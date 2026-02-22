"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import PdpTextbox1 from "@/assets/textbox/PdpTextbox1";
import GoogleIcon from "@/assets/Images/icon/googleICON.svg";
import LoginImg from "@/assets/Images/img/loginIMG.svg";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const rememberMe = localStorage.getItem("rememberMe");

    if (rememberMe === "true") {
      const savedEmail = localStorage.getItem("savedEmail");
      const savedPassword = localStorage.getItem("savedPassword");

      if (savedEmail) {
        setEmail(savedEmail);
      }

      if (savedPassword) {
        try {
          setPassword(atob(savedPassword));
        } catch {
          setPassword("");
        }
      }

      setRemember(true);
    }
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/blog/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (!email) {
      const message = "Email is required";
      setError(message);
      window.addSnackbar?.(message, "error");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      const message = "Enter a valid email";
      setError(message);
      window.addSnackbar?.(message, "error");
      return;
    }

    if (!password) {
      const message = "Password is required";
      setError(message);
      window.addSnackbar?.(message, "error");
      return;
    }

    try {
      setSubmitting(true);
      await login({ email, password });

      if (remember) {
        localStorage.setItem("savedEmail", email);
        localStorage.setItem("savedPassword", btoa(password));
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("savedPassword");
        localStorage.removeItem("rememberMe");
      }

      window.addSnackbar?.("Login successful", "success");
      router.replace("/blog/dashboard");
    } catch (submissionError) {
      const message = submissionError.message || "Login failed";
      setError(message);
      window.addSnackbar?.(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="leftImgLogin">
        <form onSubmit={handleLogin} className="auth-form-login">
          <div className="login-header">
            <h2>Login to your account</h2>
            <p>Welcome back! Select method to log in:</p>
          </div>

          <PdpTextbox1
            label="Email"
            name="email"
            id="email"
            type="email"
            value={email}
            readOnly={!emailFocused}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="off"
            onFocus={() => setEmailFocused(true)}
          />

          <PdpTextbox1
            label="Password"
            name="password"
            id="password"
            type="password"
            value={password}
            maskText={true}
            readOnly={!passwordFocused}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            onFocus={() => setPasswordFocused(true)}
          />

          <div className="CheckNforgetBox">
            <div className="check">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              Remember me
            </div>

            <div className="forget">
              <p>
                <a href="/forgot-password">Forgot Password?</a>
              </p>
            </div>
          </div>

          <button type="submit" className="btn-blue" disabled={submitting}>
            {submitting ? "Logging in..." : "Login"}
          </button>

          <div className="orSignup">
            <p>
              Don’t have an account?{" "}
              <span className="link-signup">
                <a href="/signup">Sign Up</a>
              </span>
            </p>
          </div>

          <div className="greylines">
            <div className="left-line"></div>
            <div className="middle-text">or Sign up with</div>
            <div className="right-line"></div>
          </div>

          <div className="btn-white">
            <Image src={GoogleIcon} alt="Google" />
            <div className="btn-txt">Google</div>
          </div>

          {error ? <p className="error-text">{error}</p> : null}
        </form>
      </div>

      <div className="rightImgLogin">
        <Image src={LoginImg} alt="Login Illustration" />
      </div>
    </div>
  );
}
