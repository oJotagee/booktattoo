import { describe, expect, it } from 'bun:test';

import {
  formatGaleryStyle,
  GALERY_STYLES,
  galeryStyleBadgeClass,
  isGaleryStyle,
} from '@/utils/formatGalery';

describe('isGaleryStyle', () => {
  it.each([...GALERY_STYLES])('accepts %s', (style) => {
    expect(isGaleryStyle(style)).toBe(true);
  });

  it('rejects unknown styles', () => {
    expect(isGaleryStyle('AQUARELA')).toBe(false);
  });

  it('is case sensitive', () => {
    expect(isGaleryStyle('blackwork')).toBe(false);
  });

  it('rejects non string values', () => {
    expect(isGaleryStyle(undefined)).toBe(false);
    expect(isGaleryStyle(null)).toBe(false);
    expect(isGaleryStyle(1)).toBe(false);
  });
});

describe('formatGaleryStyle', () => {
  it('returns the portuguese label', () => {
    expect(formatGaleryStyle('JAPONES')).toBe('Japonês');
    expect(formatGaleryStyle('NEOTRADICIONAL')).toBe('Neotradicional');
  });

  it.each([...GALERY_STYLES])('has a label for %s', (style) => {
    expect(formatGaleryStyle(style)).toBeTruthy();
  });
});

describe('galeryStyleBadgeClass', () => {
  it.each([...GALERY_STYLES])('has background and text classes for %s', (style) => {
    expect(galeryStyleBadgeClass(style)).toMatch(/bg-\S+.*text-\S+/);
  });
});
