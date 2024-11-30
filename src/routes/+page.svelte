<script>
	import { pushState } from '$app/navigation';
	import SearchPane from '$components/search/SearchPane.svelte';
	import MapContainer from '$components/MapContainer.svelte';
	import RouteModal from '$components/routes/RouteModal.svelte';
	import ViewAllRoutesModal from '$components/routes/ViewAllRoutesModal.svelte';
	import { isLoading } from 'svelte-i18n';
	import AlertsModal from '$components/navigation/AlertsModal.svelte';
	import { onMount } from 'svelte';
	import StopModal from '$components/stops/StopModal.svelte';
	import TripPlanModal from '$components/trip-planner/TripPlanModal.svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_OBA_REGION_NAME } from '$env/static/public';

	let stop = $state();
	let selectedTrip = $state(null);
	let showRoute = $state(false);
	let selectedRoute = $state(null);
	let showRouteMap = $state(false);
	let showAllRoutesModal = $state(false);
	let showTripPlanModal = $state(false);
	let showRouteModal = $state();
	let mapProvider = $state(null);
	let currentIntervalId = null;
	let alert = $state(null);
	let showAlertModal = $state(false);
	let stops = $state([]);
	let polylines = [];

	let tripItineraries = $state([]);
	let loadingItineraries = false;
	let fromMarker = $state(null);
	let toMarker = $state(null);
	let currentHighlightedStopId = null;

	$effect(() => {
		if (showRouteModal && showAllRoutesModal) {
			showAllRoutesModal = false;
		}

		if (showAllRoutesModal) {
			showRouteModal = false;
		}
	});

	function handleStopMarkerSelect(stopData) {
		stop = stopData;
		pushState(`/stops/${stop.id}`);
		showAllRoutesModal = false;
		if (currentHighlightedStopId !== null) {
			mapProvider.unHighlightMarker(currentHighlightedStopId);
		}
		mapProvider.highlightMarker(stop.id);
		currentHighlightedStopId = stop.id;
	}

	function handleViewAllRoutes() {
		showRouteModal = false;
		showAllRoutesModal = true;
	}

	function handleModalRouteClick(route) {
		const customEvent = new CustomEvent('routeSelectedFromModal', {
			detail: { route }
		});
		window.dispatchEvent(customEvent);
		showAllRoutesModal = false;
	}

	function closePane() {
		pushState('/');
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
		mapProvider.unHighlightMarker(currentHighlightedStopId);
		currentHighlightedStopId = null;
		showTripPlanModal = false;
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
	}

	/**
	 *
	 * @param {Object} routeData - The data related to the selected route.
	 * @param {Object} routeData.route - The selected route object.
	 * @param {Array} routeData.polylines - An array of polylines for the route.
	 * @param {Array} routeData.stops - An array of stops for the route.
	 * @param {number} routeData.currentIntervalId - The current interval ID.
	 */
	function handleRouteSelected(routeData) {
		selectedRoute = routeData.route;
		polylines = routeData.polylines;
		stops = routeData.stops;
		currentIntervalId = routeData.currentIntervalId;
		showRouteModal = true;
	}

	function clearPolylines() {
		polylines.map((p) => {
			mapProvider.removePolyline(p);
		});

		mapProvider.removeStopMarkers();
		selectedRoute = null;
	}

	async function loadAlerts() {
		try {
			const response = await fetch('/api/oba/alerts');

			if (!response.ok || response.status === 204) {
				showAlertModal = false;
				return;
			}

			const data = await response.json();

			alert = data;
			showAlertModal = true;
		} catch (error) {
			console.error('Error loading alerts:', error);
		}
	}
	/**
	 *
	 * @param {Object} tripPlanData - The data returned from the trip planning API.
	 * @param {Object} tripPlanData.data - The trip planning data.
	 * @param {Object} tripPlanData.fromMarker - The marker for the from location.
	 * @param {Object} tripPlanData.toMarker - The marker for the to location.
	 */
	function handleTripPlan(tripPlanData) {
		const tripData = tripPlanData.data;
		fromMarker = tripPlanData.fromMarker;
		toMarker = tripPlanData.toMarker;
		tripItineraries = tripData.plan?.itineraries;
		if (!tripItineraries) {
			console.error('No itineraries found', 404);
		}
		showTripPlanModal = true;
	}

	onMount(() => {
		loadAlerts();

		// close the trip plan modal when the tab is switched
		if (browser) {
			window.addEventListener('tabSwitched', () => {
				showTripPlanModal = false;
			});

			window.addEventListener('planTripTabClicked', () => {
				closePane();
			});
		}
	});
</script>

<svelte:head>
	<title>{PUBLIC_OBA_REGION_NAME}</title>
</svelte:head>

{#if showAlertModal}
	<AlertsModal {alert} />
{/if}

{#if $isLoading}
	<p>Loading...</p>
{:else}
	<div class="pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-40">
		<div class="mx-4 mt-4 flex h-full flex-col md:w-96">
			<SearchPane
				{mapProvider}
				cssClasses="pointer-events-auto"
				on:clearResults={clearPolylines}
				{handleRouteSelected}
				{handleViewAllRoutes}
				{clearPolylines}
				{handleTripPlan}
			/>

			<div class="mt-4 flex-1">
				{#if stop}
					<StopModal {closePane} {tripSelected} {handleUpdateRouteMap} {stop} />
				{/if}

				{#if showRouteModal}
					<RouteModal {closePane} {mapProvider} {stops} {selectedRoute} />
				{/if}

				{#if showAllRoutesModal}
					<ViewAllRoutesModal {closePane} {handleModalRouteClick} />
				{/if}

				{#if showTripPlanModal}
					<TripPlanModal
						{mapProvider}
						itineraries={tripItineraries}
						{fromMarker}
						{toMarker}
						loading={loadingItineraries}
						{closePane}
					/>
				{/if}
			</div>
		</div>
	</div>

	<MapContainer
		{selectedTrip}
		{selectedRoute}
		{handleStopMarkerSelect}
		{showRoute}
		{showRouteMap}
		bind:mapProvider
	/>
{/if}
