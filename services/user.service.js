import authClient from "@/lib/authAxios";
import { registerUser } from "@/services/auth.service";
import { resolveUploadUrl } from "@/services/cms.service";

const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "dev_blog_cms";
const APP_ID = Number(process.env.NEXT_PUBLIC_APP_ID || "2");
const COMPANY_ID = Number(process.env.NEXT_PUBLIC_COMPANY_ID || "2");

function getRuntimeAppContext() {
  if (typeof window === "undefined") {
    return { appKey: APP_KEY, appId: APP_ID };
  }

  const storedAppKey = sessionStorage.getItem("authAppKey");
  const storedAppId = sessionStorage.getItem("authAppId");

  return {
    appKey: storedAppKey || APP_KEY,
    appId: Number(storedAppId || APP_ID),
  };
}

function extractList(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.users)) return payload.data.users;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload)) return payload;
  return [];
}

function unwrap(response) {
  const payload = response?.data ?? {};
  // Handle { ok, data: [...] } or { ok, data: { ... } } or direct array/object
  if (payload.data !== undefined) return payload;
  return payload;
}

function toMysqlDate(value) {
  const rawValue = String(value || "").trim();

  if (!rawValue) return "";

  const dateMatch = rawValue.match(/^(\d{4}-\d{2}-\d{2})/);

  if (dateMatch) return dateMatch[1];

  return rawValue;
}

/**
 * Get all users assigned to this app.
 * GET /apps/{app_key}/users?company_id={company_id}
 */
export async function getAllUsers() {
  try {
    const { appKey } = getRuntimeAppContext();
    const response = await authClient.get(`/apps/${appKey}/users`, {
      params: { company_id: COMPANY_ID },
    });
    const payload = unwrap(response);
    return { data: extractList(payload) };
  } catch (error) {
    if (error.response) {
      return { error: true, message: error.response.data?.message || "Failed to get users" };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Get all users in the company (from user-companies table).
 * GET /user-companies?company_id={company_id}
 */
export async function getCompanyUsers() {
  try {
    const response = await authClient.get("/user-companies", {
      params: { company_id: COMPANY_ID, is_active: 1 },
    });
    const payload = unwrap(response);
    return { data: extractList(payload) };
  } catch (error) {
    if (error.response) {
      return { error: true, message: error.response.data?.message || "Failed to get company users" };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Assign an existing company user to this app with a role.
 * POST /apps/assign-user
 */
export async function assignUserToApp(userId, roleId) {
  try {
    const { appId } = getRuntimeAppContext();
    const response = await authClient.post("/apps/assign-user", {
      user_id: userId,
      company_id: COMPANY_ID,
      app_id: appId,
      role_id: roleId,
      created_by: "admin",
    });
    return unwrap(response);
  } catch (error) {
    if (error.response) {
      return { error: true, message: error.response.data?.message || "Failed to assign user to app" };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Create a new user and assign them to this app.
 * Step 1: POST /auth/register
 * Step 2: POST /apps/assign-user
 */
export async function createUser(payload) {
  try {
    const { appId } = getRuntimeAppContext();

    // Step 1: Register the user account
    const email_personal = payload.email || "";
    const email_official = payload.email_official || "";

    const regPayload = {
      first_name: payload.first_name || "",
      last_name: payload.last_name || "",
      email_address_personal: email_personal,
      ...(email_official ? { email_address_official: email_official } : {}),
      mobile_number_primary: payload.phone_no || payload.phone || "",
      password: payload.password || "",
      gender: payload.gender || "",
      date_of_birth: toMysqlDate(payload.dob),
      company_name: payload.company_name || "",
      created_by: "admin",
    };

    const regResult = await registerUser(regPayload);

    if (regResult?.error) return regResult;

    // Step 2: Assign user to this app with the selected role
    const registeredUserId =
      regResult?.data?.user_id ?? regResult?.user_id ?? regResult?.data?.id ?? null;

    if (!payload.role_id) {
      return {
        error: true,
        message: "Please select a role before creating the user",
      };
    }

    if (!registeredUserId) {
      return {
        error: true,
        message: "User registered but user id is missing for app assignment",
      };
    }

    try {
      const assignResult = await authClient.post("/apps/assign-user", {
        user_id: registeredUserId,
        company_id: COMPANY_ID,
        app_id: appId,
        role_id: payload.role_id,
        created_by: "admin",
      });

      return {
        ...(regResult || {}),
        assigned: true,
        user_id: registeredUserId,
        assignment: unwrap(assignResult),
      };
    } catch (assignErr) {
      console.warn("User created but app assignment failed:", assignErr?.response?.data);
      return {
        error: true,
        message:
          assignErr?.response?.data?.message ||
          "User was registered but could not be assigned to this app role",
      };
    }
  } catch (error) {
    if (error.response) {
      return { error: true, message: error.response.data?.message || "Failed to create user" };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Update an existing user's profile.
 * PUT /users/{userId}/profiles
 */
export async function updateUser(userId, payload) {
  try {
    const body = {
      ...(payload.first_name !== undefined ? { first_name: payload.first_name } : {}),
      ...(payload.last_name !== undefined ? { last_name: payload.last_name } : {}),
      ...(payload.full_name !== undefined ? { full_name: payload.full_name } : {}),
      ...(payload.gender !== undefined ? { gender: payload.gender } : {}),
      ...(payload.date_of_birth !== undefined || payload.dob !== undefined
        ? { date_of_birth: toMysqlDate(payload.date_of_birth || payload.dob) }
        : {}),
      ...(payload.mobile_number_primary !== undefined || payload.phone_no !== undefined || payload.phone !== undefined
        ? { mobile_number_primary: payload.mobile_number_primary || payload.phone_no || payload.phone }
        : {}),
      ...(payload.company_name !== undefined ? { company_name: payload.company_name } : {}),
      ...(payload.user_photo !== undefined || payload.avatar !== undefined
        ? { user_photo: resolveUploadUrl(payload.user_photo || payload.avatar) }
        : {}),
      modify_by: "admin",
    };

    const response = await authClient.put(`/users/${userId}/profiles`, body);
    return unwrap(response);
  } catch (error) {
    if (error.response) {
      return { error: true, message: error.response.data?.message || "Failed to update user" };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Soft delete a user.
 * DELETE /users/{userId}
 */
export async function deleteUser(userId) {
  try {
    const response = await authClient.delete(`/users/${userId}`);
    return unwrap(response);
  } catch (error) {
    if (error.response) {
      return { error: true, message: error.response.data?.message || "Failed to delete user" };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Get all roles (optionally filtered by scope).
 * GET /roles?scope=app
 */
export async function getRoles(scope = "app") {
  try {
    const { appKey } = getRuntimeAppContext();
    const response = await authClient.get("/roles", {
      params: scope
        ? {
            scope,
            company_id: COMPANY_ID,
            app_key: appKey,
          }
        : {
            company_id: COMPANY_ID,
            app_key: appKey,
          },
    });
    const payload = unwrap(response);
    const list = extractList(payload);
    return { data: list };
  } catch (error) {
    if (error.response) {
      return { error: true, message: error.response.data?.message || "Failed to get roles" };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Update a user's role in the app.
 * PUT /user-apps/{userAppId}
 */
export async function updateUserAppRole(userAppId, roleId) {
  try {
    const response = await authClient.put(`/user-apps/${userAppId}`, { role_id: roleId });
    return unwrap(response);
  } catch (error) {
    if (error.response) {
      return { error: true, message: error.response.data?.message || "Failed to update role" };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Get activity logs for this app.
 * GET /activity-logs (endpoint may not be available yet)
 */
export async function getActivityLogs(params = {}) {
  try {
    const { appKey } = getRuntimeAppContext();
    const response = await authClient.get("/activity-logs", {
      params: { company_id: COMPANY_ID, app_key: appKey, ...params },
    });
    const payload = unwrap(response);
    const list = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];
    return { data: list };
  } catch (error) {
    // 404 means endpoint not yet available on the server
    if (error.response?.status === 404 || error.response?.status === 405) {
      return { data: [], unavailable: true };
    }
    if (error.response) {
      return { error: true, message: error.response.data?.message || "Failed to fetch activity logs" };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Get a specific user's app-scoped entitlements (roles and permissions).
 * GET /user-entitlements?user_id={userId}&app_key={appKey}&company_id={companyId}
 */
export async function getUserAppEntitlements(userId) {
  try {
    const { appKey } = getRuntimeAppContext();
    const response = await authClient.get("/user-entitlements", {
      params: {
        user_id: userId,
        app_key: appKey,
        company_id: COMPANY_ID,
      },
    });
    return unwrap(response);
  } catch (error) {
    if (error.response?.status === 404) {
      return { data: [] };
    }
    if (error.response) {
      return { error: true, message: error.response.data?.message || "Failed to get user entitlements" };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Get all user-app assignments for this app.
 * GET /apps/{appKey}/user-assignments?company_id={companyId}
 */
export async function getUserAppAssignments() {
  try {
    const { appKey } = getRuntimeAppContext();
    const response = await authClient.get(`/apps/${appKey}/user-assignments`, {
      params: { company_id: COMPANY_ID },
    });
    const payload = unwrap(response);
    const list = extractList(payload);
    return { data: list };
  } catch (error) {
    if (error.response) {
      return { error: true, message: error.response.data?.message || "Failed to get user assignments" };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Remove a user from this app.
 * DELETE /apps/remove-user
 * Body: { user_id, company_id, app_id }
 */
export async function removeUserFromApp(userId) {
  try {
    const { appId } = getRuntimeAppContext();
    const response = await authClient.delete("/apps/remove-user", {
      data: {
        user_id: userId,
        company_id: COMPANY_ID,
        app_id: appId,
      },
    });
    return unwrap(response);
  } catch (error) {
    if (error.response) {
      return { error: true, message: error.response.data?.message || "Failed to remove user from app" };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Reassign a user to a different role in this app.
 * POST /apps/reassign-user-role
 * Body: { user_id, company_id, app_id, new_role_id }
 */
export async function reassignUserRole(userId, newRoleId) {
  try {
    const { appId } = getRuntimeAppContext();
    const response = await authClient.post("/apps/reassign-user-role", {
      user_id: userId,
      company_id: COMPANY_ID,
      app_id: appId,
      new_role_id: newRoleId,
    });
    return unwrap(response);
  } catch (error) {
    if (error.response) {
      return { error: true, message: error.response.data?.message || "Failed to reassign user role" };
    }
    return { error: true, message: "Network error. Try again." };
  }
}

/**
 * Bulk assign users to roles in this app.
 * POST /apps/bulk-assign-roles
 * Body: { assignments: [{ user_id, role_id }, ...], company_id, app_id }
 */
export async function bulkAssignRoles(assignments) {
  try {
    const { appId } = getRuntimeAppContext();
    const response = await authClient.post("/apps/bulk-assign-roles", {
      assignments: Array.isArray(assignments) ? assignments : [],
      company_id: COMPANY_ID,
      app_id: appId,
    });
    return unwrap(response);
  } catch (error) {
    if (error.response?.status === 404) {
      // Endpoint not available, try individual assigns
      return { data: [], unavailable: true };
    }
    if (error.response) {
      return { error: true, message: error.response.data?.message || "Failed to bulk assign roles" };
    }
    return { error: true, message: "Network error. Try again." };
  }
}
