import { FC, css, jsx, useLocal } from 'alumina';
import {
  IGeneralMenuItem,
  getFontAwesomeIconPseudoElementStyle,
  uiTheme,
} from '~/app-shared';
import { GeneralButtonMenuButton } from './GeneralButtonMenu.Button';

type Props = {
  menuItems: IGeneralMenuItem[];
  disabled?: boolean;
  hint?: string;
};

const useMenuStateModel = () => {
  const state = useLocal({ isOpen: false });
  const openMenu = () => (state.isOpen = true);
  const closeMenu = () => (state.isOpen = false);
  return { isOpen: state.isOpen, openMenu, closeMenu };
};

export const GeneralButtonMenu: FC<Props> = ({ menuItems, disabled, hint }) => {
  const { isOpen, openMenu, closeMenu } = useMenuStateModel();
  return (
    <div>
      <div class={cssMenuOverlay} onClick={closeMenu} if={isOpen} />
      <div class={cssMenuBase}>
        <GeneralButtonMenuButton
          handler={openMenu}
          active={isOpen}
          disabled={disabled}
          hint={hint}
        >
          <i class="fa fa-bars" />
        </GeneralButtonMenuButton>
        <div class={cssMenuPanel} if={isOpen}>
          {menuItems
            .filter((it) => !it.hidden)
            .map((item, idx) =>
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
                  data-hint={item.hint}
                  data-checked={item.checked}
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
    font-size: 15px;
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

    &[data-checked]:after {
      ${getFontAwesomeIconPseudoElementStyle('check')}
      font-size: 14px;
      margin-left: 5px;
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
