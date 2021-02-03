import { css } from 'goober';
import { h } from 'qx';
import { uiTheme, reflectValue } from '~/ui-common';

interface IGeneralInputProps {
  value: string;
  setValue(value: string): void;
  className?: string;
  width?: number;
}

const cssGeneralInput = (width: number | undefined) => css`
  border: solid 1px #08a;
  min-width: 100px;
  height: ${uiTheme.unitHeight}px;
  width: ${width ? `${width}px` : 'inherit'};
  font-size: 16px;
  &:focus {
    outline: none;
  }
  padding-left: 4px;
`;

export const GeneralInput = ({
  value,
  setValue,
  className,
  width,
}: IGeneralInputProps) => {
  return (
    <input
      classNames={[cssGeneralInput(width), className]}
      type="text"
      value={value}
      onInput={reflectValue(setValue)}
    />
  );
};