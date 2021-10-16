export type PromiseResultType<T> = T extends (
  ...args: any[]
) => Promise<infer R>
  ? R
  : never;

export type ExtractKeysWithType<Obj, Type> = {
  [K in keyof Obj]: Obj[K] extends Type ? K : never;
}[keyof Obj];
