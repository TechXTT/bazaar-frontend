import { storesService } from "@/api";
import { IStore } from "@/api/interfaces/stores";
import { useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { connect } from "react-redux";

type MenuItem = {
  title: string;
  store?: boolean;
};

const SideBar = (props: any) => {
  const menuItems: MenuItem[] = props.menuItems;
  const selected = props.selected;
  const selectedStore = props.selectedStore;
  const setSelected = props.setSelected;
  const setStoresSelected = props.setStoresSelected;
  const setStores = props.setStores;
  const stores: IStore[] = props.stores;

  const fetchStores = async () => {
    const res = await storesService.getUserStores(props.auth.jwt);

    if (res.status === 200) {
      setStores(res.data);
    }
  }

  return (
    <div className={`flex h-full ${(selected == "Stores" || selected == "Create Product") ? "w-1/3" : "w-1/6"}`}>
    <div className={`flex w-full `}>
      <nav className="flex w-full">
        <ul className="flex w-full flex-col">
          {menuItems.map(({ title, store }, index) => (
            <li key={title} className="flex w-full">
              <div
                onClick={() => {
                  if (store) {
                    setSelected(title);
                    fetchStores();
                  } else {
                    if (title === "Create Store" && props.auth.user.WalletAddress === '') {
                      alert('You need to create a wallet first');
                    } else {
                      setSelected(title);
                    }
                  }
                }}
                className="flex w-full"
              >
                <a
                  className={`flex w-full p-2 text-lg  ${title === 'Create Store' && props.auth.user.WalletAddress !== '' ? `hover:bg-[#416165]` : ``} cursor-pointer ${
                    index === 0 && "rounded-tl-lg"
                  } ${selected === title && "bg-[#50787d] text-white"}`}
                >
                  {title}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </div>
    {(selected == "Stores" || selected == "Create Product") && (<div className="flex w-full">
      <nav className="flex w-full">
        <ul className="flex w-full flex-col">
          {stores.map((store) => (
            <li key={store.ID} className="flex w-full">
              <div
                onClick={() => {
                  setStoresSelected(store);
                }}
                className="flex w-full"
              >
                <a
                  className={`flex w-full p-2 text-lg  hover:bg-[#416165] cursor-pointer ${selectedStore === store.ID && "bg-[#50787d] text-white"}`}
                >
                  {store.Name}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </div>)}
    </div>
  );
};

const mapStateToProps = (state: any) => {
    return {
      auth: state.auth,
    };
  };
  
export default connect(mapStateToProps)(SideBar);
  