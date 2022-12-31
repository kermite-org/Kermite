import { jsx, css, AluminaNode, FC } from 'alumina';
import { uiTheme } from '~/app-shared';

type Props = {
  handler?: () => void;
  children: AluminaNode;
  active?: boolean;
  disabled?: boolean;
  hint?: string;
};

export const GeneralButtonMenuButton: FC<Props> = ({
  handler,
  children,
  active,
  disabled,
  hint,
}) => (
  <div
    class={style}
    onClick={handler}
    data-active={active}
    data-disabled={disabled}
    data-hint={hint}
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
