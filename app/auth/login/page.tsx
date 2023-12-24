"use client";
import { usersService } from "@/api";
import { login } from "@/redux/slices/auth-slice";
import { useAppDispatch } from "@/redux/store";
import { validateLoginUser } from "@/utils/helpers";
import React, { ChangeEvent, FormEvent, useState } from "react";

interface ILoginUser {
  email: string;
  password: string;
}

const LoginPage = () => {
  const [userData, setUserData] = useState<ILoginUser>({
    email: "",
    password: "",
  });

  const [localError, setLocalError] = useState<string | null>(null);

  const dispatch = useAppDispatch()
  
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setUserData((prev) => ({ ...prev, [id]: value }));
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const validationError = validateLoginUser(userData);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    try {
      const response = await usersService.loginUser(userData);
      if (response.status === 200) {
        setLocalError(null);
        dispatch(login(response.data?.token))
        window.location.href = "/";
      } else {
        console.error("Login error: ", response);
        setLocalError("Login failed");
      }
    } catch (error) {
      console.error("Login error: ", error);
      setLocalError("An unexpected error occurred while logging in.");
    }
  };

  return (
    <div className="flex flex-col items-center md:justify-center px-2 mx-auto md:h-screen py-10 md:py-0">
      <div className="w-full bg-[#324B4E] rounded-lg shadow md:mt-0 sm:max-w-md p-2 space-y-2 md:space-y-4 sm:p-6">
        <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-2xl">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-2 font-medium">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={userData.email}
              onChange={handleInputChange}
              className="border border-gray-400 rounded-md py-2 px-3 text-black"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="password" className="mb-2 font-medium">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={userData.password}
              onChange={handleInputChange}
              className="border border-gray-400 rounded-md py-2 px-3 text-black"
            />
          </div>
          <button
            type="submit"
            className="w-full text-white bg-[#182628] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-xl block py-2.5 text-center"
          >
            Login
          </button>
          <p className="text-sm font-light text-gray-500">Don't have an account? <a href="/auth/register" className="font-medium text-primary-600 hover:underline">Register</a></p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
