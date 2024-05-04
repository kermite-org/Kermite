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

async function createBucketDb<T extends Record<string, string | object>>(args: {
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

async function start() {
  const db = await createBucketDb<{
    project: { name: string };
    asset: string;
  }>({
    dbName: "myTestDatabase",
    version: 1,
    valueTypes: {
      project: "object",
      asset: "string",
    },
  });

  await db.project.set("proj1", { name: "hoge1" });
  await db.project.set("proj2", { name: "piyo1" });

  await db.asset.set("proj1/foo", "file_content_aaa");
  await db.asset.set("proj1/bar", "file_content_bbb");
  await db.asset.set("proj2/buzz", "file_content_ccc");

  const foo = await db.project.get("proj1");
  console.log({ foo });

  const bar = await db.asset.get("proj1/foo");
  console.log({ bar });

  const keys1 = await db.project.listKeys();
  console.log({ keys1 });

  const keys3 = await db.asset.listKeys("proj1/");
  console.log({ keys3 });

  await db.asset.setManyByPrefix("proj3/", [
    { subPath: "aaa", value: "file_content_aaa" },
    { subPath: "bbb", value: "file_content_bbb" },
  ]);
  const read4 = await db.asset.getManyByPrefix("proj3/");
  console.log({ read4 });

  await db.asset.deleteManyByPrefix("proj3/");

  const read5 = await db.asset.getManyByPrefix("proj3/");
  console.log({ read5 });
}

window.addEventListener("load", start);
