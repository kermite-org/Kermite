import { IPersistKeyboardDesign } from '~/shared';
import { AppError } from '~/shared/defs';
import {
  cacheRemoteResource,
  fetchJson,
  fsxReadJsonFile,
  fsxWriteJsonFile,
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

  export function loadLayoutFromFile(filePath: string): IPersistKeyboardDesign {
    const obj = fsxReadJsonFile(filePath);
    fixLayoutData(obj, filePath);
    return obj as IPersistKeyboardDesign;
  }

  export async function loadLayoutFromUri(
    uri: string,
  ): Promise<IPersistKeyboardDesign> {
    const obj = await cacheRemoteResource(fetchJson, uri);
    fixLayoutData(obj, uri);
    return obj as IPersistKeyboardDesign;
  }

  export function saveLayoutToFile(
    filePath: string,
    design: IPersistKeyboardDesign,
  ): void {
    fsxWriteJsonFile(filePath, design);
  }
}
