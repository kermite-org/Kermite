import { FC, jsx } from 'alumina';
import { ISelectorOption, fieldSetter } from '~/app-shared';
import {
  ClosableOverlay,
  CommonDialogFrame,
  DialogButton,
  DialogButtonsRow,
  DialogContentRow,
  GeneralSelector,
} from '../../../components';

type ModalEditValues = {
  projectId: string;
};

type ModalContentProps = {
  modalTitle: string;
  editValues: ModalEditValues;
  projectOptions: ISelectorOption[];
  canSubmit: boolean;
  submit(): void;
  close(): void;
};

export const ProjectSelectionModalContent: FC<ModalContentProps> = ({
  modalTitle,
  editValues,
  submit,
  close,
  projectOptions,
  canSubmit,
}: ModalContentProps) => (
  <ClosableOverlay close={close}>
    <CommonDialogFrame caption={modalTitle} close={close}>
      <DialogContentRow>
        <GeneralSelector
          options={projectOptions}
          value={editValues.projectId}
          setValue={fieldSetter(editValues, 'projectId')}
          width={150}
        />
      </DialogContentRow>
      <DialogButtonsRow>
        <DialogButton onClick={submit} disabled={!canSubmit}>
          OK
        </DialogButton>
      </DialogButtonsRow>
    </CommonDialogFrame>
  </ClosableOverlay>
);
