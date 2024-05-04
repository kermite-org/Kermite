import { createBucketDb } from "../auxiliaries/idb-bucket-db";

export const bucketDb = await createBucketDb<{
  project: { keyboardName: string };
  projectAsset: object;
}>({
  dbName: "krm2_bucket_db",
  version: 1,
  valueTypes: {
    project: "object",
    projectAsset: "object",
  },
});
