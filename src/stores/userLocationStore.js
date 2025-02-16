import { writable } from 'svelte/store';

export const userLocation = writable({ lat: null, lng: null });
