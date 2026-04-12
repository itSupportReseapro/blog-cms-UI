"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PdpTextbox1 from "@/assets/textbox/PdpTextbox1";
import PdpButton from "@/assets/buttons/button";
import { verifyOtp } from "@/services/auth.service";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

        <PdpButton type="submit" variant="primary" fullWidth disabled={submitting}>
          {submitting ? "Verifying..." : "Verify OTP"}
        </PdpButton>
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
