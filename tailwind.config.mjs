/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	safelist: [
		'text-white',
	],
	theme: {
		fontFamily: {
			sans: ['"Inter"', 'serif'],
			display: ['"Work Sans"', 'sans-serif'],
		},
		fontSize: {
      sm: '0.875rem',
      base: '1rem',
      xl: '1.25rem',
      '2xl': '1.625rem',
      '3xl': '2.5rem',
      '4xl': '5rem',
      '5xl': '9.75rem',
    },
		container: {
			padding: {
				DEFAULT: '1.25rem',
			}
		},
		extend: {
			aspectRatio: {
        '4/3': '4 / 3',
      },
			colors: {
				'boulder': {
        '50': '#f5f6f6',
        '100': '#e6e7e7',
        '200': '#d0d1d1',
        '300': '#afb0b1',
        '400': '#86888a',
        '500': '#737577',
        '600': '#5b5d5f',
        '700': '#4e4f50',
        '800': '#444446',
        '900': '#3c3d3d',
        '950': '#252527',
    		},
			}
		},
	},
	plugins: [
		require("@xpd/tailwind-3dtransforms")
	],
}
