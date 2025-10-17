// import axios from "axios";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { CheckCircle, XCircle, Loader2, Mail, ArrowRight, AlertCircle } from "lucide-react";
import React from "react";

export const VerifyPage = () => {
  const { token } = useParams();
  // TEMP FIX: Immediately return the error state if the token is "test"
  console.log("this line reached")
  if (token === 'test') {
    // Return a basic, non-styled element immediately
    return <div>TEST PAGE RENDERED! Token: {token}</div>;
  }
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [debugMode, setDebugMode] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);

  useEffect(() => {
    const verifyEmail = async () => {
      // Log for debugging
      console.group("🔍 Email Verification Process");
      console.log("Environment:", import.meta.env.MODE);
      console.log("API URL:", API_URL);
      console.log("Token:", token?.substring(0, 30) + "...");
      console.log("Full URL:", window.location.href);

      if (!token) {
        console.error("❌ No token provided");
        console.groupEnd();
        setStatus("error");
        setMessage("No verification token provided in the URL.");
        return;
      }

      // Validate JWT format (3 parts separated by dots)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error("❌ Invalid JWT format:", tokenParts.length, "parts");
        console.groupEnd();
        setStatus("error");
        setMessage("Invalid token format. Expected JWT with 3 parts.");
        return;
      }

      try {
        const verifyEndpoint = `${API_URL}/verify`;
        console.log("📡 Sending request to:", verifyEndpoint);

        const response = await axios.get(verifyEndpoint, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          timeout: 15000, // 15 second timeout
        });

        console.log("✅ Response received:", response.data);
        console.log("Status code:", response.status);
        console.groupEnd();

        if (response.data.success) {
          setStatus("success");
          setMessage(response.data.message || "Email verified successfully!");

          if (response.data.alreadyVerified) {
            setMessage("Your email is already verified. You can now log in.");
          }
        } else {
          setStatus("error");
          setMessage(response.data.message || "Verification failed.");
        }

      } catch (error) {
        console.error("❌ Verification failed");
        console.error("Error type:", error.name);
        console.error("Error message:", error.message);

        let userMessage = "Verification failed. Please try again.";
        const details = {
          errorType: error.name,
          errorMessage: error.message,
          apiUrl: API_URL,
          hasResponse: !!error.response,
          hasRequest: !!error.request,
        };

        if (error.code === "ECONNABORTED") {
          userMessage = "Request timeout. The server is taking too long to respond.";
          details.reason = "timeout";
        } else if (error.response) {
          // Server responded with error status
          console.error("Response status:", error.response.status);
          console.error("Response data:", error.response.data);

          details.status = error.response.status;
          details.responseData = error.response.data;

          const errorMsg = error.response.data?.message || error.response.data?.error;

          switch (error.response.status) {
            case 400:
              userMessage = errorMsg || "Invalid request. The token may be malformed.";
              break;
            case 401:
              userMessage = errorMsg || "Invalid or expired verification link. Please request a new one.";
              break;
            case 404:
              userMessage = errorMsg || "User not found. The account may have been deleted.";
              break;
            case 500:
              userMessage = errorMsg || "Server error. Please try again later.";
              break;
            default:
              userMessage = errorMsg || `Server error (${error.response.status})`;
          }
        } else if (error.request) {
          // Request made but no response received
          console.error("No response from server");
          console.error("This is likely a CORS or network issue");

          details.reason = "no_response";
          details.possibleCauses = [
            "CORS not configured on backend",
            "Backend server is down",
            "Network connectivity issues",
            "Wrong API URL"
          ];

          userMessage = "Cannot reach the server. Please check your internet connection or try again later.";
        } else {
          // Request setup error
          console.error("Request setup error:", error.message);
          details.reason = "setup_error";
          userMessage = `Configuration error: ${error.message}`;
        }

        console.groupEnd();
        setStatus("error");
        setMessage(userMessage);
        setErrorDetails(details);
      }
    };

    verifyEmail();
  }, [token]);

  // Auto-redirect countdown on success
 
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
              Email Verified! ✨
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

            {/* Common Issues */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-red-800 font-semibold mb-2 text-sm">Common Reasons:</p>
              <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
                <li>The verification link has expired (valid for 10 hours)</li>
                <li>The link has already been used</li>
                <li>Network or server connection issues</li>
                <li>Invalid or corrupted token</li>
              </ul>
            </div>

            {/* Debug Info Toggle */}
            {errorDetails && (
              <button
                onClick={() => setDebugMode(!debugMode)}
                className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-2 mx-auto"
              >
                <AlertCircle size={16} />
                {debugMode ? "Hide" : "Show"} Technical Details
              </button>
            )}

            {/* Debug Details */}
            {debugMode && errorDetails && (
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6 text-left">
                <p className="font-mono text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(errorDetails, null, 2)}
                </p>
              </div>
            )}

            {/* Action Buttons */}
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
      <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 max-w-lg w-full shadow-xl text-center">
        {renderContent()}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm mb-2">
          Need help? Contact{" "}
          <a href="mailto:support@notesapp.com" className="text-indigo-600 hover:underline font-medium">
            support@notesapp.com
          </a>
        </p>
        {import.meta.env.DEV && (
          <p className="text-xs text-gray-400 mt-2 font-mono">
            API: {API_URL}
          </p>
        )}
      </div>
    </div>
  


  );
};