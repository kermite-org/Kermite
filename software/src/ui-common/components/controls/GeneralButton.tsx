import { css } from 'goober';
import { FC, h } from 'qx';
import { uiTheme } from '~/ui-common';

type IGeneralButtonForm = 'unit' | 'unitSquare' | 'large';

interface Props {
  text?: string;
  icon?: string;
  handler?(): void;
  disabled?: boolean;
  className?: string;
  form?: IGeneralButtonForm;
}

const style = css`
  background: ${uiTheme.colors.clPrimary};
  color: ${uiTheme.colors.clDecal};
  border-radius: ${uiTheme.controlBorderRadius}px;
  font-size: 15px;
  padding: 2px 4px;
  cursor: pointer;
  user-select: none;

  display: flex;
  justify-content: center;
  align-items: center;

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
    font-size: 18px;
    padding: 2px 15px;
  }

  > :not(:first-child) {
    margin-left: 3px;
  }

  &:hover {
    opacity: 0.7;
  }

  &[data-disabled] {
    pointer-events: none;
    cursor: inherit;
    opacity: 0.3;
  }
`;

export const GeneralButton: FC<Props> = ({
  text,
  icon,
  handler,
  disabled,
  className,
  form = 'unit',
}) => (
  <div
    css={style}
    className={className}
    onClick={handler}
    data-disabled={disabled}
    data-form={form}
  >
    {icon && <i class={icon} />}
    {text && <span>{text}</span>}
  </div>
);
