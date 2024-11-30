<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();
</script>

<div class="mx-auto h-full max-w-5xl overflow-y-auto">
	{@render children?.()}
</div>
