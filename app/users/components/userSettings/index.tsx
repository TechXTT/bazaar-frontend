import { usersService } from "@/api";
import { setUser } from "@/redux/slices/auth-slice";
import { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";

const UserSettingsForm = (props: any) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const dispatch = useDispatch();

  const [edit, setEdit] = useState(false);

  useEffect(() => {
    if (!props.auth.isLoggedIn) {
      window.location.href = "/auth/login";
    } else {
      setFirstName(props.auth.user.FirstName);
      setLastName(props.auth.user.LastName);
      setEmail(props.auth.user.Email);
      setWalletAddress(props.auth.user.WalletAddress);
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setEdit(!edit);

    if (edit) {
      await usersService.updateUser(
        {
          FirstName: firstName,
          LastName: lastName,
          Email: email,
          WalletAddress: walletAddress,
        },
        props.auth.jwt
      );

      dispatch(
        setUser({
          ...props.auth.user,
          FirstName: firstName,
          LastName: lastName,
          Email: email,
          WalletAddress: walletAddress,
        })
      );
    }
  };

  return (
    <div className="flex w-5/6 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col space-y-2 md:space-y-4  "
      >
        <div className="flex flex-row">
          <div className="flex flex-col pr-6 space-y-4">
            <div className="flex flex-col">
              <label htmlFor="firstName" className="mb-2 font-medium">
                First Name:
              </label>
              <input
                id="firstName"
                value={firstName}
                disabled={!edit}
                onChange={(e) => setFirstName(e.target.value)}
                className="border border-gray-400 rounded-md py-2 px-3 text-black"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="lastName" className="mb-2 font-medium">
                Last Name:
              </label>
              <input
                id="lastName"
                value={lastName}
                disabled={!edit}
                onChange={(e) => setLastName(e.target.value)}
                className="border border-gray-400 rounded-md py-2 px-3 text-black"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="email" className="mb-2 font-medium">
                Email:
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled={!edit}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-400 rounded-md py-2 px-3 text-black"
              />
            </div>
          </div>
          <div className="flex w-full flex-col space-y-4">
            <div className="flex flex-col">
              <label htmlFor="walletAddress" className="mb-2 font-medium">
                Wallet Address:
              </label>
              <input
                id="walletAddress"
                value={walletAddress}
                disabled={!edit}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="border border-gray-400 rounded-md py-2 px-3 text-black"
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full text-white bg-[#182628] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-xl block py-2.5 text-center"
        >
          {edit ? "Save" : "Edit"}
        </button>
      </form>
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    auth: state.auth,
  };
};

export default connect(mapStateToProps)(UserSettingsForm);
