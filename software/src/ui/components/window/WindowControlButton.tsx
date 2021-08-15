import { jsx, css, FC } from 'qx';
import { uiTheme } from '~/ui/base';

type Props = {
  icon: string;
  onClick: () => void;
  hint?: string;
  disabled?: boolean;
};

export const WindowControlButton: FC<Props> = ({ icon, onClick, hint, disabled }) => (
  <div css={style} onClick={onClick} data-hint={hint} data-disabled={disabled}>
    <i className={icon} />
  </div>
);

const style = css`
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
  &[data-disabled] {
    opacity: 0.3;
    pointer-events: none;
  }
`;
