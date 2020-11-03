import { css } from 'goober';
import { h } from '~lib/qx';
import { combineClasses } from '../helpers/viewHelpers';

interface IGeneralButtonProps {
  text?: string;
  icon?: string;
  handler?(): void;
  disabled?: boolean;
  className?: string;
}

const cssGeneralButton = css`
  /* display: inline-block; */

  background: #08a;
  border-radius: 2px;
  color: #fff;
  padding: 2px 4px;
  cursor: pointer;
  user-select: none;

  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    opacity: 0.7;
  }

  &[data-disabled] {
    cursor: inherit;
    opacity: 0.3;
  }
`;

export const GeneralButton = ({
  text,
  icon,
  handler,
  disabled,
  className
}: IGeneralButtonProps) => {
  return (
    <div
      class={combineClasses(cssGeneralButton, className)}
      onClick={handler}
      data-disabled={disabled}
    >
      {icon && <i class={icon} />}
      {text}
    </div>
  );
};
