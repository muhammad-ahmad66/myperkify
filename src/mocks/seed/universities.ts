import { NOT_LISTED_UNIVERSITY_ID } from '@/features/verification/schemas';
import type { University } from '@/features/verification/types';

/** [SAMPLE] The real list and domains are managed by admins (F-802). */
export const UNIVERSITIES: University[] = [
  { id: 'fast-nuces', name: 'FAST-NUCES', city: 'Lahore', emailDomains: ['nu.edu.pk'] },
  { id: 'lums', name: 'LUMS', city: 'Lahore', emailDomains: ['lums.edu.pk'] },
  { id: 'nust', name: 'NUST', city: 'Islamabad', emailDomains: ['nust.edu.pk'] },
  { id: 'iba', name: 'IBA', city: 'Karachi', emailDomains: ['iba.edu.pk'] },
  { id: 'uet', name: 'UET', city: 'Lahore', emailDomains: ['uet.edu.pk'] },
  { id: 'pu', name: 'University of the Punjab', city: 'Lahore', emailDomains: ['pu.edu.pk'] },
  { id: 'gcu', name: 'GCU', city: 'Lahore', emailDomains: ['gcu.edu.pk'] },
  { id: 'comsats', name: 'COMSATS', city: 'Islamabad', emailDomains: ['comsats.edu.pk'] },
  { id: 'ucp', name: 'UCP', city: 'Lahore', emailDomains: ['ucp.edu.pk'] },
  { id: 'umt', name: 'UMT', city: 'Lahore', emailDomains: ['umt.edu.pk'] },
  { id: 'giki', name: 'GIKI', city: 'Topi', emailDomains: ['giki.edu.pk'] },
  { id: 'qau', name: 'Quaid-i-Azam University', city: 'Islamabad', emailDomains: ['qau.edu.pk'] },
  { id: 'uok', name: 'University of Karachi', city: 'Karachi', emailDomains: ['uok.edu.pk'] },
  { id: 'aku', name: 'Aga Khan University', city: 'Karachi', emailDomains: ['aku.edu'] },
  { id: NOT_LISTED_UNIVERSITY_ID, name: "My university isn't listed", city: '', emailDomains: [] },
];
