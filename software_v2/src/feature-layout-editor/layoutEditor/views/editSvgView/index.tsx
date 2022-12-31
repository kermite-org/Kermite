import { FC, asyncRerender, css, jsx, useRef } from 'alumina';
import { editMutations, editReader } from '../../models';
import { EditSvgView } from './EditSvgView';
import { DebugOverlay, InformationOverlay } from './overlays';

export const EditSvgViewContainer: FC = () => {
  const { screenW, screenH } = editReader.sight;

  const ref = useRef<HTMLDivElement>();
  const baseEl = ref.current;
  if (baseEl) {
    const cw = baseEl.clientWidth;
    const ch = baseEl.clientHeight;
    if (!(cw === screenW && ch === screenH)) {
      editMutations.setEditScreenSize(cw, ch);
    }
  } else {
    asyncRerender();
  }

  return (
    <div class={style} ref={ref}>
      <EditSvgView />
      <DebugOverlay />
      <InformationOverlay />
    </div>
  );
};

const style = css`
  flex-grow: 1;
  overflow: hidden;
  position: relative;
  > svg {
    position: absolute;
  }
`;
