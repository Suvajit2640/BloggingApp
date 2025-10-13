import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const VerifyPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

useEffect(() => {
  const verifyEmail = async () => {
    console.log("=== Frontend VerifyPage ===");
    console.log("Token from URL:", token);

    if (!token) {
      console.log("❌ No token provided in URL");
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Verification response:", response.data);

      if (response.data.success) {
        console.log("✅ Verification success");
        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");
      } else {
        console.log("❌ Verification failed with backend message:", response.data.message);
        setStatus("error");
        setMessage(response.data.message || "Verification failed.");
      }
    } catch (error) {
      console.error("❌ Verification request error:", error);
      setStatus("error");
      if (error.response) {
        setMessage(error.response.data?.message || "Server verification failed");
      } else {
        setMessage("Network error or unexpected issue");
      }
    }
  };

  verifyEmail();
}, [token]);

  // Countdown and redirect on success
  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/Login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Loader2 className="animate-spin text-indigo-600" size={72} />
                <Mail className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-400" size={32} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Verifying Your Email
            </h2>
            <p className="text-gray-600 text-lg">
              Please wait while we confirm your account...
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </>
        );

      case "success":
        return (
          <>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <CheckCircle className="relative text-green-500" size={72} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Email Verified Successfully! ✨
            </h2>
            <p className="text-gray-600 text-lg mb-4">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700 font-medium">
                Redirecting to login in <span className="text-2xl font-bold">{countdown}</span>s
              </p>
            </div>
            <Link
              to="/Login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
            >
              Go to Login Now
              <ArrowRight size={18} />
            </Link>
          </>
        );

      case "error":
        return (
          <>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-20"></div>
                <XCircle className="relative text-red-500" size={72} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Verification Failed
            </h2>
            <p className="text-gray-600 text-lg mb-6">{message}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">
                <strong>Common Issues:</strong>
                <br />• The verification link may have expired
                <br />• The link might have been used already
                <br />• Invalid or corrupted token
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/Register"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
              >
                Register Again
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/Login"
                className="inline-flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-all"
              >
                Back to Login
              </Link>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 max-w-lg w-full shadow-xl text-center transform transition-all duration-500 hover:shadow-2xl">
        {renderContent()}
      </div>
      
      {/* Additional help text */}
      <p className="mt-8 text-gray-500 text-sm max-w-md text-center">
        Need help? Contact support at{" "}
        <a href="mailto:support@notesapp.com" className="text-indigo-600 hover:underline font-medium">
          support@notesapp.com
        </a>
      </p>
    </div>
  );
};