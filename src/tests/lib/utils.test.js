import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { debounce } from '$lib/utils';

describe('debounce', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should call the function only once after the wait time', async () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		debouncedFn();
		expect(mockFn).not.toBeCalled();

		vi.advanceTimersByTime(50);
		expect(mockFn).not.toBeCalled();

		vi.advanceTimersByTime(50);
		expect(mockFn).toBeCalledTimes(1);
	});

	it('should reset the timer when called again before wait time', () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		debouncedFn();
		vi.advanceTimersByTime(50);
		debouncedFn();
		vi.advanceTimersByTime(50);
		expect(mockFn).not.toBeCalled();

		vi.advanceTimersByTime(50);
		expect(mockFn).toBeCalledTimes(1);
	});

	it('should pass arguments to the debounced function', () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		debouncedFn('test', 123);
		vi.advanceTimersByTime(100);

		expect(mockFn).toBeCalledWith('test', 123);
	});

	it('should pass the latest arguments when called multiple times', () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		debouncedFn('first', 1);
		vi.advanceTimersByTime(50);

		debouncedFn('second', 2);
		vi.advanceTimersByTime(100);

		expect(mockFn).toBeCalledTimes(1);
		expect(mockFn).toBeCalledWith('second', 2);
	});

	it('should maintain correct context (this binding)', () => {
		const context = {
			value: 'test',
			method: vi.fn(function () {
				return this.value;
			})
		};

		const debouncedMethod = debounce(context.method, 100);
		context.debouncedMethod = debouncedMethod;

		context.debouncedMethod();
		vi.advanceTimersByTime(100);

		expect(context.method).toBeCalledTimes(1);
		expect(context.method.mock.results[0].value).toBe('test');
	});

	it('should handle zero wait time', () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 0);

		debouncedFn();
		vi.advanceTimersByTime(0);

		expect(mockFn).toBeCalledTimes(1);
	});

	it('should handle multiple rapid calls', () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		debouncedFn();
		debouncedFn();
		debouncedFn();
		debouncedFn();
		debouncedFn();

		vi.advanceTimersByTime(100);

		expect(mockFn).toBeCalledTimes(1);
	});
});
