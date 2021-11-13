import { jsx, css, FC } from 'alumina';
import { texts, uiTheme } from '~/ui/base';
import { IProfileSelectionMenuPartViewModel } from '~/ui/pages/assigner-page/ui_bar_profileManagement/viewModels/ProfileSelectionMenuPartViewModel';

type Props = {
  vm: IProfileSelectionMenuPartViewModel;
};

export const ProfileSelectionMenuPart: FC<Props> = ({
  vm: { isOpen, openMenu, closeMenu, menuItems },
}) => (
  <div css={cssProfileSelectionMenuPart}>
    <div css={cssOverlay} qxIf={isOpen} onClick={closeMenu} />
    <div css={cssMenuArea}>
      <div
        css={cssMenuButton}
        onMouseDown={openMenu}
        data-hint={texts.hint_assigner_topBar_profileOperationsMenu}
      >
        <i className="fa fa-bars" />
      </div>
      <div css={cssMenuPopup} qxIf={isOpen}>
        {menuItems.map((mi) => (
          <div
            key={mi.key}
            onMouseUp={mi.handler}
            data-hint={mi.hint}
            qxIf={mi.enabled}
          >
            {mi.text}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const cssProfileSelectionMenuPart = css``;

const cssOverlay = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
`;

const cssMenuArea = css`
  position: relative;
`;

const cssMenuButton = css`
  width: 20px;
  height: 20px;
  background: #888;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:hover {
    background: #8ac;
  }
  transition: ${uiTheme.commonTransitionSpec};
`;

const cssMenuPopup = css`
  width: 180px;
  background: #fff;
  position: absolute;
  color: #000;
  z-index: 20;
  user-select: none;
  border: solid 1px #248;

  > div {
    padding: 4px;
    font-size: 13px;
    cursor: pointer;
    &:hover {
      background: #c0f0f8;
    }
    transition: ${uiTheme.commonTransitionSpec};
  }
`;
