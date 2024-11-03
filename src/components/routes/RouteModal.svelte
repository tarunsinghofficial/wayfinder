<script>
	import StopItem from '$components/StopItem.svelte';
	import ModalPane from '$components/navigation/ModalPane.svelte';
	import { t } from 'svelte-i18n';

	export let selectedRoute;
	export let stops;
	export let mapProvider;

	function handleStopItemClick(event) {
		const { stop } = event.detail;

		mapProvider.panTo(stop.lat, stop.lon);
		mapProvider.setZoom(20);
	}

	function title() {
		if (!selectedRoute) {
			return '';
		}

		return $t('route_modal_title', { values: { name: selectedRoute.shortName } });
	}
</script>

<ModalPane on:close title={title()}>
	{#if stops && selectedRoute}
		<div class="space-y-4">
			<div>
				<div class="h-36 rounded-lg bg-[#1C1C1E] bg-opacity-80 p-4">
					<h1 class="mb-6 text-center text-2xl font-bold text-white">
						Route: {selectedRoute.shortName}
					</h1>
					<h2 class="mb-6 text-center text-xl text-white">{selectedRoute.description}</h2>
				</div>
			</div>

			<div class="space-y-2 overflow-y-scroll rounded-lg">
				<div>
					{#each stops as stop}
						<StopItem {stop} on:stopClick={handleStopItemClick} />
					{/each}
				</div>
			</div>
		</div>
	{/if}
</ModalPane>
