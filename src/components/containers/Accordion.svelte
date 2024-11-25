<script>
	import { setContext } from 'svelte';
	import { writable, derived } from 'svelte/store';

	// Props to track all possible item IDs
	export let items = [];

	// Create a store to track multiple active items using a Set
	const activeItems = writable(new Set());

	// Create dispatch for activeChanged event
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	// Methods to open/close all items
	export const openAll = () => {
		activeItems.set(new Set(items));
		dispatch('openAll');
	};

	export const closeAll = () => {
		activeItems.set(new Set());
		dispatch('closeAll');
	};

	// Watch for changes to activeItems and dispatch event
	$: {
		dispatch('activeChanged', { activeItems: Array.from($activeItems) });
	}

	// Provide context for child AccordionItems and expose methods
	setContext('accordion', {
		registerItem: (id) => {
			// Add the item ID to our items array if not already present
			if (!items.includes(id)) {
				items = [...items, id];
			}

			const isActive = derived(activeItems, ($activeItems) => $activeItems.has(id));
			return {
				isActive,
				activate: () => {
					activeItems.update((items) => {
						const newItems = new Set(items);
						if (newItems.has(id)) {
							newItems.delete(id);
						} else {
							newItems.add(id);
						}
						return newItems;
					});
				}
			};
		},
		openAll,
		closeAll
	});
</script>

<div
	class="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-700 dark:border-gray-700"
>
	<slot />
</div>
