/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';
import themes from 'daisyui/src/theming/themes';
import daisyUIThemes from 'daisyui/src/theming/themes';
export default {
  // content: ["./src/**/*.{html,js}"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui:{
    themes:[
      "light",
      {
        black:{
          ...daisyUIThemes["black"],
          primary:"rgb(29,155,240)",
          secondary:"rgb(24,24,24)",
        }
      }
    ]
  }
}

