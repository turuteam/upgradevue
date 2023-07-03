/**
 * The fields allowed to be changed in Tag
 * @field name Name of the tag
 */
export type EditTag = {
  name?: string;
};

/**
 * Tag Module State
 * @field tags List of tags
 * @field tagsCount Total count of tags
 * @field isNoMoreTags No more tags found, used for pagination
 * @field isFetchingTags Are you fetching tags?
 * @field isPatchingTag Are you patching tags?
 * @field isDeletingTag Are you deleting tags?
 */
export type TagState = {
  tags: Tag[];
  tagsCount: number;
  isNoMoreTags: boolean;
  hasFetchTagsFailed: boolean;
  isFetchingTags: boolean;
  isPatchingTag: boolean;
  isDeletingTag: boolean;
};
