import authClient from "@/lib/authAxios";
import axios from "axios";
import {
  decodeJwtPayload,
  normalizeAccessToken,
  normalizeAuthUser,
  pickTokenString,
} from "@/lib/authTokens";
import { resolveUploadUrl } from "@/services/cms.service";

function resolveAuthBaseUrl() {
  const appEnv = process.env.NEXT_PUBLIC_ENV || "development";
  const baseMap = {
    development: process.env.NEXT_PUBLIC_DEV_AUTH_API,
    test: process.env.NEXT_PUBLIC_TEST_AUTH_API,
    production: process.env.NEXT_PUBLIC_PROD_AUTH_API,
  };

  return (
    baseMap[appEnv] ||
    process.env.NEXT_PUBLIC_AUTH_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    ""
  );
}

async function postWithFallback(paths, payload) {
  let lastError = null;

  for (const path of paths) {
    try {
      return await authClient.post(path, payload);
    } catch (error) {
      const status = error?.response?.status;

      if (status === 404 || status === 405) {
        lastError = error;
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error("Auth endpoint not found");
}

async function putWithFallback(paths, payload) {
  let lastError = null;

  for (const path of paths) {
    try {
      return await authClient.put(path, payload);
    } catch (error) {
      const status = error?.response?.status;

      if (status === 404 || status === 405) {
        lastError = error;
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error("Auth endpoint not found");
}

async function getWithFallback(paths) {
  let lastError = null;

  for (const path of paths) {
    try {
      return await authClient.get(path);
    } catch (error) {
      const status = error?.response?.status;

      if (status === 404 || status === 405) {
        lastError = error;
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error("Auth endpoint not found");
}

function getStoredAuthUser() {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(sessionStorage.getItem("authUser") || "null");
  } catch {
    return null;
  }
}

function resolveProfileId(userOrId = null) {
  if (typeof userOrId === "number") return userOrId;
  if (typeof userOrId === "string" && /^\d+$/.test(userOrId)) return userOrId;

  const storedUser = getStoredAuthUser();
  const directId = userOrId?.id || storedUser?.id;

  if (directId) return directId;

  if (typeof window !== "undefined") {
    const jwtPayload = decodeJwtPayload(sessionStorage.getItem("authToken"));
    const jwtUserId = jwtPayload?.id || jwtPayload?.user_id;

    if (typeof jwtUserId === "number" || (typeof jwtUserId === "string" && /^\d+$/.test(jwtUserId))) {
      return jwtUserId;
    }
  }

  return null;
}

function toMysqlDate(value) {
  const rawValue = String(value || "").trim();

  if (!rawValue) return "";

  const dateMatch = rawValue.match(/^(\d{4}-\d{2}-\d{2})/);

  if (dateMatch) return dateMatch[1];

  return rawValue;
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    const response = await postWithFallback(["/auth/login", "/login"], { 
      email, 
      password 
    });
    const payload = response.data ?? {};

    console.log("Login response:", payload);

    // Extract data from nested structure: { ok, message, data: { accessToken, refreshToken } }
    const data = payload.data ?? payload;
    
    const token = pickTokenString(
      data?.accessToken,
      data?.access_token,
      data?.token,
      payload?.accessToken,
      payload?.access_token,
      payload?.token
    );
    const refreshToken =
      pickTokenString(
        data?.refreshToken,
        data?.refresh_token,
        payload?.refreshToken,
        payload?.refresh_token
      ) || null;
    
    const rawUser = payload.user ?? data.user ?? {
      id: payload.id ?? data.id,
      user_id: payload.user_id ?? data.user_id,
      first_name: payload.first_name ?? data.first_name ?? "",
      last_name: payload.last_name ?? data.last_name ?? "",
      firstName: payload.firstName ?? data.firstName ?? "",
      lastName: payload.lastName ?? data.lastName ?? "",
      name: payload.name ?? data.name ?? "",
      email: payload.email ?? data.email ?? email,
      role: payload.role ?? data.role ?? payload.user_type ?? data.user_type ?? "user",
    };

    const user = normalizeAuthUser(rawUser, token, rawUser?.email ?? email);

    if (!token) {
      throw new Error(payload.message || "Login failed: token missing in response");
    }

    return {
      token,
      accessToken: token,
      refreshToken,
      user,
    };
  } catch (error) {
    console.log("Login error:", error.response?.data);
    const apiMessage = error?.response?.data?.message;
    throw new Error(apiMessage || "Invalid credentials");
  }
}

export async function registerUser(payload) {
  try {
    // Centralized Auth System expects these fields
    const email_personal = payload?.email_address_personal ?? payload?.email ?? "";
    const email_official = payload?.email_address_official ?? payload?.official_email ?? "";
    
    const registerPayload = {
      full_name: payload?.full_name ?? `${payload?.first_name || ''} ${payload?.last_name || ''}`.trim(),
      first_name: payload?.first_name ?? "",
      middle_name: payload?.middle_name ?? "",
      last_name: payload?.last_name ?? "",
      date_of_birth: toMysqlDate(payload?.date_of_birth),
      gender: payload?.gender ?? "",
      company_name: payload?.company_name ?? payload?.company ?? "",
      gst_number: payload?.gst_number ?? payload?.gst ?? "",
      mobile_number_primary: payload?.mobile_number_primary ?? payload?.phone ?? "",
      mobile_number_secondary: payload?.mobile_number_secondary ?? payload?.whatsapp_no ?? "",
      email_address_personal: email_personal,
      // Only include email_address_official if it's provided and not empty
      ...(email_official ? { email_address_official: email_official } : {}),
      pan: payload?.pan ?? "",
      aadhaar: payload?.aadhaar ?? payload?.aadhar_no ?? "",
      driving_licence: payload?.driving_licence ?? "",
      voter_id: payload?.voter_id ?? "",
      address_comm_at: payload?.address_comm_at ?? "",
      address_comm_1: payload?.address_comm_1 ?? payload?.address_1 ?? "",
      address_comm_2: payload?.address_comm_2 ?? payload?.address_2 ?? "",
      address_comm_post: payload?.address_comm_post ?? "",
      address_comm_ps: payload?.address_comm_ps ?? "",
      address_comm_landmark: payload?.address_comm_landmark ?? "",
      address_comm_city: payload?.address_comm_city ?? "",
      address_comm_district: payload?.address_comm_district ?? "",
      address_comm_pin: payload?.address_comm_pin ?? "",
      address_comm_country: payload?.address_comm_country ?? "",
      address_ship_at: payload?.address_ship_at ?? "",
      address_ship_1: payload?.address_ship_1 ?? "",
      address_ship_2: payload?.address_ship_2 ?? "",
      address_ship_post: payload?.address_ship_post ?? "",
      address_ship_ps: payload?.address_ship_ps ?? "",
      address_ship_landmark: payload?.address_ship_landmark ?? "",
      address_ship_city: payload?.address_ship_city ?? "",
      address_ship_district: payload?.address_ship_district ?? "",
      address_ship_pin: payload?.address_ship_pin ?? "",
      address_ship_country: payload?.address_ship_country ?? "",
      password: payload?.password ?? "",
      created_by: payload?.created_by ?? "self",
    };
    
    const response = await postWithFallback(["/auth/register", "/register"], registerPayload);
    return response.data;
  } catch (error) {
    if (error.response) {
      return {
        error: true,
        message: error.response.data?.message || "Registration failed. Please check your details and try again.",
        status: error.response.status,
      };
    } else if (error.request) {
      return {
        error: true,
        message: "No response from server. Please check your connection.",
      };
    } else {
      return {
        error: true,
        message: "An unexpected error occurred. Please try again later.",
      };
    }
  }
}

export async function refreshAuthToken(refreshToken) {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  try {
    const response = await postWithFallback(["/auth/refresh", "/refresh"], {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    const apiMessage = error?.response?.data?.message;
    throw new Error(apiMessage || "Token refresh failed");
  }
}

export async function getProfile(userOrId = null) {
  try {
    const profileId = resolveProfileId(userOrId);

    if (!profileId) {
      return null;
    }

    const response = await authClient.get(`/users/${profileId}/profiles`);
    return response.data;
  } catch {
    return null;
  }
}

export async function viewProfile(userOrId = null) {
  try {
    const profileId = resolveProfileId(userOrId);

    if (!profileId) {
      return {
        error: true,
        message: "Profile id missing. Please login again.",
      };
    }

    const response = await authClient.get(`/users/${profileId}/profiles`);
    return response.data;
  } catch (error) {
    if (error.response) {
      return {
        error: true,
        message: error.response.data?.message || "Failed to fetch profile",
      };
    }
    return {
      error: true,
      message: "Network error. Try again.",
    };
  }
}

export async function updateProfile(payload) {
  try {
    const userId = resolveProfileId(payload);

    if (!userId) {
      return {
        error: true,
        message: "Profile id missing. Please login again.",
      };
    }

    const profilePayload = {
      full_name: payload?.full_name ?? "",
      first_name: payload?.first_name ?? "",
      middle_name: payload?.middle_name ?? null,
      last_name: payload?.last_name ?? "",
      date_of_birth: toMysqlDate(payload?.date_of_birth),
      gender: payload?.gender ?? "",
      company_name: payload?.company_name ?? "",
      gst_number: payload?.gst_number ?? "",
      mobile_number_primary: payload?.mobile_number_primary ?? "",
      mobile_number_secondary: payload?.mobile_number_secondary ?? "",
      email_address_personal: payload?.email_address_personal ?? "",
      email_address_official: payload?.email_address_official ?? "",
      modify_by: payload?.modify_by ?? "self",
    };

    if (payload?.user_photo) {
      profilePayload.user_photo = resolveUploadUrl(payload.user_photo);
    }

    const response = await authClient.put(`/users/${userId}/profiles`, profilePayload);

    return response.data;
  } catch (error) {
    if (error.response) {
      return {
        error: true,
        message: error.response.data?.message || "Failed to update profile",
      };
    }
    return {
      error: true,
      message: "Network error. Try again.",
    };
  }
}

export async function sendForgotPasswordEmail(email) {
  try {
    const response = await postWithFallback(["/auth/forgot-password", "/forgot-password"], {
      email,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      return {
        error: true,
        message: error.response.data?.message || "Invalid email",
      };
    }

    return {
      error: true,
      message: "Network error. Try again.",
    };
  }
}

// NOTE: This endpoint may not exist in the new Centralized Auth System
// The new system uses token-based password reset instead of OTP verification
// If you encounter 404 errors, you may need to update the password reset flow
export async function verifyOtp(email, otp) {
  try {
    const response = await postWithFallback(["/auth/verify-otp", "/verify-otp"], {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      return {
        error: true,
        message: error.response.data?.message || "Invalid OTP",
      };
    }

    return {
      error: true,
      message: "Network error. Try again.",
    };
  }
}

export async function resetPassword(token, newPassword) {
  try {
    const response = await postWithFallback(["/auth/reset-password", "/reset-password"], {
      token,
      newPassword,
    });

    return response.data;
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Failed to reset password",
    };
  }
}

export async function changePassword(currentPassword, newPassword) {
  try {
    const baseUrl = String(resolveAuthBaseUrl()).replace(/\/$/, "");
    const accessToken =
      typeof window !== "undefined"
        ? normalizeAccessToken(sessionStorage.getItem("authToken"))
        : "";

    if (!baseUrl) {
      return {
        error: true,
        message: "Auth API base URL is not configured",
      };
    }

    if (!accessToken) {
      return {
        error: true,
        message: "Authentication token missing. Please login again.",
      };
    }

    const response = await axios.put(
      `${baseUrl}/change-password`,
      {
        current_password: currentPassword,
        new_password: newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Failed to change password",
    };
  }
}

export async function logoutUser() {
  try {
    // Get tokens from session storage with multiple key variations
    const accessToken = typeof window !== "undefined" ? sessionStorage.getItem("authToken") : null;
    let refreshToken = typeof window !== "undefined" ? sessionStorage.getItem("refreshToken") : null;
    
    // Try alternative key names if not found
    if (!refreshToken && typeof window !== "undefined") {
      refreshToken = sessionStorage.getItem("refresh_token") || 
                     sessionStorage.getItem("refreshToken") ||
                     sessionStorage.getItem("REFRESH_TOKEN");
    }
    
    if (!refreshToken) {
      console.warn("No refresh token found in sessionStorage, attempting logout anyway");
    }
    
    if (!accessToken) {
      console.warn("No access token found, proceeding with client-side logout only");
      return {
        message: "Logout successful",
      };
    }

    // Determine the base URL
    const APP_ENV = process.env.NEXT_PUBLIC_ENV || "development";
    const AUTH_BASE_MAP = {
      development: process.env.NEXT_PUBLIC_DEV_AUTH_API,
      test: process.env.NEXT_PUBLIC_TEST_AUTH_API,
      production: process.env.NEXT_PUBLIC_PROD_AUTH_API,
    };
    const baseURL = 
      AUTH_BASE_MAP[APP_ENV] ||
      process.env.NEXT_PUBLIC_AUTH_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "";

    if (!baseURL) {
      console.warn("No base URL configured, proceeding with client-side logout only");
      return {
        message: "Logout successful",
      };
    }

    // Create a separate axios instance for logout to bypass retry logic
    const logoutClient = axios.create({
      baseURL: String(baseURL).replace(/\/$/, ""),
      timeout: 5000, // 5 second timeout
    });

    // Prepare logout payload - include refresh token in the expected format
    const logoutPayload = refreshToken ? { refreshToken } : {};

    console.log("[logoutUser] Attempting logout with:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenPreview: accessToken ? accessToken.substring(0, 20) + "..." : null,
      refreshTokenPreview: refreshToken ? refreshToken.substring(0, 20) + "..." : null,
      endpoint: baseURL,
      payload: logoutPayload,
    });

    try {
      const response = await logoutClient.post("/auth/logout", logoutPayload, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log("[logoutUser] Logout successful, response:", response.data);
      return response.data;
    } catch (logoutError) {
      // Try fallback endpoint
      try {
        const fallbackResponse = await logoutClient.post("/logout", logoutPayload, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        console.log("[logoutUser] Logout successful with fallback, response:", fallbackResponse.data);
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.log("[logoutUser] API error:", {
          status: logoutError.response?.status,
          data: logoutError.response?.data,
          message: logoutError.response?.data?.message || logoutError.message,
        });
        console.error("Logout API error details:", logoutError.response?.data);
        
        // Return success anyway - logout should proceed client-side
        return {
          message: "Logout successful",
          apiWarning: "API logout failed, but client-side logout completed",
        };
      }
    }
  } catch (error) {
    console.error("Logout error:", error.message);
    // Logout should always succeed on client side
    return {
      message: "Logout successful",
      apiWarning: "Logout completed with client-side only",
    };
  }
}
