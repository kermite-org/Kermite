import { jsx, useLocal } from 'qx';
import { ISelectorOption } from '~/ui/base';
import { ProjectSelectionModalContent } from '~/ui/components/modals/ProjectSelectionModal/ProjectSelectionModal.content';
import { createModal } from '~/ui/components/overlay';

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
