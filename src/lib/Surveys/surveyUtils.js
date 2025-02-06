
import { showSurveyModal, surveyStore } from '$stores/surveyStore.js';



export async function loadSurveys(stop = null, userId = null) {
    try {
        const response = await fetch(`/api/oba/surveys?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch surveys');

        const data = await response.json();
        const validSurveys = getValidSurveys(data.surveys);

        let selectedSurvey = null;

        if (stop) {
            selectedSurvey = getValidStopSurvey(validSurveys, stop) || getShowSurveyOnAllStops(validSurveys);
        } else {
            selectedSurvey = getMapSurvey(validSurveys);
        }

        surveyStore.set(selectedSurvey);

        showSurveyModal.set(selectedSurvey?.show_on_map === true );

    } catch (error) {
        console.error('Error loading surveys:', error);
    }
}

export function getValidSurveys(surveys) {
    const now = new Date();
    return surveys.filter(survey =>
        new Date(survey.end_date) > now &&
        !localStorage.getItem(`survey_${survey.id}_answered`) &&
        !localStorage.getItem(`survey_${survey.id}_skipped`)
    );
}

export function getValidStopSurvey(surveys, stop) {

  return surveys.find(survey =>
    survey.show_on_stops &&
    (
      (survey.visible_stop_list && survey.visible_stop_list.includes(stop.id)) ||
       survey.visible_route_list !== null &&
        survey.visible_route_list.some(routeId => stop.routeIds.includes(routeId)))

  ) || null;
}



export function getShowSurveyOnAllStops(surveys) {
    return surveys.find(survey =>
        survey.show_on_stops &&
        survey.visible_stop_list === null
    ) || null;
}

export function getMapSurvey(surveys) {
    return surveys.find(survey => survey.show_on_map) || null;
}

export async function submitHeroQuestion(surveyResponse) {

    try {
        const payload = {
            ...surveyResponse,
            responses: JSON.stringify([surveyResponse.responses[0]])
        };
        const response = await fetch('/api/oba/surveys/submit-survey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error('Failed to submit survey response', response);
        }
        const data = await response.json();
        return data.survey_response.id;
    } catch (error) {
        console.error('Error submitting hero question:', error);
        throw error;
    }
}


export async function updateSurveyResponse(surveyPublicIdentifier, surveyResponse) {
    try {
        const payload = {
            ...surveyResponse,
            responses: JSON.stringify(surveyResponse.responses)
        };
        const response = await fetch(`/api/oba/surveys/update-survey/${surveyPublicIdentifier}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error('Failed to update survey response');
        }
        return true;
    } catch (error) {
        console.error('Error updating survey response:', error);
        throw error;
    }
}


export function submitSurvey(survey, hideSurveyModal) {
	localStorage.setItem(`survey_${survey.id}_answered`, true);
        if (hideSurveyModal) {
            setTimeout(() => {
			showSurveyModal.set(false);
		}, 3000);
     }
}


export function skipSurvey(survey) {
		localStorage.setItem(`survey_${survey.id}_skipped`, true);
		showSurveyModal.set(false);
}
