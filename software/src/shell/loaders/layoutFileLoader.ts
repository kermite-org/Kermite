import { IPersistKeyboardDesign } from '~/shared';
import { AppError, IFileReadHandle, IFileWriteHandle } from '~/shared/defs';
import {
  cacheRemoteResource,
  fetchJson,
  fsxReadJsonFromFileHandle,
  fsxWriteJsonToFileHandle,
} from '~/shell/funcs';
import { LayoutDataMigrator } from '~/shell/loaders/layoutDataMigrator';
import { checkLayoutFileContentObjectSchema } from '~/shell/loaders/layoutFileSchemaChecker';

export namespace LayoutFileLoader {
  function fixLayoutData(obj: IPersistKeyboardDesign, filePath: string) {
    LayoutDataMigrator.patchOldFormatLayoutData(obj as IPersistKeyboardDesign);

    const schemaError = checkLayoutFileContentObjectSchema(obj);
    if (schemaError) {
      throw new AppError('InvalidLayoutFileSchema', {
        filePath,
        schemaErrorDetail: schemaError.toString().replace(/\\\\/g, '\\'),
      });
    }
  }

  export async function loadLayoutFromFile(
    fileHandle: IFileReadHandle,
  ): Promise<IPersistKeyboardDesign> {
    const obj = await fsxReadJsonFromFileHandle(fileHandle);
    const fileName = (await fileHandle.getFile()).name;
    fixLayoutData(obj, fileName);
    return obj as IPersistKeyboardDesign;
  }

  export async function loadLayoutFromUri(
    uri: string,
  ): Promise<IPersistKeyboardDesign> {
    const obj = await cacheRemoteResource(fetchJson, uri);
    fixLayoutData(obj, uri);
    return obj as IPersistKeyboardDesign;
  }

  export async function saveLayoutToFile(
    fileHandle: IFileWriteHandle,
    design: IPersistKeyboardDesign,
  ) {
    await fsxWriteJsonToFileHandle(fileHandle, design);
  }
}
