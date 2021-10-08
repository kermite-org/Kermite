import { validateResourceNameWithDuplicationCheck } from '~/shared';
import { modalTextEdit } from '~/ui/components';

export const resourceManagementUtils = {
  async inputSavingResourceName(args: {
    modalTitle: string;
    modalMessage: string;
    resourceTypeNameText: string;
    currentName?: string;
    existingResourceNames: string[];
  }): Promise<string | undefined> {
    const {
      modalTitle,
      modalMessage,
      resourceTypeNameText,
      existingResourceNames,
      currentName = '',
    } = args;

    const checkedResourceNames = existingResourceNames.filter(
      (it) => it !== currentName,
    );

    const validator = (text: string) =>
      validateResourceNameWithDuplicationCheck(
        text,
        resourceTypeNameText,
        checkedResourceNames,
      );

    return await modalTextEdit({
      caption: modalTitle,
      message: modalMessage,
      defaultText: currentName,
      validator,
    });
  },
};
