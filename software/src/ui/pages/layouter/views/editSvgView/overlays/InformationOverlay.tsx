import { jsx, css } from 'qx';
import { uiTheme } from '~/ui/common';
import { editReader } from '~/ui/pages/layouter/models';

const cssInformationOverlay = css`
  position: absolute;
  bottom: 0;
  left: 0;
  pointer-events: none;
  color: ${uiTheme.colors.clPrimary};
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
