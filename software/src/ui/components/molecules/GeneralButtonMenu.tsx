import { jsx, css, useLocal, FC } from 'qx';
import { IGeneralMenuItem, uiTheme } from '~/ui/base';
import { GeneralButtonMenuButton } from '~/ui/components/molecules/GeneralButtonMenu.Button';

type Props = {
  menuItems: IGeneralMenuItem[];
  disabled?: boolean;
};

const useMenuStateModel = () => {
  const state = useLocal({ isOpen: false });
  const openMenu = () => (state.isOpen = true);
  const closeMenu = () => (state.isOpen = false);
  return { isOpen: state.isOpen, openMenu, closeMenu };
};

export const GeneralButtonMenu: FC<Props> = ({ menuItems, disabled }) => {
  const { isOpen, openMenu, closeMenu } = useMenuStateModel();
  return (
    <div>
      <div css={cssMenuOverlay} onClick={closeMenu} qxIf={isOpen} />
      <div css={cssMenuBase}>
        <GeneralButtonMenuButton
          handler={openMenu}
          active={isOpen}
          disabled={disabled}
        >
          <i class="fa fa-bars" />
        </GeneralButtonMenuButton>
        <div css={cssMenuPanel} qxIf={isOpen}>
          {menuItems.map((item, idx) =>
            item.type === 'separator' ? (
              <hr key={idx} />
            ) : (
              <div
                key={idx}
                class="menuEntry"
                onClick={() => {
                  item.handler();
                  closeMenu();
                }}
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

    transition: ${uiTheme.commonTransitionSpec};
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
