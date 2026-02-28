import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const authStyles = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  font-family: "Manrope", "DM Sans", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: #e9eef6;
}

.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

/* Left Section */
.auth-left {
  position: relative;
  padding: 120px;
  
  color: #ffffff;
  background:
    linear-gradient(180deg, rgba(15, 35, 84, 0.42), rgba(10, 21, 54, 0.74)),
    url("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1800&q=80"),
    radial-gradient(circle at 20% 20%, rgba(96, 165, 250, 0.5), transparent 45%),
    linear-gradient(135deg, #94b8ff, #3b82f6 55%, #1e3a8a);
  background-size: cover, cover, cover, cover;
  background-position: center, center, center, center;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-left::before {
  content: "";
  position: absolute;
  inset: 15% 10% 10% 10%;
  border-radius: 30px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.08));
  border: 1px solid rgba(255, 255, 255, 0.18);
  pointer-events: none;
}

.auth-left::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(191, 219, 254, 0.18) 1px, transparent 1px),
    linear-gradient(90deg, rgba(191, 219, 254, 0.18) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.06));
}

.left-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 520px;
  margin: auto auto;
}

.trusted {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 100px;
  background: rgba(96, 165, 250, 0.23);
  border: 1px solid rgba(191, 219, 254, 0.45);
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.3px;
  backdrop-filter: blur(8px);
  margin-bottom: 8px;
}

.trusted i {
  font-size: 14px;
}

.left-title {
  font-size: 44px;
  line-height: 1.2;
  letter-spacing: -0.02em;
  font-weight: 800;
  margin-bottom: 16px;
}

.left-title span {
  color: #bfdbfe;
}

.left-sub {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(240, 255, 250, 0.9);
  max-width: 440px;
  margin-bottom: 32px;
}

.stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  color: #ffffff;
  border-radius: 20px;
  padding: 18px 22px;
  min-width: 170px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.stat strong {
  display: block;
  font-size: 30px;
  line-height: 1.2;
  color: #bfdbfe;
  margin-bottom: 4px;
}

.stat span {
  font-size: 13px;
  opacity: 0.8;
  letter-spacing: 0.5px;
}

/* Right Section */
.auth-right {
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.panel {
  width: min(440px, 100%);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 700;
  color: #111b37;
  margin-bottom: 32px;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  display: grid;
  place-items: center;
  font-size: 20px;
  transition: transform 0.2s ease;
}

.brand-mark:hover {
  transform: scale(1.05);
}

.title {
  font-size: 34px;
  color: #111b37;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.subtitle {
  color: #5e708f;
  font-size: 15px;
  margin-bottom: 28px;
}

.toggle {
  display: flex;
  gap: 8px;
  background: #f1f4f9;
  padding: 4px;
  border-radius: 14px;
  margin-bottom: 32px;
}

.toggle button {
  flex: 1;
  text-align: center;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  color: #5e708f;
  transition: all 0.2s ease;
  border: none;
  background: transparent;
  cursor: pointer;
}

.toggle button.active {
  background: #ffffff;
  color: #1d4ed8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.toggle button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 14px;
  font-weight: 600;
  color: #1f2e4e;
}

.field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.link {
  font-size: 13px;
  font-weight: 500;
  color: #1d4ed8;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.link:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
  border-radius: 4px;
}

.input {
  height: 52px;
  border-radius: 14px;
  border: 1px solid #e1e6ec;
  background: #f8fafd;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  transition: all 0.2s ease;
}

.input:focus-within {
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.14);
}

.input.error {
  border-color: #e53e3e;
  background: #fff5f5;
}

.input.error:focus-within {
  box-shadow: 0 0 0 4px rgba(229, 62, 62, 0.1);
}

.input i {
  color: #8e9db1;
  font-size: 16px;
  width: 18px;
}

.input input {
  border: 0;
  background: transparent;
  width: 100%;
  font-size: 15px;
  outline: none;
  color: #1f2e4e;
}

.input input::placeholder {
  color: #a6b5c9;
}

.password-input {
  display: flex;
  align-items: center;
  width: 100%;
}

.password-input input {
  flex: 1;
}

.eye-icon {
  cursor: pointer;
  color: #8e9db1;
  transition: color 0.2s ease;
}

.eye-icon:hover {
  color: #1d4ed8;
}

.error-message {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 2px;
}

.check {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #4f607f;
  font-size: 14px;
  margin: 4px 0 8px;
  cursor: pointer;
}

.check input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2563eb;
}

.submit {
  width: 100%;
  height: 54px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  margin-top: 8px;
  border: none;
}

.submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.25);
}

.submit:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit.loading {
  position: relative;
  color: transparent;
}

.submit.loading::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.or {
  margin: 28px 0 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #8e9db1;
  font-weight: 500;
  font-size: 13px;
}

.or::before,
.or::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e6eaf0;
}

.socials {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.social {
  height: 52px;
  border-radius: 14px;
  border: 1px solid #e6eaf0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #1f2e4e;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.social:hover {
  background: #f8fafd;
  border-color: #cbd0d9;
  transform: translateY(-1px);
}

.social:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.social i {
  font-size: 18px;
  color: #5e708f;
}

/* Responsive */
@media (max-width: 900px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-left {
    min-height: 400px;
    padding: 48px 24px;
  }

  .left-content {
    text-align: center;
    max-width: 100%;
  }

  .left-sub {
    margin-left: auto;
    margin-right: auto;
  }

  .stats {
    justify-content: center;
  }

  .auth-right {
    padding: 48px 24px;
  }
}

@media (max-width: 480px) {
  .left-title {
    font-size: 36px;
  }

  .stats {
    flex-direction: column;
  }

  .stat {
    width: 100%;
    min-width: auto;
  }

  .socials {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 28px;
  }
}
`;

const CONFIGURED_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const DIRECT_API_BASE_URL = (import.meta.env.VITE_API_TARGET || "http://127.0.0.1:8001").replace(/\/$/, "");
const LOCALHOST_API_BASE_URL = "http://localhost:8001";
const API_BASE_URLS = Array.from(
  new Set([CONFIGURED_API_BASE_URL, DIRECT_API_BASE_URL, LOCALHOST_API_BASE_URL].filter(Boolean))
);

const getErrorMessage = (data, fallback, rawText = "") => {
  if (data && typeof data.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    const firstDetail = data.detail[0];
    if (typeof firstDetail === "string") return firstDetail;
    if (firstDetail && typeof firstDetail.msg === "string") return firstDetail.msg;
  }

  if (data && typeof data.message === "string") {
    return data.message;
  }

  if (typeof rawText === "string" && rawText.trim()) {
    return rawText.trim().slice(0, 240);
  }

  return fallback;
};

const postJson = async (path, payload, fallbackMessage) => {
  for (const baseUrl of API_BASE_URLS) {
    let response;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    try {
      response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch {
      window.clearTimeout(timeoutId);
      continue;
    }
    window.clearTimeout(timeoutId);

    const rawText = await response.text();
    let data = null;
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      const shouldTryFallback =
        (baseUrl.startsWith("/") || response.status >= 500) &&
        API_BASE_URLS.length > 1 &&
        [404, 408, 429, 500, 502, 503, 504].includes(response.status);

      if (shouldTryFallback) {
        continue;
      }

      throw new Error(getErrorMessage(data, fallbackMessage, rawText));
    }

    return data || {};
  }

  throw new Error(
    `Cannot reach auth server. Tried ${API_BASE_URLS.join(", ")}. Ensure your backend is running.`
  );
};

function AuthPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    remember: true,
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isSignup = mode === "signup";

  const firstFieldRef = useRef(null);
  const submitButtonRef = useRef(null);

  const handleChange = useCallback((e) => {
    const { id, name, value, type, checked } = e.target;
    const key = id || name;
    if (!key) return;

    setFormData(prev => ({
      ...prev,
      [key]: type === "checkbox" ? checked : value
    }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: "" }));
    }
    if (submitError) setSubmitError("");
  }, [errors, submitError]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isSignup && !formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (isSignup && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (isSignup) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (isSignup && !formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the Terms of Service";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isSignup]);

  const handleSubmit = useCallback(async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsLoading(true);
  setSubmitError("");

  try {
    const normalizedEmail = formData.email.trim().toLowerCase();
    let authData = null;

    if (isSignup) {
      // 🔹 REGISTER USER
      const registerData = await postJson(
        "/register",
        {
          name: formData.name.trim(),
          email: normalizedEmail,
          password: formData.password,
          agreeTerms: formData.agreeTerms,
        },
        "Sign up failed"
      );

      // Some backends return token directly on register
      authData = registerData?.access_token
        ? registerData
        : await postJson(
            "/login",
            {
              email: normalizedEmail,
              password: formData.password,
            },
            "Authentication failed"
          );
    } else {
      // 🔹 LOGIN USER
      authData = await postJson(
        "/login",
        {
          email: normalizedEmail,
          password: formData.password,
        },
        "Authentication failed"
      );
    }

    if (!authData?.access_token) {
      throw new Error("Authentication token missing in server response");
    }

    // 🔹 Store authentication data
    localStorage.setItem("auth_token", authData.access_token);
    localStorage.setItem("token", authData.access_token);
    localStorage.setItem("auth_user_id", authData.user_id || authData.id || "");
    localStorage.setItem("auth_email", normalizedEmail);
    localStorage.setItem("userEmail", normalizedEmail);

    if (isSignup) {
      localStorage.setItem("auth_name", formData.name.trim());
      localStorage.setItem("finsight_new_user", "1");
    }
    window.dispatchEvent(new Event("finsight:auth-updated"));

    // 🔥 CONDITIONAL NAVIGATION
    if (isSignup) {
      navigate("/quiz");        // After Sign Up → Quiz
    } else {
      navigate("/dashboard");   // After Login → Dashboard
    }

  } catch (error) {
    setSubmitError(error.message || "Network error. Please try again.");
  } finally {
    setIsLoading(false);
  }
}, [formData, isSignup, validateForm, navigate]);
  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    setErrors({});
    setSubmitError("");
    setFormData(prev => ({
      ...prev,
      password: "",
      confirmPassword: "",
      name: "",
      email: prev.email, // keep email if you want
    }));
    setTimeout(() => {
      if (firstFieldRef.current) {
        firstFieldRef.current.focus();
      }
    }, 0);
  }, []);

  return (
    <div className="auth-page">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
      />
      <style>{authStyles}</style>

      <section className="auth-left">
        <div className="left-content">
          <div className="trusted">
            <i className="fa-solid fa-shield-halved" aria-hidden="true"></i> 
            <span>Trusted by 50,000+ users</span>
          </div>
          <h1 className="left-title">
            Start your journey to <span>financial freedom.</span>
          </h1>
          <p className="left-sub">
            Experience the most intuitive personal finance tracker. Manage budgets, track expenses, and see your wealth
            grow.
          </p>
          <div className="stats">
            <div className="stat">
              <strong>99.9%</strong>
              <span>DATA SECURITY</span>
            </div>
            <div className="stat">
              <strong>24/7</strong>
              <span>SUPPORT ACCESS</span>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-right">
        <div className="panel">
          <div className="brand">
            <span className="brand-mark" aria-label="Finsight logo">
              <i className="fa-solid fa-arrow-trend-up" aria-hidden="true"></i>
            </span>
            <span>Finsight</span>
          </div>

          <h2 className="title">{isSignup ? "Create account" : "Welcome back"}</h2>
          <p className="subtitle">
            {isSignup ? "Sign up to start your financial journey" : "Enter your credentials to access your account"}
          </p>

          <div className="toggle" role="tablist">
            <button
              role="tab"
              aria-selected={!isSignup}
              className={!isSignup ? "active" : ""}
              onClick={() => handleModeChange("login")}
            >
              Log In
            </button>
            <button
              role="tab"
              aria-selected={isSignup}
              className={isSignup ? "active" : ""}
              onClick={() => handleModeChange("signup")}
            >
              Sign Up
            </button>
          </div>

          <form className="form" onSubmit={handleSubmit} noValidate>
            {isSignup && (
              <div className="form-group">
                <label className="label" htmlFor="name">
                  Full Name
                </label>
                <div className={`input ${errors.name ? "error" : ""}`}>
                  <i className="fa-regular fa-user" aria-hidden="true"></i>
                  <input
                    ref={isSignup ? firstFieldRef : null}
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                </div>
                {errors.name && (
                  <div id="name-error" className="error-message" role="alert">
                    {errors.name}
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="label" htmlFor="email">
                Email Address
              </label>
              <div className={`input ${errors.email ? "error" : ""}`}>
                <i className="fa-regular fa-envelope" aria-hidden="true"></i>
                <input
                  ref={!isSignup ? firstFieldRef : null}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <div id="email-error" className="error-message" role="alert">
                  {errors.email}
                </div>
              )}
            </div>

            <div className="form-group">
              <div className="field-row">
                <label className="label" htmlFor="password">
                  Password
                </label>
                {!isSignup && (
                  <a 
                    href="#" 
                    className="link"
                    onClick={(e) => e.preventDefault()}
                  >
                    Forgot Password?
                  </a>
                )}
              </div>
              <div className={`input ${errors.password ? "error" : ""}`}>
                <i className="fa-solid fa-lock" aria-hidden="true"></i>
                <div className="password-input">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignup ? "Create a password" : "Enter your password"}
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                </div>
                <i
                  className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"} eye-icon`}
                  onClick={togglePasswordVisibility}
                    role="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && togglePasswordVisibility()}
                  ></i>
              </div>
              {errors.password && (
                <div id="password-error" className="error-message" role="alert">
                  {errors.password}
                </div>
              )}
            </div>

            {isSignup && (
              <div className="form-group">
                <label className="label" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <div className={`input ${errors.confirmPassword ? "error" : ""}`}>
                  <i className="fa-solid fa-lock" aria-hidden="true"></i>
                  <div className="password-input">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                    />
                  </div>
                  <i
                    className={`fa-regular ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} eye-icon`}
                    onClick={toggleConfirmPasswordVisibility}
                    role="button"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleConfirmPasswordVisibility()}
                  ></i>
                </div>
                {errors.confirmPassword && (
                  <div id="confirm-password-error" className="error-message" role="alert">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            )}

            {!isSignup && (
              <label className="check">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={formData.remember}
                  onChange={handleChange}
                />
                <span>Remember me for 30 days</span>
              </label>
            )}

            {isSignup && (
              <>
                <label className="check">
                  <input
                    id="agreeTerms"
                    name="agreeTerms"
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    aria-invalid={!!errors.agreeTerms}
                    aria-describedby={errors.agreeTerms ? "terms-error" : undefined}
                  />
                  <span>I agree to the Terms of Service and Privacy Policy</span>
                </label>
                {errors.agreeTerms && (
                  <div id="terms-error" className="error-message" role="alert">
                    {errors.agreeTerms}
                  </div>
                )}
              </>
            )}

            {submitError && (
              <div className="error-message" role="alert" style={{ textAlign: 'center' }}>
                {submitError}
              </div>
            )}

            <button
              ref={submitButtonRef}
              className={`submit ${isLoading ? "loading" : ""}`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "" : (isSignup ? "Sign Up" : "Log In")}
              {!isLoading && <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>}
            </button>
          </form>

          <div className="or">Or continue with</div>
          <div className="socials">
            <button className="social" type="button" disabled={isLoading}>
              <i className="fa-brands fa-google" aria-hidden="true"></i> Google
            </button>
            <button className="social" type="button" disabled={isLoading}>
              <i className="fa-brands fa-apple" aria-hidden="true"></i> Apple
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AuthPage;
