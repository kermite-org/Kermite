import { jsx, css, FC } from 'qx';
import { uiTheme } from '~/ui/base';

type Props = {
  icon: string;
  onClick: () => void;
  hint?: string;
};

export const WindowControlButton: FC<Props> = ({ icon, onClick, hint }) => (
  <div css={style} onClick={onClick} data-hint={hint}>
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
`;
