import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('$env/static/public', () => ({
	PUBLIC_ANALYTICS_DOMAIN: 'api.example.com',
	PUBLIC_ANALYTICS_ENABLED: 'true',
	PUBLIC_ANALYTICS_API_HOST: 'https://api.example.com'
}));

import analytics from '$lib/Analytics/PlausibleAnalytics.js';

describe('PlausibleAnalytics', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('sends an event via fetch and returns JSON result (reportPageView)', async () => {
		const mockResponse = { status: 'ok' };
		analytics.enabled = true;
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => JSON.stringify(mockResponse),
			json: async () => mockResponse
		});

		const result = await analytics.reportPageView('/test');
		expect(result).toEqual(mockResponse);
		expect(global.fetch).toHaveBeenCalledWith(
			'/api/events',
			expect.objectContaining({
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			})
		);
	});

	it('skips sending an event when analytics is disabled', async () => {
		analytics.enabled = false;
		const consoleSpy = vi.spyOn(console, 'debug').mockImplementation();

		const result = await analytics.reportPageView('/test');
		expect(consoleSpy).toHaveBeenCalledWith('Analytics disabled: skipping event');
		expect(result).toBeUndefined();
		consoleSpy.mockRestore();
	});

	it('throws an error if fetch response is not ok (reportPageView)', async () => {
		const errorText = 'failure';
		analytics.enabled = true;
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			statusText: 'Server Error',
			text: async () => errorText
		});

		await expect(analytics.reportPageView('/test')).rejects.toThrow(
			`Error sending event: Server Error. ${errorText}`
		);
	});

	it('sends a search query event (reportSearchQuery)', async () => {
		const query = 'svelte testing';
		const expectedResponse = { status: 'ok' };
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => JSON.stringify(expectedResponse),
			json: async () => expectedResponse
		});

		const result = await analytics.reportSearchQuery(query);
		expect(global.fetch).toHaveBeenCalledWith(
			'/api/events',
			expect.objectContaining({
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: expect.stringContaining(`"query":"${query}"`)
			})
		);
		expect(result).toEqual(expectedResponse);
	});

	it('sends a stop viewed event (reportStopViewed)', async () => {
		const stopId = 123;
		const stopDistance = 'User Distance: 00050-00100m';
		const expectedResponse = { status: 'ok' };
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => JSON.stringify(expectedResponse),
			json: async () => expectedResponse
		});

		const result = await analytics.reportStopViewed(stopId, stopDistance);
		expect(global.fetch).toHaveBeenCalledWith(
			'/api/events',
			expect.objectContaining({
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: expect.stringContaining(`"id":${stopId}`)
			})
		);
		expect(global.fetch).toHaveBeenCalledWith(
			'/api/events',
			expect.objectContaining({
				body: expect.stringContaining(`"distance":"${stopDistance}"`)
			})
		);
		expect(result).toEqual(expectedResponse);
	});

	it('sends a route clicked event (reportRouteClicked)', async () => {
		const routeId = '544';
		const expectedResponse = { status: 'ok' };
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => JSON.stringify(expectedResponse),
			json: async () => expectedResponse
		});

		const result = await analytics.reportRouteClicked(routeId);
		expect(global.fetch).toHaveBeenCalledWith(
			'/api/events',
			expect.objectContaining({
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: expect.stringContaining(`"id":"${routeId}"`)
			})
		);
		expect(result).toEqual(expectedResponse);
	});

	it('sends an arrival clicked event (reportArrivalClicked)', async () => {
		const action = 'arrivalAction';
		const expectedResponse = { status: 'ok' };
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => JSON.stringify(expectedResponse),
			json: async () => expectedResponse
		});

		const result = await analytics.reportArrivalClicked(action);
		expect(global.fetch).toHaveBeenCalledWith(
			'/api/events',
			expect.objectContaining({
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: expect.stringContaining(`"item_id":"${action}"`)
			})
		);
		expect(result).toEqual(expectedResponse);
	});

	it('merges default properties when building props', async () => {
		analytics.defaultProperties = { id: '1_00' };
		const expectedResponse = { status: 'ok' };
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => JSON.stringify(expectedResponse),
			json: async () => expectedResponse
		});

		await analytics.reportPageView('/test');
		expect(global.fetch).toHaveBeenCalledWith(
			'/api/events',
			expect.objectContaining({
				body: expect.stringContaining(`"id":"1_00"`)
			})
		);
	});
});
