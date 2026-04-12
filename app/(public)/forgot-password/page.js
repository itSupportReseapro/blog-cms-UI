"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PdpTextbox1 from "@/assets/textbox/PdpTextbox1";
import PdpButton from "@/assets/buttons/button";
import { sendForgotPasswordEmail } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      window.addSnackbar?.("Email is required", "error");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      window.addSnackbar?.("Enter a valid email", "error");
      return;
    }

    try {
      setSubmitting(true);
      const result = await sendForgotPasswordEmail(email);

      if (result?.error) {
        window.addSnackbar?.(result.message || "Failed to send OTP", "error");
        return;
      }

      window.addSnackbar?.("OTP sent. Check your email.", "success");
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: "56px auto", padding: "24px" }}>
      <h1>Forgot Password</h1>
      <p>Enter your email to receive a verification code.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
        <PdpTextbox1
          label="Email"
          name="email"
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <PdpButton type="submit" variant="primary" fullWidth disabled={submitting}>
          {submitting ? "Sending..." : "Send OTP"}
        </PdpButton>
      </form>
    </main>
  );
}
