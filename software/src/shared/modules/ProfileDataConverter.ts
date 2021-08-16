import {
  createDictionaryFromKeyValues,
  IAssignEntry,
  IPersistAssignEntry,
  IAssignsDictionary,
  IPersistProfileData,
  IProfileData,
  profileFormatRevisionLatest,
} from '~/shared';

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
  ): IPersistProfileData {
    return {
      formatRevision: profileFormatRevisionLatest,
      projectId: source.projectId,
      keyboardDesign: source.keyboardDesign,
      settings: source.settings,
      layers: source.layers,
      assigns: convertAssignsDictionaryToArray(source.assigns),
      mappingEntries: source.mappingEntries,
    };
  }

  export function convertProfileDataFromPersist(
    source: IPersistProfileData,
  ): IProfileData {
    return {
      projectId: source.projectId,
      keyboardDesign: source.keyboardDesign,
      settings: source.settings,
      layers: source.layers,
      assigns: convertAssignsArrayToDictionary(source.assigns),
      mappingEntries: source.mappingEntries,
    };
  }
}
