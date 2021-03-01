import { FC, jsx, css, Hook } from 'qx';
import { uiTheme } from '~/ui-common';
import { ISelectorOption } from '~/ui-common/base';

interface Props {
  options: ISelectorOption[];
  value: string;
  setValue(value: string): void;
  width?: number;
  className?: string;
  disabled?: boolean;
  hint?: string;
  forceControlled?: boolean;
}

const style = (width: number | undefined) => css`
  display: block;
  border: solid 1px ${uiTheme.colors.clPrimary};
  background: ${uiTheme.colors.clControlBase};
  color: ${uiTheme.colors.clControlText};
  border-radius: ${uiTheme.controlBorderRadius}px;
  height: ${uiTheme.unitHeight}px;
  width: ${width ? `${width}px` : 'inherit'};
  font-size: 15px;
  cursor: pointer;
  &:focus {
    outline: none;
  }
  &:hover {
    opacity: 0.8;
  }
  &:disabled {
    opacity: 0.5;
  }
`;

export const GeneralSelector: FC<Props> = ({
  options,
  value,
  setValue,
  className,
  width,
  disabled,
  hint,
  forceControlled,
}) => {
  const onChange = (event: Event) => {
    const el = event.currentTarget as HTMLSelectElement;
    const newValue = el.value;
    if (forceControlled) {
      // controlledなコンポーネントとして動作させるため現在選択されている値に一旦戻す
      el.value = value;
    }
    setValue(newValue);
  };

  return (
    <select
      value={options.length > 0 ? value : ''}
      onChange={onChange}
      css={style(width)}
      className={className}
      disabled={disabled}
      data-hint={hint}
    >
      {options.map((it, idx) => (
        <option value={it.value} key={idx}>
          {it.label}
        </option>
      ))}
    </select>
  );
};
