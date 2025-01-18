<script>
	import StopItem from '$components/StopItem.svelte';
	import ModalPane from '$components/navigation/ModalPane.svelte';
	import { t } from 'svelte-i18n';

	let { selectedRoute, stops, mapProvider, closePane } = $props();

	function handleStopItemClick(stop) {
		mapProvider.flyTo(stop.lat, stop.lon, 18);
	}

	function title() {
		if (!selectedRoute) {
			return '';
		}

		return $t('route_modal_title', { values: { name: selectedRoute.shortName } });
	}
</script>

<ModalPane {closePane} title={title()}>
	{#if stops && selectedRoute}
		<div class="space-y-4">
			<div>
				<div class="h-36 bg-brand-secondary bg-opacity-80 p-4 rounded-lg">
					<h1 class="mb-6 text-2xl font-bold text-center text-white">
						Route: {selectedRoute.shortName}
					</h1>
					<h2 class="mb-6 text-xl text-center text-white">{selectedRoute.description}</h2>
				</div>
			</div>

			<div class="space-y-2 rounded-lg">
				<div>
					{#each stops as stop}
						<StopItem {stop} {handleStopItemClick} />
					{/each}
				</div>
			</div>
		</div>
	{/if}
</ModalPane>
