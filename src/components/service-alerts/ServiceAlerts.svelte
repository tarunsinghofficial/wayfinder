<script>
	import { modalOpen } from '$src/stores/modalOpen';
	import {
		faChevronLeft,
		faChevronRight as faChevronRightPagination
	} from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { Modal } from 'flowbite-svelte';
	import ServiceAlertItem from './ServiceAlertItem.svelte';

	let { serviceAlerts = $bindable([]) } = $props();

	let modalAlert = $state(null);
	let isAlertsHidden = $state(false);
	let currentPage = $state(1);
	const alertsPerPage = 3;

	let totalPages = $derived(Math.ceil(serviceAlerts.length / alertsPerPage));

	let paginatedAlerts = $derived(
		serviceAlerts.slice((currentPage - 1) * alertsPerPage, currentPage * alertsPerPage)
	);

	function openModal(alert) {
		modalAlert = alert;
		modalOpen.set(true);
	}

	function closeModal() {
		modalAlert = null;
		modalOpen.update(() => false);
	}

	function toggleAlerts() {
		if (isAlertsHidden) {
			isAlertsHidden = false;
			currentPage = 1;
		} else {
			isAlertsHidden = true;
		}
	}

	function goToPage(page) {
		currentPage = Math.max(1, Math.min(page, totalPages));
		isAlertsHidden = false;
	}

	function handleKeydown(event) {
		if (event.key === 'Escape' && modalAlert) {
			closeModal();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if serviceAlerts.length > 0}
	<div class="relative flex flex-col gap-y-1 rounded-lg bg-white p-4 dark:bg-gray-800">
		<div class="mb-2 flex items-center justify-between">
			<h3 class="font-medium text-gray-700 dark:text-white">
				SERVICE ALERTS ({serviceAlerts.length})
			</h3>
			<button
				class="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-500"
				onclick={toggleAlerts}
			>
				{isAlertsHidden ? 'Show' : 'Hide'}
			</button>
		</div>

		{#if !isAlertsHidden}
			<div class="space-y-2">
				{#each paginatedAlerts as alert}
					<ServiceAlertItem {alert} {openModal} />
				{/each}
			</div>

			{#if totalPages > 1}
				<div class="mt-3 flex items-center justify-center gap-4">
					<button
						class="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-200"
						onclick={() => goToPage(currentPage - 1)}
						disabled={currentPage === 1}
					>
						<FontAwesomeIcon icon={faChevronLeft} class="h-4 w-4" />
					</button>
					<span class="text-sm text-gray-700 dark:text-gray-300">
						Page {currentPage} of {totalPages}
					</span>
					<button
						class="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-200"
						onclick={() => goToPage(currentPage + 1)}
						disabled={currentPage === totalPages}
					>
						<FontAwesomeIcon icon={faChevronRightPagination} class="h-4 w-4" />
					</button>
				</div>
			{/if}
		{/if}
	</div>
{/if}

{#if $modalOpen && modalAlert}
	<div class="center">
		<Modal
			title={modalAlert.summary.value}
			open={$modalOpen && modalAlert}
			on:close={closeModal}
			size="xl"
			class="min-h-[400px] w-full max-w-3xl rounded-xl bg-white p-8 text-gray-900 shadow-2xl dark:bg-gray-800 dark:text-gray-100"
		>
			<p class="mt-6 text-base leading-relaxed text-gray-800 dark:text-gray-200">
				{modalAlert.description.value}
			</p>
		</Modal>
	</div>
{/if}
