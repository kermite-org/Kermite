import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';
import { IProfileManagerViewModel } from './ProfileManagementPart.model';
import { makeProfileSelectionMenuPartModel } from './ProfileSelectionMenu.model';

const cssBase = css``;

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
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:hover {
    background: #8ac;
  }
`;

const cssMenuPopup = css`
  width: 100px;
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
  vm: IProfileManagerViewModel;
}) => {
  const menuModel = makeProfileSelectionMenuPartModel(props.vm);

  return () => {
    const { isOpen, openMenu, closeMenu, menuItems } = menuModel;
    return (
      <div css={cssBase}>
        <div css={cssOverlay} qxIf={isOpen} onClick={closeMenu} />
        <div css={cssMenuArea}>
          <div css={cssMenuButton} onMouseDown={openMenu}>
            <i className="fa fa-bars" />
          </div>
          <div css={cssMenuPopup} qxIf={isOpen}>
            {menuItems.map((mi) => (
              <div key={mi.key} onMouseUp={mi.handler}>
                {mi.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
};
