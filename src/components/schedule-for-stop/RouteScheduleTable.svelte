<script>
	import { createEventDispatcher } from 'svelte';
	import { t } from 'svelte-i18n';

	export let schedule;

	const dispatch = createEventDispatcher();

	function handleToggle() {
		dispatch('toggle');
	}

	function formatHour(hour) {
		const hourInt = +hour;
		if (hourInt === 0) return '12';
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

<div class="overflow-x-auto">
	<table class="mt-4 w-full table-auto rounded-lg border border-gray-200 shadow-lg">
		<thead class="bg-gray-100 text-gray-800">
			<tr>
				<th class="cursor-pointer px-6 py-3 text-left">{$t('schedule_for_stop.hour')}</th>
				<th class="cursor-pointer px-6 py-3 text-left">{$t('schedule_for_stop.minutes')}</th>
			</tr>
		</thead>
		<tbody>
			<tr class="bg-gray-50 hover:bg-gray-100">
				<td colspan="2" class="px-6 py-3 font-semibold text-gray-700">AM</td>
			</tr>
			{#if renderScheduleTable(schedule).amTimes.length === 0}
				<tr>
					<td colspan="2" class="border px-6 py-3 text-center text-gray-500">
						{$t('schedule_for_stop.no_am_schedules_available')}
					</td>
				</tr>
			{:else}
				{#each renderScheduleTable(schedule).amTimes as [hour, times]}
					<tr class="hover:bg-gray-100">
						<td
							class="border px-6 py-3 text-center text-lg font-semibold"
							title="Full Time: {hour}:{extractMinutes(times[0].arrivalTime)}"
						>
							{formatHour(hour)} <span class="text-sm text-gray-600">AM</span>
						</td>
						<td class="border px-6 py-3 text-lg">
							{#each times as stopTime, index (index)}
								<span>
									{extractMinutes(stopTime.arrivalTime)}
									{index < times.length - 1 ? ', ' : ''}
								</span>
							{/each}
						</td>
					</tr>
				{/each}
			{/if}

			<tr class="bg-gray-50 hover:bg-gray-100">
				<td colspan="2" class="px-6 py-3 font-semibold text-gray-700">PM</td>
			</tr>
			{#if renderScheduleTable(schedule).pmTimes.length === 0}
				<tr>
					<td colspan="2" class="border px-6 py-3 text-center text-gray-500">
						{$t('schedule_for_stop.no_pm_schedules_available')}
					</td>
				</tr>
			{:else}
				{#each renderScheduleTable(schedule).pmTimes as [hour, times]}
					<tr class="hover:bg-gray-100">
						<td
							class="border px-6 py-3 text-center text-lg font-semibold"
							title="Full Time: {hour}:{extractMinutes(times[0].arrivalTime)}"
						>
							{formatHour(hour)} <span class="text-sm text-gray-600">PM</span>
						</td>
						<td class="border px-6 py-3 text-lg">
							{#each times as stopTime, index (index)}
								<span>
									{extractMinutes(stopTime.arrivalTime)}
									{index < times.length - 1 ? ', ' : ''}
								</span>
							{/each}
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
