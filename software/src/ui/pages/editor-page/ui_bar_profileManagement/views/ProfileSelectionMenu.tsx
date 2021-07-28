import { jsx, css } from 'qx';
import { texts } from '~/ui/common';
import { IProfileSelectionMenuPartViewModel } from '~/ui/pages/editor-page/ui_bar_profileManagement/viewModels/ProfileSelectionMenuPartViewModel';

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
`;

const cssMenuPopup = css`
  width: 160px;
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
  }
`;

export const ProfileSelectionMenuPart = (props: {
  vm: IProfileSelectionMenuPartViewModel;
}) => {
  const { isOpen, openMenu, closeMenu, menuItems } = props.vm;
  return (
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
};
