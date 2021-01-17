import { reflectFieldValue } from '~/ui-common';
import { h } from 'qx';
import {
  ClosableOverlay,
  CommonDialogFrame,
  DialogContentRow,
  DialogButtonsRow,
  DialogButton,
} from '~/ui-root/base/dialog/CommonDialogParts';
import { createModal } from '~/ui-root/base/overlay/ForegroundModalLayer';
import { models } from '~/ui-root/models';
import { ISelectorOption } from '~/ui-root/viewModels/viewModelInterfaces';
import {
  cssCommonPropertiesTable,
  cssCommonTextInput,
} from '~/ui-root/views/controls/CommonStyles';
import { GeneralSelector } from '~/ui-root/views/controls/GeneralSelector';

interface ICreateProfileDialogEditValues {
  profileName: string;
  targetProjectId: string;
  presetName: string;
}

function makeProfileSetupModalViewModel() {
  const projectOptions = models.projectResourceModel
    .getProjectsWithLayout()
    .map((info) => ({
      id: info.projectId,
      text: info.projectPath,
    }));

  const defaultProjectId = projectOptions[0].id || '';

  function getLayoutNameOptions(projectId: string) {
    const info = models.projectResourceModel
      .getProjectsWithLayout()
      .find((info) => info.projectId === projectId);
    return info!.layoutNames.map((it) => ({ id: `@${it}`, text: `@${it}` }));
  }

  const editValues: ICreateProfileDialogEditValues = {
    profileName: '',
    targetProjectId: defaultProjectId,
    presetName: getLayoutNameOptions(defaultProjectId)[0].id,
  };

  return {
    projectOptions,
    get presetOptions() {
      return getLayoutNameOptions(editValues.targetProjectId);
    },
    editValues,
    sync() {
      const options = getLayoutNameOptions(editValues.targetProjectId);
      if (!options.find((opt) => opt.id === editValues.presetName)) {
        editValues.presetName = options[0].id;
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
                    choiceId={editValues.targetProjectId}
                    setChoiceId={(id) => (editValues.targetProjectId = id)}
                    width={150}
                  />
                </td>
              </tr>
              <tr>
                <td>Preset</td>
                <td>
                  <GeneralSelector
                    options={presetOptions}
                    choiceId={editValues.presetName}
                    setChoiceId={(id) => (editValues.presetName = id)}
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
