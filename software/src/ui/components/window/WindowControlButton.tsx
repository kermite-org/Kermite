import { jsx, css } from 'qx';
import { uiTheme } from '~/ui/base';

export const WindowControlButton = (props: {
  icon: string;
  onClick: () => void;
  hint?: string;
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
    <div css={cssButton} onClick={props.onClick} data-hint={props.hint}>
      <i className={props.icon} />
    </div>
  );
};
