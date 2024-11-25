<script>
	import ArrivalDeparture from '../ArrivalDeparture.svelte';
	import TripDetailsModal from '../navigation/TripDetailsModal.svelte';
	import LoadingSpinner from '$components/LoadingSpinner.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	import '$lib/i18n.js';
	import { t } from 'svelte-i18n';

	import { isLoading } from 'svelte-i18n';

	export let stop;
	export let arrivalsAndDeparturesResponse = null;

	let arrivalsAndDepartures;
	let loading = false;
	let error;

	let showTripDetails = false;
	let selectedTripDetails = null;
	let interval = null;
	let initialDataLoaded = false;

	const dispatch = createEventDispatcher();

	async function loadData(stopID) {
		loading = true;
		const response = await fetch(`/api/oba/arrivals-and-departures-for-stop/${stopID}`);

		if (response.ok) {
			arrivalsAndDeparturesResponse = await response.json();
			arrivalsAndDepartures = arrivalsAndDeparturesResponse.data.entry;
		} else {
			error = 'Unable to fetch arrival/departure data';
		}
		loading = false;
	}

	function resetDataFetchInterval(stopID) {
		if (interval) clearInterval(interval);

		loadData(stopID);

		interval = setInterval(() => {
			loadData(stopID);
		}, 30000);
	}

	$: if (stop?.id && initialDataLoaded) {
		clearInterval(interval);
		resetDataFetchInterval(stop.id);
	}

	onMount(() => {
		loadData(stop.id);
		initialDataLoaded = true;
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	let _routeShortNames = null;
	function routeShortNames() {
		if (!_routeShortNames && arrivalsAndDeparturesResponse?.data?.references?.routes) {
			_routeShortNames = arrivalsAndDeparturesResponse.data.references.routes
				.filter((r) => stop.routeIds.includes(r.id))
				.map((r) => r.nullSafeShortName)
				.sort();
		}
		return _routeShortNames;
	}

	function handleShowTripDetails(event) {
		selectedTripDetails = {
			...event.detail,
			routeShortName: event.detail.routeShortName,
			tripHeadsign: event.detail.tripHeadsign,
			scheduledArrivalTime: event.detail.scheduledArrivalTime
		};
		showTripDetails = true;
		dispatch('tripSelected', selectedTripDetails);
		dispatch('updateRouteMap', { show: true });
	}

	function handleCloseTripDetailModal() {
		showTripDetails = false;
		dispatch('tripSelected', null);
		dispatch('updateRouteMap', { show: false });
	}
</script>

{#if $isLoading}
	<p>Loading...</p>
{:else}
	<div>
		{#if loading && isLoading}
			<LoadingSpinner />
		{/if}

		{#if error}
			<p>{error}</p>
		{/if}

		{#if arrivalsAndDepartures}
			<div class="space-y-4">
				<div>
					<div class="relative flex flex-col gap-y-1 rounded-lg bg-[#1C1C1E] bg-opacity-80 p-4">
						<h1 class="h1 mb-0 text-white">{stop.name}</h1>
						<h2 class="h2 mb-0 text-white">{$t('stop')} #{stop.id}</h2>
						{#if routeShortNames()}
							<h2 class="h2 mb-0 text-white">{$t('routes')}: {routeShortNames().join(', ')}</h2>
						{/if}
						<div class="mt-auto flex justify-end">
							<a
								href={`/stops/${stop.id}/schedule`}
								class="inline-block rounded-lg border border-green-500 bg-green-500 px-3 py-1 text-sm font-medium text-white shadow-md transition duration-200 ease-in-out hover:bg-green-600"
								target="_blank"
							>
								{$t('schedule_for_stop.view_schedule')}
							</a>
						</div>
					</div>
				</div>
				{#if arrivalsAndDepartures.arrivalsAndDepartures.length === 0}
					<div class="flex items-center justify-center">
						<p>{$t('no_arrivals_or_departures_in_next_30_minutes')}</p>
					</div>
				{:else}
					<div class="space-y-2 overflow-y-scroll rounded-lg">
						<div>
							{#each arrivalsAndDepartures.arrivalsAndDepartures as arrival}
								<ArrivalDeparture
									arrivalDeparture={arrival}
									on:showTripDetails={handleShowTripDetails}
								/>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}

		{#if showTripDetails}
			<TripDetailsModal {stop} {selectedTripDetails} onClose={handleCloseTripDetailModal} />
		{/if}
	</div>
{/if}
