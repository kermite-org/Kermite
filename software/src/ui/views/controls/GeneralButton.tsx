import { css } from 'goober';
import { h } from '~lib/qx';
import { classes } from '../helpers/viewHelpers';

interface IGeneralButtonProps {
  text?: string;
  icon?: string;
  handler?(): void;
  disabled?: boolean;
  extraCss?: string;
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
  extraCss
}: IGeneralButtonProps) => {
  return (
    <div
      class={classes(cssGeneralButton, extraCss)}
      onClick={handler}
      data-disabled={disabled}
    >
      {icon && <i class={icon} />}
      {text}
    </div>
  );
};
