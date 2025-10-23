import React, { useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { HiOutlinePencilSquare } from "react-icons/hi2";

const ForgetPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
});

const API_URL = import.meta.env.VITE_API_URL;

export const ForgetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ForgetPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/forgetPassword`, data);

      if (response.data.success) {
        toast.success(response.data.message || "OTP sent to your email!");
        localStorage.setItem("email", data.email);
        navigate("/verify-otp");
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Forget password error:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.");
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
          <h1 className="text-4xl font-extrabold text-indigo-600">Forgot Password?</h1>
          <p className="text-gray-500 mt-2">
            Enter your email address and we'll send you an OTP to reset your password.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              id="email"
              className={`p-3 border ${
                errors.email ? "border-red-500" : "border-gray-300 focus:border-indigo-500"
              } w-full rounded-lg transition-colors focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 transition-all">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 pt-2">
          Remember your password?{" "}
          <Link
            to="/Login"
            className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};