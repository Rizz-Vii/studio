"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import ReCAPTCHA from "react-google-recaptcha";
import { Eye, EyeOff } from "lucide-react";
import LoadingScreen from "@/components/ui/loading-screen";

export default function RegisterPage() {
  // Auth guard - redirect authenticated users away from register page
  const { shouldRender } = useAuthGuard();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    captcha?: string;
    form?: string;
  }>({});

  if (loading) {
    return <LoadingScreen fullScreen text="Setting up your account..." />;
  }

  if (!shouldRender) {
    return <LoadingScreen fullScreen text="Redirecting..." />;
  }

  function validate() {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      newErrors.email = "Invalid email address.";
    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    if (!agreeTerms)
      newErrors.terms = "You must agree to the Terms & Conditions.";
    if (!captchaToken) newErrors.captcha = "Please verify that you're human.";
    return newErrors;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password.trim()
      );
      // User document will be created by ensureUserSubscription in AuthContext
      // This ensures consistent subscription structure across all auth methods
      router.push("/dashboard");
    } catch (error: any) {
      setErrors({
        form: error?.message || "Registration failed. Please try again.",
      });
    }
  }

  return (
    <div className="inset-0 flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md p-8 space-y-6 rounded-1xl shadow-xl border bg-white -mt-16"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 underline mb-2">
          Register
        </h2>
        <div>
          <label htmlFor="email" className="block font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
          />
          <p className="text-xs text-red-600 mt-1">{errors.email}</p>
        </div>
        <div className="relative">
          <label htmlFor="password" className="block font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg pr-10 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-9 text-gray-600"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <p className="text-xs text-red-600 mt-1">{errors.password}</p>
        </div>
        <div className="relative">
          <label htmlFor="confirmPassword" className="block font-medium mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg pr-10 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-9 text-gray-600"
            onClick={() => setShowConfirm((v) => !v)}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
        </div>
        <div>
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onChange={(token) => setCaptchaToken(token || "")}
          />
          <p className="text-xs text-red-600 mt-1">{errors.captcha}</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="terms" className="text-sm">
              I agree to the{" "}
              <a href="/terms" className="underline text-blue-600">
                Terms & Conditions
              </a>
            </label>
          </div>
          {errors.terms && (
            <p className="text-xs text-red-600 mt-1">{errors.terms}</p>
          )}
        </div>
        {errors.form && (
          <p className="text-xs text-red-600 mt-1">{errors.form}</p>
        )}
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition"
        >
          Register
        </button>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
