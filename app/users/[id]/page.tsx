"use client";
import { useParams } from "next/navigation";

const UserSettingsPage = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="flex w-full md:justify-center px-2 mx-auto md:h-screen py-28 px-10">
      <div className="flex flex-col w-full rounded-lg shadow p-4 md:space-y-2 ">
        <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-2xl">
          {id}
        </h1>
    </div>
    </div>
  );
};

export default UserSettingsPage;
