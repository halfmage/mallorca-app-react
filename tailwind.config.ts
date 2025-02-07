import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'media',
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'primary': {
          '50': '#fff9ec',
          '100': '#fff2d3',
          '200': '#ffe2a5',
          '300': '#ffcc6d',
          '400': '#ffaa32',
          '500': '#ff8f0a',
          '600': '#ff7700',
          '700': '#cc5602',
          '800': '#a1430b',
          '900': '#82390c',
          '950': '#461a04',
        },
        'secondary': {
          '50': '#fbfee7',
          '100': '#f5fccb',
          '200': '#eafa9c',
          '300': '#d8f363',
          '400': '#c3e734',
          '500': '#b8e417',
          '600': '#81a40c',
          '700': '#617d0e',
          '800': '#4e6311',
          '900': '#415314',
          '950': '#212e05',
        },
        'tertiary': {
          '50': '#e9f0ff',
          '100': '#d6e4ff',
          '200': '#b5caff',
          '300': '#89a6ff',
          '400': '#5b73ff',
          '500': '#3542ff',
          '600': '#1913ff',
          '700': '#1209f9',
          '800': '#0f0bc8',
          '900': '#13139c',
          '950': '#07062f',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
