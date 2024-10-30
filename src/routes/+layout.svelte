<script>
	import Header from '$components/navigation/Header.svelte';
	import '../app.css';
	import { config } from '@fortawesome/fontawesome-svg-core';
	import '@fortawesome/fontawesome-svg-core/styles.css';
	import '$lib/i18n';
	config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
</script>

<div class="flex h-dvh w-full flex-col">
	<Header />
	<div class="relative flex-1 overflow-hidden">
		<slot></slot>
	</div>
</div>
