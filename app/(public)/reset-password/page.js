"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PdpTextbox1 from "@/assets/textbox/PdpTextbox1";
import PdpButton from "@/assets/buttons/button";
import { resetPassword } from "@/services/auth.service";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const otp = searchParams.get("otp") || "";

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !otp) {
      window.addSnackbar?.("Email or OTP is missing. Restart forgot password flow.", "error");
      router.push("/forgot-password");
      return;
    }

    if (!form.newPassword || form.newPassword.length < 6) {
      window.addSnackbar?.("Password must be at least 6 characters", "error");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      window.addSnackbar?.("Passwords do not match", "error");
      return;
    }

    try {
      setSubmitting(true);
      const result = await resetPassword(email, otp, form.newPassword, form.confirmPassword);

      if (result?.error) {
        window.addSnackbar?.(result.message || "Failed to reset password", "error");
        return;
      }

      window.addSnackbar?.("Password reset successful", "success");
      router.push("/login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: "56px auto", padding: "24px" }}>
      <h1>Reset Password</h1>
      <p>Set a new password for {email || "your account"}.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
        <PdpTextbox1
          label="New Password"
          name="newPassword"
          id="newPassword"
          type="password"
          maskText={true}
          value={form.newPassword}
          onChange={handleChange}
        />

        <PdpTextbox1
          label="Confirm Password"
          name="confirmPassword"
          id="confirmPassword"
          type="password"
          maskText={true}
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <PdpButton type="submit" variant="primary" fullWidth disabled={submitting}>
          {submitting ? "Resetting..." : "Reset Password"}
        </PdpButton>
      </form>
    </main>
  );
}
