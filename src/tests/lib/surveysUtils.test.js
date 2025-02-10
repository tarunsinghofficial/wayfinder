import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	getValidSurveys,
	getValidStopSurvey,
	getShowSurveyOnAllStops,
	getMapSurvey,
	submitHeroQuestion,
	updateSurveyResponse
} from '../../lib/Surveys/surveyUtils';

beforeEach(() => {
	let store = {};
	vi.stubGlobal('localStorage', {
		getItem: vi.fn((key) => store[key] || null),
		setItem: vi.fn((key, value) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		})
	});

	localStorage.clear();
});

describe('getValidSurveys', () => {
	it('should return surveys with valid end_date or no end_date', () => {
		const now = new Date();
		const futureDate = new Date(now.getTime() + 10000).toISOString();
		const pastDate = new Date(now.getTime() - 10000).toISOString();

		const surveys = [
			{ id: 1, end_date: futureDate },
			{ id: 2, end_date: pastDate },
			{ id: 3 } // case when end_date is not present, the survey should be valid also.
		];

		const valid = getValidSurveys(surveys);
		expect(valid).toEqual([{ id: 1, end_date: futureDate }, { id: 3 }]);
	});

	it('should filter out surveys that were answered or skipped', () => {
		const now = new Date();
		const futureDate = new Date(now.getTime() + 10000).toISOString();

		const surveys = [
			{ id: 1, end_date: futureDate },
			{ id: 2, end_date: futureDate }
		];

		localStorage.setItem('survey_1_answered', 'true');
		localStorage.setItem('survey_2_skipped', 'true');

		const valid = getValidSurveys(surveys);
		expect(valid).toEqual([]);
	});
});

describe('getValidStopSurvey', () => {
	it('should return a survey based on visible_stop_list matching stop id', () => {
		const surveys = [
			{ id: 1, show_on_stops: false },
			{ id: 2, show_on_stops: true, visible_stop_list: ['stop1'], visible_route_list: null },
			{ id: 3, show_on_stops: true, visible_stop_list: ['stop2'], visible_route_list: null }
		];
		const stop = { id: 'stop1', routeIds: [] };

		const result = getValidStopSurvey(surveys, stop);
		expect(result).toEqual(surveys[1]);
	});

	it('should return a survey based on visible_route_list matching one of stop.routeIds', () => {
		const surveys = [
			{ id: 1, show_on_stops: true, visible_stop_list: null, visible_route_list: ['r1', 'r2'] },
			{ id: 2, show_on_stops: true, visible_stop_list: null, visible_route_list: ['r3'] }
		];
		const stop = { id: 'stop10', routeIds: ['r2'] };

		const result = getValidStopSurvey(surveys, stop);
		expect(result).toEqual(surveys[0]);
	});

	it('should return null if no survey matches', () => {
		const surveys = [
			{ id: 1, show_on_stops: true, visible_stop_list: ['stop3'], visible_route_list: ['r5'] }
		];
		const stop = { id: 'stop1', routeIds: ['r2'] };

		const result = getValidStopSurvey(surveys, stop);
		expect(result).toBeNull();
	});
});

describe('getShowSurveyOnAllStops', () => {
	it('should return survey if show_on_stops is true and visible_stop_list is null', () => {
		const surveys = [
			{ id: 1, show_on_stops: true, visible_stop_list: null },
			{ id: 2, show_on_stops: true, visible_stop_list: ['stop1'] }
		];

		const result = getShowSurveyOnAllStops(surveys);
		expect(result).toEqual(surveys[0]);
	});

	it('should return null if no survey meets the criteria', () => {
		const surveys = [
			{ id: 1, show_on_stops: false, visible_stop_list: null },
			{ id: 2, show_on_stops: true, visible_stop_list: ['stop1'] }
		];

		const result = getShowSurveyOnAllStops(surveys);
		expect(result).toBeNull();
	});
});

describe('getMapSurvey', () => {
	it('should return the survey with show_on_map true', () => {
		const surveys = [
			{ id: 1, show_on_map: false },
			{ id: 2, show_on_map: true }
		];

		const result = getMapSurvey(surveys);
		expect(result).toEqual(surveys[1]);
	});

	it('should return null if no survey has show_on_map true', () => {
		const surveys = [
			{ id: 1, show_on_map: false },
			{ id: 2, show_on_map: false }
		];

		const result = getMapSurvey(surveys);
		expect(result).toBeNull();
	});
});

describe('submitHeroQuestion', () => {
	beforeEach(() => {
		global.fetch = vi.fn();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	it('should resolve with data when response is ok', async () => {
		const mockResponseData = { survey_response: { id: '1' } };
		global.fetch.mockResolvedValue({
			ok: true,
			json: async () => mockResponseData
		});

		const surveyResponse = {
			id: 1,
			user_identifier: 'user123',
			stop_identifier: 'stop456',
			responses:
				"[{ question_id: 1, question_label: 'Question', question_type: 'radio', answer: 'yes' }]"
		};
		const result = await submitHeroQuestion(surveyResponse);

		expect(result).toEqual(mockResponseData.survey_response.id);
		expect(global.fetch).toHaveBeenCalled();
	});

	it('should throw an error when response is not ok', async () => {
		global.fetch.mockResolvedValue({
			ok: false
		});

		await expect(submitHeroQuestion({})).rejects.toThrow(expect.any(Error));
	});
});

describe('updateSurveyResponse', () => {
	beforeEach(() => {
		global.fetch = vi.fn();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	it('should resolve with true when response is ok', async () => {
		global.fetch.mockResolvedValue({
			ok: true
		});

		const surveyPublicIdentifier = 'abc123';
		const surveyResponse = {
			id: 1,
			user_identifier: 'user123',
			stop_identifier: 'stop456',
			responses: [{ question_id: 1, answer: 'updated answer' }]
		};

		const result = await updateSurveyResponse(surveyPublicIdentifier, surveyResponse);

		expect(result).toEqual(true);
	});

	it('should throw an error when response is not ok', async () => {
		global.fetch.mockResolvedValue({
			ok: false
		});

		const surveyPublicIdentifier = 'abc123';
		const surveyResponse = {
			id: 1,
			user_identifier: 'user123',
			stop_identifier: 'stop456',
			responses: [{ question_id: 1, answer: 'updated answer' }]
		};

		await expect(updateSurveyResponse(surveyPublicIdentifier, surveyResponse)).rejects.toThrow(
			'Failed to update survey response'
		);
	});
});
