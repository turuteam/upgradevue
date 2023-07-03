import { Module } from "vuex";
import { RootState } from '@/store/modules/types';

export type AccessibilityState = {
  accessible: boolean;
  noAccessibilityTo: string | null;
}

export const initialAccessibilityState = (): AccessibilityState => ({
  accessible: true,
  noAccessibilityTo: null,
});

const accessibilityModule: Module<AccessibilityState, RootState> = {
  state: initialAccessibilityState,
  mutations: {
    SET_PAGE_ACCESSIBILITY(state, payload: AccessibilityState) {
      state.accessible = payload.accessible;
      state.noAccessibilityTo = payload.noAccessibilityTo;
    },
  },
};

export default accessibilityModule;
