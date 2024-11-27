<script>
	import { run } from 'svelte/legacy';

	import { setContext } from 'svelte';
	import { writable, derived } from 'svelte/store';

	// Create a store to track the active item and data.
	const activeItem = writable(null);
	const activeData = writable(null);

	// Create dispatch for activeChanged event
	import { createEventDispatcher } from 'svelte';
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();
	const dispatch = createEventDispatcher();

	// Watch for changes to activeItem and dispatch event
	run(() => {
		dispatch('activeChanged', {
			activeItem: $activeItem,
			activeData: $activeData
		});
	});

	// Provide context for child AccordionItems
	setContext('accordion', {
		registerItem: (id) => {
			const isActive = derived(activeItem, ($activeItem) => $activeItem === id);
			return {
				isActive,
				activate: (data) => {
					const newId = $activeItem === id ? null : id;
					activeItem.set(newId);
					activeData.set(newId ? data : null);
				}
			};
		}
	});
</script>

<div
	class="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-700 dark:border-gray-700"
>
	{@render children?.()}
</div>
