import oba, { handleOBAResponse } from '$lib/obaSdk.js';

export async function load({ params }) {
	const stopID = params.stopID;
	const response = await oba.scheduleForStop.retrieve(stopID);
	const scheduleForStop = await handleOBAResponse(response, 'stop').json();

	return {
		stopID: params.stopID,
		scheduleForStop: scheduleForStop.data
	};
}
