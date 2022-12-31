import { validateResourceNameWithDuplicationCheck } from '~/app-shared-2';
import { modalTextEdit } from '~/fe-shared-2/components';

export const resourceManagementUtils = {
  async inputSavingResourceName(args: {
    modalTitle: string;
    modalMessage: string;
    resourceTypeNameText: string;
    currentName?: string;
    existingResourceNames: string[];
    allowSavingWithCurrentName?: boolean;
  }): Promise<string | undefined> {
    const {
      modalTitle,
      modalMessage,
      resourceTypeNameText,
      existingResourceNames,
      currentName = '',
      allowSavingWithCurrentName,
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
      allowSavingWithDefaultText: allowSavingWithCurrentName,
    });
  },
};
