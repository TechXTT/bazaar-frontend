"use client";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import UserSettingsForm from "../components/userSettings";
import SideBar from "../components/sidebar";
import { useEffect, useState } from "react";
import Orders from "../components/orders";
import { IStore } from "@/api/interfaces/stores";
import StoresPage from "../components/stores";
import StoreForm from "../components/createForms/createStore";
import ProductForm from "../components/createForms/createProduct";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/auth-slice";

const UserSettingsPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { id } = useParams<{ id: string }>();
  const [stores, setStores] = useState<IStore[]>([]);
  const dispatch = useDispatch();

  const menuItems = [
    {
      title: "Settings",
    },
    {
      title: "Orders",
    },
    {
      title: "Stores",
      store: true,
    },
    {
      title: "Create Store",
    },
    {
      title: "Create Product",
      store: true,
    },
    {
      title: "Logout",
    },
  ];

  useEffect(() => {
    if (!searchParams.get("selected")) {
      router.push(`${pathname}?selected=Settings`);
    }
  }, []);

  const Page = () => {
    switch (searchParams.get("selected")) {
      case "Settings":
        return <UserSettingsForm id={id} />;
      case "Orders":
        return <Orders />;
      case "Stores":
        return searchParams.get("store") ? (
          <StoresPage id={searchParams.get("store")!} />
        ) : (
          <div />
        );
      case "Create Store":
        return <StoreForm />;
      case "Create Product":
        return searchParams.get("store") ? (
          <ProductForm storeId={searchParams.get("store")!} />
        ) : (
          <div />
        );
      case "Logout":
        return <div />;
    }
  };

  const onSelect = (select: string) => {
    if (select === "Logout") {
      router.push("/auth/logout");
      return;
    }

    if (select === searchParams.get("selected")) return;

    const current = new URLSearchParams(Array.from(searchParams.entries()));

    current.set("selected", select);
    current.delete("store");

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`${pathname}${query}`);
  };

  const onStoreSelect = (store: IStore) => {
    if (store.ID === searchParams.get("store")) return;

    const current = new URLSearchParams(Array.from(searchParams.entries()));

    current.set("store", store.ID);

    const search = current.toString();
    const query = `${"?".repeat(search.length && 1)}${search}`;

    router.push(`${pathname}${query}`);
  };

  return (
    <div className="flex flex-col w-full items-center md:justify-center px-2 mx-auto md:h-screen py-10 md:py-0">
      <div className="flex bg-[#324B4E] rounded-lg shadow w-2/3 h-2/3">
        <div className="flex flex-col w-full">
          <div className="flex flex-row flex-1 w-full overflow-scroll">
            <SideBar
              menuItems={menuItems}
              selected={searchParams.get("selected")}
              selectedStore={searchParams.get("store")}
              setSelected={onSelect}
              setStoresSelected={onStoreSelect}
              setStores={setStores}
              stores={stores}
            />
            <Page />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;
