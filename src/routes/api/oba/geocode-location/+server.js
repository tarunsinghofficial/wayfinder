import { bingGeocode, googleGeocode } from '$lib/geocoder';

import { PRIVATE_OBA_GEOCODER_PROVIDER as geocoderProvider } from '$env/static/private';

import { env } from '$env/dynamic/private';

let geocoderApiKey = env.PRIVATE_OBA_GEOCODER_API_KEY;

async function locationSearch(query) {
	if (geocoderProvider === 'google') {
		return googleGeocode({ apiKey: geocoderApiKey, query });
	} else {
		return bingGeocode({ apiKey: geocoderApiKey, query });
	}
}

export async function GET({ url }) {
	const searchInput = url.searchParams.get('query')?.trim();

	const locationResponse = await locationSearch(searchInput);

	return new Response(
		JSON.stringify({
			location: locationResponse
		}),
		{
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
}
