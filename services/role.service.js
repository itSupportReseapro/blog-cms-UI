import authClient from "@/lib/authAxios";

const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "dev_blog_cms";
const COMPANY_ID = Number(process.env.NEXT_PUBLIC_COMPANY_ID || "2");

function unwrap(response) {
  const payload = response?.data ?? {};
  if (payload.data !== undefined) return payload;
  return payload;
}

/**
 * Get all roles for the app.
 * GET /roles?scope=app&company_id={company_id}
 */
export async function getRoles() {
  try {
    const response = await authClient.get("/roles", {
      params: {
        scope: "app",
        company_id: COMPANY_ID,
      },
    });
    const payload = unwrap(response);
    const list = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload)
      ? payload
      : [];
    return { data: list };
  } catch (error) {
    if (error.response) {
      return {
        error: true,
        message: error.response.data?.message || "Failed to fetch roles",
      };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Get a single role by ID.
 * GET /roles/{roleId}
 */
export async function getRoleById(roleId) {
  try {
    const response = await authClient.get(`/roles/${roleId}`);
    return unwrap(response);
  } catch (error) {
    if (error.response) {
      return {
        error: true,
        message: error.response.data?.message || "Failed to fetch role",
      };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Create a new role for the app.
 * POST /roles
 * Body: {
 *   role_key: string (unique identifier),
 *   role_name: string (display name),
 *   description?: string,
 *   role_scope: "app",
 *   company_id: number,
 *   app_key: string,
 *   is_default?: boolean,
 *   created_by: string,
 * }
 */
export async function createRole(roleData) {
  try {
    const payload = {
      role_key: roleData.role_key || "",
      role_name: roleData.role_name || "",
      description: roleData.description || "",
      role_scope: "app",
      company_id: COMPANY_ID,
      app_key: APP_KEY,
      is_default: roleData.is_default || false,
      is_active: roleData.is_active ?? 1,
      created_by: roleData.created_by || "admin",
    };

    const response = await authClient.post("/roles", payload);
    return unwrap(response);
  } catch (error) {
    if (error.response) {
      return {
        error: true,
        message: error.response.data?.message || "Failed to create role",
      };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Update an existing role.
 * PUT /roles/{roleId}
 * Body: {
 *   role_name?: string,
 *   description?: string,
 *   is_default?: boolean,
 *   modify_by: string,
 * }
 */
export async function updateRole(roleId, roleData) {
  try {
    const payload = {
      ...(roleData.role_name !== undefined ? { role_name: roleData.role_name } : {}),
      ...(roleData.role_key !== undefined ? { role_key: roleData.role_key } : {}),
      ...(roleData.role_scope !== undefined ? { role_scope: roleData.role_scope } : {}),
      ...(roleData.description !== undefined ? { description: roleData.description } : {}),
      ...(roleData.is_active !== undefined ? { is_active: roleData.is_active } : {}),
      ...(roleData.is_default !== undefined ? { is_default: roleData.is_default } : {}),
      modify_by: roleData.modify_by || "admin",
    };

    const response = await authClient.put(`/roles/${roleId}`, payload);
    return unwrap(response);
  } catch (error) {
    if (error.response) {
      return {
        error: true,
        message: error.response.data?.message || "Failed to update role",
      };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Delete a role (soft delete).
 * DELETE /roles/{roleId}
 */
export async function deleteRole(roleId) {
  try {
    const response = await authClient.delete(`/roles/${roleId}`);
    return unwrap(response);
  } catch (error) {
    if (error.response) {
      return {
        error: true,
        message: error.response.data?.message || "Failed to delete role",
      };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Get permissions assigned to a specific role.
 * GET /roles/{roleId}/permissions
 */
export async function getRolePermissions(roleId) {
  try {
    const response = await authClient.get(`/roles/${roleId}/permissions`);
    const payload = unwrap(response);
    const list = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload)
      ? payload
      : [];
    return { data: list };
  } catch (error) {
    if (error.response?.status === 404) {
      // Role or permissions not found
      return { data: [] };
    }
    if (error.response) {
      return {
        error: true,
        message: error.response.data?.message || "Failed to fetch role permissions",
      };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Assign permissions to a role.
 * POST /roles/{roleId}/permissions
 * Body: {
 *   permission_ids: number[],
 *   created_by: string,
 * }
 */
export async function assignPermissionsToRole(roleId, permissionIds, createdBy = "admin") {
  try {
    const payload = {
      permission_ids: Array.isArray(permissionIds) ? permissionIds : [],
      created_by: createdBy,
    };

    const response = await authClient.post(`/roles/${roleId}/permissions`, payload);
    return unwrap(response);
  } catch (error) {
    if (error.response) {
      return {
        error: true,
        message: error.response.data?.message || "Failed to assign permissions",
      };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Remove a permission from a role.
 * DELETE /roles/{roleId}/permissions/{permissionId}
 */
export async function removePermissionFromRole(roleId, permissionId) {
  try {
    const response = await authClient.delete(
      `/roles/${roleId}/permissions/${permissionId}`
    );
    return unwrap(response);
  } catch (error) {
    if (error.response) {
      return {
        error: true,
        message:
          error.response.data?.message || "Failed to remove permission from role",
      };
    }
    return { error: true, message: "Network error. Try again." };
  }
}
