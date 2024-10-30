<script>
	import { pushState } from '$app/navigation';
	import SearchPane from '$components/search/SearchPane.svelte';
	import ModalPane from '$components/navigation/ModalPane.svelte';
	import StopPane from '$components/oba/StopPane.svelte';
	import MapContainer from '$components/MapContainer.svelte';
	import RouteModal from '$components/navigation/RouteModal.svelte';
	import ViewAllRoutesModal from '$components/navigation/ViewAllRoutesModal.svelte';
	import { isLoading } from 'svelte-i18n';

	let stop;
	let selectedTrip = null;
	let showRoute = false;
	let selectedRoute = null;
	let showRouteMap = false;
	let showAllStops = false;
	let showAllRoutesModal = false;
	let showRouteModal;
	let mapProvider = null;
	let currentIntervalId = null;
	let polylines = [];
	let stops = [];

	$: {
		if (showRouteModal && showAllRoutesModal) {
			showAllRoutesModal = false;
		}

		if (showAllRoutesModal) {
			showRouteModal = false;
		}
	}

	function stopSelected(event) {
		stop = event.detail.stop;
		pushState(`/stops/${stop.id}`);
	}

	function handleShowAllRoutes() {
		showRouteModal = false;
		showAllRoutesModal = true;
	}

	function handleRouteSelectedFromModal(event) {
		const route = event.detail.route;
		const customEvent = new CustomEvent('routeSelectedFromModal', {
			detail: { route }
		});
		window.dispatchEvent(customEvent);
		showAllRoutesModal = false;
	}

	function closePane() {
		if (polylines) {
			clearPolylines();
			mapProvider.removeStopMarkers();
			mapProvider.cleanupInfoWindow();
			mapProvider.clearVehicleMarkers();
			clearInterval(currentIntervalId);
		}
		stop = null;
		selectedTrip = null;
		selectedRoute = null;
		showRoute = false;
		showRouteModal = false;
		showAllRoutesModal = false;
	}

	function tripSelected(event) {
		if (event.detail) {
			selectedTrip = event.detail;
			showRoute = true;
			selectedRoute = {
				id: event.detail.routeId,
				shortName: event.detail.routeShortName
			};
		} else {
			selectedTrip = null;
			showRoute = false;
			selectedRoute = null;
		}
	}

	function handleUpdateRouteMap(event) {
		showRouteMap = event.detail.show;
		showAllStops = !event.detail.show;
	}

	function handleShowAllStops() {
		showAllStops = true;
		showRouteMap = false;
	}

	function handleRouteSelected(event) {
		selectedRoute = event.detail.route;
		polylines = event.detail.polylines;
		stops = event.detail.stops;
		currentIntervalId = event.detail.currentIntervalId;
		showRouteModal = true;
	}

	function clearPolylines() {
		polylines.map(async (p) => {
			mapProvider.removePolyline(await p);
		});

		mapProvider.removeStopMarkers();
		selectedRoute = null;
	}
</script>

{#if $isLoading}
	<p>Loading...</p>
{:else}
	<div class="pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-40">
		<div class="ml-4 mt-4 flex h-full w-full flex-col md:w-96">
			<SearchPane
				{mapProvider}
				cssClasses="pointer-events-auto"
				on:routeSelected={handleRouteSelected}
				on:clearResults={clearPolylines}
				on:viewAllRoutes={handleShowAllRoutes}
			/>
			<div class="mt-2">
				{#if stop}
					<ModalPane on:close={closePane}>
						<StopPane
							{showAllStops}
							{stop}
							on:tripSelected={tripSelected}
							on:updateRouteMap={handleUpdateRouteMap}
							on:showAllStops={handleShowAllStops}
						/>
					</ModalPane>
				{/if}

				{#if showRouteModal}
					<ModalPane on:close={closePane}>
						<RouteModal {mapProvider} {stops} {selectedRoute} />
					</ModalPane>
				{/if}

				{#if showAllRoutesModal}
					<ModalPane on:close={closePane}>
						<ViewAllRoutesModal on:routeSelected={handleRouteSelectedFromModal} />
					</ModalPane>
				{/if}
			</div>
		</div>
	</div>

	<MapContainer
		{selectedTrip}
		{selectedRoute}
		on:stopSelected={stopSelected}
		{showRoute}
		{showRouteMap}
		{stop}
		bind:mapProvider
	/>
{/if}
