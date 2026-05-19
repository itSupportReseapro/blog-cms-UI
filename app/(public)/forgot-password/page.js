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
  const [sent, setSent] = useState(false);

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
      // Centralized Auth System sends password reset link via email
      const result = await sendForgotPasswordEmail(email);

      if (result?.error) {
        window.addSnackbar?.(result.message || "Failed to send password reset link", "error");
        return;
      }

      window.addSnackbar?.("Password reset instructions sent to your email.", "success");
      setSent(true);
      
      // Optional: Redirect back to login after a delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <main style={{ maxWidth: 420, margin: "56px auto", padding: "24px" }}>
        <h1>Check Your Email</h1>
        <p>
          We&apos;ve sent a password reset link to <strong>{email}</strong>. 
          Please check your email and click the link to reset your password.
        </p>
        <p style={{ marginTop: "16px", fontSize: "12px", color: "#666" }}>
          You&apos;ll be redirected to login in a few seconds...
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 420, margin: "56px auto", padding: "24px" }}>
      <h1>Forgot Password</h1>
      <p>Enter your email to receive a password reset link.</p>

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
          {submitting ? "Sending..." : "Send Reset Link"}
        </PdpButton>
      </form>
    </main>
  );
}
