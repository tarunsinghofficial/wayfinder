<script>
	import {
		PUBLIC_OBA_REGION_NAME,
		PUBLIC_OBA_LOGO_URL,
		PUBLIC_NAV_BAR_LINKS
	} from '$env/static/public';

	import ThemeSwitcher from '$lib/ThemeSwitch/ThemeSwitcher.svelte';
	import MobileMenu from './MobileMenu.svelte';

	let isMobileMenuOpen = $state(false);

	let headerLinks = $state(null);

	if (PUBLIC_NAV_BAR_LINKS) {
		headerLinks = JSON.parse(PUBLIC_NAV_BAR_LINKS);
	}

	function toggleNavbar() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}
</script>

<div
	class="bg-blur-md flex items-center justify-between border-b border-gray-500 bg-white/80 px-4 dark:bg-black dark:text-white md:flex-row md:px-8"
>
	<div class="flex flex-1 items-center justify-between md:flex-none">
		<div class="flex w-full justify-between gap-4 px-2 py-2 md:w-auto">
			<div class="flex items-center justify-center gap-x-2">
				<a href="/" class="block">
					<img src={PUBLIC_OBA_LOGO_URL} alt={PUBLIC_OBA_REGION_NAME} class="h-10 rounded-sm" />
				</a>
				<a href="/" class="block text-xl font-extrabold">
					{PUBLIC_OBA_REGION_NAME}
				</a>
			</div>

			<div class="flex items-center justify-end md:hidden">
				<button onclick={toggleNavbar} aria-label="Toggle navigation menu">
					<svg
						class="burger-icon h-6 w-6 text-gray-900 dark:text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16m-7 6h7"
						></path>
					</svg>
				</button>
			</div>
		</div>

		<div class="hidden items-center gap-4 px-2 py-2 md:flex">
			<div class="flex gap-x-4">
				{#each Object.entries(headerLinks) as [key, value]}
					<div class="rounded-md border bg-white/80 dark:bg-gray-800">
						<a href={value} class="block px-2 py-1 font-semibold text-gray-900 dark:text-white"
							>{key}</a
						>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="hidden md:flex">
		<ThemeSwitcher />
	</div>
</div>

{#if isMobileMenuOpen}
	<MobileMenu {headerLinks} closeMenu={toggleNavbar} />
{/if}

<style lang="postcss">
	.burger-icon {
		cursor: pointer;
	}
</style>
