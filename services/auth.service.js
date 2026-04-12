import authClient from "@/lib/authAxios";

const AUTH_APP_ID = process.env.NEXT_PUBLIC_AUTH_APP_ID || "20";

function resolveUserDisplayName(user, fallbackEmail = "") {
  const primaryNameParts = [user?.first_name, user?.last_name].filter(
    (value) => typeof value === "string" && value.trim()
  );
  const secondaryNameParts = [user?.firstName, user?.lastName].filter(
    (value) => typeof value === "string" && value.trim()
  );
  const fullName = (primaryNameParts.length ? primaryNameParts : secondaryNameParts)
    .filter((value) => typeof value === "string" && value.trim())
    .join(" ")
    .trim();
  const fallbackName = [user?.name, user?.full_name, user?.fullName, user?.username, user?.user_name]
    .find((value) => typeof value === "string" && value.trim())
    ?.replace(/\s+/g, " ")
    .trim();

  return (
    fullName ||
    fallbackName ||
    (typeof fallbackEmail === "string" && fallbackEmail.includes("@")
      ? fallbackEmail.split("@")[0]
      : "")
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

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    const response = await postWithFallback(["/login", "/auth/login"], { email, password });
    const payload = response.data ?? {};

    console.log("Login response:", payload);

    // Extract data from nested structure: { ok, message, data: { accessToken, refreshToken } }
    const data = payload.data ?? payload;
    
    const token = data.accessToken ?? data.access_token ?? data.token ?? payload.accessToken ?? payload.token ?? "";
    const refreshToken = data.refreshToken ?? data.refresh_token ?? payload.refreshToken ?? payload.refresh_token ?? null;
    
    const rawUser = payload.user ?? data.user ?? {
      id: payload.user_id ?? data.user_id ?? payload.id ?? data.id ?? "",
      user_id: payload.user_id ?? data.user_id ?? payload.id ?? data.id ?? "",
      first_name: payload.first_name ?? data.first_name ?? "",
      last_name: payload.last_name ?? data.last_name ?? "",
      firstName: payload.firstName ?? data.firstName ?? "",
      lastName: payload.lastName ?? data.lastName ?? "",
      name: payload.name ?? data.name ?? "",
      email: payload.email ?? data.email ?? email,
      role: payload.role ?? data.role ?? payload.user_type ?? data.user_type ?? "user",
    };

    const user = {
      ...rawUser,
      id: rawUser?.id ?? rawUser?.user_id ?? payload.user_id ?? data.user_id ?? payload.id ?? data.id ?? "",
      user_id:
        rawUser?.user_id ?? rawUser?.id ?? payload.user_id ?? data.user_id ?? payload.id ?? data.id ?? "",
      first_name: rawUser?.first_name ?? payload.first_name ?? data.first_name ?? "",
      last_name: rawUser?.last_name ?? payload.last_name ?? data.last_name ?? "",
      firstName: rawUser?.firstName ?? payload.firstName ?? data.firstName ?? "",
      lastName: rawUser?.lastName ?? payload.lastName ?? data.lastName ?? "",
      name: resolveUserDisplayName(rawUser, rawUser?.email ?? email),
      email: rawUser?.email ?? payload.email ?? data.email ?? email,
      role: rawUser?.role ?? payload.role ?? data.role ?? payload.user_type ?? data.user_type ?? "user",
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
    const AUTH_DOMAIN = process.env.NEXT_PUBLIC_AUTH_DOMAIN || "pubmanu.com";
    const registerPayload = {
      domain: payload?.domain ?? AUTH_DOMAIN,
      salutation: payload?.salutation ?? "",
      first_name: payload?.first_name ?? "",
      middle_name: payload?.middle_name ?? "",
      last_name: payload?.last_name ?? "",
      email: payload?.email ?? "",
      official_email: payload?.official_email ?? "",
      password: payload?.password ?? "",
      phone: payload?.phone ?? "",
      whatsapp_no: payload?.whatsapp_no ?? "",
      gender: payload?.gender ?? "",
      job_description: payload?.job_description ?? payload?.designation ?? "",
      company: payload?.company ?? "",
      country: payload?.country ?? "",
      gst: payload?.gst ?? "",
      hear_about_us: payload?.hear_about_us ?? "",
      about: payload?.about ?? payload?.description ?? "",
      user_photo: payload?.user_photo ?? "",
      address_1: payload?.address_1 ?? "",
      address_2: payload?.address_2 ?? "",
      aadhar_no: payload?.aadhar_no ?? "",
      pan: payload?.pan ?? "",
      app_id: payload?.app_id ?? String(AUTH_APP_ID),
      appId: payload?.appId ?? String(AUTH_APP_ID),
      ...payload,
    };
    const response = await postWithFallback(["/register", "/auth/register"], registerPayload);
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
    const response = await postWithFallback(["/refresh", "/auth/refresh"], {
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
    const response = await getWithFallback(["/me", "/auth/me"]);
    return response.data;
  } catch {
    return null;
  }
}

export async function sendForgotPasswordEmail(email) {
  try {
    const response = await postWithFallback(["/forgot-password", "/auth/forgot-password"], {
      app_id: String(AUTH_APP_ID),
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

export async function verifyOtp(email, otp) {
  try {
    const response = await postWithFallback(["/verify-otp", "/auth/verify-otp"], {
      app_id: String(AUTH_APP_ID),
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

export async function resetPassword(email, otp, newPassword, confirmPassword) {
  try {
    const response = await postWithFallback(["/reset-password", "/auth/reset-password"], {
      app_id: String(AUTH_APP_ID),
      email,
      otp,
      newPassword,
      confirmPassword,
    });

    return response.data;
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Failed to reset password",
    };
  }
}
