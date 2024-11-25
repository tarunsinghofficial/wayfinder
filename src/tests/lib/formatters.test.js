import { describe, it, expect } from 'vitest';
import { convertUnixToTime } from '$lib/formatters';

describe('convertUnixToTime', () => {
	it('returns a blank string when its input is null', () => {
		expect(convertUnixToTime(null)).toBe('');
	});

	it('returns a blank string when its input is an empty string', () => {
		expect(convertUnixToTime('')).toBe('');
	});

	it('converts a Unix timestamp to a locale-specific formatted time', () => {
		expect(convertUnixToTime(1727442050)).toBe('01:00 PM');
	});
});
