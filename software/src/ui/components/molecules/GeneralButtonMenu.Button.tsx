import { jsx, css, QxNode, FC } from 'alumina';
import { uiTheme } from '~/ui/base';

type Props = {
  handler?: () => void;
  children: QxNode;
  active?: boolean;
  disabled?: boolean;
};

export const GeneralButtonMenuButton: FC<Props> = ({
  handler,
  children,
  active,
  disabled,
}) => (
  <div
    css={style}
    onClick={handler}
    data-active={active}
    data-disabled={disabled}
  >
    {children}
  </div>
);

const style = css`
  border: solid 1px #048;
  color: #048;
  background: #fff;
  padding: 0 8px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;

  &:hover {
    background: #def;
  }

  &[data-active] {
    background: #37c;
    color: #fff;
  }

  &[data-disabled] {
    opacity: 0.5;
    pointer-events: none;
  }

  transition: ${uiTheme.commonTransitionSpec};
`;
