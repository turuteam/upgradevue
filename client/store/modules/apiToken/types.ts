import { ApiToken } from '~/api/api-tokens/types';

export type ApiTokenState = {
  apiTokens: ApiToken[],
  isFetchingApiTokens: boolean,
  isTokenBeingDeleted: boolean
};