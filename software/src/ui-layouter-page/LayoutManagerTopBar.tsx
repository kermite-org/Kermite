import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import {
  OperationButtonWithIcon,
  ProjectAttachmentFileSelectorModal,
} from '~/ui-common/components';
import { LayoutManagerButton } from '~/ui-layouter-page/LayoutManagerButton';
import { LayoutManagerMenu } from '~/ui-layouter-page/LayoutManagerMenu';
import { useLayoutManagerViewModel } from '~/ui-layouter-page/LayoutManagerViewModel';
import { makeLayoutSelectorModelViewModel } from '~/ui-layouter-page/ProjectLayoutSelectorModalViewModel';

const cssLayoutManagementBar = css`
  color: ${uiTheme.colors.clMainText};
  display: flex;
  padding: 6px;
  padding-bottom: 0;

  > * + * {
    margin-left: 4px;
  }

  > * {
    flex-shrink: 0;
  }

  > .targetDisplayArea {
    flex-grow: 1;
    border: solid 1px ${uiTheme.colors.clPrimary};
    display: flex;
    align-items: center;
    padding: 0 5px;
  }
`;

export const LayoutManagerTopBar = () => {
  const vm = useLayoutManagerViewModel();
  const modalVm = makeLayoutSelectorModelViewModel(vm);
  return (
    <div css={cssLayoutManagementBar}>
      <LayoutManagerMenu baseVm={vm} />
      <LayoutManagerButton
        active={vm.isEditCurrnetProfileLayoutActive}
        handler={vm.toggleCurrentProfileEdit}
      >
        <i class="fa fa-link" />
      </LayoutManagerButton>
      <div class="targetDisplayArea">{vm.editSourceText}</div>
      <OperationButtonWithIcon
        icon="save"
        label="save"
        disabled={!vm.canOverwrite}
        onClick={vm.overwriteLayout}
      />
      {modalVm && <ProjectAttachmentFileSelectorModal vm={modalVm} />}
    </div>
  );
};
