import type { Config } from "tailwindcss";

const config: Config = {
  content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
],
  theme: {
    extend: {
      colors: {
        'default-50': 'var(--color-default-50)',
        'default-200': 'var(--color-default-200)',
        'default-500': 'var(--color-default-500)',
        'default-600': 'var(--color-default-600)',
        'default-800': 'var(--color-default-800)',
      },
    },
  },
  plugins: [
    require("daisyui") 
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#570df8",
          "secondary": "#f000b8",
          "accent": "#37cdbe",
          "neutral": "#3d4451",
          "base-100": "#ffffff",
        },
      },
    ],
  },
};

export default config;
