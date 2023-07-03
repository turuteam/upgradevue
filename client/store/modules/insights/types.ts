export type InsightState = {
  currentInsights: Insights | null;
  isPollingCurrentInsights: boolean;
  hasFetchInsightsFailed: boolean;
  fetchInsightsPolling: NodeJS.Timeout | null;
}
