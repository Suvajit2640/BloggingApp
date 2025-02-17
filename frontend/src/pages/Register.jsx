import react from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

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

export const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validateRegister),
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`http://localhost:8000/register`, data);

      if (response.data.status === 201) {
        localStorage.setItem("username", data.userName);
        notify("success");
      } else {
        notify("user exists");
      }
    } catch (error) {
      console.log(error);
      notify("fail");
    }
  };

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

  return (
    <>
      <div className=" max-h-[90vh]  items-center flex flex-col bg-cyan-200 justify-center ">
        <div className="  bg-cyan-50  p-5 rounded-lg max-h-[85vh] flex flex-col m-10" >
          <h1 className="text-3xl text-center font-bold mb-3 ">Sign Up</h1>
          <form
            action="#"
            className=" flex  flex-col items-center  "
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex gap-2 flex-col w-[27vw]">
              <label htmlFor="name" className="text-xl font-bold ">
                Name:
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                id="username"
                name="username"
                className="p-2  border-2 rounded"
                {...register("userName")}
              />

              {errors.userName ? (
                <span className="text-red-500 text-xs">
                  {errors.userName.message}
                </span>
              ) : (
                <span className="text-red-500 invisible text-xs">""</span>
              )}
            </div>

            <div className=" flex  gap-2 flex-col w-[27vw]">
              <label htmlFor="email" className="text-lg font-bold ">
                Email:
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                id="useremail"
                className="p-2 border-2 rounded "
                {...register("email")}
              />
              {errors.email ? (
                <span className="text-red-500 text-xs">
                  {errors.email.message}
                </span>
              ) : (
                <span className="text-red-500 text-xs invisible">""</span>
              )}
            </div>
            <div className=" flex  gap-2 flex-col w-[27vw]">
              <label htmlFor="password" className="text-lg  font-bold ">
                Password:
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                id="userpassword"
                className="p-2 border-2 rounded "
                {...register("password")}
                autoComplete="on"
              />
              {errors.password ? (
                <span className="text-red-500 text-xs transition-all ease-in-out 3s">
                  {errors.password.message}
                </span>
              ) : (
                <span className="text-red-500 text-xs invisible ">""</span>
              )}
            </div>
            <button
              type="submit"
              className="text-md border-black border-2 p-1 px-3 bg-black text-white rounded transition ease-in-out delay-150  hover:scale-105 hover:bg-slate-800 duration-500"
            >
              Register
            </button>
          </form>
        </div>
      </div>
      ;
    </>
  );
};
