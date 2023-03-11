module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: "384px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1792px",
    },
  },
  // daisyUI config (optional)
  daisyui: {
    styled: true,
    themes: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
    darkTheme: "dark",
    themes: [
      {
        mytheme: {
          primary: "#17429F",
          neutral: "#1d1d29",
          secondary: "#FF9D00",
          accent: "#E5E7EB",
          // sedcondary: "#1d1d29",
          // acccent: "#FF9D00",
          // necutral: "#191D24",
          "base-100": "#fafbfa",
          info: "#00b1fd",
          success: "#24e170",
          warning: "#FBBD23",
          error: "#F84C4C",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
