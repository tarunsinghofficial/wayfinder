<script>
	import { t } from 'svelte-i18n';
	let { index, activeTab, setActiveTab } = $props();
</script>

<button
	class="tab-container__item"
	class:tab-container__item--active={activeTab === index}
	onclick={() => setActiveTab(index)}
>
	{$t('trip-planner.itinerary')}
	{index + 1}
</button>
