import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		coverage: {
			provider: 'v8',
			reportsDirectory: './coverage',
			reporter: ['text', 'html'],
			all: true,
			exclude: ['node_modules', 'coverage', '.svelte-kit', 'build']
		}
	}
});
