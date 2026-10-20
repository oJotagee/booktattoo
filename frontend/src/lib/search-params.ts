export type SearchParamValue = string | string[] | null | undefined;

export function firstParam(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

export function parsePageParam(value: SearchParamValue) {
  return Math.max(Number(firstParam(value)) || 1, 1);
}
