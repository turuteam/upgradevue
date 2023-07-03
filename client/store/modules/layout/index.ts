import { Module } from "vuex";
import { RootState } from '@/store/modules/types';

export type LayoutState = {
  displaySegmentDrawer: boolean,
  imageIndex: number,
  hideCreateSegmentButton: false,
  hideFilterApplyButton: false,
}

export const initialLayoutState = (): LayoutState => ({
  displaySegmentDrawer: false,
  imageIndex: -1,
  hideCreateSegmentButton: false,
  hideFilterApplyButton: false,
});
  
const layoutModule: Module<LayoutState, RootState> = {
  namespaced: true,
  state: initialLayoutState,
  actions: {},
  mutations: {
    TOGGLE_SEGMENT_DRAWER(state: LayoutState, {toggle, hideCreateSegmentButton = false, hideFilterApplyButton =false}) {
      state.hideCreateSegmentButton = hideCreateSegmentButton
      state.hideFilterApplyButton = hideFilterApplyButton
      if (typeof toggle !== 'boolean') {
        state.displaySegmentDrawer = !state.displaySegmentDrawer;
      } else {
        state.displaySegmentDrawer = toggle;
      }
    },
    
    SWITCH_SPLIT_BACKGROUND_IMAGE(state: LayoutState, imageIndex: number) {
      state.imageIndex = imageIndex;
    },
  },
};

export default layoutModule;
