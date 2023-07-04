import { defineNuxtPlugin } from 'nuxt/app';

const fuzzySearch = (list: string, string: string) => {
  let listItem = list.toLowerCase();
  let i = 0;
  let n = -1;
  let l = list;
  var s = string.toLowerCase();
  for (; l = s[i++];) {
    if (!~(n = listItem.indexOf(l, n + 1))) return false;
  }
  return true;
};


declare module 'nuxt/app' {
  interface NuxtApp {
    $arFuzzySearch: typeof fuzzySearch;
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $arFuzzySearch: typeof fuzzySearch;
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $arFuzzySearch: typeof fuzzySearch;
  }
}

export default defineNuxtPlugin(() => {
  return {
    provide: {
      fuzzySearch
    }
  }
});
