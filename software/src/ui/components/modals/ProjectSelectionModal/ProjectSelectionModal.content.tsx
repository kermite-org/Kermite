import { FC, jsx } from 'qx';
import { ISelectorOption } from '~/ui/base';
import { GeneralSelector } from '~/ui/components/atoms';
import {
  ClosableOverlay,
  CommonDialogFrame,
  DialogButton,
  DialogButtonsRow,
  DialogContentRow,
} from '~/ui/components/modals/CommonDialogParts';
import { fieldSetter } from '~/ui/utils';

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
