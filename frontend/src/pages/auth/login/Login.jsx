import { useState } from "react";

import AuthImagePattern from "../../../components/AuthImagePattern";
import {
  Mail,
  Eye,
  EyeOff,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useStateContext } from "../../../contexts/ContextProvider";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { currentColor } = useStateContext();
  const queryClient = useQueryClient();

  // Real-time validation
  const validateField = (field, value) => {
    const errors = { ...validationErrors };

    switch (field) {
      case "email":
        if (!value.trim()) {
          errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.email = "Invalid email format";
        } else {
          delete errors.email;
        }
        break;

      case "password":
        if (!value) {
          errors.password = "Password is required";
        } else if (value.length < 6) {
          errors.password = "Password must be at least 6 characters";
        } else {
          delete errors.password;
        }
        break;

      default:
        break;
    }

    setValidationErrors(errors);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    validateField(field, value);
  };

  const {
    mutate: loginMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ email, password }) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Something went wrong");
        }

        return res.json();
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }

        throw new Error("Something went wrong");
      }
    },
    onSuccess: () => {
      //redirect to dashboard
      queryClient.invalidateQueries({ querykey: ["authUser"] });
      toast.success("logged in successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handlesubmit = (e) => {
    e.preventDefault();
    loginMutation(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Left Side - Enhanced Form */}
      <div className="flex justify-center items-center p-6 sm:p-12 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-lg space-y-8 relative z-10">
          {/* Enhanced Header */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-4 group">
              {/* Logo with enhanced styling */}
              <div className="relative">
                <div
                  className="size-16 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-2xl group-hover:scale-110 backdrop-blur-sm border border-white/20"
                  style={{
                    background: `linear-gradient(135deg, ${currentColor}15, ${currentColor}35)`,
                  }}
                >
                  <Shield
                    className="size-8 transition-all duration-300"
                    style={{ color: currentColor }}
                  />
                </div>
                {/* Floating elements */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                <div
                  className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Welcome Back
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg max-w-sm leading-relaxed">
                  Sign in to access your CMFPG dashboard
                </p>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  System Online
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Form */}
          <form
            onSubmit={handlesubmit}
            className="space-y-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50"
          >
            {/* Email Field */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Mail className="size-4" style={{ color: currentColor }} />
                Email Address
                <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="size-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  className={`block w-full pl-12 pr-12 py-3.5 border-2 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-300 ${
                    validationErrors.email
                      ? "border-red-300 focus:border-red-500"
                      : formData.email && !validationErrors.email
                      ? "border-green-300 focus:border-green-500"
                      : "border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  }`}
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  {validationErrors.email ? (
                    <AlertCircle className="size-5 text-red-500" />
                  ) : formData.email && !validationErrors.email ? (
                    <CheckCircle className="size-5 text-green-500" />
                  ) : null}
                </div>
              </div>
              {validationErrors.email && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="size-4" />
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Lock className="size-4" style={{ color: currentColor }} />
                Password
                <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="size-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={`block w-full pl-12 pr-12 py-3.5 border-2 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-300 ${
                    validationErrors.password
                      ? "border-red-300 focus:border-red-500"
                      : formData.password && !validationErrors.password
                      ? "border-green-300 focus:border-green-500"
                      : "border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  }`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
                  {validationErrors.password ? (
                    <AlertCircle className="size-5 text-red-500" />
                  ) : formData.password && !validationErrors.password ? (
                    <CheckCircle className="size-5 text-green-500" />
                  ) : null}
                  <button
                    type="button"
                    className="text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="size-4" />
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Enhanced Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="group relative w-full py-4 px-6 rounded-2xl text-white font-semibold text-lg transition-all duration-500 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-xl hover:shadow-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${currentColor}, ${currentColor}dd)`,
                }}
                disabled={isPending}
              >
                {/* Button background animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                <div className="relative flex items-center justify-center gap-3">
                  {isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="size-5 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Sign In</span>
                      <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>

              {/* Error Display */}
              {isError && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="size-4" />
                    {error.message}
                  </p>
                </div>
              )}
            </div>
          </form>

          {/* Enhanced Footer */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Need Help?
              </span>
              <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Don&apos;t have an account?
              </p>
              <a
                href="tel:68310"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                <Shield className="size-4" />
                Contact REPI Administrator: 68310
              </a>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Secure access to CMFPG Management System
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title={"Welcome back!"}
        subtitle={
          "  Sign in to continue your conversations, catch up with your messages, and manage your maintenance."
        }
      />
    </div>
  );
};
export default LoginPage;
