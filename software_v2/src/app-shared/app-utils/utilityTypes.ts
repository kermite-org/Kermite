export type PromiseResultType<T> = T extends (
  ...args: any[]
) => Promise<infer R>
  ? R
  : never;

export type ExtractKeysWithType<Obj, Type> = {
  [K in keyof Obj]: Obj[K] extends Type ? K : never;
}[keyof Obj];

export type PartialRecord<K extends string | number | symbol, V> = Partial<
  Record<K, V>
>;
