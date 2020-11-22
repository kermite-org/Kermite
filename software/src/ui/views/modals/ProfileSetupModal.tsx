import { h } from '~lib/qx';
import {
  CommonDialogFrame,
  DialogContentRow,
  DialogButton,
  DialogButtonsRow,
  ClosableOverlay
} from '~ui/base/dialog/CommonDialogParts';
import { reflectFieldValue } from '~ui/base/helper/FormHelpers';
import { createModal } from '~ui/base/overlay/ForegroundModalLayer';
import { models } from '~ui/models';
import { ISelectorOption } from '~ui/viewModels/viewModelInterfaces';
import {
  cssCommonPropertiesTable,
  cssCommonTextInput
} from '~ui/views/controls/CommonStyles';
import { GeneralSelector } from '~ui/views/controls/GeneralSelector';

interface ICreateProfileDialogEditValues {
  profileName: string;
  targetProjectId: string;
}

const ProfileSetupModalContent = (props: {
  editValues: ICreateProfileDialogEditValues;
  projectOptions: ISelectorOption[];
  submit(): void;
  close(): void;
}) => {
  const { editValues, submit, close, projectOptions } = props;

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
  const projectOptions = models.projectResourceModel
    .getProjectsWithLayout()
    .map((info) => ({
      id: info.projectId,
      text: info.projectPath
    }));

  const editValues: ICreateProfileDialogEditValues = {
    profileName: '',
    targetProjectId: projectOptions?.[0].id || ''
  };
  return (props: {
    close: (result: ICreateProfileDialogEditValues | undefined) => void;
  }) => {
    const submit = () => props.close(editValues);
    const close = () => props.close(undefined);
    return (
      <ProfileSetupModalContent
        editValues={editValues}
        submit={submit}
        close={close}
        projectOptions={projectOptions}
      />
    );
  };
});
