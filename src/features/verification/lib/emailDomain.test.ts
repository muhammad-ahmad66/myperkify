import { describe, expect, it } from 'vitest';
import { classifyEmail, findUniversityByEmail } from './emailDomain';

describe('classifyEmail', () => {
  it.each([
    ['ayesha.k@lums.edu.pk', 'university'],
    ['someone@aku.edu', 'university'],
    ['  ZARA@IBA.EDU.PK ', 'university'],
    ['hassan99@gmail.com', 'personal'],
    ['me@company.pk', 'other'],
    ['not-an-email', 'none'],
    ['name@domain', 'none'],
  ])('%s is %s', (email, kind) => {
    expect(classifyEmail(email)).toBe(kind);
  });
});

describe('findUniversityByEmail', () => {
  const universities = [
    { id: 'nust', name: 'NUST', city: 'Islamabad', emailDomains: ['nust.edu.pk'] },
  ];

  it('matches a subdomain of a known domain', () => {
    expect(findUniversityByEmail('bilal@student.nust.edu.pk', universities)?.id).toBe('nust');
  });

  it('does not match a lookalike domain', () => {
    expect(findUniversityByEmail('bilal@fakenust.edu.pk', universities)).toBeUndefined();
  });
});
