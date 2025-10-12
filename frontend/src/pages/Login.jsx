import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom"; // Import Link for navigation to Register
import { UserContext } from "../context/UserContext";
import { FaEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";

// --- ZOD Validation Schema (UNCHANGED) ---
const ValidateLogin = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(8, { message: "Password must contain at least 8 characters" })
    .refine((val) => /[0-9]/.test(val), {
      message: "Password must contain at least one number",
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
      message: "Password must contain at least one special character",
    }),
});

export const Login = () => {
  const navigate = useNavigate();
  const { setIsLogin } = useContext(UserContext); // Removed isLogin as it wasn't used
  const [showPassword, setShowPassword] = useState(false); 
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ValidateLogin),
  });

  // --- Toast Notification Logic (UNCHANGED) ---
  const notify = (value) => {
    if (value === "success") {
      toast.success("Login successful!", { autoClose: 3000 });
    } else if (value === "fail") {
      toast.error("Invalid Credentials. Try again", { autoClose: 3000 });
    } else if (value === "verify error") {
      toast.error("User is not verified. Please check your email.", { autoClose: 4000 });
    }
  };

  // --- Submission Logic (UNCHANGED) ---
  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`http://localhost:8000/login`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { token, refreshToken, username, file } = await response.data;
      
      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("username", username);
      localStorage.setItem("profileImage", file);

      axios.defaults.headers = {
        Authorization: "Bearer " + token,
      };

      if (response.status === 201) {
        notify("success");
        setIsLogin(true); // Must set this before navigation to reflect context immediately
        navigate("/Notes", { replace: true });
      } else {
        notify("fail");
      }
      
    } catch (error) {
      if(error.response && error.response.data.data === "user is not verified") {
        notify("verify error");
      } else {
        notify("fail");
      }
    }
  };

  // --- Rendered Component with New UI/UX ---
  return (
    // Responsive container uses min-h-screen for full view height and a light, modern background
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-6">
      <div
        className="
          bg-white 
          p-8 sm:p-10 
          rounded-xl 
          shadow-2xl 
          w-full 
          max-w-md 
          transform 
          transition-all 
          hover:shadow-3xl
          space-y-6
        "
      >
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-indigo-600">
            Welcome!
          </h1>
          <p className="text-gray-500 mt-2">
            Sign in to access your NoteWorthy workspace.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Email Field */}
          <div className="space-y-1">
            <label htmlFor="useremail" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              id="useremail"
              className={`p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-indigo-500'} w-full rounded-lg transition-colors focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 transition-all">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label htmlFor="userpassword" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                id="userpassword"
                className={`p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300 focus:border-indigo-500'} w-full rounded-lg transition-colors focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
                {...register("password")}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-1"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEye size={20} /> : <FaRegEyeSlash size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 transition-all">
                {errors.password.message}
              </p>
            )}
          </div>
          
          {/* Forgot Password Link (Common UX practice) */}
          <div className="text-right text-sm">
             {/* You can add a proper route for this later */}
            <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            Login
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-600 pt-2">
          Don't have an account yet?{" "}
          <Link
            to="/Register"
            className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
          >
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};