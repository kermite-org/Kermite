import { FC, css, jsx } from 'alumina';
import { colors } from '~/app-shared';
import { editReader } from '../../../models';

export const InformationOverlay: FC = () => {
  const { pressedKeyIndices } = editReader;
  return (
    <div class={style} if={pressedKeyIndices.length > 0}>
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
