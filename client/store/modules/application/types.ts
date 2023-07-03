/**
 * State of Application Module
 * @field applicationTime Save application time in Vuex Store, whenever you need a timer, use it
 */

export type ApplicationHistory = {
  page: string;
  prev: ApplicationHistory | null;
}
export type ApplicationState = {
  applicationTime: number;
  history: ApplicationHistory;
}
