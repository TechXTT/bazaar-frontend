"use client";
import { logout } from "@/redux/slices/auth-slice";
import { useAppDispatch } from "@/redux/store";
import { useEffect } from "react";

const LogoutPage = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(logout());
        window.location.href = "/";
    }, [dispatch]);
    
    return <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-2xl">Logging out...</h1>
    </div>;
    }

export default LogoutPage;
