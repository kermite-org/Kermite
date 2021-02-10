import { css } from 'goober';
import { FC, h } from 'qx';
import { uiTheme, reflectValue } from '~/ui-common';

interface Props {
  value: string;
  setValue(value: string): void;
  className?: string;
  width?: number;
}

const style = (width: number | undefined) => css`
  background: ${uiTheme.colors.clControlBase};
  border: solid 1px ${uiTheme.colors.clPrimary};
  color: ${uiTheme.colors.clControlText};
  border-radius: ${uiTheme.controlBorderRadius}px;
  min-width: 100px;
  height: ${uiTheme.unitHeight}px;
  width: ${width ? `${width}px` : 'inherit'};
  font-size: 15px;
  &:focus {
    outline: none;
  }
  padding-left: 4px;
`;

export const GeneralInput: FC<Props> = ({
  value,
  setValue,
  className,
  width,
}) => {
  return (
    <input
      css={style(width)}
      className={className}
      type="text"
      value={value}
      onInput={reflectValue(setValue)}
    />
  );
};
