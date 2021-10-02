import { validateResourceName } from '~/shared';
import { modalTextEdit } from '~/ui/components';

export const resourceManagementUtils = {
  makeResourceNameValidator(
    resourceTypeNameText: string,
    existingResourceNames?: string[],
    allowDifferentCasingVariants?: boolean,
  ): (text: string) => string | undefined {
    return (resourceName) =>
      validateResourceName(
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
