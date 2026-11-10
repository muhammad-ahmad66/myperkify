import { create } from 'zustand';

type ReturnDeal = { slug: string; brand: string };

type SignupDraftState = {
  /** Email typed on a deal page, carried into the sign-up form. Kept in memory only. */
  email: string;
  /** Deal the student came from, so the Verified screen can link back. */
  returnDeal: ReturnDeal | null;
  setDraft: (draft: { email?: string; returnDeal?: ReturnDeal | null }) => void;
};

export const useSignupDraftStore = create<SignupDraftState>((set) => ({
  email: '',
  returnDeal: null,
  setDraft: (draft) => set(draft),
}));
