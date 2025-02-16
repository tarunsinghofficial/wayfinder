/**
 * Converts from OBA orientation to direction.
 *
 * From OBA REST API docs for trip status (open)
 * : "orientation - ...0º is east, 90º is north, 180º is west, and 270º is south."
 *
 * @param orientation 0º is east, 90º is north, 180º is west, and 270º is south
 * @return direction, where 0º is north, 90º is east, 180º is south, and 270º is west
 */

export function toDirection(orientation) {
	let direction = (-orientation + 90) % 360;
	if (direction < 0) {
		direction += 360;
	}

	return direction === 0 ? 0 : direction;
}

/**
 * calculate midpoint of a list of stops so we can show the route on the map
 * @param  list of stops
 * @returns
 */
export function calculateMidpoint(stops) {
	let totalLat = 0;
	let totalLon = 0;

	for (const stop of stops) {
		totalLat += stop.lat;
		totalLon += stop.lon;
	}

	const midpointLat = totalLat / stops.length;
	const midpointLon = totalLon / stops.length;

	return { lat: midpointLat, lng: midpointLon };
}

/**
 * Calculates the distance between two geographical points using the Haversine formula.
 *
 * @param {number} lat1 - Latitude of the first location in degrees.
 * @param {number} lon1 - Longitude of the first location in degrees.
 * @param {number} lat2 - Latitude of the second location in degrees.
 * @param {number} lon2 - Longitude of the second location in degrees.
 * @returns {number} The distance between the two points in kilometers.
 */
export function calcDistanceBetweenTwoPoints(lat1, lon1, lat2, lon2) {
	const earthRadiusKm = 6371; // Earth's radius in kilometers
	const deltaLat = toRadians(lat2 - lat1);
	const deltaLon = toRadians(lon2 - lon1);
	const radLat1 = toRadians(lat1);
	const radLat2 = toRadians(lat2);

	const a =
		Math.sin(deltaLat / 2) ** 2 +
		Math.sin(deltaLon / 2) ** 2 * Math.cos(radLat1) * Math.cos(radLat2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const distanceKm = earthRadiusKm * c;
	return distanceKm;
}

/**
 * Converts degrees to radians.
 *
 * @param {number} degrees - The degrees to convert.
 * @returns {number} The angle in radians.
 */
function toRadians(degrees) {
	return (degrees * Math.PI) / 180;
}
