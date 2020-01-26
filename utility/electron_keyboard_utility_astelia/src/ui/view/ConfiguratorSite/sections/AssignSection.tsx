import { jsx, css } from '@emotion/core';
import { VirtualKey } from '~model/HighLevelDefs';
import { VirtualKeyTexts } from '../Constants';
import { AppState } from '~ui/state/store';
import { Dispatch } from 'redux';
import { editorSlice } from '~ui/state/editorSlice';
import { useSelector } from 'react-redux';
import { IKeyAssignEntry } from '~contract/data';
import { useMapDispatchToProps } from '~ui/hooks';

const assignKeysGroup0: VirtualKey[] = [
  'K_A',
  'K_B',
  'K_C',
  'K_D',
  'K_E',
  'K_F',
  'K_G',
  'K_H',
  'K_I',
  'K_J',
  'K_K',
  'K_L',
  'K_M',
  'K_N',
  'K_O',
  'K_P',
  'K_Q',
  'K_R',
  'K_S',
  'K_T',
  'K_U',
  'K_V',
  'K_W',
  'K_X',
  'K_Y',
  'K_Z'
];

const selectCurrentAssign = (state: AppState) => {
  const editModel = state.editor.editModel;
  const curSlotAddress = state.editor.currentAssignSlotAddress;
  return editModel.keyAssigns[curSlotAddress];
};

const mapStateToProps = (state: AppState) => ({
  currentAssign: selectCurrentAssign(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setKeyAssignToCurrentSlot(assign: IKeyAssignEntry) {
    dispatch(editorSlice.actions.setKeyAssignToCurrentSlot(assign));
  }
});

export const AssignSection = () => {
  const { currentAssign } = useSelector(mapStateToProps);
  const { setKeyAssignToCurrentSlot } = useMapDispatchToProps(
    mapDispatchToProps
  );

  const cssBox = css`
    display: flex;
    flex-wrap: wrap;
  `;

  const cssAssignSlotCard = css`
    width: 40px;
    height: 40px;
    background: #333;
    margin: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    cursor: pointer;

    &[data-current='true'] {
      background: #0f0;
    }
  `;

  return (
    <div css={cssBox}>
      {assignKeysGroup0.map(vk => {
        const text = VirtualKeyTexts[vk];

        const isCurrent =
          currentAssign &&
          currentAssign.type === 'keyInput' &&
          currentAssign.virtualKey === vk;

        const onClick = () => {
          setKeyAssignToCurrentSlot({
            type: 'keyInput',
            virtualKey: vk
          });
        };
        return (
          <div
            css={cssAssignSlotCard}
            key={vk}
            data-current={isCurrent}
            onClick={onClick}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
};
