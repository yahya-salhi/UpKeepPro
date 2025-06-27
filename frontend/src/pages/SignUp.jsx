import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import AuthImagePattern from "../components/AuthImagePattern";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useStateContext } from "../contexts/ContextProvider";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    grade: "",
    role: "",
  });
  const { currentColor } = useStateContext();

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  // Real-time validation
  const validateField = (field, value) => {
    const errors = { ...validationErrors };

    switch (field) {
      case "username":
        if (!value.trim()) {
          errors.username = "Username is required";
        } else if (value.length > 50) {
          errors.username = "Username must be less than 50 characters";
        } else {
          delete errors.username;
        }
        break;

      case "email":
        if (!value.trim()) {
          errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.email = "Invalid email format";
        } else if (value.length > 100) {
          errors.email = "Email must be less than 100 characters";
        } else {
          delete errors.email;
        }
        break;

      case "password":
        if (!value) {
          errors.password = "Password is required";
        } else if (value.length < 8) {
          errors.password = "Password must be at least 8 characters";
        } else {
          delete errors.password;
        }
        break;

      case "confirmPassword":
        if (value !== formData.password) {
          errors.confirmPassword = "Passwords do not match";
        } else {
          delete errors.confirmPassword;
        }
        break;

      default:
        break;
    }

    setValidationErrors(errors);
  };

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
    if (formData.role !== "STAG" && !formData.grade)
      return toast.error("Military rank is required for this role");

    return true;
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    validateField(field, value);

    if (field === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
      // Re-validate confirm password when password changes
      if (formData.confirmPassword) {
        validateField("confirmPassword", formData.confirmPassword);
      }
    }

    if (field === "confirmPassword") {
      validateField("confirmPassword", value);
    }
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData({
      ...formData,
      role,
      // Clear grade when switching to STAG role
      grade: role === "STAG" ? "" : formData.grade,
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Left side */}
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
                  Create Account
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg max-w-sm leading-relaxed">
                  Join CMFPG and unlock your potential with professional
                  training
                </p>
              </div>

              {/* Progress indicator */}
              <div className="flex space-x-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <div
                  className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-blue-200 animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Enhanced Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50"
          >
            {/* Username Field */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <User className="size-4" style={{ color: currentColor }} />
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="size-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  id="username"
                  className={`block w-full pl-12 pr-4 py-3.5 border-2 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-300 ${
                    validationErrors.username
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  }`}
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                />
                {validationErrors.username && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <AlertCircle className="size-5 text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.username && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="size-4" />
                  {validationErrors.username}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Mail className="size-4" style={{ color: currentColor }} />
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="size-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  className={`block w-full pl-12 pr-4 py-3.5 border-2 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-300 ${
                    validationErrors.email
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  }`}
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                {validationErrors.email ? (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <AlertCircle className="size-5 text-red-500" />
                  </div>
                ) : formData.email && !validationErrors.email ? (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <CheckCircle className="size-5 text-green-500" />
                  </div>
                ) : null}
              </div>
              {validationErrors.email && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="size-4" />
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field with Strength Indicator */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Lock className="size-4" style={{ color: currentColor }} />
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="size-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`block w-full pl-12 pr-12 py-3.5 border-2 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-300 ${
                    validationErrors.password
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  }`}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Password Strength:
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        passwordStrength <= 2
                          ? "text-red-500"
                          : passwordStrength <= 3
                          ? "text-yellow-500"
                          : passwordStrength <= 4
                          ? "text-blue-500"
                          : "text-green-500"
                      }`}
                    >
                      {passwordStrength <= 2
                        ? "Weak"
                        : passwordStrength <= 3
                        ? "Fair"
                        : passwordStrength <= 4
                        ? "Good"
                        : "Strong"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength
                            ? passwordStrength <= 2
                              ? "bg-red-400"
                              : passwordStrength <= 3
                              ? "bg-yellow-400"
                              : passwordStrength <= 4
                              ? "bg-blue-400"
                              : "bg-green-400"
                            : "bg-gray-200 dark:bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {validationErrors.password && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="size-4" />
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Lock className="size-4" style={{ color: currentColor }} />
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="size-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`block w-full pl-12 pr-12 py-3.5 border-2 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-300 ${
                    validationErrors.confirmPassword
                      ? "border-red-300 focus:border-red-500"
                      : formData.confirmPassword &&
                        formData.password === formData.confirmPassword
                      ? "border-green-300 focus:border-green-500"
                      : "border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  }`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
                  {validationErrors.confirmPassword ? (
                    <AlertCircle className="size-5 text-red-500" />
                  ) : formData.confirmPassword &&
                    formData.password === formData.confirmPassword ? (
                    <CheckCircle className="size-5 text-green-500" />
                  ) : null}
                  <button
                    type="button"
                    className="text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="size-4" />
                  {validationErrors.confirmPassword}
                </p>
              )}
              {formData.confirmPassword &&
                formData.password === formData.confirmPassword &&
                !validationErrors.confirmPassword && (
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="size-4" />
                    Passwords match perfectly!
                  </p>
                )}
            </div>

            {/* Role and Grade Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Field */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Shield className="size-4" style={{ color: currentColor }} />
                  Role
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <select
                    id="role"
                    className="block w-full pl-4 pr-10 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 appearance-none cursor-pointer"
                    value={formData.role}
                    onChange={handleRoleChange}
                  >
                    <option disabled value="">
                      Select your role
                    </option>
                    <option value="CC">CC - Chef de Centre</option>
                    <option value="REPI">REPI - Responsable Pédagogique</option>
                    <option value="RM">RM - Responsable Maintenance</option>
                    <option value="FORM">FORM - Formateur</option>
                    <option value="RLOG">RLOG - Responsable Logistique</option>
                    <option value="CAR">CAR - Cadre Administratif</option>
                    <option value="REP">REP - Représentant</option>
                    <option value="STAG">STAG - Stagiaire</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg
                      className="size-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Grade/Level Field */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <User className="size-4" style={{ color: currentColor }} />
                  {formData.role === "STAG" ? "Level/Grade" : "Military Rank"}
                  {formData.role !== "STAG" && (
                    <span className="text-red-500">*</span>
                  )}
                  {formData.role === "STAG" && (
                    <span className="text-gray-400 text-xs">(Optional)</span>
                  )}
                </label>
                <div className="relative group">
                  <select
                    className="block w-full pl-4 pr-10 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 appearance-none cursor-pointer"
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({ ...formData, grade: e.target.value })
                    }
                  >
                    <option disabled value="">
                      {formData.role === "STAG"
                        ? "Select level (optional)"
                        : "Select your rank"}
                    </option>
                    {formData.role === "STAG" ? (
                      <>
                        <option value="BTP MMSI">
                          BTP MMSI - Bâtiment Maintenance
                        </option>
                        <option value="BTP TSS">
                          BTP TSS - Travaux Spécialisés
                        </option>
                        <option value="CAP SOUDURE">
                          CAP SOUDURE - Certificat Soudure
                        </option>
                        <option value="CAP ALUM">
                          CAP ALUM - Certificat Aluminium
                        </option>
                        <option value="CC SOUDURE">
                          CC SOUDURE - Cours Complémentaire
                        </option>
                        <option value="CC ALUM">
                          CC ALUM - Cours Complémentaire
                        </option>
                      </>
                    ) : (
                      <>
                        <option value="SGT">SGT - Sergent</option>
                        <option value="SGT/C">SGT/C - Sergent Chef</option>
                        <option value="ADJ">ADJ - Adjudant</option>
                        <option value="ADJ/C">ADJ/C - Adjudant Chef</option>
                        <option value="ADJ/M">ADJ/M - Adjudant Major</option>
                        <option value="S/LT">S/LT - Sous Lieutenant</option>
                        <option value="LT">LT - Lieutenant</option>
                        <option value="CPT">CPT - Capitaine</option>
                        <option value="CMD">CMD - Commandant</option>
                        <option value="LT/COL">
                          LT/COL - Lieutenant Colonel
                        </option>
                        <option value="COL">COL - Colonel</option>
                        <option value="COL/M">COL/M - Colonel Major</option>
                      </>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg
                      className="size-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Submit Button */}
            <div className="pt-6">
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
                      <span>Creating Your Account...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="size-5 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Create Account</span>
                      <svg
                        className="size-5 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </div>
              </button>

              {/* Additional Info */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  By creating an account, you agree to our{" "}
                  <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    Privacy Policy
                  </span>
                </p>
              </div>
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
