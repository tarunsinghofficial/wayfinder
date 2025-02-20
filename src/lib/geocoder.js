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

	return data.suggestions;
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
		formatted_address: data.resourceSets[0].resources[0].address.formattedAddress
	};
}
