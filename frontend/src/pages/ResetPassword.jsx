import React, { useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { FaEye, FaRegEyeSlash } from "react-icons/fa";

const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must contain at least 8 characters" })
      .refine((val) => /[0-9]/.test(val), {
        message: "Password must contain at least one number",
      })
      .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const API_URL = import.meta.env.VITE_API_URL;

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const email = localStorage.getItem("email");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const payload = {
      email: email,
      password: data.password,
    };

    try {
      const response = await axios.post(`${API_URL}/resetPassword`, payload);

      if (response.data.success) {
        toast.success(response.data.message || "Password reset successfully!");
        localStorage.removeItem("email");
        setTimeout(() => {
          navigate("/Login");
        }, 1500);
      } else {
        toast.error(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 sm:p-6">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md transform transition-all hover:shadow-3xl space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <HiOutlinePencilSquare size={48} className="text-indigo-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-indigo-600">Reset Password</h1>
          <p className="text-gray-500 mt-2">
            Enter your new password to reset your account password.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter new password"
                id="password"
                className={`p-3 pr-10 border ${
                  errors.password ? "border-red-500" : "border-gray-300 focus:border-indigo-500"
                } w-full rounded-lg transition-colors focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
                {...register("password")}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-1"
                onClick={() => setPasswordVisible((prev) => !prev)}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
              >
                {passwordVisible ? <FaEye size={20} /> : <FaRegEyeSlash size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 transition-all">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                placeholder="Confirm new password"
                id="confirmPassword"
                className={`p-3 pr-10 border ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300 focus:border-indigo-500"
                } w-full rounded-lg transition-colors focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
                {...register("confirmPassword")}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-1"
                onClick={() => setConfirmPasswordVisible((prev) => !prev)}
                aria-label={confirmPasswordVisible ? "Hide password" : "Show password"}
              >
                {confirmPasswordVisible ? <FaEye size={20} /> : <FaRegEyeSlash size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 transition-all">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};