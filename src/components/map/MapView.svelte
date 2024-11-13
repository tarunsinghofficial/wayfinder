<script>
	import { browser } from '$app/environment';
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import {
		PUBLIC_OBA_REGION_CENTER_LAT as initialLat,
		PUBLIC_OBA_REGION_CENTER_LNG as initialLng
	} from '$env/static/public';

	import { debounce } from '$lib/utils';
	import LocationButton from '$lib/LocationButton/LocationButton.svelte';
	import RouteMap from './RouteMap.svelte';

	import { faBus } from '@fortawesome/free-solid-svg-icons';
	import { RouteType, routePriorities, prioritizedRouteTypeForDisplay } from '$config/routeConfig';

	export let selectedTrip = null;
	export let selectedRoute = null;
	export let showRoute = false;
	export let showRouteMap = false;
	export let stop = null;
	export let mapProvider = null;
<<<<<<< HEAD
=======
	let isTripPlanMoodActive = false;
>>>>>>> b21eed0 (feat: implement trip planner mood toggle in MapView component)

	let selectedStopID = null;
	let mapInstance = null;
	let mapElement;
	let markers = [];
	let allStops = [];
	let stopsCache = new Map();

	const dispatch = createEventDispatcher();

	function cacheKey(zoomLevel, boundingBox) {
		const decimalPlaces = 2; // 2 decimal places equals between 0.5 and 1.1 km depending on where you are in the world.
		const roundedBox = {
			north: boundingBox.north.toFixed(decimalPlaces),
			south: boundingBox.south.toFixed(decimalPlaces),
			east: boundingBox.east.toFixed(decimalPlaces),
			west: boundingBox.west.toFixed(decimalPlaces)
		};

		return `${roundedBox.north}_${roundedBox.south}_${roundedBox.east}_${roundedBox.west}_${zoomLevel}`;
	}

	function getBoundingBox() {
		if (!mapProvider) {
			throw new Error('Map provider is not initialized');
		}
		return mapProvider.getBoundingBox();
	}

	async function loadStopsForLocation(lat, lng, zoomLevel, firstCall = false) {
		if (firstCall) {
			const response = await fetch(`/api/oba/stops-for-location?lat=${lat}&lng=${lng}&radius=2500`);
			if (!response.ok) {
				throw new Error('Failed to fetch locations');
			}
			return await response.json();
		}

		const boundingBox = getBoundingBox();
		const key = cacheKey(zoomLevel, boundingBox);

		if (stopsCache.has(key)) {
			console.debug('Stop cache hit: ', key);
			return stopsCache.get(key);
		} else {
			console.debug('Stop cache miss: ', key);
		}

		const response = await fetch(
			`/api/oba/stops-for-location?lat=${lat}&lng=${lng}&latSpan=${boundingBox.north - boundingBox.south}&lngSpan=${boundingBox.east - boundingBox.west}&radius=1500`
		);

		if (!response.ok) {
			throw new Error('Failed to fetch locations');
		}

		const stopsForLocation = await response.json();
		stopsCache.set(key, stopsForLocation);

		return stopsForLocation;
	}

	async function initMap() {
		try {
			await mapProvider.initMap(mapElement, {
				lat: Number(initialLat),
				lng: Number(initialLng)
			});

			mapInstance = mapProvider;

			await loadStopsAndAddMarkers(initialLat, initialLng, true);

			const debouncedLoadMarkers = debounce(async () => {
				const center = mapInstance.getCenter();
				const zoomLevel = mapInstance.map.getZoom();

				// Prevent fetching stops when a route is selected, we only fetch stops when we are see other stops
				if (selectedRoute || showRoute) {
					return;
				}
				await loadStopsAndAddMarkers(center.lat, center.lng, false, zoomLevel);
			}, 300);

			mapProvider.eventListeners(mapInstance, debouncedLoadMarkers);

			if (browser) {
				window.addEventListener('themeChange', handleThemeChange);
			}
		} catch (error) {
			console.error('Error initializing map:', error);
		}
	}

	async function loadStopsAndAddMarkers(lat, lng, firstCall = false, zoomLevel = 15) {
		const stopsData = await loadStopsForLocation(lat, lng, zoomLevel, firstCall);
		const newStops = stopsData.data.list;
		const routeReference = stopsData.data.references.routes || [];

		const routeLookup = new Map(routeReference.map((route) => [route.id, route]));

		// merge the stops routeIds with the route data
		newStops.forEach((stop) => {
			stop.routes = stop.routeIds.map((routeId) => routeLookup.get(routeId)).filter(Boolean);
		});

		allStops = [...new Map([...allStops, ...newStops].map((stop) => [stop.id, stop])).values()];

		if (selectedRoute && !showRoute) {
			allStops = [];
		} else if (showRoute && selectedRoute) {
			const stopsToShow = allStops.filter((s) => s.routeIds.includes(selectedRoute.id));
			stopsToShow.forEach((s) => addMarker(s));
		} else {
			newStops.forEach((s) => addMarker(s));
		}
	}

	function clearAllMarkers() {
		markers.forEach((markerObj) => {
			mapInstance.removeMarker(markerObj);
		});
		markers = [];
	}

	$: if (selectedRoute && !showRoute) {
		clearAllMarkers();
		allStops = [];
	}

	$: if (stop && mapInstance) {
		// TODO: make sure that these markers are deduped. i.e. we shouldn't
		// show the same stop twice on the map
		if (stop.id !== selectedStopID) {
			addMarker(stop);
		}
	}

	$: if (selectedRoute && showRoute) {
		clearAllMarkers();
		const stopsToShow = allStops.filter((s) => s.routeIds.includes(selectedRoute.id));
		stopsToShow.forEach((s) => addMarker(s));
	}

	// If no route is selected and not showing a route, add all markers
	// This ensures markers are re-added after a route is deselected
	$: if (!selectedRoute && !showRoute) {
		allStops.forEach((s) => addMarker(s));
	}

	// TODO: prevent fetch stops-for-location if the trip planner mood is on - we should do this after merge.
	$: {
		if (isTripPlanMoodActive) {
			clearAllMarkers();
		} else {
			if (!selectedRoute || !showRoute) {
				allStops.forEach((s) => addMarker(s));
			}
		}
	}

	function addMarker(s, routeReference) {
		if (!mapInstance) {
			console.error('Map not initialized yet');
			return;
		}

		// // check if the marker already exists
		const existingMarker = markers.find((marker) => marker.stop.id === s.id);

		// if it does, don't add it again
		if (existingMarker) {
			return;
		}

		let icon = faBus;

		if (s.routes && s.routes.length > 0) {
			const routeTypes = new Set(s.routes.map((r) => r.type));
			let prioritizedType = routePriorities.find((type) => routeTypes.has(type));
			if (prioritizedType === undefined) {
				prioritizedType = RouteType.UNKNOWN;
			}
			icon = prioritizedRouteTypeForDisplay(prioritizedType);
		}

		const markerObj = mapInstance.addMarker({
			position: { lat: s.lat, lng: s.lon },
			icon: icon,
			stop: s,
			onClick: () => {
				selectedStopID = s.id;
				dispatch('stopSelected', { stop: s });
			}
		});

		markerObj.stop = s;
		markers.push(markerObj);
	}

	function handleThemeChange(event) {
		const { darkMode } = event.detail;
		mapInstance.setTheme(darkMode ? 'dark' : 'light');
	}

	function handleLocationObtained(event) {
		const { latitude, longitude } = event.detail;
		mapInstance.setCenter({ lat: latitude, lng: longitude });
		mapInstance.addUserLocationMarker({ lat: latitude, lng: longitude });
	}

	onMount(async () => {
		await initMap();
		if (browser) {
			const darkMode = document.documentElement.classList.contains('dark');
			window.addEventListener('planTripTabClicked', () => {
				isTripPlanMoodActive = true;
			});
			window.addEventListener('tabSwitched', () => {
				isTripPlanMoodActive = false;
			});
			const event = new CustomEvent('themeChange', { detail: { darkMode } });
			window.dispatchEvent(event);
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('themeChange', handleThemeChange);
		}
		markers.forEach(({ markerObj, element }) => {
			mapProvider.removeMarker(markerObj);
			if (element && element.parentNode) {
				element.parentNode.removeChild(element);
			}
		});
	});
</script>

<div class="map-container">
	<div id="map" bind:this={mapElement}></div>

	{#if selectedTrip && showRouteMap}
		<RouteMap mapProvider={mapInstance} tripId={selectedTrip.tripId} />
	{/if}
</div>

<div class="controls">
	<LocationButton on:locationObtained={handleLocationObtained} />
</div>

<style>
	.map-container {
		position: relative;
		height: 100%;
		width: 100%;
		z-index: 1;
	}
	#map {
		height: 100%;
		width: 100%;
	}
</style>
