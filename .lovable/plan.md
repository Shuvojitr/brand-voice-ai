

## Plan: Convert Template Editor from Popup to Full Page

### Overview
Convert the current template editing dialog to a dedicated full-page editor, similar to the Blog Post Editor. This will provide more screen space, better navigation, and a more consistent editing experience.

### Changes

**1. Create Template Editor Page**
Create a new page `src/pages/admin/AdminTemplateEditor.tsx` that:
- Supports both create (`/admin/templates/new`) and edit (`/admin/templates/edit/:templateId`) modes
- Uses the AdminLayout wrapper for consistent navigation
- Has a header with back button, template name, and save/delete actions
- Contains the same tabbed interface (Edit, Template Form, Preview Prompt) but with full-page layout
- Shows loading skeleton when fetching template data

**2. Update Routing**
Add new routes in `App.tsx`:
- `/admin/templates/new` - Create new template
- `/admin/templates/edit/:templateId` - Edit existing template

**3. Simplify AdminTemplates.tsx**
- Remove the large Dialog component for template editing (~300+ lines)
- Update "Add" and "Edit" buttons to navigate to the new page routes
- Keep the delete confirmation dialog (AlertDialog) as is

**4. Update Manager Panel (Optional)**
Apply the same pattern to `ManagerTemplates.tsx` for consistency:
- Create `/manager/templates/new` and `/manager/templates/edit/:templateId` routes
- Or reuse the same editor component if permissions allow

### New Page Layout

```text
+------------------------------------------------------------------+
|  [<- Back to Templates]            Template Editor    [Save] [Delete] |
+------------------------------------------------------------------+
|  Tabs: [Edit] [Template Form] [Preview Prompt]                      |
+------------------------------------------------------------------+
|                                                                      |
|  (Full-height tab content with comfortable spacing)                  |
|                                                                      |
|  - Name, Slug, Category, Icon, Model fields                         |
|  - Description textarea                                              |
|  - System Prompt textarea (larger)                                   |
|  - Form Schema JSON editor (larger)                                  |
|  - Active toggle                                                     |
|                                                                      |
+------------------------------------------------------------------+
```

### Files to Create
- `src/pages/admin/AdminTemplateEditor.tsx` - New full-page template editor

### Files to Modify
- `src/App.tsx` - Add new routes
- `src/pages/admin/AdminTemplates.tsx` - Remove dialog, update buttons to use navigation
- `src/pages/manager/ManagerTemplates.tsx` - Same changes for manager panel

### Technical Details

The new editor page will:
- Use `useParams()` to get `templateId` for edit mode
- Use `useNavigate()` for back navigation after save/delete
- Fetch template data with React Query when in edit mode
- Submit using the same Supabase logic already in place
- Show toast notifications on success/error
- Have proper loading states

