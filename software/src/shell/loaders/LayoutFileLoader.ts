import { IPersistKeyboardDesign } from '~/shared';
import { AppError } from '~/shared/defs';
import {
  cacheRemoteResouce,
  fetchJson,
  fsxReadJsonFile,
  fsxWriteJsonFile,
} from '~/shell/funcs';
import { LayoutDataMigrator } from '~/shell/loaders/LayoutDataMigrator';
import { checkLayoutFileContentObjectSchema } from '~/shell/loaders/LayoutFileSchemaChecker';

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
    filePath: string,
  ): Promise<IPersistKeyboardDesign> {
    const obj = await fsxReadJsonFile(filePath);
    fixLayoutData(obj, filePath);
    return obj as IPersistKeyboardDesign;
  }

  export async function loadLayoutFromUri(
    uri: string,
  ): Promise<IPersistKeyboardDesign> {
    const obj = await cacheRemoteResouce(fetchJson, uri);
    fixLayoutData(obj, uri);
    return obj as IPersistKeyboardDesign;
  }

  export async function saveLayoutToFile(
    filePath: string,
    design: IPersistKeyboardDesign,
  ): Promise<void> {
    await fsxWriteJsonFile(filePath, design);
  }
}
