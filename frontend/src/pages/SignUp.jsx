import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import AuthImagePattern from "../components/AuthImagePattern";
import { Eye, EyeOff, Lock, Mail, MessageSquare, User } from "lucide-react";
import toast from "react-hot-toast";

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

  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async ({ username, email, password, role, grade }) => {
      try {
        const res = await fetch("/api/users/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password, role, grade }),
        });

        if (!res.ok) {
          const errorResponse = await res.json();
          throw new Error(errorResponse.error);
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
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData); // Log form data
    if (validateForm()) {
      mutate(formData);
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) return toast.error("Username is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (formData.password !== formData.confirmPassword)
      return toast.error("Passwords do not match");
    if (!formData.role) return toast.error("Role is required");
    if (!formData.grade) return toast.error("Grade is required");

    return true;
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side */}
      <div className="flex justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6 mb-12">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">
                Get started now and simplify your workflow!
              </p>
            </div>
          </div>
          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">User Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="John yahya"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
            </div>
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>
            {/* Confirm Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Confirm Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>
            {/* Role */}
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Pick up the role</span>
              </div>
              <select
                className="select select-bordered"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option disabled value="">
                  Pick one
                </option>
                <option value="CC">CC</option>
                <option value="REPI">REPI</option>
                <option value="RM">RM</option>
                <option value="FORM">FORM</option>
                <option value="RLOG">RLOG</option>
                <option value="CAR">CAR</option>
                <option value="REP">REP</option>
              </select>
            </label>
            {/* Grade */}
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Pick up the military rank</span>
              </div>
              <select
                className="select select-bordered"
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
              >
                <option disabled value="">
                  Pick one
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
            </label>
            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isPending}
            >
              {isPending ? "Loading..." : "Create Account"}
            </button>
            {isError && <p className="text-red-500">{error.message}</p>}
          </form>
        </div>
      </div>
      {/* Right side */}
      <AuthImagePattern
        title="Join our CMFPG"
        subtitle="Develop your expertise with top-tier training at Gafsa’s Military Vocational Training Center."
      />
    </div>
  );
}

export default SignUp;
