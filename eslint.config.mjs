import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  { ignores: ["node_modules/", ".wrangler/", "worker-configuration.d.ts"] },
  tseslint.configs.recommended,
  prettier
);
