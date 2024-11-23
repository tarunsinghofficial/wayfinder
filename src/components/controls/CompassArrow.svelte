<!--

    This Svelte component renders a FontAwesome arrow icon that rotates based on the provided `stopDirection` prop.

    Props:
    - `stopDirection` (string): The direction in which the arrow should point. 
      Possible values are 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'. 
      If the value is not one of these, the arrow will be hidden.
-->

<script>
	import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

	export let stopDirection = '';

	function rotationAngleClass() {
		switch (stopDirection) {
			case 'N':
				return '-rotate-90';
			case 'NE':
				return '-rotate-45';
			case 'E':
				return 'rotate-0';
			case 'SE':
				return 'rotate-45';
			case 'S':
				return 'rotate-90';
			case 'SW':
				return 'rotate-135';
			case 'W':
				return 'rotate-180';
			case 'NW':
				return 'rotate-225';
			default:
				return 'hidden';
		}
	}
</script>

<FontAwesomeIcon icon={faArrowRight} class={rotationAngleClass()} />
