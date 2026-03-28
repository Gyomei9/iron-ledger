import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface2)",
          3: "var(--surface3)",
        },
        border: {
          DEFAULT: "var(--border)",
          2: "var(--border2)",
        },
        text: {
          DEFAULT: "var(--text)",
          2: "var(--text2)",
          muted: "var(--muted)",
        },
        accent: {
          DEFAULT: "var(--ac)",
          2: "var(--ac2)",
          3: "var(--ac3)",
        },
        ok: {
          DEFAULT: "var(--green)",
          2: "var(--green2)",
          bg: "var(--green-bg)",
        },
        danger: {
          DEFAULT: "var(--red)",
          2: "var(--red2)",
          bg: "var(--red-bg)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      backgroundImage: {
        "accent-grad": "var(--ac-grad)",
        "accent-grad2": "var(--ac-grad2)",
      },
      backgroundColor: {
        bg: "var(--bg)",
      },
    },
  },
  plugins: [],
};

export default config;
