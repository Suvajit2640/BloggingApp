import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const VerifyPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const verify = async () => {
      try {
        await axios.get("http://localhost:8000/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatus("success");
      } catch (e) {
        console.error(e);
        setStatus("error");
      }
    };

    if (token) verify();
  }, [token]);

  // Delay redirect to show the success message
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => navigate("/Login"), 3000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const messages = {
    loading: {
      title: "Verifying your email...",
      subtitle: "Please wait while we confirm your account.",
      icon: <Loader2 className="animate-spin text-indigo-500" size={64} />,
    },
    success: {
      title: "✅ Email Verified Successfully!",
      subtitle: "Redirecting you to the login page...",
      icon: <CheckCircle className="text-green-500" size={64} />,
    },
    error: {
      title: "❌ Verification Failed",
      subtitle: "The link may have expired or is invalid.",
      icon: <XCircle className="text-red-500" size={64} />,
    },
  };

  const { title, subtitle, icon } = messages[status];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md shadow-lg"
      >
        <div className="flex justify-center mb-4">{icon}</div>
        <h2 className="text-2xl font-bold text-black mb-2">{title}</h2>
        <p className="text-black-300 mb-6">{subtitle}</p>

        {status === "error" && (
          <Link
            to="/Register"
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 text-black px-5 py-2.5 rounded-lg font-medium transition-all"
          >
            Try Again
          </Link>
        )}
      </motion.div>
    </div>
  );
};
