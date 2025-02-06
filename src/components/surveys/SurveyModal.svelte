<script>
	import { Modal, Button } from 'flowbite-svelte';
	import SurveyQuestion from './SurveyQuestion.svelte';
	import {
		submitHeroQuestion as submitHeroQuestionUtil,
		updateSurveyResponse as updateSurveyResponseUtil,
		skipSurvey,
		submitSurvey
	} from '$lib/Surveys/surveyUtils';

	import { showSurveyModal, surveyStore } from '$stores/surveyStore';
	import { getUserId } from '$lib/utils/user';

	let { stop = $bindable(null), skipHeroQuestion, surveyPublicIdentifierOutside } = $props();

	let userAnswers = $state([]);
	let heroQuestionAnswered = $state(false);
	let heroQuestion = $state(null);
	let remainingQuestions = $state([]);
	let surveyPublicIdentifier = $state(null);
	let surveySubmitted = $state(false);
	let errors = $state([]);

	let currentSurvey = $state($surveyStore);

	if (currentSurvey && currentSurvey.questions) {
		heroQuestion = currentSurvey.questions[0];
		remainingQuestions = currentSurvey.questions.slice(1);
	}

	let surveyResponse = {
		survey_id: currentSurvey.id,
		user_identifier: getUserId(),
		stop_identifier: stop?.id ?? null,
		stop_latitude: stop?.lat ?? null,
		stop_longitude: stop?.lon ?? null,
		responses: []
	};

	function handleInputChange(event, question, index) {
		const type = question.content.type;

		if (type === 'text' || type === 'radio') {
			userAnswers[index] = event.target.value;
		} else if (type === 'checkbox') {
			const value = event.target.value;
			if (event.target.checked) {
				userAnswers[index] = [...(userAnswers[index] || []), value];
			} else {
				userAnswers[index] = (userAnswers[index] || []).filter((option) => option !== value);
				if (userAnswers[index].length === 0) {
					delete userAnswers[index];
				}
			}
		}

		surveyResponse.responses[index] = {
			question_id: question.id,
			question_label: question.content.label_text,
			question_type: question.content.type,
			answer: userAnswers[index] || null
		};
	}

	function validateAnswers() {
		let valid = true;
		errors = new Array(currentSurvey.questions.length).fill(false);

		if (!heroQuestionAnswered && !skipHeroQuestion) {
			if (heroQuestion.required && (!userAnswers[0] || userAnswers[0].length === 0)) {
				errors[0] = true;
				valid = false;
			}
		} else {
			remainingQuestions.forEach((question, index) => {
				const answer = userAnswers[index + 1];
				if (question.required && (!answer || (Array.isArray(answer) && answer.length === 0))) {
					errors[index + 1] = true;
					valid = false;
				}
			});
		}

		return valid;
	}

	async function submitHeroQuestion() {
		if (!validateAnswers()) return;

		try {
			surveyPublicIdentifier = await submitHeroQuestionUtil(surveyResponse);
			heroQuestionAnswered = true;
			submitSurvey(currentSurvey, false);
		} catch (error) {
			console.error('Error submitting hero question:', error);
		}
	}

	async function updateSurveyResponse() {
		if (surveyPublicIdentifierOutside) [(surveyPublicIdentifier = surveyPublicIdentifierOutside)];
		updateSurveyResponseUtil(surveyPublicIdentifier, surveyResponse);
	}

	function handleSubmit() {
		if (!validateAnswers()) return;

		updateSurveyResponse();
		surveySubmitted = true;
		submitSurvey(currentSurvey, true);
	}
</script>

{#if $showSurveyModal && currentSurvey}
	<Modal open={$showSurveyModal} size="3xl" class="max-w-5xl rounded-2xl">
		<div
			class="flex items-center justify-between rounded-t-2xl border-b border-gray-200 p-6 dark:border-gray-700"
		>
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white">{currentSurvey.name}</h2>
		</div>

		<div class="flex flex-col space-y-6 p-6">
			{#if surveySubmitted}
				<div class="flex flex-1 flex-col items-center justify-center p-12">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-20 w-20 text-green-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<h2 class="mt-6 text-4xl font-bold text-gray-900 dark:text-white">Survey Submitted</h2>
					<p class="mt-3 text-xl text-gray-700 dark:text-gray-300">
						Thank you for taking the survey!
					</p>
				</div>
			{:else}
				<div class="max-h-[60vh] overflow-y-auto p-6">
					{#if !heroQuestionAnswered && !skipHeroQuestion}
						<SurveyQuestion
							question={heroQuestion}
							index={0}
							value={userAnswers[0]}
							onInputChange={(e) => handleInputChange(e, heroQuestion, 0)}
							required={heroQuestion?.required}
							error={errors[0]}
						/>
					{:else}
						<div class="space-y-8">
							{#each remainingQuestions as question, index}
								<SurveyQuestion
									{question}
									index={index + 1}
									value={userAnswers[index + 1]}
									onInputChange={(e) => handleInputChange(e, question, index + 1)}
									required={question.required}
									error={errors[index + 1]}
								/>
							{/each}
						</div>
					{/if}
				</div>

				<div
					class="sticky bottom-0 flex justify-end gap-4 rounded-b-2xl border-t border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
				>
					{#if !heroQuestionAnswered && !skipHeroQuestion}
						<Button
							onclick={submitHeroQuestion}
							color="green"
							class="rounded-lg px-10 py-3 shadow-md transition-shadow hover:shadow-lg"
						>
							Next
						</Button>
					{:else}
						<Button
							onclick={skipSurvey}
							color="red"
							class="rounded-lg px-10 py-3 shadow-md transition-shadow hover:shadow-lg"
						>
							Skip
						</Button>
						<Button
							onclick={handleSubmit}
							color="green"
							class="rounded-lg px-10 py-3 shadow-md transition-shadow hover:shadow-lg"
						>
							Submit
						</Button>
					{/if}
				</div>
			{/if}
		</div>
	</Modal>
{/if}
