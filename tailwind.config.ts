import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 淡粉色風格：玫瑰粉 + 亮粉
        brand: {
          DEFAULT: "#db2777",  // primary - 玫瑰粉
          dark: "#9d174d",     // 深玫瑰
          light: "#fdf2f8",    // 淡粉底
          accent: "#f472b6",   // 亮粉
          gold: "#f0a8c0",     // 玫瑰金
        },
        ink: {
          DEFAULT: "#3a2230",
          soft: "#6e5560",
          muted: "#a98c99",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', '"PingFang TC"', '"Microsoft JhengHei"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        brand: "0 4px 16px rgba(219, 39, 119, 0.12)",
        banner: "0 4px 18px rgba(157, 23, 77, 0.28)",
      },
      backgroundImage: {
        "page-grad": "linear-gradient(180deg, #fdf2f8 0%, #fce7f3 100%)",
        "step-grad": "linear-gradient(90deg, #9d174d 0%, #db2777 50%, #f472b6 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
