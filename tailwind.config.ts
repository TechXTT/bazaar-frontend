/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    fontFamily: {
      inter: "'Inter', sans-serif",
      zone99: "warzone97",
      origin: "OriginTechDemoRegular",
    },
    container: {
      center: true,
      padding: "1rem",
    },
    colors: {
      current: "currentColor",
      transparent: "transparent",
      white: "#FFFFFF",
      black: "#141420",
      "bg-color": "#2C2C39",
      border: "#3D3D4D",
      stroke: "#4D4C5A",
      dark: "#1D2144",
      primary: "#5142FC",
      secondary: "#36B37E",
      yellow: "#FBB040",
      "body-color": "#A1A0AE",
      gradient:
        "linear-gradient(158.44deg, #68CBE9 7.17%, #7775B4 52.72%, #7B51A1 91.26%)",
      error: "#FF0000",
    },
    extend: {
      backgroundImage: () => ({
        gradient:
          "linear-gradient(158.44deg, #68CBE9 7.17%, #7775B4 52.72%, #7B51A1 91.26%)",
      }),
      boxShadow: {
        primary: "0px 4px 16px rgba(81, 66, 252, 0.4)",
        secondary: "0px 4px 16px rgba(54, 179, 126, 0.4)",
        yellow: "0px 4px 16px rgba(251, 176, 64, 0.4)",
      },
      spacing: {
        "1/2": "50%",
        "1/3": "33.333333%",
        "2/3": "66.666667%",
        "1/4": "25%",
        "2/4": "50%",
        "3/4": "75%",
        "1/5": "20%",
        "2/5": "40%",
        "3/5": "60%",
        "4/5": "80%",
        "1/6": "16.666667%",
        "2/6": "33.333333%",
        "3/6": "50%",
        "4/6": "66.666667%",
        "5/6": "83.333333%",
        "1/12": "8.333333%",
        "2/12": "16.666667%",
        "3/12": "25%",
        "4/12": "33.333333%",
        "5/12": "41.666667%",
        "6/12": "50%",
        "7/12": "58.333333%",
        "8/12": "66.666667%",
        "9/12": "75%",
        "10/12": "83.333333%",
        "11/12": "91.666667%",
      },
    },
  },
  plugins: [
    require("@shrutibalasa/tailwind-grid-auto-fit"),
    require("tailwindcss-animatecss"),
  ],
};
