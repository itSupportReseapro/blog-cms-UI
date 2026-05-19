import authClient from "@/lib/authAxios";

const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "dev_blog_cms";
const COMPANY_ID = Number(process.env.NEXT_PUBLIC_COMPANY_ID || "2");

function unwrap(response) {
  const payload = response?.data ?? {};
  if (payload.data !== undefined) return payload;
  return payload;
}

/**
 * Get all permissions for the app.
 * GET /permissions?scope=app&company_id={company_id}
 */
export async function getPermissions() {
  try {
    const response = await authClient.get("/permissions", {
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
        message: error.response.data?.message || "Failed to fetch permissions",
      };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Get a single permission by ID.
 * GET /permissions/{permissionId}
 */
export async function getPermissionById(permissionId) {
  try {
    const response = await authClient.get(`/permissions/${permissionId}`);
    return unwrap(response);
  } catch (error) {
    if (error.response) {
      return {
        error: true,
        message: error.response.data?.message || "Failed to fetch permission",
      };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Create a new permission for the app.
 * POST /permissions
 * Body: {
 *   perm_key: string (unique identifier, e.g., "blog.create"),
 *   perm_name: string (display name, e.g., "Create Blog"),
 *   description?: string,
 *   category?: string (e.g., "blog", "user", "content"),
 *   perm_scope: "app",
 *   company_id: number,
 *   app_key: string,
 *   created_by: string,
 * }
 */
export async function createPermission(permissionData) {
  try {
    const payload = {
      perm_key: permissionData.perm_key || "",
      perm_name: permissionData.perm_name || "",
      description: permissionData.description || "",
      category: permissionData.category || "",
      perm_scope: "app",
      company_id: COMPANY_ID,
      app_key: APP_KEY,
      is_active: permissionData.is_active ?? 1,
      created_by: permissionData.created_by || "admin",
    };

    const response = await authClient.post("/permissions", payload);
    return unwrap(response);
  } catch (error) {
    if (error.response) {
      return {
        error: true,
        message:
          error.response.data?.message || "Failed to create permission",
      };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Update an existing permission.
 * PUT /permissions/{permissionId}
 * Body: {
 *   perm_name?: string,
 *   description?: string,
 *   category?: string,
 *   modify_by: string,
 * }
 */
export async function updatePermission(permissionId, permissionData) {
  try {
    const payload = {
      ...(permissionData.perm_name !== undefined ? { perm_name: permissionData.perm_name } : {}),
      ...(permissionData.perm_key !== undefined ? { perm_key: permissionData.perm_key } : {}),
      ...(permissionData.perm_scope !== undefined ? { perm_scope: permissionData.perm_scope } : {}),
      ...(permissionData.description !== undefined
        ? { description: permissionData.description }
        : {}),
      ...(permissionData.category !== undefined ? { category: permissionData.category } : {}),
      ...(permissionData.is_active !== undefined ? { is_active: permissionData.is_active } : {}),
      modify_by: permissionData.modify_by || "admin",
    };

    const response = await authClient.put(`/permissions/${permissionId}`, payload);
    return unwrap(response);
  } catch (error) {
    if (error.response) {
      return {
        error: true,
        message:
          error.response.data?.message || "Failed to update permission",
      };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Delete a permission (soft delete).
 * DELETE /permissions/{permissionId}
 */
export async function deletePermission(permissionId) {
  try {
    const response = await authClient.delete(`/permissions/${permissionId}`);
    return unwrap(response);
  } catch (error) {
    if (error.response) {
      return {
        error: true,
        message:
          error.response.data?.message || "Failed to delete permission",
      };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Bulk create permissions for the app.
 * POST /permissions/bulk
 * Body: {
 *   permissions: PermissionData[],
 *   created_by: string,
 * }
 */
export async function createPermissionsBulk(permissions, createdBy = "admin") {
  try {
    const payload = {
      permissions: Array.isArray(permissions) ? permissions : [],
      created_by: createdBy,
    };

    const response = await authClient.post("/permissions/bulk", payload);
    return unwrap(response);
  } catch (error) {
    if (error.response?.status === 404) {
      // Endpoint might not support bulk, try individual creates
      const results = [];
      for (const perm of permissions) {
        const result = await createPermission({ ...perm, created_by: createdBy });
        results.push(result);
      }
      return { data: results };
    }

    if (error.response) {
      return {
        error: true,
        message:
          error.response.data?.message || "Failed to create permissions",
      };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Get permissions by category (e.g., "blog", "user").
 * GET /permissions/category/{category}
 */
export async function getPermissionsByCategory(category) {
  try {
    const response = await authClient.get(`/permissions/category/${category}`, {
      params: {
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
    if (error.response?.status === 404) {
      return { data: [] };
    }

    if (error.response) {
      return {
        error: true,
        message:
          error.response.data?.message || "Failed to fetch permissions",
      };
    }
    return { error: true, message: "Network error. Try again." };
  }
}
