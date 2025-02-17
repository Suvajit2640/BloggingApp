import react from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useState, useContext } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { FaEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";

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
  const { isLogin, setIsLogin } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false); 
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ValidateLogin),
  });

  // submit button -----------------
  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`http://localhost:8000/login`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { token, refreshToken, username } = await response.data;
      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("username", username);

      axios.defaults.headers = {
        Authorization: "Bearer " + token,
      };

      if (response.status === 201) {
        notify("success");
        await navigate("/Notes", { replace: true });
        setIsLogin(true);
      } else {
        notify("fail");
      }
     
    } catch (error) {
      if(error.response.data.data==="user is not verified")
      {
        notify("verify error")
      }
      else {

        notify("fail")
      }
      
    }
  };

  // toast functionality--------------------
  const notify = (value) => {
    if (value === "success") {
      toast.success("Login successful!", { autoClose: 3000 });
    } else if (value === "fail") {
      toast.error("Invalid Credentials. Try again", { autoClose: 3000 });
    } else if (value === "verify error") {
      toast.error("User is not verified", { autoClose: 2000 });
    }
  };

  return (
    <>
     <div className="h-[90vh] items-center flex flex-col bg-cyan-200 justify-center">
        <div className="bg-cyan-50 p-5 rounded-lg">
          <h1 className="text-3xl text-center font-bold mb-5">Sign In</h1>
          <form
            action="#"
            className="flex flex-col items-center gap-5"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col items-center gap-5">
              <div className="flex gap-2 flex-col w-[27vw]">
                <label htmlFor="email" className="text-lg font-bold">
                  Email:
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  id="useremail"
                  className="p-2 border-2 rounded"
                  {...register("email")}
                />
                {errors.email ? (
                  <span className="text-red-500 text-xs">{errors.email.message}</span>
                ) : (
                  <span className="text-red-500 text-xs invisible">""</span>
                )}
              </div>
              <div className="flex gap-2 flex-col w-[27vw]">
                <label htmlFor="password" className="text-lg font-bold">
                  Password:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    placeholder="Enter your password"
                    id="userpassword"
                    className="p-2 border-2 rounded w-full"
                    {...register("password")}
                    autoComplete="on"
                  />
                  <span
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)} 
                  >
                    {showPassword ? <FaEye /> : <FaRegEyeSlash />}
                  </span>
                </div>
                {errors.password ? (
                  <span className="text-red-500 text-xs transition-all ease-in-out 3s">
                    {errors.password.message}
                  </span>
                ) : (
                  <span className="text-red-500 text-xs invisible">""</span>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="text-md border-black border-2 p-1 px-3 bg-black text-white rounded transition ease-in-out delay-150 hover:scale-105 hover:bg-slate-800 duration-500"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
