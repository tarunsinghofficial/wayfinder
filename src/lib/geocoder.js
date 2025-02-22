import { error } from '@sveltejs/kit';

export async function googleGeocode({ apiKey, query }) {
	const response = await fetch(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`
	);
	const data = await response.json();

	if (data.status !== 'OK' || data.results.length === 0) {
		return null;
	}

	const result = data.results[0];

	return createGeocodingResult({
		geometry: result.geometry,
		formatted_address: result.formatted_address,
		name: result.formatted_address
	});
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

	if (!data.suggestions) {
		return [];
	}

	const suggestions = [];
	for (const suggestion of data.suggestions) {
		const prediction = suggestion.placePrediction;

		const suggestionObject = createSuggestion(
			prediction.placeId,
			prediction.text.text,
			prediction.text.text
		);

		if (suggestionObject) {
			suggestions.push(suggestionObject);
		}
	}

	return suggestions;
}

export async function bingGeocode({ apiKey, query }) {
	const rawBingResult = await fetch(
		`https://dev.virtualearth.net/REST/v1/Locations?query=${encodeURIComponent(query)}&key=${apiKey}`,
		{
			method: 'GET',
			headers: { Accept: 'application/json' }
		}
	);

	const data = await rawBingResult.json();

	if (data.resourceSets[0].estimatedTotal === 0) {
		return null;
	}

	const resource = data.resourceSets[0].resources[0];

	return createGeocodingResult({
		geometry: {
			location: {
				lat: resource.point.coordinates[0] ?? null,
				lng: resource.point.coordinates[1] ?? null
			}
		},
		formatted_address: resource.address.formattedAddress,
		name: resource.name ?? '',
		placeId: null
	});
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

	if (!resourceSets || resourceSets.length === 0 || resourceSets[0].estimatedTotal === 0) {
		return [];
	}

	const resources = resourceSets[0].resources;
	if (!resources || resources.length === 0) {
		return [];
	}

	const suggestions = [];
	for (const resource of resources) {
		if (resource.value && Array.isArray(resource.value)) {
			for (const item of resource.value) {
				const displayText = item.name
					? `${item.name} - ${item.address.formattedAddress}`
					: item.address.formattedAddress;

				const suggestion = createSuggestion(
					null,
					item.name || item.address.formattedAddress,
					displayText
				);

				if (suggestion) {
					suggestions.push(suggestion);
				}
			}
		} else {
			const suggestion = createSuggestion(
				null,
				resource.name || resource.address.formattedAddress,
				resource.address.formattedAddress
			);

			if (suggestion) {
				suggestions.push(suggestion);
			}
		}
	}

	return suggestions;
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

/**
 *
 * @param {string} placeId     optional - some providers return a placeId
 * @param {string} name    	   required - used for geocoding the selected place
 * @param {string} displayText required - used for displaying the selected place
 * @returns
 */
function createSuggestion(placeId, name, displayText) {
	if (!name || !displayText) return null;

	return {
		...(placeId && { placeId }),
		name,
		displayText
	};
}

/**
 *
 * @param {location{lat,lng}} geometry
 * @param {string} formatted_address
 * @param {string} name
 * @returns
 */
function createGeocodingResult({ geometry, formatted_address, name }) {
	return {
		name: name || formatted_address,
		formatted_address: formatted_address,
		geometry: {
			location: {
				lat: geometry.location.lat,
				lng: geometry.location.lng
			}
		}
	};
}
