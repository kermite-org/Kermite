import { css } from 'goober';
import { h } from 'qx';
import { useLayoutManagerViewModel } from '~/ui-layouter-page/LayoutManagerViewModel';

const cssLayoutManagementBar = css`
  display: flex;
  background: #fff;
  padding: 5px;

  > * + * {
    margin-left: 4px;
  }

  > .btn {
    flex-shrink: 0;
    border: solid 1px #008;
    color: #008;
    padding: 0 8px;
    height: 28px;
    display: flex;
    align-items: center;
    cursor: pointer;

    &[data-active] {
      background: #cdf;
    }

    &[data-disabled] {
      opacity: 0.5;
    }
  }

  > .targetDisplayArea {
    flex-grow: 1;
    border: solid 1px #aaa;
    display: flex;
    align-items: center;
    padding: 0 5px;
  }
`;

export const LayoutManagementBar = () => {
  const vm = useLayoutManagerViewModel();
  return (
    <div css={cssLayoutManagementBar}>
      <div class="btn">menu</div>
      <div
        class="btn"
        data-active={vm.isEditCurrnetProfileLayoutActive}
        onClick={vm.loadCurrentProfileLayout}
      >
        <i class="fa fa-link" />
      </div>
      <div class="targetDisplayArea">{vm.editSourceText}</div>
      <div
        class="btn"
        data-disabled={!vm.canOverwrite}
        onClick={vm.overwriteLayout}
      >
        save
      </div>
    </div>
  );
};
