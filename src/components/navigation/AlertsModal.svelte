<script lang="ts">
	import { Modal, Button } from 'flowbite-svelte';
	import { getLocaleFromNavigator } from 'svelte-i18n';
	import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

	let showModal = true;

	export let alert: GtfsRealtimeBindings.transit_realtime.IAlert;

	const currentLanguage = String(getLocaleFromNavigator()).split('-')[0];

	function getTranslation(translations) {
		return (
			translations.find((t) => t.language === currentLanguage)?.text ||
			translations.find((t) => t.language === 'en')?.text ||
			translations[0].text
		);
	}
	function getHeaderTextTranslation() {
		return getTranslation(alert.headerText.translation);
	}

	function getBodyTextTranslation() {
		return getTranslation(alert.descriptionText.translation);
	}

	function getUrlTranslation() {
		return getTranslation(alert.url.translation);
	}
</script>

<Modal title={getHeaderTextTranslation()} bind:open={showModal} autoclose>
	<p class="text-base leading-relaxed text-gray-500 dark:text-gray-200">
		{getBodyTextTranslation()}
	</p>
	<svelte:fragment slot="footer">
		<div class="flex-1 text-right">
			<Button
				class="bg-gray-300 text-black hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
				on:click={() => (showModal = false)}
			>
				Close
			</Button>
			<Button
				class="bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
				on:click={() => window.open(getUrlTranslation(), '_blank')}
			>
				Learn More
			</Button>
		</div>
	</svelte:fragment>
</Modal>
