import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 淡粉色風格：玫瑰粉 + 亮粉（已調淡，移除原本偏酒紅的深色）
        brand: {
          DEFAULT: "#ec4899",  // primary - 玫瑰粉（較柔）
          dark: "#db2777",     // 深玫瑰（原 #9d174d 太酒紅，改成乾淨玫瑰粉）
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
        brand: "0 4px 16px rgba(236, 72, 153, 0.12)",
        banner: "0 4px 18px rgba(219, 39, 119, 0.24)",
      },
      backgroundImage: {
        "page-grad": "linear-gradient(180deg, #fdf2f8 0%, #fce7f3 100%)",
        "step-grad": "linear-gradient(90deg, #db2777 0%, #ec4899 50%, #f472b6 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
