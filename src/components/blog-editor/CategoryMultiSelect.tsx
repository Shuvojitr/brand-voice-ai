import { useState, useRef, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Check, Search, FolderTree } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
}

interface CategoryMultiSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function CategoryMultiSelect({ selectedIds, onChange }: CategoryMultiSelectProps) {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("blog_categories")
      .select("*")
      .eq("is_active", true)
      .order("name");
    if (!error && data) setCategories(data);
    setIsLoading(false);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  const selectedCategories = useMemo(
    () => categories.filter((c) => selectedIds.includes(c.id)),
    [categories, selectedIds]
  );

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const remove = (id: string) => {
    onChange(selectedIds.filter((i) => i !== id));
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const slug = newSlug.trim() || newName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Check for duplicate name (case insensitive)
    const exists = categories.some((c) => c.name.toLowerCase() === newName.trim().toLowerCase());
    if (exists) {
      toast({ title: "Category already exists", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("blog_categories")
        .insert({ name: newName.trim(), slug, description: newDescription.trim() || null })
        .select()
        .single();

      if (error) throw error;

      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      onChange([...selectedIds, data.id]);
      setShowCreateModal(false);
      setNewName("");
      setNewSlug("");
      setNewDescription("");
      toast({ title: "Category created" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5">
        <FolderTree className="h-3.5 w-3.5" />
        Categories
      </Label>

      {/* Selected badges */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedCategories.map((cat) => (
            <Badge key={cat.id} variant="secondary" className="gap-1 pr-1">
              {cat.name}
              <button
                type="button"
                onClick={() => remove(cat.id)}
                className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Searchable dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder={isLoading ? "Loading categories..." : "Search categories..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="pl-8 h-9 text-sm"
          />
        </div>

        {isOpen && !isLoading && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filtered.map((cat) => {
              const isSelected = selectedIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggle(cat.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left"
                >
                  <div className={`h-4 w-4 rounded border flex items-center justify-center ${isSelected ? "bg-primary border-primary" : "border-input"}`}>
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span>{cat.name}</span>
                </button>
              );
            })}
            {filtered.length === 0 && search && (
              <div className="px-3 py-2 text-sm text-muted-foreground">No categories found</div>
            )}
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(true);
                setNewName(search);
                setNewSlug(search.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left border-t text-primary font-medium"
            >
              <Plus className="h-4 w-4" />
              Add New Category
            </button>
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>Add a new blog category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setNewSlug(e.target.value.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                }}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
                placeholder="category-slug"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Optional..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
