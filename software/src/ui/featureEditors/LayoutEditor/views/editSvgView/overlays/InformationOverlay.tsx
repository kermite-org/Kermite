import { jsx, css, FC } from 'alumina';
import { colors } from '~/ui/base';
import { editReader } from '~/ui/featureEditors/LayoutEditor/models';

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
  color: ${colors.clPrimary};
  margin: 1px 4px;
`;
