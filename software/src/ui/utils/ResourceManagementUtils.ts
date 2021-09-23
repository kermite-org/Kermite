import { modalTextEdit } from '~/ui/components';

const helpers = {
  checkValidResourceName(
    resourceName: string,
    existingResourceNames: string[],
    resourceTypeNameText: string,
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
    const existingName = allowDifferentCasingVariants
      ? existingResourceNames.find((it) => it === resourceName)
      : existingResourceNames.find(
          (it) => it.toLowerCase() === resourceName.toLowerCase(),
        );
    if (existingName) {
      return `${existingName} already exists.`;
    }
    return undefined;
  },
  makeResourceNameValidator(
    existingResourceNames: string[],
    resourceTypeNameText: string,
    allowDifferentCasingVariants?: boolean,
  ): (text: string) => string | undefined {
    return (resourceName) =>
      helpers.checkValidResourceName(
        resourceName,
        existingResourceNames,
        resourceTypeNameText,
        allowDifferentCasingVariants,
      );
  },
};
export const resourceManagementUtils = {
  async inputSavingResourceName(args: {
    modalTitle: string;
    modalMessage: string;
    resourceTypeNameText: string;
    existingResourceNames: string[];
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

    const validator = helpers.makeResourceNameValidator(
      existingResourceNames,
      resourceTypeNameText,
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
