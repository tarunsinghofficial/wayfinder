import oba, { handleOBAResponse } from '$lib/obaSdk';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, params }) {
	const stopId = params.stopId;
	const date = url.searchParams.get('date');

	let queryParams = {};
	if (date) {
		queryParams.date = date;
	}

	const response = await oba.scheduleForStop.retrieve(stopId, queryParams);
	return handleOBAResponse(response, 'stop-for-schedule');
}
