/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-purple-dark': '#3a1f7c',
                'brand-cyan': '#41A5B5',
                'brand-purple-base': '#5221a7',
                'brand-purple-light': '#e8f3f6', // Note: This is a very light blue, not purple. Naming for clarity.
                'brand-bg-light': '#e3f2fd',
                'brand-bg-main': '#f4f6f8',
                'brand-hover-light': 'rgba(177, 205, 225, 0.5)',
            }
        },
    },
    plugins: [],
}