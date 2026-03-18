"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./signup.css";
import PdpTextbox1 from "@/assets/textbox/PdpTextbox1";
import PdpButton from "@/assets/buttons/button";
import Image from "next/image";
import GoogleIcon from "@/assets/Images/icon/googleICON.svg";
import leftImg from "@/assets/Images/img/signupIMG.svg";
import { registerUser } from "@/services/auth.service";

export default function SignupPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!form.first_name) {
      newErrors.first_name = "First Name is required";
      window.addSnackbar("First Name is required", "error");
    }
    if (!form.last_name) {
      newErrors.last_name = "Last Name is required";
      window.addSnackbar("Last Name is required", "error");
    }
    if (!form.email) {
      newErrors.email = "Email is required";
      window.addSnackbar("Email is required", "error");
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Enter a valid email";
      window.addSnackbar("Enter a valid email", "error");
    }
    if (!form.phone) {
      newErrors.phone = "Phone is required";
      window.addSnackbar("Phone number is required", "error");
    }
    if (!form.password) {
      newErrors.password = "Password is required";
      window.addSnackbar("Password is required", "error");
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      window.addSnackbar("Password must be at least 6 characters", "error");
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      window.addSnackbar("Passwords do not match", "error");
    }

    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      const res = await registerUser({
        name: `${form.first_name} ${form.last_name}`.trim(),
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      if (res.error) {
        window.addSnackbar(res.message, "error");
        return;
      }

      window.addSnackbar("Signup successful!", "success");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="leftImgSignup">
        <Image src={leftImg} alt="leftImg" />
      </div>
      <div className="rightImgSignup">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="login-header">
            <h2>Sign Up</h2>
            <p>Create your account to get started</p>
          </div>

          <PdpTextbox1
            label="First Name"
            name="first_name"
            id="first_name"
            type="text"
            onChange={handleChange}
            value={form.first_name}
          />

          <PdpTextbox1
            label="Last Name"
            name="last_name"
            id="last_name"
            type="text"
            onChange={handleChange}
            value={form.last_name}
          />

          <PdpTextbox1
            label="Email"
            name="email"
            id="email"
            type="email"
            onChange={handleChange}
            value={form.email}
          />

          <PdpTextbox1
            label="Phone Number"
            name="phone"
            id="phone"
            type="text"
            onChange={handleChange}
            value={form.phone}
          />

          <PdpTextbox1
            label="Password"
            name="password"
            id="password"
            type="password"
            maskText={true}
            onChange={handleChange}
            value={form.password}
          />

          <PdpTextbox1
            label="Confirm Password"
            name="confirmPassword"
            id="confirmPassword"
            type="password"
            maskText={true}
            onChange={handleChange}
            value={form.confirmPassword}
          />

          <div className="CheckNforgetBox">
            <div className="check">
              <input type="checkbox" required />I agree to all the{" "}
              <span>Terms</span> and <span>Privacy Policies</span>
            </div>
          </div>

          <PdpButton
            type="submit"
            variant="primary"
            size="md"
            radius="sm"
            fullWidth
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </PdpButton>

          <p>
            Already have an account? <a href="/login">Login</a>
          </p>

          <div className="greylines">
            <div className="left-line"></div>
            <div className="middle-text">or Sign up with</div>
            <div className="right-line"></div>
          </div>
          <div className="btn-white">
            <div>
              <Image src={GoogleIcon} alt="Google" />
            </div>
            <div className="btn-txt">Sign up with Google</div>
          </div>
        </form>
      </div>
    </div>
  );
}
