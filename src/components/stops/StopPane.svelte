<script>
	import ArrivalDeparture from '$components/ArrivalDeparture.svelte';
	import TripDetailsPane from '$components/oba/TripDetailsPane.svelte';
	import LoadingSpinner from '$components/LoadingSpinner.svelte';
	import Accordion from '$components/containers/SingleSelectAccordion.svelte';
	import AccordionItem from '$components/containers/AccordionItem.svelte';
	import SurveyModal from '$components/surveys/SurveyModal.svelte';
	import SurveyQuestion from '$components/surveys/SurveyQuestion.svelte';
	import { onDestroy } from 'svelte';
	import '$lib/i18n.js';
	import { isLoading, t } from 'svelte-i18n';
	import { submitHeroQuestion, skipSurvey } from '$lib/Surveys/surveyUtils';
	import { surveyStore, showSurveyModal } from '$stores/surveyStore';
	import { getUserId } from '$lib/utils/user';

	/**
	 * @typedef {Object} Props
	 * @property {any} stop
	 * @property {any} [arrivalsAndDeparturesResponse]
	 */

	/** @type {Props} */
	let {
		handleUpdateRouteMap,
		tripSelected,
		stop,
		arrivalsAndDeparturesResponse = $bindable(null)
	} = $props();

	let arrivalsAndDepartures = $state();
	let loading = $state(false);
	let error = $state();

	let interval = null;
	let currentStopSurvey = $state(null);

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

	$effect(() => {
		if (stop?.id) {
			clearInterval(interval);
			resetDataFetchInterval(stop.id);
		}
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

	function handleAccordionSelectionChanged(event) {
		const data = event.activeData; // this is the ArrivalDeparture object plumbed into the AccordionItem
		const show = !!data;
		tripSelected({ detail: data });
		handleUpdateRouteMap({ detail: { show } });
	}

	let heroAnswer = '';
	let nextSurveyQuestion = $state(false);
	let surveyPublicIdentifier = $state(null);
	let showHeroQuestion = $state(true);

	async function handleNext() {
		if (heroAnswer && heroAnswer.trim() != '') {
			showSurveyModal.set(true);
			nextSurveyQuestion = true;

			let surveyResponse = {
				survey_id: currentStopSurvey.id,
				user_identifier: getUserId(),
				stop_identifier: stop.id,
				stop_latitude: stop.lat,
				stop_longitude: stop.lon,
				responses: []
			};

			surveyResponse.responses[0] = {
				question_id: currentStopSurvey.questions[0].id,
				question_label: currentStopSurvey.questions[0].content.label_text,
				question_type: currentStopSurvey.questions[0].content.type,
				answer: heroAnswer
			};

			surveyPublicIdentifier = await submitHeroQuestion(surveyResponse);
			showHeroQuestion = false;
		}
	}

	function handleSkip() {
		skipSurvey(currentStopSurvey);
		showHeroQuestion = false;
	}
	function handleHeroQuestionChange(event) {
		heroAnswer = event.target.value;
	}

	$effect(() => {
		currentStopSurvey = $surveyStore;
	});
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
				{#if showHeroQuestion && currentStopSurvey}
					<div class="hero-question-container relative rounded-lg bg-gray-50 p-6 shadow">
						<button
							onclick={handleSkip}
							class="absolute right-2 top-2 text-2xl text-gray-500 hover:text-gray-700"
							title="Skip hero question"
						>
							&times;
						</button>
						<h2 class="h2 mb-4">{currentStopSurvey.name}</h2>
						<SurveyQuestion
							question={currentStopSurvey.questions[0]}
							index={0}
							required={currentStopSurvey.questions[0].required}
							onInputChange={handleHeroQuestionChange}
							variant="compact"
							error={[false]}
						/>
						<div class="mt-4 flex justify-end">
							<button
								onclick={handleNext}
								class="rounded bg-green-500 px-4 py-3 text-white shadow transition hover:bg-green-600"
							>
								Next
							</button>
						</div>
					</div>
				{/if}

				{#if nextSurveyQuestion}
					<SurveyModal
						currentSurvey={currentStopSurvey}
						{stop}
						skipHeroQuestion={true}
						surveyPublicIdentifierOutside={surveyPublicIdentifier}
					/>
				{/if}

				{#if arrivalsAndDepartures.arrivalsAndDepartures.length === 0}
					<div class="flex items-center justify-center">
						<p>{$t('no_arrivals_or_departures_in_next_30_minutes')}</p>
					</div>
				{:else}
					{#key arrivalsAndDepartures.stopId}
						<Accordion {handleAccordionSelectionChanged}>
							{#each arrivalsAndDepartures.arrivalsAndDepartures as arrival}
								<AccordionItem data={arrival}>
									{#snippet header()}
										<span>
											<ArrivalDeparture arrivalDeparture={arrival} />
										</span>
									{/snippet}
									<TripDetailsPane
										{stop}
										tripId={arrival.tripId}
										serviceDate={arrival.serviceDate}
									/>
								</AccordionItem>
							{/each}
						</Accordion>
					{/key}
				{/if}
			</div>
		{/if}
	</div>
{/if}
