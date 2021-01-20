import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-layouter/base';
import { editReader } from '~/ui-layouter/editor/store';

const cssInformationOverlay = css`
  position: absolute;
  bottom: 0;
  left: 0;
  pointer-events: none;
  color: ${uiTheme.colors.primary};
  margin: 1px 4px;
`;

export const InformationOverlay = () => {
  const { pressedKeyIndices } = editReader;
  return (
    <div css={cssInformationOverlay} qxIf={pressedKeyIndices.length > 0}>
      hold key indices: {JSON.stringify(pressedKeyIndices)}
    </div>
  );
};
