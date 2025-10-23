import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import OtpInput from "react-otp-input";

const API_URL = import.meta.env.VITE_API_URL;

export const OtpVerify = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const email = localStorage.getItem("email");

  const handleChange = (newCode) => {
    setCode(newCode);
  };

  const verify = async () => {
    if (code.length !== 4) {
      toast.error("Please enter a 4-digit OTP");
      return;
    }

    setLoading(true);
    const data = {
      email: email,
      otp: parseInt(code),
    };

    try {
      const response = await axios.post(`${API_URL}/verifyOtp`, data);

      if (response.data.success) {
        toast.success(response.data.message || "OTP verified successfully!");
        navigate("/reset-password");
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    const data = {
      email: email,
    };

    try {
      const response = await axios.post(`${API_URL}/forgetPassword`, data);

      if (response.data.success) {
        toast.success(response.data.message || "OTP resent successfully!");
        setCode("");
      } else {
        toast.error(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 sm:p-6">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md transform transition-all hover:shadow-3xl space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <HiOutlinePencilSquare size={48} className="text-indigo-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-indigo-600">Verify OTP</h1>
          <p className="text-gray-500 mt-2">
            We've sent a 4-digit OTP to <strong>{email}</strong>
          </p>
        </div>

        <div className="flex justify-center">
          <OtpInput
            value={code}
            onChange={handleChange}
            numInputs={4}
            shouldAutoFocus={true}
            renderInput={(props) => (
              <input
                {...props}
                className="!w-14 !h-14 mx-2 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all"
                style={{ width: "3.5rem", height: "3.5rem" }}
              />
            )}
          />
        </div>

        <button
          onClick={verify}
          disabled={loading || code.length !== 4}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{" "}
            <button
              onClick={resend}
              disabled={resending}
              className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors disabled:opacity-50"
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          </p>
        </div>

        <p className="text-center text-sm text-gray-600 pt-2">
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