import { css } from 'goober';
import { Hook, h } from 'qx';
import { editReader, editMutations } from '@ui-layouter/editor/store';
import { DebugOverlay } from './DebugOverlay';
import { EditSvgView } from './EditSvgView';

export const EditSvgViewContainer = () => {
  const cssSvgView = css`
    border: solid 1px #888;
    flex-grow: 1;
    overflow: hidden;
    position: relative;
    > svg {
      position: absolute;
    }
  `;

  const { screenW, screenH } = editReader.sight;

  Hook.useEffect(() => {
    const el = document.getElementById('domEditSvgOuterDiv');
    if (el) {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (!(cw === screenW && ch === screenH)) {
        editMutations.setEditScreenSize(cw, ch);
        return true;
      }
    }
  });

  return (
    <div css={cssSvgView} id="domEditSvgOuterDiv">
      <EditSvgView />
      <DebugOverlay />
    </div>
  );
};
