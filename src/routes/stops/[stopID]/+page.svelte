<script>
	import StopPane from '$components/stops/StopPane.svelte';
	import StopPageHeader from '$components/stops/StopPageHeader.svelte';
	import StandalonePage from '$components/StandalonePage.svelte';
	import '$lib/i18n.js';
	import { t } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { loadSurveys } from '$lib/Surveys/surveyUtils.js';
	import { getUserId } from '$lib/utils/user.js';

	let { data } = $props();
	const stop = data.stopData.entry;
	const arrivalsAndDeparturesResponse = data.arrivalsAndDeparturesResponse;

	onMount(() => {
		loadSurveys(stop, getUserId());
	});
</script>

<svelte:head>
	<title>{stop.name} - {$t('arrivals_and_departures_for_stop.title')}</title>
</svelte:head>

<StandalonePage>
	<StopPageHeader stopName={stop.name} stopId={stop.id} stopDirection={stop.direction} />
	<StopPane {stop} {arrivalsAndDeparturesResponse} />
</StandalonePage>
