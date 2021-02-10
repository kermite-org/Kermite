import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';

type IGeneralButtonForm = 'unit' | 'unitSquare' | 'large';

interface IGeneralButtonProps {
  text?: string;
  icon?: string;
  handler?(): void;
  disabled?: boolean;
  className?: string;
  form?: IGeneralButtonForm;
}

const cssGeneralButton = css`
  background: ${uiTheme.colors.clPrimary};
  color: ${uiTheme.colors.clDecal};
  border-radius: 1px;
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
    pointer-events: none;
    cursor: inherit;
    opacity: 0.3;
  }

  &[data-form='unit'] {
    height: ${uiTheme.unitHeight}px;
    padding: 2px 10px;
  }

  &[data-form='unitSquare'] {
    width: ${uiTheme.unitHeight}px;
    height: ${uiTheme.unitHeight}px;
  }

  &[data-form='large'] {
    height: 36px;
    padding: 2px 15px;
  }
`;

export const GeneralButton = ({
  text,
  icon,
  handler,
  disabled,
  className,
  form = 'unit',
}: IGeneralButtonProps) => {
  return (
    <div
      classNames={[cssGeneralButton, className]}
      onClick={handler}
      data-disabled={disabled}
      data-form={form}
    >
      {icon && <i class={icon} />}
      {text}
    </div>
  );
};
