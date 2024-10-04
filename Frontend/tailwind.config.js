//** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['Menlo', 'monospace'],
    },
    extend: {

      animation: {
        gradient: "gradient 8s linear infinite",
      },
      keyframes: {
        gradient: {
          to: {
            backgroundPosition: "var(--bg-size) 0",
          },
        },
      },

      borderWidth: {
        "15": "15px",
      },
      borderRadius: {
        lg: "20px",
      },
      keyframes: {
        'gradient-move': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
        'marquee': {
          'from': { transform: "translateX(0)" },
          'to': { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        'gradient-pulse': {
          '0%, 100%': { 
            borderColor: 'rgba(255, 255, 255, 1)', // White
          },
          '50%': { 
            borderColor: 'rgba(255, 0, 0, 1)', // Red
          },
          '25%, 75%': { 
            borderColor: 'rgba(0, 103, 230, 1)', // Blue
          },
        },
      },
      animation: {
        'gradient-move': 'gradient-move 8s ease infinite',
        'gradient-pulse': 'gradient-pulse 4s linear infinite',
        'marquee': 'marquee var(--duration) linear infinite',
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
      },
    },
  },
  plugins: [],
}