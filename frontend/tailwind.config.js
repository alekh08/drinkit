/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fef2f3',
                    100: '#fde6e7',
                    200: '#fbd0d5',
                    300: '#f7aab2',
                    400: '#f27a8a',
                    500: '#e74c62',
                    600: '#d42d49',
                    700: '#b31f3b',
                    800: '#961c36',
                    900: '#801b32',
                },
                secondary: {
                    50: '#f8f9fa',
                    100: '#e9ecef',
                    200: '#dee2e6',
                    300: '#ced4da',
                    400: '#adb5bd',
                    500: '#6c757d',
                    600: '#495057',
                    700: '#343a40',
                    800: '#212529',
                    900: '#0d1117',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
