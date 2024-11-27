<script>
	export let current = false;
	export let href;
</script>

<div class="tab-container__item" class:tab-container__item--active={current}>
	<a {href} class="block">
		<slot></slot>
	</a>
</div>
