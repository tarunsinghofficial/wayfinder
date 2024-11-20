<script>
	import { faBus, faMapMarkerAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	export let stopName;
	export let stopId;
	export let stopDirection;
</script>

<div class="mb-6 rounded-lg bg-white p-6 text-center shadow-lg">
	<h1 class="flex items-center justify-center gap-2 text-3xl font-bold text-green-700">
		<FontAwesomeIcon icon={faBus} /> Stop Details
	</h1>
	<p class="mt-2 flex items-center justify-center gap-2 text-lg text-gray-700">
		<FontAwesomeIcon icon={faMapMarkerAlt} />
		<strong>Stop Name:</strong>
		{stopName} | <strong>Stop ID:</strong>
		{stopId}
	</p>
	<p class="mt-2 flex items-center justify-center gap-2 text-lg text-gray-700">
		<FontAwesomeIcon icon={faArrowRight} />
		<strong>Direction:</strong>
		{stopDirection}
	</p>
	<div class="mt-4 flex justify-center">
		<a
			href={`/stops/${stopId}`}
			class="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-3 py-1 text-white shadow hover:bg-green-600"
		>
			<FontAwesomeIcon icon={faMapMarkerAlt} />
			Click here for real-time info
		</a>
	</div>
</div>
