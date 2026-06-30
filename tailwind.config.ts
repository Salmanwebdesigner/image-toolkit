import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 24px 80px rgba(15, 23, 42, 0.08)",
        float: "0 18px 60px rgba(99, 102, 241, 0.18)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(99, 102, 241, 0.18), transparent 32%), radial-gradient(circle at top right, rgba(56, 189, 248, 0.12), transparent 28%), linear-gradient(180deg, #f8fbff 0%, #eef4ff 42%, #f8fafc 100%)",
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        fadeUp: "fadeUp 500ms ease-out both",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
