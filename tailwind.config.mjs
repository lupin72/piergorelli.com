/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		fontFamily: {
			sans: ['"Inter variable"', 'sans-serif'],
			display: ['"Work Sans"', 'sans-serif'],
		},
		container: {
			padding: {
				DEFAULT: '1.25rem',
			}
		},
		extend: {},
	},
	plugins: [
		require("@xpd/tailwind-3dtransforms")
	],
}
