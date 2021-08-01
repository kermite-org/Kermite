import { jsx, css, FC } from 'qx';
import { uiTheme } from '~/ui/base';
import { editReader } from '~/ui/pages/layouter/models';

export const InformationOverlay: FC = () => {
  const { pressedKeyIndices } = editReader;
  return (
    <div css={style} qxIf={pressedKeyIndices.length > 0}>
      hold key indices: {JSON.stringify(pressedKeyIndices)}
    </div>
  );
};

const style = css`
  position: absolute;
  bottom: 0;
  left: 0;
  pointer-events: none;
  color: ${uiTheme.colors.clPrimary};
  margin: 1px 4px;
`;
