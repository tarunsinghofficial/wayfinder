<script>
	import { page } from '$app/stores';
	import LoadingSpinner from '$components/LoadingSpinner.svelte';
	import ScheduleAccordionItem from '$components/schedule-for-stop/ScheduleAccordionItem.svelte';
	import StopPageHeader from '$components/stops/StopPageHeader.svelte';
	import StandalonePage from '$components/StandalonePage.svelte';
	import { formatTime } from '$lib/formatters.js';
	import { Accordion } from 'flowbite-svelte';
	import { Datepicker } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { isLoading } from 'svelte-i18n';
	import { t } from 'svelte-i18n';

	let selectedDate = new Date();
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

	onMount(async () => {
		const formattedDate = currentDate.toISOString().split('T')[0];
		await fetchScheduleForStop(stopId, formattedDate);
		toggleAll(true);
	});
</script>

<svelte:head>
	<title>{stopName} - {$t('schedule_for_stop.route_schedules')}</title>
</svelte:head>

<StandalonePage>
	{#if loading || $isLoading}
		<LoadingSpinner />
	{:else}
		<StopPageHeader {stopName} {stopId} {stopDirection} />

		<div class="flex flex-col">
			<div class="flex flex-1 flex-col">
				<h2 class="mb-4 text-2xl font-bold text-gray-800">
					{$t('schedule_for_stop.route_schedules')}
				</h2>

				<div class="mb-4 flex gap-4">
					<div class="min-w-32">
						<Datepicker bind:value={selectedDate} inputClass="w-96" />
					</div>

					<div class="flex-1 text-right">
						<button class="button" on:click={() => toggleAll(true)}>
							{$t('schedule_for_stop.show_all_routes')}
						</button>
						<button class="button" on:click={() => toggleAll(false)}>
							{$t('schedule_for_stop.collapse_all_routes')}
						</button>
					</div>
				</div>

				<div class="flex-1 rounded-lg border border-gray-200 bg-white p-6">
					{#if emptySchedules}
						<p class="text-center text-gray-700">
							{$t('schedule_for_stop.no_schedules_available')}
						</p>
					{:else}
						<Accordion flush multiple>
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
	{/if}
</StandalonePage>
