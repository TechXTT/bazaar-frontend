"use client";
import { usersService } from "@/api";
import { validateRegisterUser } from "@/utils/helpers";
import React, { useState } from "react";

interface IRegisterUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const [userData, setUserData] = useState<IRegisterUser>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [localError, setLocalError] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setUserData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    setLocalError(null);

    const validationError = validateRegisterUser(userData);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    try {
      const response = await usersService.registerUser(userData);

      if (response.status === 201) {
        setLocalError(null);
      } else {
        console.error("Register error: ", response);
        setLocalError("Registration failed");
      }
    } catch (error) {
      console.error("Register error: ", error);
      setLocalError("An unexpected error occurred while registering.");
    }
  };

  return (
    <div className="flex flex-col items-center md:justify-center px-4 mx-auto md:h-screen pt-16">
      <div className="w-full bg-[#324B4E] rounded-lg shadow md:mt-0 sm:max-w-md p-4 space-y-2 md:space-y-4 sm:p-8">
        <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-2xl">
          Register
        </h1>
        <form onSubmit={handleSubmit} className="space-y-1 md:space-y-2">
          <div className="flex flex-col">
            <label htmlFor="firstName" className="mb-2 font-medium">
              First name:
            </label>
            <input
              id="firstName"
              value={userData.firstName}
              autoComplete="given-name"
              onChange={handleInputChange}
              className="text-base rounded-lg block bg-transparent border-2 py-2.5 px-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="lastName" className="mb-2 font-medium">
              Last name:
            </label>
            <input
              id="lastName"
              value={userData.lastName}
              autoComplete="family-name"
              onChange={handleInputChange}
              className="text-base rounded-lg block bg-transparent border-2 py-2.5 px-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-2 font-medium">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={userData.email}
              autoComplete="email"
              onChange={handleInputChange}
              className="text-base rounded-lg block bg-transparent border-2 py-2.5 px-2"
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
              autoComplete="new-password"
              onChange={handleInputChange}
              className="text-base rounded-lg block bg-transparent border-2 py-2.5 px-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="confirmPassword" className="mb-2 font-medium">
              Confirm Password:
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={userData.confirmPassword}
              autoComplete="new-password"
              onChange={handleInputChange}
              className="text-base rounded-lg block bg-transparent border-2 py-2.5 px-2"
            />
          </div>
          <div className="flex flex-col">
          <button
            type="submit"
            className="w-full mt-2 text-white bg-[#182628] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-xl block py-2.5 text-center"
          >
            Sign in
          </button>
          {localError && (
            <p className="text-sm text-red-500">{localError}</p>
          )}

          </div>
          <p className="text-sm font-light text-gray-500">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="font-medium text-primary-600 hover:underline"
            >
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
