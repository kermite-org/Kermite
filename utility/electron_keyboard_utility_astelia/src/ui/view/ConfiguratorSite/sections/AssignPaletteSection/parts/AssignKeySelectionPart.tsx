import { css, jsx } from '@emotion/core';
import { IKeyAssignEntry } from '~contract/data';
import { VirtualKey } from '~model/HighLevelDefs';
import { assignPaletteLocalTheme } from '../assignPaletteLocalTheme';
import { AssignSlotCard } from '../components/AssignSlotCard';
import { isAssignKeySpecific } from '~ui/state/editor';

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

const assignKeysGroup1: VirtualKey[] = [
  'K_Num_0',
  'K_Num_1',
  'K_Num_2',
  'K_Num_3',
  'K_Num_4',
  'K_Num_5',
  'K_Num_6',
  'K_Num_7',
  'K_Num_8',
  'K_Num_9'
];

const assignKeysGroup2: VirtualKey[] = [
  'K_F1',
  'K_F2',
  'K_F3',
  'K_F4',
  'K_F5',
  'K_F6',
  'K_F7',
  'K_F8',
  'K_F9',
  'K_F10',
  'K_F11',
  'K_F12'
];

const assignKeysGroup3: VirtualKey[] = [
  'K_Dot',
  'K_Comma',
  'K_Semicolon',
  'K_Colon',
  'K_Exclamation',
  'K_Question',

  'K_Underscore',

  'K_Plus',
  'K_Minus',
  'K_Asterisk',
  'K_Slash',
  'K_Equal',

  'K_Ampersand',
  'K_VerticalBar',
  'K_Hat',
  'K_Tilde',

  'K_AtMark',
  'K_Sharp',
  'K_Dollar',
  'K_Yen',
  'K_Percent',
  'K_BackSlash',

  'K_SingleQuote',
  'K_DoubleQuote',
  'K_BackQuote',

  'K_LeftParenthesis',
  'K_RightParenthesis',
  'K_LeftSquareBracket',
  'K_RightSquareBracket',
  'K_LeftCurlyBrace',
  'K_RightCurlyBrace',
  'K_LessThan',
  'K_GreaterThan'
];

const assignKeysGroup4: VirtualKey[] = [
  'K_Space',
  'K_Enter',
  'K_Tab',
  'K_BackSpace',
  'K_Escape',

  'K_LeftArrow',
  'K_RightArrow',
  'K_UpArrow',
  'K_DownArrow',
  'K_Home',
  'K_End',
  'K_PageUp',
  'K_PageDn',
  'K_Insert',
  'K_Delete'
];

const assignKeysGroup5: VirtualKey[] = [
  'K_CapsLock',
  'K_PrintScreen',
  'K_HankakuZenkaku',
  'K_KatakanaHiragana',
  'K_Henkan',
  'K_Muhenkan'
];

// const assignKeysGroup6: VirtualKey[] = ['K_Shift', 'K_Ctrl', 'K_Alt', 'K_OS'];

export const assignKeyGroupsTable: VirtualKey[][] = [
  assignKeysGroup0,
  assignKeysGroup1,
  assignKeysGroup2,
  assignKeysGroup3,
  assignKeysGroup4,
  assignKeysGroup5
];

export const AssignKeySelectionPart = (props: {
  currentAssign: IKeyAssignEntry | undefined;
  setCurrentAssignKey: (virtualKey: VirtualKey) => void;
}) => {
  const { currentAssign, setCurrentAssignKey } = props;

  const cssBox = css`
    flex-grow: 1;

    overflow-y: auto;
    height: 230px;
    padding: ${assignPaletteLocalTheme.commonHalfMargin};
  `;

  const cssCardListFrame = css`
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    > * {
      margin: ${assignPaletteLocalTheme.commonHalfMargin};
    }
  `;

  return (
    <div css={cssBox}>
      {assignKeyGroupsTable.map((srcTable, index) => {
        return (
          <div css={cssCardListFrame} key={index}>
            {srcTable.map(vk => {
              const isActive = isAssignKeySpecific(currentAssign, vk);
              const onClick = () => {
                setCurrentAssignKey(vk);
              };
              return (
                <AssignSlotCard
                  isActive={isActive}
                  onClick={onClick}
                  virtualKey={vk}
                  key={vk}
                ></AssignSlotCard>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
