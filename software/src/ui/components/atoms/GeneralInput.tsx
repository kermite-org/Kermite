import { FC, jsx, css } from 'alumina';
import { colors, uiTheme } from '~/ui/base';
import { reflectValue } from '~/ui/utils';

interface Props {
  type?: string;
  value: string;
  setValue?(value: string): void;
  width?: number;
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  onFocus?(): void;
  onBlur?(): void;
  hint?: string;
  min?: number;
  max?: number;
}

export const GeneralInput: FC<Props> = ({
  type = 'text',
  value,
  setValue,
  width,
  disabled,
  invalid,
  readOnly,
  onFocus,
  onBlur,
  hint,
  min,
  max,
}) => {
  return (
    <input
      class={style(width)}
      type={type}
      min={min}
      max={max}
      value={value}
      onInput={setValue && reflectValue(setValue)}
      disabled={disabled}
      data-invalid={invalid}
      readOnly={readOnly}
      onFocus={onFocus}
      onBlur={onBlur}
      data-hint={hint}
      spellcheck={'false' as any}
    />
  );
};

const style = (width: number = 100) => css`
  display: block;
  background: ${colors.clControlBase};
  border: solid 1px ${colors.clPrimary};
  color: ${colors.clControlText};
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
    background: ${colors.clInvalidInput};
  }
`;
