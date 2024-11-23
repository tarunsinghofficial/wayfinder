<script>
	import { faBus, faMapMarkerAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { t } from 'svelte-i18n';
	export let stopName;
	export let stopId;
	export let stopDirection;
</script>

<div class="mb-6 rounded-lg bg-white p-6 text-center shadow-lg">
	<h1 class="flex items-center justify-center gap-2 text-3xl font-bold text-green-700">
		<FontAwesomeIcon icon={faBus} />
		{$t('schedule_for_stop.stop_details')}
	</h1>
	<p class="mt-2 flex items-center justify-center gap-2 text-lg text-gray-700">
		<FontAwesomeIcon icon={faMapMarkerAlt} />
		<strong>{$t('schedule_for_stop.stop_name')}:</strong>
		{stopName} | <strong>{$t('schedule_for_stop.stop_id')}:</strong>
		{stopId}
	</p>
	<p class="mt-2 flex items-center justify-center gap-2 text-lg text-gray-700">
		<FontAwesomeIcon icon={faArrowRight} />
		<strong>{$t('schedule_for_stop.direction')}:</strong>
		{stopDirection}
	</p>
	<div class="mt-4 flex justify-center">
		<a
			href={`/stops/${stopId}`}
			class="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-3 py-1 text-white shadow hover:bg-green-600"
		>
			<FontAwesomeIcon icon={faMapMarkerAlt} />
			{$t('schedule_for_stop.click_for_realtime')}
		</a>
	</div>
</div>
