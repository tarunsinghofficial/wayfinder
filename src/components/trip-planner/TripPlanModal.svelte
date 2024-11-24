<script>
	import ModalPane from '$components/navigation/ModalPane.svelte';
	import LoadingSpinner from '$components/LoadingSpinner.svelte';
	import ItineraryDetails from './ItineraryDetails.svelte';
	import ItineraryTab from './ItineraryTab.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { t } from 'svelte-i18n';

	export let mapProvider;
	export let itineraries = [];
	export let loading = false;
	export let fromMarker = null;
	export let toMarker = null;

	let expandedSteps = {};
	let activeTab = 0;

	function toggleSteps(index) {
		expandedSteps[index] = !expandedSteps[index];
		expandedSteps = { ...expandedSteps };
	}

	function setActiveTab(index) {
		activeTab = index;
		drawRoute();
	}

	let currPolylines = [];
	let polylineStyle = {
		weight: 8,
		opacity: 0.8,
		withArrow: false
	};

	// draw the current itinerary route based on the active itinerary tab
	async function drawRoute() {
		if (currPolylines.length > 0) {
			currPolylines.forEach((polyline) => {
				mapProvider.removePolyline(polyline);
			});
			currPolylines = [];
		}

		itineraries[activeTab].legs.forEach((leg) => {
			const shape = leg.legGeometry.points;
			const polyline = mapProvider.createPolyline(shape, polylineStyle, true);
			currPolylines.push(polyline);
		});
	}

	onMount(() => {
		drawRoute();
	});
	onDestroy(() => {
		mapProvider.removePinMarker(fromMarker);
		mapProvider.removePinMarker(toMarker);

		if (currPolylines.length > 0) {
			currPolylines.forEach(async (polyline) => {
				mapProvider.removePolyline(await polyline);
			});
		}
	});
</script>

<ModalPane on:close title={$t('trip-planner.trip_itineraries')}>
	{#if loading}
		<LoadingSpinner />
	{/if}

	{#if itineraries.length > 0}
		<div class="tab-container">
			<!-- eslint-disable no-unused-vars -->
			{#each itineraries as _, index}
				<ItineraryTab {index} {activeTab} {setActiveTab} />
			{/each}
		</div>

		<div class="p-4">
			{#if itineraries[activeTab]}
				<ItineraryDetails itinerary={itineraries[activeTab]} {expandedSteps} {toggleSteps} />
			{/if}
		</div>
	{:else}
		<div class="flex h-full items-center justify-center text-gray-400 dark:text-gray-500">
			{$t('trip-planner.no_itineraries_found')}
		</div>
	{/if}
</ModalPane>
