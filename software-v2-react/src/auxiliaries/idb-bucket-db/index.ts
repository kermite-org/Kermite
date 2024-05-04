import { openDB } from "idb";

type IBucket<T> = {
  get(path: string): Promise<T | undefined>;
  set(path: string, value: T): Promise<void>;
  delete(path: string): Promise<void>;
  listKeys(pathPrefix?: string): Promise<string[]>;
  getManyByPrefix(
    pathPrefix: string
  ): Promise<{ subPath: string; value: T | undefined }[]>;
  setManyByPrefix(
    pathPrefix: string,
    items: { subPath: string; value: T }[]
  ): Promise<void>;
  deleteManyByPrefix(pathPrefix: string): Promise<void>;
};

function getObjectKeys<T extends Record<string, any>>(
  obj: T
): Extract<keyof T, string>[] {
  return Object.keys(obj) as Extract<keyof T, string>[];
}

function mapObjectKeys<K extends string, R>(
  keys: K[],
  fn: (key: K) => R
): Record<K, R> {
  return Object.fromEntries(keys.map((key) => [key, fn(key)])) as Record<K, R>;
}

async function mapPromisesSequential<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (const item of items) {
    results.push(await fn(item));
  }
  return results;
}

export async function createBucketDb<
  T extends Record<string, string | object>
>(args: {
  dbName: string;
  version?: number;
  valueTypes: { [key in keyof T]: "string" | "object" };
}): Promise<{ [K in keyof T]: IBucket<T[K]> }> {
  const bucketNames = getObjectKeys(args.valueTypes);
  const idb = await openDB(args.dbName, args.version, {
    upgrade(db) {
      bucketNames.forEach((bucketName) => db.createObjectStore(bucketName));
    },
  });
  function createBucket<K extends keyof T>(
    bucketName: Extract<K, string>
  ): IBucket<T[K]> {
    const isObject = args.valueTypes[bucketName] === "object";
    const bucket: IBucket<T[K]> = {
      async get(path) {
        const data = await idb.get(bucketName, path);
        return isObject ? JSON.parse(data) : data;
      },
      async set(path, value) {
        const data = isObject ? JSON.stringify(value) : value;
        await idb.put(bucketName, data, path);
      },
      async delete(path) {
        await idb.delete(bucketName, path);
      },
      async listKeys(pathPrefix) {
        return (await idb.getAllKeys(
          bucketName,
          pathPrefix && IDBKeyRange.bound(pathPrefix, pathPrefix + "~")
        )) as string[];
      },
      async getManyByPrefix(pathPrefix) {
        const paths = await bucket.listKeys(pathPrefix);
        return await mapPromisesSequential(paths, async (path) => {
          const subPath = path.replace(new RegExp("^" + pathPrefix), "");
          const value = await bucket.get(path);
          return { subPath, value };
        });
      },
      async setManyByPrefix(pathPrefix, items) {
        await mapPromisesSequential(items, async (item) => {
          const path = pathPrefix + item.subPath;
          await bucket.set(path, item.value);
        });
      },
      async deleteManyByPrefix(pathPrefix) {
        const keys = await bucket.listKeys(pathPrefix);
        for (const key of keys) {
          await bucket.delete(key);
        }
      },
    };
    return bucket;
  }
  return mapObjectKeys(bucketNames, createBucket) as {
    [K in keyof T]: IBucket<T[K]>;
  };
}
