import { useState, useRef, useEffect, useMemo, useCallback, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load all existing tags from blog_posts
  useEffect(() => {
    const loadTags = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("tags");

      if (data) {
        const tagSet = new Set<string>();
        data.forEach((post: any) => {
          post.tags?.forEach((t: string) => tagSet.add(t.toLowerCase().trim()));
        });
        setAllTags(Array.from(tagSet).sort());
      }
    };
    loadTags();
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = useMemo(() => {
    if (!input.trim()) return [];
    const q = input.toLowerCase().trim();
    return allTags
      .filter((t) => t.includes(q) && !tags.includes(t))
      .slice(0, 8);
  }, [input, allTags, tags]);

  useEffect(() => {
    setSuggestions(filteredSuggestions);
    setSelectedSuggestionIndex(-1);
  }, [filteredSuggestions]);

  const addTag = useCallback(
    (tag: string) => {
      const normalized = tag.toLowerCase().trim();
      if (!normalized) return;
      if (tags.includes(normalized)) return; // prevent duplicates
      onChange([...tags, normalized]);
      setInput("");
      setShowSuggestions(false);
      inputRef.current?.focus();
    },
    [tags, onChange]
  );

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        addTag(suggestions[selectedSuggestionIndex]);
      } else if (input.trim()) {
        addTag(input);
      }
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label className="flex items-center gap-1.5">
        <Tag className="h-3.5 w-3.5" />
        Tags
      </Label>

      {/* Tag badges */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input with suggestions */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => input.trim() && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Type and press Enter to add..."
          className="h-9 text-sm"
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-40 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent ${
                  i === selectedSuggestionIndex ? "bg-accent" : ""
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Press Enter or comma to add. {tags.length > 0 && `${tags.length} tag${tags.length > 1 ? "s" : ""} added.`}
      </p>
    </div>
  );
}
