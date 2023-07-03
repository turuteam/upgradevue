import { clone } from '@/utils/helpers';

export const mergeDynamicTags = (...tagsSet: string[][]): string[] => {
  let dynamicTags: string[] = [];
  tagsSet.forEach(tags => {
    dynamicTags = dynamicTags.concat(clone(tags));
  });
  return dynamicTags.filter((tag, tagIdx) => {
    return dynamicTags.indexOf(tag) === tagIdx; // This will prevent duplicated tags
  });
};
