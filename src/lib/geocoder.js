import { error } from '@sveltejs/kit';

export async function googleGeocode({ apiKey, query }) {
	const response = await fetch(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`
	);
	const data = await response.json();

	if (data.status === 'OK') {
		return data.results[0];
	} else {
		return null;
	}
}

export async function googlePlacesAutocomplete({ apiKey, input }) {
	const response = await fetch(`https://places.googleapis.com/v1/places:autocomplete`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Goog-Api-Key': apiKey
		},
		body: JSON.stringify({ input })
	});
	const data = await response.json();

	return data.suggestions
		? data.suggestions.map((suggestion) => ({
				placeId: suggestion.placePrediction.placeId,
				text: suggestion.placePrediction.text.text,
				displayText: suggestion.placePrediction.text.text
			}))
		: [];
}

export async function bingGeocode({ apiKey, query }) {
	const rawBingResult = await fetch(
		`https://dev.virtualearth.net/REST/v1/Locations?query=${query}&key=${apiKey}`,
		{
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		}
	);

	const data = await rawBingResult.json();

	if (data.resourceSets[0].estimatedTotal === 0) {
		return null;
	}

	return {
		geometry: {
			location: {
				lat: data.resourceSets[0].resources[0].point.coordinates[0] ?? null,
				lng: data.resourceSets[0].resources[0].point.coordinates[1] ?? null
			}
		},
		formatted_address: data.resourceSets[0].resources[0].address.formattedAddress,
		name: data.resourceSets[0].resources[0].name ?? ""
	};
}

export async function bingAutoSuggestPlaces({ apiKey, query }) {
	const rawBingResult = await fetch(
		`https://dev.virtualearth.net/REST/v1/Autosuggest?query=${encodeURIComponent(query)}&key=${apiKey}`,
		{
			method: 'GET',
			headers: { Accept: 'application/json' }
		}
	);

	const data = await rawBingResult.json();

	const resourceSets = data.resourceSets;
	if (!resourceSets || resourceSets.length === 0 || resourceSets[0].estimatedTotal === 0)
		return null;

	const resources = resourceSets[0].resources;
	if (!resources || resources.length === 0) return null;

	return resources.flatMap((resource) =>
		resource.value && Array.isArray(resource.value)
			? resource.value.map((item) => ({
					displayText: item.name
						? `${item.name} - ${item.address.formattedAddress}`
						: item.address.formattedAddress,
					text: item.address.formattedAddress
				}))
			: [{ text: resource.address.formattedAddress, name: resource.name }]
	);
}

export async function fetchAutocompleteResults(provider, query, apiKey) {
	switch (provider) {
		case 'google':
			return await googlePlacesAutocomplete({ apiKey, input: query });
		case 'bing':
			return await bingAutoSuggestPlaces({ apiKey, query });
		default:
			throw error(500, 'Invalid geocoding provider');
	}
}
