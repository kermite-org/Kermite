import { createDictionaryFromKeyValues } from '../app-utils';
import {
  IAssignEntry,
  IAssignsDictionary,
  IPersistAssignEntry,
  IPersistKeyboardLayout,
  IPersistProfileData,
  IPersistProfileFileData,
  IProfileData,
  profileFormatRevisionLatest,
} from '../domain-base';

export namespace ProfileDataConverter {
  export function convertAssignsArrayToDictionary(
    assigns: IPersistAssignEntry[],
  ): IAssignsDictionary {
    return createDictionaryFromKeyValues(
      assigns.map((assign) => {
        const { layerId, keyId, usage } = assign;
        const address = `${layerId}.${keyId}`;
        return [address, usage];
      }),
    );
  }

  export function convertAssignsDictionaryToArray(
    assigns: IAssignsDictionary,
  ): IPersistAssignEntry[] {
    return Object.keys(assigns).map((address) => {
      const [layerId, keyId] = address.split('.');
      const usage = assigns[address] as IAssignEntry;
      return {
        layerId,
        keyId,
        usage,
      };
    });
  }

  export function convertProfileDataToPersist(
    source: IProfileData,
    referredLayoutName: string,
  ): IPersistProfileData {
    return {
      formatRevision: profileFormatRevisionLatest,
      projectId: source.projectId,
      // keyboardDesign: source.keyboardDesign,
      settings: source.settings,
      layers: source.layers,
      assigns: convertAssignsDictionaryToArray(source.assigns),
      mappingEntries: source.mappingEntries,
      referredLayoutName,
    };
  }

  export function convertProfileToPersistFileData(
    source: IProfileData,
    profileName: string,
    referredLayoutName: string,
  ): IPersistProfileFileData {
    const { formatRevision, projectId, ...restProps } =
      convertProfileDataToPersist(source, referredLayoutName);
    return {
      formatRevision,
      projectId,
      profileName,
      ...restProps,
    };
  }

  export function convertProfileDataFromPersist(
    source: IPersistProfileData,
    keyboardLayout: IPersistKeyboardLayout,
  ): IProfileData {
    return {
      projectId: source.projectId,
      // keyboardDesign: source.keyboardDesign,
      keyboardLayout,
      settings: source.settings,
      layers: source.layers,
      assigns: convertAssignsArrayToDictionary(source.assigns),
      mappingEntries: source.mappingEntries,
    };
  }
}
