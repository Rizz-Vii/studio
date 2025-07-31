<<<<<<< HEAD
// Emergency ESLint configuration with minimal rules
// Used for Development Hyperloop lean builds to skip intensive linting

export default [];  // Empty configuration = no rules applied
=======
// Emergency ESLint config for deployment
export default [
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/out/**"],
  },
];
>>>>>>> workshop/performance
