import { jsx, css } from 'qx';
import { LayoutManagerButton } from '~/ui/components';
import { useLayoutManagerMenuModel } from '~/ui/pages/layouter-page/LayoutManagerMenu.model';
import { ILayoutManagerViewModel } from '~/ui/pages/layouter-page/LayoutManagerViewModel';

const cssMenuBase = css`
  position: relative;
`;
const cssMenuPanel = css`
  position: absolute;
  z-index: 2;
  width: 220px;

  background: #fff;
  border: solid 1px #888;
  padding: 5px;
  color: #444;
  > * + * {
    margin-top: 4px;
  }

  > .menuEntry {
    padding: 4px 8px;
    cursor: pointer;

    &:hover {
      background: #8cf;
    }

    &[data-disabled] {
      cursor: inherit;
      pointer-events: none;
      opacity: 0.5;
    }
  }
`;

const cssMenuOverlay = css`
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

export const LayoutManagerMenu = (props: {
  baseVm: ILayoutManagerViewModel;
}) => {
  const { baseVm } = props;
  const vm = useLayoutManagerMenuModel(baseVm);
  return (
    <div>
      <div css={cssMenuOverlay} onClick={vm.closeMenu} qxIf={vm.isOpen} />
      <div css={cssMenuBase}>
        <LayoutManagerButton handler={vm.openMenu} active={vm.isOpen}>
          <i class="fa fa-bars" />
        </LayoutManagerButton>
        <div css={cssMenuPanel} qxIf={vm.isOpen}>
          {vm.menuItems.map((item, idx) =>
            item.type === 'separator' ? (
              <hr key={idx} />
            ) : (
              <div
                key={idx}
                class="menuEntry"
                onClick={item.handler}
                data-disabled={item.disabled}
              >
                {item.text}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
};
