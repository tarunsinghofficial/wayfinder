<script>
	export let arrivalDeparture;
	let routeShortName = arrivalDeparture.routeShortName;
	let tripHeadsign = arrivalDeparture.tripHeadsign;
	let scheduledArrivalTime = arrivalDeparture.scheduledArrivalTime;
	let predictedArrivalTime = arrivalDeparture.predictedArrivalTime;
	import { t } from 'svelte-i18n';

	function formatTime(time) {
		const date = new Date(time);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function getArrivalStatus(predictedTime, scheduledTime) {
		const now = new Date();
		const predicted = new Date(predictedTime);
		const scheduled = new Date(scheduledTime);

		const predictedDiff = predicted - now;
		const scheduledDiff = scheduled - now;

		if (predictedTime == 0) {
			return {
				status: `${$t('status.scheduled')}`,
				text: `${$t('status.scheduled_not_real_time')}`,
				color: 'text-gray-500 dark:text-gray-400'
			};
		} else if (predictedDiff <= 0) {
			return {
				status: `${$t('early')}`,
				text: `${$t('arrives')} ${Math.abs(Math.floor(predictedDiff / 60000))} ${$t('status.min')} ${$t('status.early')}`,
				color: 'text-red-500'
			};
		} else if (scheduledDiff <= 0) {
			return {
				status: `${$t('status.on_time')}`,
				text: `${$t('status.arrives_on_time')}`,
				color: 'text-green-500'
			};
		} else {
			return {
				status: `${$t('status.late')}`,
				text: `${$t('arrives')} ${Math.floor(predictedDiff / 60000)} ${$t('status.min')} ${$t('status.late')}`,
				color: 'text-blue-500'
			};
		}
	}

	function calculateTimeToReach(predictedTime, scheduledTime) {
		const now = new Date();
		const predicted = new Date(predictedTime);
		const scheduled = new Date(scheduledTime);

		const predictedDiff = predicted - now;

		const chosenTime = predictedDiff >= 0 ? predicted : scheduled;

		return `${Math.floor((chosenTime - now) / 60000)}m`;
	}
</script>

<div class="flex flex-col gap-1">
	<p class="text-left text-xl font-semibold text-black dark:text-white">
		{routeShortName} - {tripHeadsign}
	</p>
	<p class="text-left font-semibold text-black dark:text-white">
		<span class="text-md">{formatTime(scheduledArrivalTime)}</span> -
		<span class={getArrivalStatus(predictedArrivalTime, scheduledArrivalTime).color}>
			{getArrivalStatus(predictedArrivalTime, scheduledArrivalTime).text}
		</span>
	</p>
</div>
<div>
	<p class="text-lg font-semibold text-black dark:text-white">
		{calculateTimeToReach(predictedArrivalTime, scheduledArrivalTime)}
	</p>
</div>
