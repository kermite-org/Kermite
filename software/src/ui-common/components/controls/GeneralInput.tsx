import { css } from 'goober';
import { FC, h } from 'qx';
import { uiTheme, reflectValue } from '~/ui-common';

interface Props {
  value: string;
  setValue?(value: string): void;
  className?: string;
  width?: number;
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  onFocus?(): void;
  onBlur?(): void;
}

const style = (width: number = 100) => css`
  display: block;
  background: ${uiTheme.colors.clControlBase};
  border: solid 1px ${uiTheme.colors.clPrimary};
  color: ${uiTheme.colors.clControlText};
  border-radius: ${uiTheme.controlBorderRadius}px;
  /* min-width: 100px; */
  height: ${uiTheme.unitHeight}px;
  width: ${width ? `${width}px` : 'inherit'};
  font-size: 15px;
  padding-left: 4px;

  &:hover {
    opacity: 0.8;
  }

  &:focus {
    outline: none;
    opacity: 1;
  }

  &:disabled {
    opacity: 0.5;
  }

  &[data-invalid] {
    background: ${uiTheme.colors.clInvalidInput};
  }
`;

export const GeneralInput: FC<Props> = ({
  value,
  setValue,
  className,
  width,
  disabled,
  invalid,
  readOnly,
  onFocus,
  onBlur,
}) => {
  return (
    <input
      css={style(width)}
      className={className}
      type="text"
      value={value}
      onInput={setValue && reflectValue(setValue)}
      disabled={disabled}
      data-invalid={invalid}
      readOnly={readOnly}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
};
