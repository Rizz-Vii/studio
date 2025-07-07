/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {}, // Correct for Tailwind v3+
    autoprefixer: {}, // Autoprefixer plugin
  },
};

export default config;
