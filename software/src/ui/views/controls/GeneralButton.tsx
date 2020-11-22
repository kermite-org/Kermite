import { css } from 'goober';
import { h } from '~lib/qx';
import { combineClasses } from '~ui/base/helper/ViewHelpers';
import { uiTheme } from '~ui/core';

type IGeneralButtonForm = 'unit' | 'unitSquare' | 'large';

interface IGeneralButtonProps {
  text?: string;
  icon?: string;
  handler?(): void;
  disabled?: boolean;
  className?: string;
  form?: IGeneralButtonForm;
}

const { unitHeight } = uiTheme;
const cssGeneralButton = css`
  background: #08a;
  border-radius: 1px;
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

  &[data-form='unit'] {
    height: ${unitHeight}px;
    padding: 2px 10px;
  }

  &[data-form='unitSquare'] {
    width: ${unitHeight}px;
    height: ${unitHeight}px;
  }

  &[data-form='large'] {
    height: 36px;
    padding: 2px 15px;
    border-radius: 5px;
  }
`;

export const GeneralButton = ({
  text,
  icon,
  handler,
  disabled,
  className,
  form = 'unit'
}: IGeneralButtonProps) => {
  return (
    <div
      class={combineClasses(cssGeneralButton, className)}
      onClick={handler}
      data-disabled={disabled}
      data-form={form}
    >
      {icon && <i class={icon} />}
      {text}
    </div>
  );
};
