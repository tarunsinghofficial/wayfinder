import { describe, it, expect } from 'vitest';
import { toDirection, calculateMidpoint } from '$lib/mathUtils';

describe('toDirection', () => {
    it('converts east orientation (0°) to 90° direction', () => {
        expect(toDirection(0)).toBe(90);
    });

    it('converts north orientation (90°) to 0° direction', () => {
        expect(toDirection(90)).toBe(0);
    });

    it('converts west orientation (180°) to 270° direction', () => {
        expect(toDirection(180)).toBe(270);
    });

    it('converts south orientation (270°) to 180° direction', () => {
        expect(toDirection(270)).toBe(180);
    });

    it('handles negative orientations', () => {
        expect(toDirection(-90)).toBe(180);  // -90° orientation should be 180° direction
        expect(toDirection(-180)).toBe(270); // -180° orientation should be 270° direction
        expect(toDirection(-270)).toBe(0);   // -270° orientation should be 0° direction
    });

    it('handles orientations > 360°', () => {
        expect(toDirection(450)).toBe(0);    // 450° orientation (90° + 360°) should be 0° direction
        expect(toDirection(720)).toBe(90);   // 720° orientation (0° + 2*360°) should be 90° direction
    });

    it('converts arbitrary angles correctly', () => {
        expect(toDirection(45)).toBe(45);    // 45° orientation to 45° direction
        expect(toDirection(135)).toBe(315);  // 135° orientation to 315° direction
        expect(toDirection(225)).toBe(225);  // 225° orientation to 225° direction
        expect(toDirection(315)).toBe(135);  // 315° orientation to 135° direction
    });
});

describe('calculateMidpoint', () => {
    it('calculates midpoint for two stops', () => {
        const stops = [
            { lat: 47.6062, lon: -122.3321 },
            { lat: 47.6092, lon: -122.3331 }
        ];
        
        const result = calculateMidpoint(stops);
        
        expect(result.lat).toBeCloseTo(47.6077);
        expect(result.lng).toBeCloseTo(-122.3326);
    });

    it('calculates midpoint for multiple stops', () => {
        const stops = [
            { lat: 47.6062, lon: -122.3321 },
            { lat: 47.6092, lon: -122.3331 },
            { lat: 47.6082, lon: -122.3341 }
        ];
        
        const result = calculateMidpoint(stops);
        
        expect(result.lat).toBeCloseTo(47.6079);
        expect(result.lng).toBeCloseTo(-122.3331);
    });

    it('returns same point for single stop', () => {
        const stops = [
            { lat: 47.6062, lon: -122.3321 }
        ];
        
        const result = calculateMidpoint(stops);
        
        expect(result.lat).toBe(47.6062);
        expect(result.lng).toBe(-122.3321);
    });

    it('handles positive and negative coordinates', () => {
        const stops = [
            { lat: -33.8688, lon: 151.2093 },  // Sydney
            { lat: 40.7128, lon: -74.0060 }    // New York
        ];
        
        const result = calculateMidpoint(stops);
        
        expect(result.lat).toBeCloseTo(3.422);
        expect(result.lng).toBeCloseTo(38.6017);
    });

    it('handles coordinates around the same area', () => {
        const stops = [
            { lat: 47.6062, lon: -122.3321 },
            { lat: 47.6065, lon: -122.3324 },
            { lat: 47.6068, lon: -122.3327 }
        ];
        
        const result = calculateMidpoint(stops);
        
        expect(result.lat).toBeCloseTo(47.6065);
        expect(result.lng).toBeCloseTo(-122.3324);
    });
});