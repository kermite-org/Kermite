import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import { LayoutManagerButton } from '~/ui-layouter-page/LayoutManagerButton';
import { LayoutManagerMenu } from '~/ui-layouter-page/LayoutManagerMenu';
import { useLayoutManagerViewModel } from '~/ui-layouter-page/LayoutManagerViewModel';
import { ProjectLayoutSelectorModal } from '~/ui-layouter-page/ProjectLayoutSelectorModal';

const cssLayoutManagementBar = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  display: flex;
  padding: 6px;
  padding-bottom: 3px;

  > * + * {
    margin-left: 4px;
  }

  > * {
    flex-shrink: 0;
  }

  > .targetDisplayArea {
    flex-grow: 1;
    border: solid 1px #aaa;
    display: flex;
    align-items: center;
    padding: 0 5px;
  }
`;

export const LayoutManagerTopBar = () => {
  const vm = useLayoutManagerViewModel();
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
      <LayoutManagerButton
        disabled={!vm.canOverwrite}
        handler={vm.overwriteLayout}
      >
        save
      </LayoutManagerButton>
      <ProjectLayoutSelectorModal baseVm={vm} />
    </div>
  );
};
