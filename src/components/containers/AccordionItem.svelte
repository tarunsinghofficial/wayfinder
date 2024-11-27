<script>
	import { getContext } from 'svelte';
	import { slide } from 'svelte/transition';

	/**
	 * @typedef {Object} Props
	 * @property {any} [data]
	 * @property {import('svelte').Snippet} [header]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { data = null, header, children } = $props();

	const id = crypto.randomUUID();
	const { registerItem } = getContext('accordion');
	const { isActive, skipAnimation, activate } = registerItem(id);
	function toggle() {
		activate(data);
	}
</script>

<div class="relative">
	<div class="sticky top-0 z-10 bg-white dark:bg-gray-800">
		<button
			type="button"
			class="flex w-full items-center justify-between py-3 text-left text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
			class:text-gray-900={$isActive}
			class:dark:text-white={$isActive}
			onclick={toggle}
			aria-expanded={$isActive}
		>
			{@render header?.()}
			<svg
				class="h-6 w-6 shrink-0 transition-transform"
				class:rotate-180={$isActive}
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>
	</div>

	{#if $isActive}
		<div
			transition:slide|local={{
				duration: $skipAnimation ? 0 : 300
			}}
		>
			<div class="py-3">
				{@render children?.()}
			</div>
		</div>
	{/if}
</div>
