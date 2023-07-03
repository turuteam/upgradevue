export function isErrorStatus(status: number): boolean {
  return status < 200 || status >= 300;
}