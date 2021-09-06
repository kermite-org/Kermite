import { modalAlert, modalTextEdit } from '~/ui/components';

const checkValidResourceName = async (
  resourceName: string,
  existingResourceNames: string[],
  resourceTypeNameText: string,
): Promise<boolean> => {
  // eslint-disable-next-line no-irregular-whitespace
  // eslint-disable-next-line no-misleading-character-class
  if (!resourceName.match(/^[^/./\\:*?"<>| \u3000\u0e49]+$/)) {
    await modalAlert(
      `${resourceName} is not a valid ${resourceTypeNameText}. operation cancelled.`,
    );
    return false;
  }
  const isExist = existingResourceNames.includes(resourceName);
  if (isExist) {
    await modalAlert(`${resourceName} is already exists. operation cancelled.`);
    return false;
  }
  return true;
};

export async function inputSavingResourceName(args: {
  modalTitle: string;
  resourceTypeNameText: string;
  existingResourceNames: string[];
  defaultText?: string;
}): Promise<string | undefined> {
  const {
    modalTitle,
    resourceTypeNameText,
    existingResourceNames,
    defaultText,
  } = args;
  const resourceName = await modalTextEdit({
    caption: modalTitle,
    message: resourceTypeNameText,
    defaultText,
  });
  if (resourceName !== undefined) {
    if (
      await checkValidResourceName(
        resourceName,
        existingResourceNames,
        resourceTypeNameText,
      )
    ) {
      return resourceName;
    }
  }
  return undefined;
}
