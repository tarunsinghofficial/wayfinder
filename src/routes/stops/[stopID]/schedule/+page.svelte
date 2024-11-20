<script>
	import { page } from '$app/stores';
	import { convertUnixToTime, formatTime } from '$lib/formatters.js';
	import { Accordion, AccordionItem } from 'flowbite-svelte';
	import { Datepicker } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	let selectedDate = new Date();
	let schedulesMap = new Map();
	let schedules = [];
	let stopName = 'Stop Name';
	let stopId;
	let expandedItems = [];

	$: stopId = $page.params.stopID;

	async function fetchScheduleForStop(stopId) {
		try {
			const response = await fetch(`/api/oba/schedule-for-stop/${stopId}`);
			if (!response.ok) throw new Error('Failed to fetch schedule for stop');
			const scheduleForStop = await response.json();
			handleScheduleForStopResponse(scheduleForStop.data.entry);
		} catch (error) {
			console.error('Error fetching schedules:', error);
		}
	}

	function handleScheduleForStopResponse(scheduleForStop) {
		schedulesMap.clear();
		for (let routeSchedule of scheduleForStop.stopRouteSchedules) {
			let routeId = routeSchedule.routeId;
			let stopRouteDirectionSchedules = routeSchedule.stopRouteDirectionSchedules;

			stopRouteDirectionSchedules.forEach((directionSchedule) => {
				const stopTimesGroupedByHour = groupStopTimesByHour(directionSchedule.scheduleStopTimes);
				schedulesMap.set(routeId, {
					tripHeadsign: directionSchedule.tripHeadsign,
					stopTimes: stopTimesGroupedByHour
				});
			});
		}
		schedules = Array.from(schedulesMap.values());
		expandedItems = schedules.map((_, index) => false);
	}

	// TODO: ADD AM AND PM LOGIC
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

	onMount(() => {
		fetchScheduleForStop(stopId);
	});
</script>

<div class="mx-auto max-w-7xl p-5">
	<div class="mb-6 rounded-lg bg-gray-100 p-6 text-center shadow-lg">
		<h1 class="text-3xl font-bold text-green-700">Stop Details</h1>
		<p class="mt-2 text-lg text-gray-700">
			<strong>Stop Name:</strong>
			{stopName} | <strong>Stop ID:</strong>
			{stopId}
		</p>
	</div>

	<div class="flex flex-col gap-6 md:flex-row">
		<div class="md:w-1/3">
			<h2 class="mb-4 text-xl font-semibold text-gray-800">Select Date</h2>
			<div class="rounded-lg border border-gray-300 bg-white p-4 shadow">
				<Datepicker inline bind:value={selectedDate} />
				<p class="mt-4 text-sm text-gray-600">
					Selected date: {selectedDate ? selectedDate.toLocaleDateString() : 'None'}
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
				style="max-height: calc(100vh - 220px);"
			>
				<Accordion>
					{#each schedules as schedule, index (schedule.tripHeadsign)}
						<AccordionItem open={expandedItems[index]}>
							<span slot="header" class="-semibold text-lg text-gray-800">
								{schedule.tripHeadsign}
							</span>
							{#each Object.entries(schedule.stopTimes) as [hour, times]}
								<h3 class="mt-4 text-lg text-green-700">{hour}:00</h3>
								<table class="mt-2 w-full table-auto border border-gray-200">
									<thead class="bg-gray-100">
										<tr>
											<th class="border px-4 py-2 text-left">Arrival Time</th>
										</tr>
									</thead>
									<tbody>
										{#each times as stopTime}
											<tr>
												<td class="border px-4 py-2 text-center">{stopTime.arrivalTime}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							{/each}
						</AccordionItem>
					{/each}
				</Accordion>
			</div>
		</div>
	</div>
</div>
