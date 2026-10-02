import {
  daysBetween,
  durationLabel,
  elapsedLabel,
  isIsoDate,
  todayDate,
} from '../../src/utils/date';

describe('isIsoDate', () => {
  it('accepts a zero-padded date', () => {
    expect(isIsoDate('2026-10-02')).toBe(true);
  });

  it('rejects an unpadded date', () => {
    expect(isIsoDate('2026-10-2')).toBe(false);
  });
});

describe('todayDate', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(todayDate('2026-10-02')).toBe('2026-10-02');
  });
});

describe('daysBetween', () => {
  it('counts whole calendar days', () => {
    expect(daysBetween('2026-10-01', '2026-10-03')).toBe(2);
  });

  it('is negative when the second date is earlier', () => {
    expect(daysBetween('2026-10-03', '2026-10-01')).toBe(-2);
  });
});

describe('elapsedLabel', () => {
  it('renders minutes and padded seconds', () => {
    expect(elapsedLabel(93)).toBe('1:33');
  });

  it('renders an em dash for an absent value', () => {
    expect(elapsedLabel(null)).toBe('—');
  });
});

describe('durationLabel', () => {
  it('renders seconds under a minute', () => {
    expect(durationLabel(45)).toBe('45 s');
  });

  it('renders minutes and seconds', () => {
    expect(durationLabel(90)).toBe('1 min 30 s');
  });

  it('omits zero seconds', () => {
    expect(durationLabel(120)).toBe('2 min');
  });

  it('renders whole hours', () => {
    expect(durationLabel(3600)).toBe('1 h');
  });

  it('renders hours and minutes', () => {
    expect(durationLabel(5400)).toBe('1 h 30 min');
  });

  it('renders an em dash for an absent value', () => {
    expect(durationLabel(null)).toBe('—');
  });
});
