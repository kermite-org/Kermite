import { createBucketDb } from ".";

export async function executeIdbBucketExample() {
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
