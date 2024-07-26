/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{html,js,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins"],
      },
      colors: {
        "my-orange": "FF7E03",
        "bg-clr": "150142",
        "chatbg-clr": "1C005A",
        acc_d: "2D097F",
        acc_l: "3A0CA4",
        "connected-clr": "36FF04",
        "gray-clr": "CCD6DD",
      },
    },
  },
  plugins: [require("daisyui")],
};
