import { css, FC, jsx } from 'alumina';
import { colors, ISelectorOption, uiTheme } from '~/app-shared';

interface Props {
  options: ISelectorOption[];
  value: string;
  setValue(value: string): void;
  width?: number;
  disabled?: boolean;
  hint?: string;
  forceControlled?: boolean;
}

export const GeneralSelector: FC<Props> = ({
  options,
  value,
  setValue,
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
      class={style(width)}
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

const style = (width: number | undefined) => css`
  display: block;
  border: solid 1px ${colors.clPrimary};
  background: ${colors.clControlBase};
  color: ${colors.clControlText};
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
    cursor: inherit;
  }
`;
