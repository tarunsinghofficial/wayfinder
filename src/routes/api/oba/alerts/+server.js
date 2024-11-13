import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { PRIVATE_OBACO_API_BASE_URL, PRIVATE_OBACO_SHOW_TEST_ALERTS } from '$env/static/private';
import { buildURL } from '$lib/urls.js';

export async function GET() {
	try {
		const alertsURL = buildURL(
			PRIVATE_OBACO_API_BASE_URL,
			'alerts.pb',
			PRIVATE_OBACO_SHOW_TEST_ALERTS && PRIVATE_OBACO_SHOW_TEST_ALERTS == 'true' ? { test: 1 } : {}
		);

		const response = await fetch(alertsURL);

		const buffer = await response.arrayBuffer();

		const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));

		let validAlert = null;
		for (const entity of feed.entity) {
			// If we're in test mode, show the alert to test the UI
			if (PRIVATE_OBACO_SHOW_TEST_ALERTS) {
				validAlert = entity.alert;
				break;
			}
			if (entity.alert && isValidAlert(entity.alert)) {
				validAlert = entity.alert;
				break;
			}
		}

		if (validAlert) {
			return new Response(JSON.stringify(validAlert), {
				headers: { 'Content-Type': 'application/json' }
			});
		} else {
			return new Response(null, {
				status: 204,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	} catch (error) {
		return new Response(
			JSON.stringify({ error: 'Failed to fetch or parse alerts', message: error }),
			{
				headers: { 'Content-Type': 'application/json' },
				status: 500
			}
		);
	}
}

function isValidAlert(alert) {
	return isAgencyWideAlert(alert) && isStartDateWithin24Hours(alert) && isHighSeverity(alert);
}

function isHighSeverity(alert) {
	if (!alert) {
		return false;
	}

	const isHighSeverity =
		(alert &&
			getSeverityLevel(alert) ===
				GtfsRealtimeBindings.transit_realtime.Alert.SeverityLevel.SEVERE) ||
		getSeverityLevel(alert) === GtfsRealtimeBindings.transit_realtime.Alert.SeverityLevel.WARNING;

	return isHighSeverity;
}

function getSeverityLevel(alert) {
	return alert.severityLevel;
}

function isStartDateWithin24Hours(alert) {
	const startDate = alert.activePeriod[0].start;
	const now = Date.now() / 1000;
	return startDate <= now && startDate >= now - 24 * 60 * 60;
}

function isAgencyWideAlert(alert) {
	return alert.informedEntity && alert.informedEntity.length > 0;
}
