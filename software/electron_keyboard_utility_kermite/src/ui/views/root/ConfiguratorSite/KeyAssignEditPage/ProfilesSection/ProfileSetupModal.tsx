import { h } from '~lib/qx';
import { createModal } from '~ui/views/basis/ForegroundModalLayer';
import { reflectFieldValue } from '~ui/views/common/FormHelpers';
import {
  CommonDialogFrame,
  DialogContentRow,
  DialogButton,
  DialogButtonsRow,
  ClosableOverlay
} from '~ui/views/common/CommonDialogParts';
import {
  cssCommonPropertiesTable,
  cssCommonTextInput
} from '~ui/views/common/commonStyles';
import { models } from '~ui/models';

interface ICreateProfileDialogEditValues {
  profileName: string;
  breedName: string;
}

const ProfileSetupModalContent = (props: {
  editValues: ICreateProfileDialogEditValues;
  breedNames: string[];
  submit(): void;
  close(): void;
}) => {
  const { editValues, submit, close, breedNames } = props;

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
                  <select
                    value={editValues.breedName}
                    onChange={reflectFieldValue(editValues, 'breedName')}
                  >
                    {breedNames.map((breedName) => (
                      <option value={breedName} key={breedName}>
                        {breedName}
                      </option>
                    ))}
                  </select>
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
  const breedNames = models.keyboardShapesModel.getAllBreedNames();
  const editValues: ICreateProfileDialogEditValues = {
    profileName: '',
    breedName: breedNames[0]
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
        breedNames={breedNames}
      />
    );
  };
});
