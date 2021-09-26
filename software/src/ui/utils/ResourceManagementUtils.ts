import { modalTextEdit } from '~/ui/components';

export const resourceManagementUtils = {
  checkValidResourceName(
    resourceName: string,
    resourceTypeNameText: string,
    existingResourceNames?: string[],
    allowDifferentCasingVariants?: boolean,
  ): string | undefined {
    // eslint-disable-next-line no-irregular-whitespace
    // eslint-disable-next-line no-misleading-character-class
    if (resourceName.match(/[/./\\:*?"<>| \u3000\u0e49]/)) {
      return `${resourceName} is not a valid ${resourceTypeNameText}.`;
    }
    if (resourceName.length > 32) {
      return `${resourceTypeNameText} should be no more than 32 characters.`;
    }
    if (existingResourceNames) {
      const existingName = allowDifferentCasingVariants
        ? existingResourceNames.find((it) => it === resourceName)
        : existingResourceNames.find(
            (it) => it.toLowerCase() === resourceName.toLowerCase(),
          );
      if (existingName) {
        return `${existingName} already exists.`;
      }
    }
    return undefined;
  },
  makeResourceNameValidator(
    resourceTypeNameText: string,
    existingResourceNames?: string[],
    allowDifferentCasingVariants?: boolean,
  ): (text: string) => string | undefined {
    return (resourceName) =>
      resourceManagementUtils.checkValidResourceName(
        resourceName,
        resourceTypeNameText,
        existingResourceNames,
        allowDifferentCasingVariants,
      );
  },
  async inputSavingResourceName(args: {
    modalTitle: string;
    modalMessage: string;
    resourceTypeNameText: string;
    existingResourceNames?: string[];
    defaultText?: string;
    allowDifferentCasingVariants?: boolean;
  }): Promise<string | undefined> {
    const {
      modalTitle,
      modalMessage,
      resourceTypeNameText,
      existingResourceNames,
      defaultText,
      allowDifferentCasingVariants,
    } = args;

    const validator = resourceManagementUtils.makeResourceNameValidator(
      resourceTypeNameText,
      existingResourceNames,
      allowDifferentCasingVariants,
    );
    return await modalTextEdit({
      caption: modalTitle,
      message: modalMessage,
      defaultText,
      validator,
    });
  },
};
