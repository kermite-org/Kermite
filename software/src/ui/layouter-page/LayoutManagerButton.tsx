import { jsx, css, QxNode } from 'qx';

const cssLayoutManagerButton = css`
  border: solid 1px #048;
  color: #048;
  background: #fff;
  padding: 0 8px;
  height: 28px;
  display: flex;
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
`;

export const LayoutManagerButton = (props: {
  handler?: () => void;
  children: QxNode;
  active?: boolean;
  disabled?: boolean;
}) => {
  const { handler, children, active, disabled } = props;
  return (
    <div
      css={cssLayoutManagerButton}
      onClick={handler}
      data-active={active}
      data-disabled={disabled}
    >
      {children}
    </div>
  );
};
