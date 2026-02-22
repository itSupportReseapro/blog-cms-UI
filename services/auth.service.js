import authClient from "@/lib/authAxios";

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    const response = await authClient.post("/auth/login", { email, password });
    const payload = response.data ?? {};

    console.log("Login response:", payload);

    // Extract data from nested structure: { ok, message, data: { accessToken, refreshToken } }
    const data = payload.data ?? payload;
    
    const token = data.accessToken ?? data.access_token ?? data.token ?? payload.accessToken ?? payload.token ?? "";
    const refreshToken = data.refreshToken ?? data.refresh_token ?? payload.refreshToken ?? payload.refresh_token ?? null;
    
    const user = payload.user ?? data.user ?? {
      id: payload.user_id ?? data.user_id ?? payload.id ?? data.id ?? "",
      name: payload.name ?? data.name ?? "",
      email: payload.email ?? data.email ?? email,
      role: payload.role ?? data.role ?? payload.user_type ?? data.user_type ?? "user",
    };

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
    const response = await authClient.post("/auth/register", payload);
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
    const response = await authClient.post("/auth/refresh", {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    const apiMessage = error?.response?.data?.message;
    throw new Error(apiMessage || "Token refresh failed");
  }
}

export async function getProfile() {
  try {
    const response = await authClient.get("/auth/me");
    return response.data;
  } catch {
    return null;
  }
}
