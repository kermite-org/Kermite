import { modalAlert, modalTextEdit } from '~/ui/components';

export async function checkValidResourceName(
  resourceName: string,
  existingResourceNames: string[],
  resourceTypeNameText: string,
  checkCaseInsensitive?: boolean,
): Promise<boolean> {
  // eslint-disable-next-line no-irregular-whitespace
  // eslint-disable-next-line no-misleading-character-class
  if (!resourceName.match(/^[^/./\\:*?"<>| \u3000\u0e49]+$/)) {
    await modalAlert(
      `${resourceName} is not a valid ${resourceTypeNameText}. operation cancelled.`,
    );
    return false;
  }
  const existingName = checkCaseInsensitive
    ? existingResourceNames.find(
        (it) => it.toLowerCase() === resourceName.toLowerCase(),
      )
    : existingResourceNames.find((it) => it === resourceName);
  if (existingName) {
    await modalAlert(`${existingName} is already exists. operation cancelled.`);
    return false;
  }
  return true;
}

export async function inputSavingResourceName(args: {
  modalTitle: string;
  modalMessage: string;
  resourceTypeNameText: string;
  existingResourceNames: string[];
  defaultText?: string;
  checkCaseInsensitive?: boolean;
}): Promise<string | undefined> {
  const {
    modalTitle,
    modalMessage,
    resourceTypeNameText,
    existingResourceNames,
    defaultText,
    checkCaseInsensitive,
  } = args;
  const resourceName = await modalTextEdit({
    caption: modalTitle,
    message: modalMessage,
    defaultText,
  });
  if (resourceName !== undefined) {
    if (
      await checkValidResourceName(
        resourceName,
        existingResourceNames,
        resourceTypeNameText,
        checkCaseInsensitive,
      )
    ) {
      return resourceName;
    }
  }
  return undefined;
}
