import { css } from 'goober';
import { editMutations, editReader } from '~/editor/models';
import { DebugOverlay } from '~/editor/views/DebugOverlay';
import { h, Hook } from '~/qx';
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

  Hook.useSideEffect(() => {
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
