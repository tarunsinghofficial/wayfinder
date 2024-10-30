import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { PRIVATE_OBACO_API_BASE_URL } from '$env/static/private';

export async function GET() {
	try {
		const response = await fetch(`${PRIVATE_OBACO_API_BASE_URL}/alerts.pb`);

		const buffer = await response.arrayBuffer();

		const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));

		let validAlert = null;
		for (const entity of feed.entity) {
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
			return new Response(JSON.stringify({ message: 'No high severity alerts available' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to fetch or parse alerts' }), {
			headers: { 'Content-Type': 'application/json' },
			status: 500
		});
	}
}

function isValidAlert(alert) {
	return isAgencyWideAlert(alert) && isStartDateWithin24Hours(alert) && isHighSeverity(alert);
}

function isHighSeverity(alert) {
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
