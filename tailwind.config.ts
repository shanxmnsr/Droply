// import type { Config } from "tailwindcss";

// const config: Config = {
//   content: [
//   "./app/**/*.{js,ts,jsx,tsx,mdx}",
//   "./pages/**/*.{js,ts,jsx,tsx,mdx}",
//   "./components/**/*.{js,ts,jsx,tsx,mdx}",
// ],
//   theme: {
//     extend: {
//       colors: {
//         'default-50': 'var(--color-default-50)',
//         'default-200': 'var(--color-default-200)',
//         'default-500': 'var(--color-default-500)',
//         'default-600': 'var(--color-default-600)',
//         'default-800': 'var(--color-default-800)',
//       },
//     },
//   },
//   plugins: [
//     require("daisyui") 
//   ],
//   daisyui: {
//     themes: [
//       {
//         mytheme: {
//           "primary": "#570df8",
//           "secondary": "#f000b8",
//           "accent": "#37cdbe",
//           "neutral": "#3d4451",
//           "base-100": "#ffffff",
//         },
//       },
//     ],
//   },
// };

// export default config;










// FOR UI 
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
        // Base (zinc system)
        background: "#09090b", // zinc-950
        card: "#18181b",       // zinc-900
        border: "#27272a",

        // Droply brand system
        primary: {
          DEFAULT: "#6366F1", // indigo
          hover: "#4f46e5",
        },

        accent: {
          DEFAULT: "#38BDF8", // sky blue
        },

        muted: "#a1a1aa",
      },
    },
  },

  // You can keep daisyUI but DO NOT use its theme colors anymore
  plugins: [require("daisyui")],

  daisyui: {
    themes: [
      {
        droply: {
          primary: "#6366F1",
          secondary: "#38BDF8",
          accent: "#38BDF8",
          neutral: "#18181b",
          "base-100": "#09090b",
        },
      },
    ],
  },
};

export default config;