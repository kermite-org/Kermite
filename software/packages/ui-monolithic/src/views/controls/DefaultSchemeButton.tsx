import { css } from 'goober';
import { ILayerDefaultScheme } from '~shared/defs/ProfileData';
import { h } from '~qx';

export const DefaultSchemeButton = (props: {
  value: ILayerDefaultScheme;
  isCurrent: boolean;
  setCurrent: () => void;
  disabled: boolean;
}) => {
  const { value, isCurrent, setCurrent, disabled } = props;

  const cssButton = css`
    min-width: 80px;
    height: 26px;
    padding: 0 8px;
    cursor: pointer;
    border: solid 1px #048;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    &[data-current] {
      background: #0cf;
    }
    &:hover {
      opacity: 0.8;
    }

    &[data-disabled] {
      pointer-events: none;
      color: #888;
      background: #ddd;
      border: solid 1px #666;
    }
  `;
  return (
    <div
      css={cssButton}
      data-current={isCurrent}
      onClick={setCurrent}
      data-disabled={disabled}
    >
      {value}
    </div>
  );
};
