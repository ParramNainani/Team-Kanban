import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#050101",
        obsidian: "#120504",
        rust: "#5C0301",
        blood: "#9F0601",
        flame: "#DA1702",
        ember: "#E15A15",
        ashgold: "#A78F62",
        cream: "#EAE9DC",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "ember-radial":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(225,90,21,0.22), transparent 55%)",
        "blood-glow":
          "radial-gradient(circle at 70% 30%, rgba(218,23,2,0.18), transparent 45%)",
      },
    },
  },
  plugins: [],
};

export default config;
