<script>
	import { page } from '$app/stores';
	import LoadingSpinner from '$components/LoadingSpinner.svelte';
	import ScheduleAccordionItem from '$components/schedule-for-stop/scheduleAccordionItem.svelte';
	import StopDetailsHeader from '$components/schedule-for-stop/StopDetailsHeader.svelte';
	import { formatTime } from '$lib/formatters.js';
	import { Accordion } from 'flowbite-svelte';
	import { Datepicker } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { isLoading } from 'svelte-i18n';

	let selectedDate = '';
	let prevSelectedDate = null;
	let schedulesMap = new Map();
	let routeReference = new Map();
	let schedules = [];
	let stopName = '';
	let stopId = '';
	let stopDirection = '';
	let expandedItems = [];
	let loading = true;
	let emptySchedules = false;
	let currentDate = new Date();

	$: stopId = $page.params.stopID;

	$: if (selectedDate && selectedDate !== prevSelectedDate) {
		const formattedDate = selectedDate.toISOString().split('T')[0];
		prevSelectedDate = selectedDate;
		fetchScheduleForStop(stopId, formattedDate);
	}

	async function fetchScheduleForStop(stopId, date) {
		try {
			loading = true;
			emptySchedules = false;
			const response = await fetch(`/api/oba/schedule-for-stop/${stopId}?date=${date}`);
			if (!response.ok) throw new Error('Failed to fetch schedule for stop');
			const scheduleForStop = await response.json();
			handleScheduleForStopResponse(scheduleForStop.data);
		} catch (error) {
			console.error('Error fetching schedules:', error);
		} finally {
			loading = false;
		}
	}

	function handleScheduleForStopResponse(scheduleForStop) {
		schedulesMap.clear();
		routeReference.clear();

		if (!scheduleForStop.entry.stopRouteSchedules.length) {
			emptySchedules = true;
			schedules = [];
			expandedItems = [];
			return;
		}

		setStopDetails(scheduleForStop.references.stops[0]);
		mapRoutes(scheduleForStop.references.routes);
		processRouteSchedules(scheduleForStop.entry.stopRouteSchedules);

		schedules = Array.from(schedulesMap.values());
		expandedItems = schedules.map(() => false);
	}

	function mapRoutes(routes) {
		for (let route of routes) {
			routeReference.set(route.id, route);
		}
	}

	function setStopDetails(stop) {
		stopName = stop.name;
		stopId = stop.id;
		stopDirection = stop.direction;
	}

	function processRouteSchedules(routeSchedules) {
		for (let routeSchedule of routeSchedules) {
			let routeId = routeSchedule.routeId;
			let stopRouteDirectionSchedules = routeSchedule.stopRouteDirectionSchedules;

			stopRouteDirectionSchedules.forEach((directionSchedule) => {
				const stopTimesGroupedByHour = groupStopTimesByHour(directionSchedule.scheduleStopTimes);
				const routeName = getRouteName(routeId, directionSchedule.tripHeadsign);

				schedulesMap.set(routeName, {
					tripHeadsign: routeName,
					stopTimes: stopTimesGroupedByHour
				});
			});
		}
	}

	function getRouteName(routeId, tripHeadsign) {
		const route = routeReference.get(routeId);
		return `${route.shortName ?? route.longName} - ${tripHeadsign}`;
	}

	function groupStopTimesByHour(stopTimes) {
		const grouped = {};
		for (let stopTime of stopTimes) {
			const date = new Date(stopTime.arrivalTime);
			const hour = date.getHours();
			if (!grouped[hour]) grouped[hour] = [];
			grouped[hour].push({
				arrivalTime: formatTime(stopTime.arrivalTime)
			});
		}
		return grouped;
	}

	function toggleAll(expand) {
		expandedItems = schedules.map(() => expand);
	}

	function toggleAccordion(index) {
		expandedItems = expandedItems.map((item, i) => (i === index ? !item : item));
	}

	onMount(() => {
		const formattedDate = currentDate.toISOString().split('T')[0];
		fetchScheduleForStop(stopId, formattedDate);
	});
</script>

{#if loading || $isLoading}
	<LoadingSpinner />
{:else}
	<div class="mx-auto max-w-7xl overflow-y-auto p-5" style="max-height: calc(100vh - 100px);">
		<StopDetailsHeader {stopName} {stopId} {stopDirection} />

		<div class="flex flex-col gap-6 md:flex-row">
			<div class="md:w-1/3">
				<h2 class="mb-4 text-xl font-semibold text-gray-800">Select Date</h2>
				<div class="rounded-lg border border-gray-300 bg-white p-4 shadow">
					<Datepicker inline bind:value={selectedDate} />
					<p class="mt-4 text-sm text-gray-600">
						Selected date: {selectedDate
							? selectedDate.toLocaleDateString()
							: currentDate.toLocaleDateString()}
					</p>
				</div>
			</div>

			<div class="flex flex-1 flex-col">
				<h2 class="mb-4 text-2xl font-bold text-gray-800">Route Schedules</h2>

				<div class="mb-4 flex gap-4">
					<button
						class="text-md rounded-lg bg-green-500 px-6 py-2 text-white shadow hover:bg-green-600 active:bg-green-700"
						on:click={() => toggleAll(true)}
					>
						Show All Routes
					</button>
					<button
						class="text-md rounded-lg bg-gray-500 px-6 py-2 text-white shadow hover:bg-gray-600 active:bg-gray-700"
						on:click={() => toggleAll(false)}
					>
						Collapse All Routes
					</button>
				</div>

				<div
					class="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-lg"
				>
					{#if emptySchedules}
						<p class="text-center text-gray-700">No schedules available for the selected date.</p>
					{:else}
						<Accordion flush>
							{#each schedules as schedule, index (schedule.tripHeadsign)}
								<ScheduleAccordionItem
									{schedule}
									expanded={expandedItems[index]}
									on:toggle={() => toggleAccordion(index)}
								/>
							{/each}
						</Accordion>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
