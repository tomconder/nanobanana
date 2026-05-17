import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["node_modules/", ".wrangler/", "worker-configuration.d.ts"] },
  tseslint.configs.recommended
);
