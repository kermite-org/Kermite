export type PromiseResultType<T> = T extends (
  ...args: any[]
) => Promise<infer R>
  ? R
  : never;
