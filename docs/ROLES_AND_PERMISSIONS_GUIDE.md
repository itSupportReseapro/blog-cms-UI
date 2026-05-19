# Roles & Permissions Integration Guide

## Overview

The Blog CMS now includes a comprehensive roles and permissions management system integrated from the auth-platform-UI. This system allows you to:

- **Define roles** at the app level (e.g., Admin, Editor, Viewer)
- **Create permissions** with granular control (e.g., "blog.create", "user.read.all")
- **Assign roles to users** within this app
- **Control access** using permission guards in components
- **Manage users** per app with role assignments

## Key Concepts

### Roles
A role is a collection of permissions that can be assigned to users. Roles are **app-scoped**, meaning each role belongs to a specific app (Blog CMS) within a company.

**Built-in Roles:**
- `super_admin` - Platform-wide admin with full access
- `admin` - App-level admin, can manage content and users
- `lead` - Team lead, can manage team and content
- `editor` - Can create and edit content
- `user` - Basic user access
- `viewer` - Read-only access
- `inventory_admin` - Special role for inventory
- `guest` - No access

### Permissions
A permission represents a specific action a user can perform. Permissions follow the pattern `{resource}.{action}`.

**Examples:**
- `blog.create` - Create blog posts
- `blog.read` - Read blog posts
- `blog.update` - Update blog posts
- `blog.delete` - Delete blog posts
- `user.create` - Create users
- `role.read` - Read role information
- `settings.update` - Update app settings

### App-Scoped Access
- **Company ID**: Fixed at 2 (set in `.env.local`)
- **App Key**: `pdp_blog_cms` (from environment)
- **App ID**: Comes from login response and stored in AuthContext

## Configuration

### Environment Variables (`.env.local`)

```env
# App Configuration
NEXT_PUBLIC_APP_KEY=dev_blog_cms
NEXT_PUBLIC_APP_ID=2
NEXT_PUBLIC_COMPANY_ID=2

# Auth API URLs
NEXT_PUBLIC_DEV_AUTH_API=https://dev.pdp.auth.reseapro.com
NEXT_PUBLIC_PROD_AUTH_API=https://pdp.auth.reseapro.com
```

### AuthContext

The AuthContext now stores additional information from login:

```javascript
{
  user,            // User object with roles and apps
  token,           // Access token
  appId,          // Current app ID from user's apps array
  appKey,         // Current app key
  isAuthenticated, // Boolean
  login,          // Function to login
  logout,         // Function to logout
}
```

## Usage Examples

### 1. Component-Based Permission Check (Can Component)

```jsx
import { Can } from "@/components/Can";

// Single permission
<Can action="blog.create">
  <button>Create New Blog</button>
</Can>

// Multiple permissions (all required)
<Can 
  action={["blog.create", "blog.publish"]} 
  fallback={<p>You don't have permission</p>}
>
  <BlogForm />
</Can>

// With fallback UI
<Can 
  action="user.create" 
  fallback={<span style={{ color: 'gray' }}>Create User (disabled)</span>}
>
  <button>Create User</button>
</Can>
```

### 2. Imperative Permission Check (useCanAccess Hook)

```jsx
import { useCanAccess } from "@/components/Can";

export function BlogActions() {
  const { can, cannot, permissions, info } = useCanAccess();

  return (
    <div>
      {can("blog.create") && <button>Create Blog</button>}
      {can(["blog.update", "blog.publish"]) && <button>Edit & Publish</button>}
      
      {cannot("blog.delete") && (
        <p>You cannot delete blogs</p>
      )}

      {/* Get all permissions for UI logic */}
      <p>Your permissions: {permissions.join(", ")}</p>

      {/* Get role info */}
      {info().effectiveRole === "admin" && <AdminPanel />}
    </div>
  );
}
```

### 3. Fetch Available Roles

```jsx
import { useRoles } from "@/hooks/useRoles";
import { getRoles, createRole } from "@/services/role.service";

// In a component
export function RoleSelector() {
  const { roles, loading, error, refetch } = useRoles();

  if (loading) return <p>Loading roles...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <select>
      {roles.map(role => (
        <option key={role.role_id} value={role.role_id}>
          {role.role_name}
        </option>
      ))}
    </select>
  );
}

// Or directly call service
const rolesResult = await getRoles();
if (!rolesResult.error) {
  setRoles(rolesResult.data);
}
```

### 4. Fetch Available Permissions

```jsx
import { usePermissions } from "@/hooks/usePermissions";

// All permissions
export function PermissionsManager() {
  const { permissions, loading } = usePermissions();

  return (
    <ul>
      {permissions.map(perm => (
        <li key={perm.perm_id}>
          {perm.perm_key}: {perm.perm_name}
        </li>
      ))}
    </ul>
  );
}

// Permissions by category
export function BlogPermissions() {
  const { permissions } = usePermissions({ category: "blog" });

  return (
    <ul>
      {permissions.map(perm => (
        <li key={perm.perm_id}>{perm.perm_name}</li>
      ))}
    </ul>
  );
}
```

### 5. Create a New Role

```jsx
import { createRole, assignPermissionsToRole } from "@/services/role.service";

async function newContentManagerRole() {
  // Step 1: Create the role
  const roleResult = await createRole({
    role_key: "content_manager",
    role_name: "Content Manager",
    description: "Manages blog content and can publish",
  });

  if (roleResult.error) {
    console.error("Failed to create role:", roleResult.message);
    return;
  }

  const roleId = roleResult.data?.role_id;

  // Step 2: Assign permissions to the role
  const permissionsId = [1, 2, 4, 5]; // IDs from permission.perm_id

  const assignResult = await assignPermissionsToRole(roleId, permissionsId);

  if (assignResult.error) {
    console.error("Failed to assign permissions:", assignResult.message);
  }
}
```

### 6. Create a User with Role Assignment

```jsx
import { createUser } from "@/services/user.service";

async function addNewTeamMember(userData, roleId) {
  const result = await createUser({
    first_name: userData.firstName,
    last_name: userData.lastName,
    email: userData.email,
    phone_no: userData.phone,
    password: userData.password,
    role_id: roleId, // This role will be assigned to the app
  });

  if (result.error) {
    console.error("Failed to create user:", result.message);
  } else {
    console.log("User created and assigned to app");
  }
}
```

### 7. Change User's Role

```jsx
import { reassignUserRole } from "@/services/user.service";

async function promoteUserToEditor(userId, newRoleId) {
  const result = await reassignUserRole(userId, newRoleId);

  if (result.error) {
    console.error("Failed to reassign role:", result.message);
  } else {
    console.log("User role updated");
  }
}
```

### 8. Bulk Assign Roles

```jsx
import { bulkAssignRoles } from "@/services/user.service";

async function assignRolesToMultipleUsers() {
  const assignments = [
    { user_id: 1, role_id: 2 }, // User 1 → Editor role
    { user_id: 3, role_id: 3 }, // User 3 → Lead role
    { user_id: 5, role_id: 4 }, // User 5 → Admin role
  ];

  const result = await bulkAssignRoles(assignments);

  if (result.error) {
    console.error("Failed to assign roles:", result.message);
  }
}
```

### 9. Get User's Entitlements (Roles & Permissions)

```jsx
import { getUserAppEntitlements } from "@/services/user.service";

async function viewUserPermissions(userId) {
  const result = await getUserAppEntitlements(userId);

  if (!result.error) {
    console.log("User's app permissions:", result.data);
    // result.data contains the user's roles and permissions for this app
  }
}
```

### 10. Remove User from App

```jsx
import { removeUserFromApp } from "@/services/user.service";

async function removeTeamMember(userId) {
  const result = await removeUserFromApp(userId);

  if (result.error) {
    console.error("Failed to remove user:", result.message);
  } else {
    console.log("User removed from app");
  }
}
```

## Available Services

### `role.service.js`
- `getRoles()` - Get all app roles
- `getRoleById(roleId)` - Get specific role
- `createRole(roleData)` - Create new role
- `updateRole(roleId, roleData)` - Update role
- `deleteRole(roleId)` - Delete role
- `getRolePermissions(roleId)` - Get permissions assigned to role
- `assignPermissionsToRole(roleId, permIds)` - Assign permissions to role
- `removePermissionFromRole(roleId, permId)` - Remove permission from role

### `permission.service.js`
- `getPermissions()` - Get all app permissions
- `getPermissionById(permId)` - Get specific permission
- `createPermission(permData)` - Create new permission
- `updatePermission(permId, permData)` - Update permission
- `deletePermission(permId)` - Delete permission
- `getPermissionsByCategory(category)` - Get permissions by category
- `createPermissionsBulk(permissions)` - Bulk create permissions

### `user.service.js` (Enhanced)
- `getAllUsers()` - Get all app users
- `createUser(userData)` - Create user and assign to app
- `updateUser(userId, userData)` - Update user profile
- `deleteUser(userId)` - Soft delete user
- `getRoles()` - Get available roles
- `updateUserAppRole(userAppId, roleId)` - Update user's role
- `getActivityLogs(params)` - Get activity logs
- `getUserAppEntitlements(userId)` - Get user's permissions
- `getUserAppAssignments()` - Get all user-app assignments
- `removeUserFromApp(userId)` - Remove user from app
- `reassignUserRole(userId, newRoleId)` - Change user's role
- `bulkAssignRoles(assignments)` - Assign multiple users to roles

## Available Hooks

### `useRoles()`
```javascript
const { roles, loading, error, refetch } = useRoles();
```

### `usePermissions(options)`
```javascript
// Get all permissions
const { permissions, loading, error, refetch } = usePermissions();

// Get permissions by category
const { permissions: blogPerms } = usePermissions({ category: "blog" });
```

### `useCanAccess()`
```javascript
const { can, cannot, permissions, info } = useCanAccess();

can("action.name")              // Check permission
cannot("action.name")           // Check lack of permission
permissions                     // Array of all user permissions
info()                         // Get role and permission info
```

## Component

### `Can` Component
```jsx
<Can action="permission.name">
  <Content />
</Can>

<Can action={["perm1", "perm2"]} fallback={<Denied />}>
  <Content />
</Can>
```

## Database/API Structure

### Roles Table
```
role_id (int, PK)
role_key (string) - e.g., "editor"
role_name (string) - e.g., "Blog Editor"
description (string)
scope (string) - "app", "company", "platform"
company_id (int)
app_key (string)
is_default (boolean)
created_by (string)
created_at (timestamp)
modified_at (timestamp)
deleted_at (timestamp) - for soft delete
```

### Permissions Table
```
perm_id (int, PK)
perm_key (string) - e.g., "blog.create"
perm_name (string) - e.g., "Create Blog"
description (string)
category (string) - e.g., "blog", "user"
scope (string) - "app", "company", "platform"
company_id (int)
app_key (string)
created_by (string)
created_at (timestamp)
deleted_at (timestamp)
```

### Role-Permission Junction
```
role_perm_id (int, PK)
role_id (int, FK to roles)
perm_id (int, FK to permissions)
created_by (string)
created_at (timestamp)
```

### User-App Assignment
```
user_app_id (int, PK)
user_id (int, FK to users)
app_id (int) or app_key (string)
company_id (int)
role_id (int, FK to roles)
created_by (string)
created_at (timestamp)
modified_at (timestamp)
deleted_at (timestamp)
```

## Best Practices

1. **Always check permissions before showing UI elements**
   ```jsx
   <Can action="blog.delete">
     <DeleteButton />
   </Can>
   ```

2. **Use meaningful permission names**
   ```
   ✓ "blog.create"
   ✓ "user.read.all"
   ✗ "create"
   ✗ "read"
   ```

3. **Organize permissions by resource**
   - blog.* - Blog-related permissions
   - user.* - User management
   - role.* - Role management
   - settings.* - Settings management

4. **Use role-based defaults** - Assign default roles when creating users
   ```jsx
   const defaultRole = roles.find(r => r.is_default);
   createUser({ ...userData, role_id: defaultRole.role_id });
   ```

5. **Check backend as well** - Frontend permission checks are UX only; always validate on backend

## Troubleshooting

### "Permission Denied" in Console
- Check if user's role has the required permission
- Verify permission name is correct (case-sensitive)
- Ensure user's JWT includes their app assignment

### Roles Not Loading
- Verify `COMPANY_ID=2` in `.env.local`
- Check network tab for API errors
- Ensure user has `role.read` permission

### User Cannot Access App After Role Assignment
- Verify role has necessary permissions
- Check if user needs to refresh token (logout/login)
- Ensure app_id matches between frontend and API

### Permission Changes Not Reflecting
- Clear browser cache/session storage
- Log out and log back in
- Verify role-permission assignment actually succeeded in API

## File Locations

- Services: `/services/role.service.js`, `/services/permission.service.js`, `/services/user.service.js`
- Hooks: `/hooks/useRoles.js`, `/hooks/usePermissions.js`, `/components/Can.js` (includes `useCanAccess`)
- Context: `/context/AuthContext.js`
- Configuration: `/lib/roleMap.js`, `.env.local`
