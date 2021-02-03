import { h } from 'qx';
import { ISelectorOption, reflectFieldValue } from '~/ui-common';
import {
  ClosableOverlay,
  CommonDialogFrame,
  DialogContentRow,
  DialogButtonsRow,
  DialogButton,
} from '~/ui-common/fundamental/dialog/CommonDialogParts';
import { createModal } from '~/ui-common/fundamental/overlay/ForegroundModalLayer';
import { projectResourceModel } from '~/ui-common/sharedModels/ProjectResourceModel';
import { GeneralSelector } from '~/ui-common/sharedViews/controls/GeneralSelector';
import {
  cssCommonPropertiesTable,
  cssCommonTextInput,
} from '~/ui-editor-page/components/controls/CommonStyles';

interface ICreateProfileDialogEditValues {
  profileName: string;
  targetProjectSig: string;
  layoutName: string;
}

function makeProfileSetupModalViewModel() {
  const projectOptions = projectResourceModel
    .getProjectsWithLayout()
    .map((info) => ({
      id: info.sig,
      text: info.projectPath,
    }));

  const defaultProjectSig = projectOptions[0]?.id || '';

  function getLayoutNameOptions(projectSig: string) {
    const info = projectResourceModel
      .getProjectsWithLayout()
      .find((info) => info.sig === projectSig);
    return info?.layoutNames.map((it) => ({ id: it, text: it })) || [];
  }

  const editValues: ICreateProfileDialogEditValues = {
    profileName: '',
    targetProjectSig: defaultProjectSig,
    layoutName: getLayoutNameOptions(defaultProjectSig)[0]?.id,
  };

  return {
    projectOptions,
    get presetOptions() {
      return getLayoutNameOptions(editValues.targetProjectSig);
    },
    editValues,
    sync() {
      const options = getLayoutNameOptions(editValues.targetProjectSig);
      if (!options.find((opt) => opt.id === editValues.layoutName)) {
        editValues.layoutName = options[0]?.id;
      }
    },
  };
}

const ProfileSetupModalContent = (props: {
  editValues: ICreateProfileDialogEditValues;
  projectOptions: ISelectorOption[];
  presetOptions: ISelectorOption[];
  submit(): void;
  close(): void;
}) => {
  const { editValues, submit, close, projectOptions, presetOptions } = props;

  return (
    <ClosableOverlay close={close}>
      <CommonDialogFrame caption="Create Profile">
        <DialogContentRow>
          <table css={cssCommonPropertiesTable}>
            <tbody>
              <tr>
                <td>Profile Name</td>
                <td>
                  <input
                    type="text"
                    css={cssCommonTextInput}
                    value={editValues.profileName}
                    onChange={reflectFieldValue(editValues, 'profileName')}
                  />
                </td>
              </tr>
              <tr>
                <td>Target Keyboard</td>
                <td>
                  <GeneralSelector
                    options={projectOptions}
                    choiceId={editValues.targetProjectSig}
                    setChoiceId={(id) => (editValues.targetProjectSig = id)}
                    width={150}
                  />
                </td>
              </tr>
              <tr>
                <td>Layout</td>
                <td>
                  <GeneralSelector
                    options={presetOptions}
                    choiceId={editValues.layoutName}
                    setChoiceId={(id) => (editValues.layoutName = id)}
                    width={150}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </DialogContentRow>
        <DialogButtonsRow>
          <DialogButton onClick={submit}>OK</DialogButton>
        </DialogButtonsRow>
      </CommonDialogFrame>
    </ClosableOverlay>
  );
};

export const callProfileSetupModal = createModal(() => {
  const vm = makeProfileSetupModalViewModel();

  return (props: {
    close: (result: ICreateProfileDialogEditValues | undefined) => void;
  }) => {
    vm.sync();
    const submit = () => {
      props.close(vm.editValues);
    };
    const close = () => props.close(undefined);
    return (
      <ProfileSetupModalContent
        editValues={vm.editValues}
        submit={submit}
        close={close}
        projectOptions={vm.projectOptions}
        presetOptions={vm.presetOptions}
      />
    );
  };
});
