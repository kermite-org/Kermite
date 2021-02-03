import {
  createDictionaryFromKeyValues,
  IAssignEntry,
  IPersistAssignEntry,
  IAssignsDictionary,
  IPersistProfileData,
  IProfileData,
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

  export function convertAssingsDictionaryToArray(
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
      formatRevision: 'PRF03',
      projectId: source.projectId,
      keyboardDesign: source.keyboardDesign,
      settings: source.settings,
      layers: source.layers,
      assigns: convertAssingsDictionaryToArray(source.assigns),
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
    };
  }
}