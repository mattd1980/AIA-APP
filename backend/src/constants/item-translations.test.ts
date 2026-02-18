import { describe, it, expect } from 'vitest';
import { translateToEnglish } from './item-translations';

describe('translateToEnglish', () => {
  it('translates common furniture terms', () => {
    expect(translateToEnglish('Canape en cuir marron')).toBe('sofa leather brown');
  });

  it('translates electronics terms', () => {
    expect(translateToEnglish('Televiseur')).toBe('television');
  });

  it('translates appliance terms', () => {
    expect(translateToEnglish('Refrigerateur')).toBe('refrigerator');
  });

  it('handles accented characters', () => {
    expect(translateToEnglish('Refrigerateur')).toBe('refrigerator');
    expect(translateToEnglish('Televiseur')).toBe('television');
    expect(translateToEnglish('Etagere')).toBe('shelf');
  });

  it('drops French articles and prepositions', () => {
    expect(translateToEnglish('Le grand bureau en bois')).toBe('large desk wood');
  });

  it('preserves unknown words (likely brand names)', () => {
    expect(translateToEnglish('Canape IKEA KIVIK')).toBe('sofa ikea kivik');
  });

  it('handles hyphenated words by splitting them', () => {
    expect(translateToEnglish('Grille-pain')).toBe('toaster bread');
  });

  it('returns empty string for empty input', () => {
    expect(translateToEnglish('')).toBe('');
  });

  it('preserves model numbers and alphanumeric strings', () => {
    expect(translateToEnglish('Ecran Samsung LS27')).toBe('monitor samsung ls27');
  });

  it('translates color descriptors', () => {
    expect(translateToEnglish('Fauteuil noir')).toBe('armchair black');
  });

  it('translates a complex multi-word description', () => {
    expect(translateToEnglish('Table de bureau en bois moderne')).toBe('table desk wood modern');
  });
});
