import { jsx, css, FC } from 'qx';
import { uiTheme } from '~/ui/base';
import {
  OperationButtonWithIcon,
  ProjectAttachmentFileSelectorModal,
} from '~/ui/components';
import { LayoutManagerMenu } from '~/ui/pages/layouter-page/LayoutManagerMenu';
import { useLayoutManagerViewModel } from '~/ui/pages/layouter-page/LayoutManagerViewModel';
import { makeLayoutSelectorModalViewModel } from '~/ui/pages/layouter-page/ProjectLayoutSelectorModalViewModel';

export const LayoutManagerTopBar: FC = () => {
  const vm = useLayoutManagerViewModel();
  const modalVm = makeLayoutSelectorModalViewModel(vm);
  return (
    <div css={style}>
      <LayoutManagerMenu baseVm={vm} />
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

const style = css`
  color: ${uiTheme.colors.clMainText};
  display: flex;
  padding: 6px;
  padding-bottom: 0;
  gap: 0 4px;

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
