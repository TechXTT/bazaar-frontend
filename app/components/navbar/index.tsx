"use client";

import Link from "next/link";

import { TbMenu2 } from "react-icons/tb";
import { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { usersService } from "@/api";
import { useAppDispatch } from "@/redux/store";
import { clearCart, logout, setUser } from "@/redux/slices/auth-slice";
import { FaUser, FaShoppingCart } from "react-icons/fa";
import { useSDK } from "@metamask/sdk-react";

const MAIN_LINKS = [
  {
    href: "/",
    title: "Начало",
  },
  {
    href: "/stores",
    title: "Магазини",
  },
  {
    href: "/search",
    title: "Търсене",
  }
];

const UNAUTH_LINKS = [
  {
    href: "/auth/login",
    title: "Вход",
  },
  {
    href: "/auth/register",
    title: "Регистрация",
  },
];

const AUTH_LINKS = [
  {
    href: "/auth/logout",
    title: "Акаунт",
  },
  {
    href: "/cart",
    title: "Количка",
  },
  {
    href: "/",
    title: "Wallet",
  },
];

const Linky = ({ href, children }: { href: string; children: string }) => {
  return (
    <Link
      href={href}
      className={`mx-8 flex sm:text-lg md:text-xl lg:text-xl font-semibold whitespace-nowrap ${
        /* selected ? 'text-white' : */ "text-[#95B0B4]"
      } hover:text-white lg:mr-0 lg:inline-flex lg:py-6 lg:px-0`}
    >
      {children}
    </Link>
  );
};

const Navigation = (props: any) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [links, setLinks] = useState<any>(null);

  const [jwt, setJwt] = useState<any>(null);

  const dispatch = useAppDispatch();

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  const [account, setAccount] = useState<string>();
  const { sdk, connected, connecting, provider, chainId } = useSDK();

  const connectMetaMask = async () => {
    try {
      const accounts = await sdk?.connect();
      if (accounts) {
        //@ts-ignore
        setAccount(accounts?.[0]);
      }
    } catch (err) {
      console.warn(`failed to connect..`, err);
    }
  };

  useEffect(() => {
    if (props.auth.jwt && props.auth.jwt !== jwt) {
      setJwt(props.auth.jwt);
    }
  }, [props.auth.jwt]);

  useEffect(() => {
    const changeChain = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }],
          });
        } catch (error) {
          console.log("error", error);
        }
      }
    };

    if (chainId != "0xaa36a7") {
      // force to change to 0xaa36a7
      changeChain();
    }
  }, [chainId]);

  useEffect(() => {
    const auth = async () => {
      try {
        const res = await usersService.getMe(props.auth.jwt);
        console.log("res", res);
        if (res.status === 200) {
          setLinks(AUTH_LINKS);
          dispatch(setUser(res.data));
        } else {
          setLinks(UNAUTH_LINKS);
          dispatch(logout());
        }
      } catch (error) {
        setLinks(UNAUTH_LINKS);
        dispatch(logout());
      }
    };

    if (props.auth.jwt && props.auth.isLoggedIn) {
      auth();
    } else {
      setLinks(UNAUTH_LINKS);
      dispatch(logout());
    }
  }, [jwt]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileOpen && mobileMenuRef.current && mobileButtonRef.current) {
        if (
          !mobileMenuRef.current.contains(event.target as Node) &&
          !mobileButtonRef.current.contains(event.target as Node)
        ) {
          setMobileOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileOpen, mobileMenuRef, mobileButtonRef]);

  let navbarClasses = [
    "header",
    "top-0",
    "left-0",
    "py-2",
    "flex",
    "w-full",
    "items-center",
    "transition",
    "fixed",
    "duration-500",
    ...(scrolled
      ? [
          "z-50",
          "bg-dark",
          "bg-opacity-70",
          "shadow-sticky",
          "backdrop-blur-lg",
          "duration-500",
        ]
      : ["bg-transparent", "z-50"]),
  ];

  return (
    <header className={navbarClasses.join(" ")}>
      <div className="container">
        <div className="relative mx-[-16px] flex items-center justify-between">
          <div className="w-60 max-w-full px-4">
            <Link
              href="/"
              className={`header-logo block w-full font-origin text-xl whitespace-nowrap  ${
                scrolled ? " py-4 lg:py-2" : " py-5 lg:py-7"
              }`}
            >
              <svg viewBox="0 0 370.00000000000006 92.9173120021266">
                <g
                  id="SvgjsG1193"
                  transform="matrix(0.9866242296433964,0,0,0.9866242296433964,-13.812739215007548,-2.7852401551192347)"
                  fill="#ffffff"
                >
                  <path
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#ffffff"
                    d="M83.667,97h-16.76c-0.709,0-1.282-0.573-1.282-1.279V28.677c0-0.706,0.573-1.279,1.282-1.279h16.76  c0.709,0,1.282,0.573,1.282,1.279v67.044C84.949,96.427,84.376,97,83.667,97z M68.188,94.44h14.199V29.96H68.188V94.44z"
                  ></path>
                  <path
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#ffffff"
                    d="M57.326,28.677h-2.56v-7.292c0-8.822-7.181-16.003-16.006-16.003s-16.003,7.181-16.003,16.003v7.292h-2.56  v-7.292c0-10.236,8.326-18.562,18.562-18.562s18.565,8.326,18.565,18.562V28.677z"
                  ></path>
                  <path
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#ffffff"
                    d="M82.65,96.497l-8.382-10.964c-0.171-0.223-0.263-0.498-0.263-0.778V22.467  c0-8.825-7.181-16.003-16.005-16.003c-8.823,0-16.004,7.178-16.004,16.003v6.21h-2.56v-6.21c0-10.239,8.327-18.565,18.563-18.565  s18.564,8.326,18.564,18.565v61.856l8.121,10.618L82.65,96.497z"
                  ></path>
                  <path
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#ffffff"
                    d="M66.448,97H15.279C14.572,97,14,96.427,14,95.721V28.677c0-0.706,0.572-1.279,1.279-1.279h51.169v2.562  H16.56v64.48h49.276l8.453-10.489l1.994,1.607l-8.838,10.966C67.202,96.826,66.836,97,66.448,97z"
                  ></path>
                </g>
                <g
                  id="SvgjsG1194"
                  transform="matrix(3.0748182115913107,0,0,3.0748182115913107,88.18585825216869,6.612587036036459)"
                  fill="#ffffff"
                >
                  <path d="M1.04 6 l7.96 0 c0.6 0 0.6 2.24 0 2.24 l-2.84 0.04 l0 11.28 c0 0.6 -2.28 0.6 -2.28 0 l0 -11.28 l-2.84 -0.04 c-0.6 0 -0.6 -2.24 0 -2.24 z M16.32 11.94 l0 -5.48 c0 -0.6 2.3 -0.6 2.3 0 l0 13.1 c0 0.6 -2.3 0.6 -2.3 0 l0 -5.36 l-2.58 0 l0 5.36 c0 0.6 -2.28 0.6 -2.28 0 l0 -13.1 c0 -0.6 2.28 -0.6 2.28 0 l0 5.48 l2.58 0 z M23.700000000000003 17.72 l2.86 0 c0.6 0 0.6 2.28 0 2.28 l-3.86 0 c-1.28 0 -1.28 0 -1.28 -1.08 l0 -11.84 c0 -1.08 0 -1.08 1.22 -1.1 l3.9 0.02 c0.6 0 0.6 2.28 0 2.28 l-2.84 0 l0 3.64 l2 0 c0.6 0 0.6 2.3 0 2.3 l-2 0 l0 3.5 z M37.02 6 l3.5 0 c1.4 0 2.4 2.52 2.32 4.54 c-0.04 1.04 -0.54 1.4 -1.18 2.16 c0.78 0.96 1.26 1.54 1.3 2.74 c0.06 1.96 -1.02 4.56 -2.24 4.56 l-3.64 0 c-1.26 0 -1.26 0 -1.26 -1.1 l0 -11.8 c0 -1.08 0 -1.08 1.2 -1.1 z M38.1 8.26 l0 3.6 l1.2 0 c1 0 2 -1.9 0.8 -3.6 l-2 0 z M38.1 14.1 l0 3.62 l2 0 c1.2 -1.72 0.2 -3.62 -0.8 -3.62 l-1.2 0 z M50.86 6.42 l2.08 12.7 c0.16 1 -2.1 1.1 -2.22 0.38 l-0.4 -2.4 l-2.34 0 l-0.4 2.4 c-0.1 0.6 -2.38 0.62 -2.22 -0.38 l2.1 -12.7 c0.1 -0.6 3.32 -0.54 3.4 0 z M49.94 14.84 l-0.78 -4.78 l-0.8 4.78 l1.58 0 z M57.94 17.78 l3.52 0 c0.6 0 0.6 2.22 0 2.22 l-5.24 0 c-1 0 -1.54 -0.84 -1.16 -1.68 l4.48 -10.08 l-3.54 0 c-0.6 0 -0.6 -2.24 0 -2.24 l5.26 0 c1 0 1.54 0.86 1.16 1.68 z M70.03999999999999 6.42 l2.08 12.7 c0.16 1 -2.1 1.1 -2.22 0.38 l-0.4 -2.4 l-2.34 0 l-0.4 2.4 c-0.1 0.6 -2.38 0.62 -2.22 -0.38 l2.1 -12.7 c0.1 -0.6 3.32 -0.54 3.4 0 z M69.12 14.84 l-0.78 -4.78 l-0.8 4.78 l1.58 0 z M79.62 6.42 l2.08 12.7 c0.16 1 -2.1 1.1 -2.22 0.38 l-0.4 -2.4 l-2.34 0 l-0.4 2.4 c-0.1 0.6 -2.38 0.62 -2.22 -0.38 l2.1 -12.7 c0.1 -0.6 3.32 -0.54 3.4 0 z M78.7 14.84 l-0.78 -4.78 l-0.8 4.78 l1.58 0 z M91.60000000000001 18.86 c0.42 1 -1.82 1.48 -2.08 0.88 l-0.12 -0.28 c-0.66 -1.58 -1.38 -3.38 -2.04 -4.98 l-0.98 0 l0 5.08 c0 0.6 -2.28 0.6 -2.28 0 l0 -12.3 c0 -0.94 0.02 -1.24 1.42 -1.26 l2.06 0 c0.72 0 1.52 0.02 2.14 0.42 c1.36 0.86 1.78 2.38 1.76 3.92 c-0.02 1.28 -0.2 2.56 -1.46 3.5 c-0.14 0.08 -0.26 0.16 -0.38 0.24 c0.64 1.52 1.34 3.26 1.96 4.78 z M86.38000000000001 12.2 l1.72 0 c0.92 0 1.06 -1.12 1.1 -1.44 c0.02 -0.22 0.02 -1.02 -0.02 -1.4 c-0.08 -0.74 -0.36 -1.12 -1.28 -1.12 l-1.52 0 l0 3.96 z"></path>
                </g>
              </svg>
            </Link>
          </div>
          <div className="flex w-full items-center justify-between px-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              id="navbarToggler"
              name="navbarToggler"
              ref={mobileButtonRef}
              className="absolute right-4 top-1/2 block translate-y-[-50%] rounded-lg px-3 py-3 ring-primary focus:ring-2 lg:hidden"
            >
              <TbMenu2 size={32} />
            </button>
            <nav
              id="navbarCollapse"
              ref={mobileMenuRef}
              className={
                ` right-4 top-full w-full max-w-[250px] rounded-lg bg-bg-color shadow-lg lg:static lg:block lg:w-full lg:max-w-full lg:bg-transparent py-3 lg:py-0 lg:px-4 lg:shadow-none xl:px-6` +
                (mobileOpen ? " block" : " hidden")
              }
            >
              <ul
                className={`block lg:flex place-content-between ${
                  mobileOpen ? "flex-col" : "flex-row"
                }`}
              >
                <div
                  className={`flex ${
                    mobileOpen ? "flex-col" : "flex-row"
                  } items-end justify-items-end`}
                >
                  {MAIN_LINKS.map((link: any) => (
                    <li
                      className="group relative"
                      onClick={() => setMobileOpen(false)}
                      key={link.title}
                    >
                      <Linky href={link.href}>{link.title}</Linky>
                    </li>
                  ))}
                </div>
                <div
                  className={`flex ${
                    mobileOpen ? "flex-col items-end" : "flex-row"
                  }`}
                >
                  {props.auth.isLoggedIn && links
                    ? links.map((link: any) => (
                        <li
                          className={`${
                            (link.title == "Акаунт" ||
                              link.title == "Количка" ||
                              link.title == "Wallet") &&
                            (!mobileOpen || link.title == "Wallet")
                              ? "rounded-full ml-4 flex mt-5 mb-4 p-1.5 bg-[#151f20]"
                              : ""
                          } group relative`}
                          onClick={() => setMobileOpen(false)}
                          key={link.title}
                        >
                          {/* <Linky href={link.href}>{link.title}</Linky> */}
                          {link.title == "Акаунт" && !mobileOpen ? (
                            <div className="rounded-full">
                              <FaUser
                                className=""
                                size={28}
                                onClick={() => {
                                  window.location.href = `/users/${props.auth.user?.ID}`;
                                }}
                              />
                            </div>
                          ) : link.title == "Количка" && !mobileOpen ? (
                            <div>
                              <div className="rounded-full">
                                <FaShoppingCart
                                  className="menu-hover"
                                  size={28}
                                  onClick={() => {
                                    window.location.href = `/cart`;
                                  }}
                                />
                                <p className="text-white absolute -top-2 -right-2">
                                  {props.auth.cart.products.length}
                                </p>
                              </div>
                              <div className="invisible absolute z-50 bg-[#324B4E] -left-32 top-10 rounded-lg p-2 flex w-96 flex-col group-hover:visible ">
                                <div className="flex flex-col overflow-scroll max-h-48">
                                  {props.auth.cart.products.map(
                                    (product: any) => (
                                      <div
                                        key={product.ID}
                                        className="flex w-full flex-row items-center mb-2"
                                      >
                                        <div className="flex flex-row w-8">
                                          <p>{product.Quantity} x</p>
                                        </div>
                                        <div className="flex bg-[#627C7F] w-full rounded p-1">
                                          <p> {product.Name}</p>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                                <div className="flex justify-end">
                                  <p className="text-lg text-right">
                                    Total:{" "}
                                    {props.auth.cart.total
                                      ? props.auth.cart.total
                                      : "0.00"}
                                  </p>
                                </div>
                                <div className="flex w-full justify-center">
                                  <button
                                    className="bg-[#151f20] text-xl text-white font-bold py-2 px-2 rounded"
                                    onClick={() => {
                                      window.location.href = `/cart`;
                                    }}
                                  >
                                    Checkout
                                  </button>
                                  <div className="w-2"></div>
                                  <button
                                    className="bg-[#151f20] text-xl text-white font-bold py-2 px-2 rounded"
                                    onClick={() => dispatch(clearCart())}
                                  >
                                    Clear Cart
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : link.title == "Wallet" && !mobileOpen ? (
                            <>
                              <button
                                style={{ paddingLeft: 10, paddingRight: 10 }}
                                disabled={connected}
                                onClick={connectMetaMask}
                              >
                                {connected ? "Connected" : "Connect"}
                              </button>
                            </>
                          ) : (
                            <Linky href={link.href}>{link.title}</Linky>
                          )}
                        </li>
                      ))
                    : props.auth.isLoggedIn
                    ? AUTH_LINKS.map((link: any) => (
                        <li
                          className={`${
                            link.title == "Акаунт"
                              ? "rounded-full  mt-5 mb-4 p-1.5 bg-[#151f20]"
                              : ""
                          } group relative`}
                          onClick={() => setMobileOpen(false)}
                          key={link.title}
                        >
                          {/* <Linky href={link.href}>{link.title}</Linky> */}
                          {link.title == "Акаунт" ? (
                            <div className="rounded-full">
                              <FaUser
                                className=""
                                size={28}
                                onClick={() => {
                                  window.location.href = `/users/${props.auth.user?.ID}`;
                                }}
                              />
                            </div>
                          ) : (
                            <Linky href={link.href}>{link.title}</Linky>
                          )}
                        </li>
                      ))
                    : UNAUTH_LINKS.map((link: any) => (
                        <li
                          className="group relative"
                          onClick={() => setMobileOpen(false)}
                          key={link.title}
                        >
                          <Linky href={link.href}>{link.title}</Linky>
                        </li>
                      ))}
                </div>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

const mapStateToProps = (state: any) => {
  return {
    auth: state.auth,
  };
};

export default connect(mapStateToProps)(Navigation);
