import { jsx, useLocal } from 'alumina';
import { ISelectorOption } from '~/fe-shared';
import { createModal } from '../../../components';
import { ProjectSelectionModalContent } from './ProjectSelectionModal.content';

type ModalProps = {
  modalTitle: string;
  projectOptions: ISelectorOption[];
  selectedValue: string;
};

export const callProjectSelectionModal = createModal(
  ({ modalTitle, projectOptions, selectedValue }: ModalProps) => {
    return (props: { close: (result: string | undefined) => void }) => {
      const editValues = useLocal({ projectId: selectedValue });
      const canSubmit = !!editValues.projectId;
      const submit = () => props.close(editValues.projectId);
      const close = () => props.close(undefined);
      return (
        <ProjectSelectionModalContent
          modalTitle={modalTitle}
          editValues={editValues}
          projectOptions={projectOptions}
          canSubmit={canSubmit}
          submit={submit}
          close={close}
        />
      );
    };
  },
);
