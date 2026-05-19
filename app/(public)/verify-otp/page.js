"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PdpTextbox1 from "@/assets/textbox/PdpTextbox1";
import PdpButton from "@/assets/buttons/button";
import { verifyOtp, sendForgotPasswordEmail } from "@/services/auth.service";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      window.addSnackbar?.("Email is missing. Restart forgot password flow.", "error");
      router.push("/forgot-password");
      return;
    }

    if (!otp || otp.length < 4) {
      window.addSnackbar?.("Enter a valid OTP", "error");
      return;
    }

    try {
      setSubmitting(true);
      const result = await verifyOtp(email, otp);

      if (result?.error) {
        window.addSnackbar?.(result.message || "OTP verification failed", "error");
        return;
      }

      window.addSnackbar?.("OTP verified", "success");
      router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      window.addSnackbar?.("Email is missing. Restart forgot password flow.", "error");
      return;
    }

    try {
      setIsResending(true);
      const result = await sendForgotPasswordEmail(email);

      if (result?.error) {
        window.addSnackbar?.(result.message || "Failed to send OTP", "error");
        return;
      }

      window.addSnackbar?.("OTP sent. Check your email.", "success");
    } catch (error) {
      window.addSnackbar?.("Failed to resend OTP", "error");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: "56px auto", padding: "24px" }}>
      <h1>Verify OTP</h1>
      <p>Enter the OTP sent to {email || "your email"}.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
        <PdpTextbox1
          label="OTP"
          name="otp"
          id="otp"
          type="text"
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
        />

        <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
          <PdpButton type="submit" variant="primary" fullWidth disabled={submitting || isResending}>
            {submitting ? "Verifying..." : "Verify OTP"}
          </PdpButton>

          <PdpButton 
            type="button" 
            variant="outline" 
            fullWidth 
            onClick={handleResendOtp} 
            disabled={submitting || isResending}
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </PdpButton>
        </div>
      </form>
    </main>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}
