import { Module } from "vuex";
import { RootState } from '@/store/modules/types';
import { clone, mergeObjects } from '@/utils/helpers/'
import { TagState, EditTag } from './types';
import { tagActions } from './actions';

export const initialTagState = (): TagState => ({
  tags: [],
  tagsCount: 0,
  isFetchingTags: false,
  isNoMoreTags: false,
  hasFetchTagsFailed: false,
  isPatchingTag: false,
  isDeletingTag: false,
});


const tagModule: Module<TagState, RootState> = {
  namespaced: true,
  state: initialTagState,
  actions: tagActions,
  getters: {
    bubbleUpFavoriteTags() {
      return (tags: Tag[]) => clone(tags).sort(
        (a: Tag, b: Tag) => {
          if (a.favourite && !b.favourite) return -1;
          else if (!a.favourite && b.favourite) return 1;
          else return 0;
        },
      );
    },
    tagsList(state) {
      return state.tags
    }
  },
  mutations: {
    // Tag Pagination
    RESET_TAGS(state) {
      state.tags = [];
      state.tagsCount = 0;
      state.isNoMoreTags = false;
      state.hasFetchTagsFailed = false;
    },
    SET_TAGS(state, tags: Tag[]) {
      state.tags = clone(tags);
    },
    CONCAT_TAGS(state, tags: Tag[]) {
      state.tags = clone(state.tags.concat(tags));
    },
    SET_TAGS_COUNT(state, tagsCount: number) {
      state.tagsCount = tagsCount;
    },
    SET_IS_FETCHING_TAGS(state, isFetching: boolean) {
      state.isFetchingTags = isFetching;
    },
    SET_IS_NO_MORE_TAGS(state, isNoMoreTags: boolean) {
      state.isNoMoreTags = isNoMoreTags;
    },
    SET_HAS_FETCH_TAGS_FAILED(state, hasFailed: boolean) {
      state.hasFetchTagsFailed = hasFailed;
    },
    // Patch Tag
    SET_IS_PATCHING_TAG(state, isPatching: boolean) {
      state.isPatchingTag = isPatching;
    },
    PATCH_TAG_IN_TAGS(state, { oid, editTag }: { oid: number, editTag: EditTag }) {
      let newTags: Tag[] = clone(state.tags);
      newTags = newTags.map(tag => {
        if (oid === tag.oid) { return mergeObjects(tag, editTag); }
        else { return tag; }
      });
      state.tags = newTags;
    },
    // Delete Tag
    SET_IS_DELETING_TAG(state, isDeleting: boolean) {
      state.isDeletingTag = isDeleting;
    },
    REMOVE_TAG_FROM_TAGS(state, oid: number) {
      const newTags: Tag[] = clone(state.tags);
      state.tags = newTags.filter(tag => tag.oid !== oid);
    },
  },
};

export default tagModule;
