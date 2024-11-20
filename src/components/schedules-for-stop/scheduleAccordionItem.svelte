<script>
	import { createEventDispatcher } from 'svelte';
	import { AccordionItem } from 'flowbite-svelte';

	export let schedule;
	export let expanded;

	const dispatch = createEventDispatcher();

	function handleToggle() {
		dispatch('toggle');
	}

	function formatHour(hour) {
		const hourInt = +hour;
		if (hourInt === 0) return 12;
		if (hourInt > 12) return hourInt - 12;
		return hourInt;
	}

	function renderScheduleTable(schedule) {
		const stopTimes = Object.entries(schedule.stopTimes);

		const amTimes = stopTimes.filter(([hour]) => +hour < 12);
		const pmTimes = stopTimes.filter(([hour]) => +hour >= 12);

		return {
			amTimes,
			pmTimes
		};
	}

	function extractMinutes(arrivalTime) {
		return arrivalTime.replace(/[AP]M/, '').split(':')[1];
	}
</script>

<AccordionItem open={expanded} on:click={handleToggle}>
	<span slot="header" class="text-lg font-semibold text-gray-800">
		{schedule.tripHeadsign}
	</span>
	<table class="mt-4 w-full table-auto border border-gray-200">
		<thead class="bg-gray-100">
			<tr>
				<th class="border px-4 py-2 text-left">Hour</th>
				<th class="border px-4 py-2 text-left">Minutes</th>
			</tr>
		</thead>
		<tbody>
			<tr class="bg-gray-200">
				<td colspan="2" class="px-4 py-2 font-bold">AM</td>
			</tr>
			{#each renderScheduleTable(schedule).amTimes as [hour, times]}
				<tr>
					<td class="border px-4 py-2 text-center">{formatHour(hour)}:00</td>
					<td class="border px-4 py-2">
						{#each times as stopTime, index (index)}
							<span>
								{extractMinutes(stopTime.arrivalTime)}
								{index < times.length - 1 ? ', ' : ''}
							</span>
						{/each}
					</td>
				</tr>
			{/each}

			<tr class="bg-gray-200">
				<td colspan="2" class="px-4 py-2 font-bold">PM</td>
			</tr>
			{#each renderScheduleTable(schedule).pmTimes as [hour, times]}
				<tr>
					<td class="border px-4 py-2 text-center">{formatHour(hour)}:00</td>
					<td class="border px-4 py-2">
						{#each times as stopTime, index (index)}
							<span>
								{extractMinutes(stopTime.arrivalTime)}
								{index < times.length - 1 ? ', ' : ''}
							</span>
						{/each}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</AccordionItem>
