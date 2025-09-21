import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.extends("next/core-web-vitals", "next/typescript"),
	...compat.config({
		rules: {
			'react/no-empty-object-type': 'off',
			'@next/no-empty-object-type': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-explicit-any':'off',
			'react-hooks/exhaustive-deps': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
		},
	})
];

export default eslintConfig;
