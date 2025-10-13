import react from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { FaEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";

const validateRegister = z.object({
  userName: z
    .string()
    .min(4, { message: "Username must be at least 4 characters long" }),
  email: z.string().email("Invalid email format"),
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


const API_URL = import.meta.env.VITE_API_URL;

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  console.log("outside submit");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validateRegister),
  });

  const notify = (value) => {
    if (value === "success") {
      toast.success(
        "Registration successful! Please check your email to verify your account.",
        { autoClose: 3000 }
      );
    } else if (value === "fail") {
      toast.error("Registration failed. Try again", { autoClose: 3000 });
    } else if (value === "user exists") {
      toast.error("User already exists", { autoClose: 2000 });
    }
  };

  const onSubmit = async (data) => {
    try {
      
      const response = await axios.post(`${API_URL}/register`, data);
      // console.log("register page");
      if (response.data.success) {
        localStorage.setItem("username", data.userName);
        notify("success");
      } else {
        notify("user exists");
      }
    } catch (error) {
      console.error(error.response || error);
      if (error.response && error.response.status === 400) {
        notify("user exists");
      } else {
        notify("fail");
      }
    }
  };

  return (
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
          <h1 className="text-4xl font-extrabold text-indigo-700">
            Create Your Account
          </h1>
          <p className="text-gray-500 mt-2">
            Start taking better notes today.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your unique name"
              id="username"
              className={`p-3 border ${errors.userName ? 'border-red-500' : 'border-gray-300 focus:border-indigo-500'} w-full rounded-lg transition-colors focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
              {...register("userName")}
            />
            {errors.userName && (
              <p className="text-red-500 text-xs mt-1 transition-all">
                {errors.userName.message}
              </p>
            )}
          </div>

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

          <div className="space-y-1">
            <label htmlFor="userpassword" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Must be 8+ chars, 1 number, 1 special char"
                id="userpassword"
                className={`p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300 focus:border-indigo-500'} w-full rounded-lg transition-colors focus:ring-2 focus:ring-indigo-200 focus:outline-none`}
                {...register("password")}
                autoComplete="new-password"
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

          <button
            type="submit"
            className="w-full mt-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            Register Now
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 pt-2">
          Already have an account?{" "}
          <Link
            to="/Login"
            className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};