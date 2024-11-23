<script>
	import { t } from 'svelte-i18n';
	export let index;
	export let activeTab;
	export let setActiveTab;
</script>

<button
	class="tab-container__item"
	class:tab-container__item--active={activeTab === index}
	on:click={() => setActiveTab(index)}
>
	{$t('trip-planner.itinerary')}
	{index + 1}
</button>
