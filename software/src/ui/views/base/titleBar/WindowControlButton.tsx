import { css } from 'goober';
import { uiTheme } from '~ui/core';
import { h } from '~qx';

export const WindowControlButton = (props: {
  icon: string;
  onClick: () => void;
}) => {
  const cssButton = css`
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 40px;
    height: 30px;
    color: ${uiTheme.colors.clWindowButtonFace};
    &:hover {
      background: ${uiTheme.colors.clWindowButtonHoverBack};
    }
    -webkit-app-region: no-drag;
  `;
  return (
    <div css={cssButton} onClick={props.onClick}>
      <i className={props.icon} />
    </div>
  );
};
