import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import AuthImagePattern from "../components/AuthImagePattern";
import { Eye, EyeOff, Lock, Mail, MessageSquare, User } from "lucide-react";
import toast from "react-hot-toast";
import { useStateContext } from "../contexts/ContextProvider";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    grade: "",
    role: "",
  });
  const { currentColor } = useStateContext();

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ username, email, password, role, grade }) => {
      try {
        const res = await fetch("/api/users/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password, role, grade }),
        });
        if (!res.ok) {
          const errorResponse = await res.json();
          const errorMessage = errorResponse.error || "Unknown error";
          if (errorMessage.toLowerCase().includes("username already exists")) {
            toast.error(
              "Username already exists. Please choose a different one."
            );
          } else if (
            errorMessage.toLowerCase().includes("email already exists")
          ) {
            toast.error("Email already exists. Please use a different email.");
          } else {
            toast.error(errorMessage);
          }
          throw new Error(errorMessage);
        }
        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error in signup:", error.message);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Account created successfully");
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        grade: "",
        role: "",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      mutate(formData);
    }
  };

  const validateForm = () => {
    // Username validation
    if (!formData.username.trim()) return toast.error("Username is required");
    if (formData.username.length > 50)
      return toast.error("Username must be less than 50 characters");

    // Email validation
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (formData.email.length > 100)
      return toast.error("Email must be less than 100 characters");

    // Password validation
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 8)
      return toast.error("Password must be at least 8 characters");
    if (!/[A-Z]/.test(formData.password))
      return toast.error("Password must contain at least one uppercase letter");
    if (!/[a-z]/.test(formData.password))
      return toast.error("Password must contain at least one lowercase letter");
    if (!/[0-9]/.test(formData.password))
      return toast.error("Password must contain at least one number");
    if (!/[^A-Za-z0-9]/.test(formData.password))
      return toast.error(
        "Password must contain at least one special character"
      );

    // Confirm password validation
    if (formData.password !== formData.confirmPassword)
      return toast.error("Passwords do not match");

    // Role and grade validation
    if (!formData.role) return toast.error("Role is required");
    if (!formData.grade) return toast.error("Grade is required");

    return true;
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData({ ...formData, email });
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Invalid email format", { id: "email-error" });
    } else {
      toast.dismiss("email-error");
    }
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    if (password && password.length < 8) {
      toast.error("Password must be at least 8 characters", {
        id: "password-error",
      });
    } else {
      toast.dismiss("password-error");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-gray-900">
      {/* Left side */}
      <div className="flex justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-3 group">
              <div
                className="size-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${currentColor}20, ${currentColor}40)`,
                  border: `1px solid ${currentColor}30`,
                }}
              >
                <MessageSquare
                  className="size-7"
                  style={{ color: currentColor }}
                />
              </div>
              <h1 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                Create Account
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                Get started now and simplify your workflow!
              </p>
            </div>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm"
          >
            {/* Username */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                User Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  id="username"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                  placeholder="User Name"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleEmailChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handlePasswordChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Role and Grade in a grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <div className="relative">
                  <select
                    id="role"
                    className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors appearance-none"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option disabled value="">
                      Select role
                    </option>
                    <option value="CC">CC</option>
                    <option value="REPI">REPI</option>
                    <option value="RM">RM</option>
                    <option value="FORM">FORM</option>
                    <option value="RLOG">RLOG</option>
                    <option value="CAR">CAR</option>
                    <option value="REP">REP</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="size-5 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Grade */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Military Rank
                </label>
                <div className="relative">
                  <select
                    className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors appearance-none"
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({ ...formData, grade: e.target.value })
                    }
                  >
                    <option disabled value="">
                      Select rank
                    </option>
                    <option value="SGT">SGT</option>
                    <option value="SGT/C">SGT/C</option>
                    <option value="ADJ">ADJ</option>
                    <option value="ADJ/C">ADJ/C</option>
                    <option value="ADJ/M">ADJ/M</option>
                    <option value="S/LT">S/LT</option>
                    <option value="LT">LT</option>
                    <option value="CPT">CPT</option>
                    <option value="CMD">CMD</option>
                    <option value="COL">LT/COL</option>
                    <option value="COL/M">COL</option>
                    <option value="COL/M">COL/M</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="size-5 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ backgroundColor: currentColor }}
                disabled={isPending}
              >
                {isPending ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side */}
      <AuthImagePattern
        title="Join our CMFPG"
        subtitle="Develop your expertise with top-tier training at Gafsa's Military Vocational Training Center."
      />
    </div>
  );
}

export default SignUp;
