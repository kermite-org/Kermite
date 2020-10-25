import { writeUint16LE, writeUint8 } from './Helpers'

const enum KC {
  K_NONE = 0,
  K_A = 1,
  K_B,
  K_C,
  K_D,
  K_E,
  K_F,
  K_G,
  K_H,
  K_I,
  K_J,
  K_K,
  K_L,
  K_M,
  K_N,
  K_O,
  K_P,
  K_Q,
  K_R,
  K_S,
  K_T,
  K_U,
  K_V,
  K_W,
  K_X,
  K_Y,
  K_Z,
  K_Num_0,
  K_Num_1,
  K_Num_2,
  K_Num_3,
  K_Num_4,
  K_Num_5,
  K_Num_6,
  K_Num_7,
  K_Num_8,
  K_Num_9,
  K_Escape,
  K_Space,
  K_Enter,
  K_Tab,
  K_BackSpace,
  K_F1,
  K_F2,
  K_F3,
  K_F4,
  K_F5,
  K_F6,
  K_F7,
  K_F8,
  K_F9,
  K_F10,
  K_F11,
  K_F12,

  K_Dot,
  K_Comma,
  K_Exclamation,
  K_Question,
  K_Colon,
  K_Semicolon,
  K_Underscore,
  K_Plus,
  K_Minus,
  K_Asterisk,
  K_Slash,
  K_Equal,
  K_Ampersand,
  K_VerticalBar,
  K_Hat,
  K_Tilde,
  K_AtMark,
  K_Sharp,
  K_Dollar,
  K_Yen,
  K_Percent,
  K_BackSlash,
  K_SingleQuote,
  K_DoubleQuote,
  K_BackQuote,
  K_LeftParenthesis,
  K_RightParenthesis,
  K_LeftSquareBracket,
  K_RightSquareBracket,
  K_LeftCurlyBrace,
  K_RightCurlyBrace,
  K_LessThan,
  K_GreaterThan,

  K_Shift,
  K_Ctrl,
  K_Alt,
  K_OS,

  K_Home,
  K_End,
  K_Insert,
  K_Delete,
  K_PageUp,
  K_PageDn,

  K_LeftArrow,
  K_RightArrow,
  K_UpArrow,
  K_DownArrow,

  K_PrintScreen,
  K_CapsLock,
  K_ScrollLockk,
  K_PauseBreak,
  K_Menu,

  K_HankakuZenkaku,
  K_KatakanaHiragana,
  K_Muhenkan,
  K_Henkan,

  K_Special_0,
  K_Special_1,
  K_Special_2,
  K_Special_3,
  K_Special_4,
  K_Special_5,
  K_Special_6,
  K_Special_7,
  K_Special_8,
  K_Special_9,
  K_Special_10,
  K_Special_11,
  K_Special_12,
  K_Special_13,
  K_Special_14,
  K_Special_15,

  K_F13,
  K_F14,
  K_F15,
  K_F16,
  K_F17,
  K_F18,
  K_F19,
  K_F20,
  K_F21,
  K_F22,
  K_F23,
  K_F24,

  K_NumPad_0,
  K_NumPad_1,
  K_NumPad_2,
  K_NumPad_3,
  K_NumPad_4,
  K_NumPad_5,
  K_NumPad_6,
  K_NumPad_7,
  K_NumPad_8,
  K_NumPad_9,
  K_NumPad_Dot,
  K_NumPad_Plus,
  K_NumPad_Minus,
  K_NumPad_Asterisc,
  K_NumPad_Slash,
  K_NumPad_Equal,
  K_NumPad_Enter,
  K_NumPad_BackSpace,
  K_NumPad_00,
  K_NumLock,

  K_LShift,
  K_LCtrl,
  K_LAlt,
  K_LOS,
  K_RShift,
  K_RCtrl,
  K_RAlt,
  K_ROS
}

const enum AssignTypes {
  AssignType_KeyInput = 0,
  AssignType_LayerInvocation = 1
}

const enum Triggers {
  TrKeyDown = 1,
  TrKeyTap = 2,
  TrKeyHold = 3
}

const enum Operations {
  OpHoldLayer = 1,
  OpOneshotLayer = 2,
  OpSetModalLayer = 3,
  OpToggleModalLayer = 4,
  OpClearModalLayers = 5
}

interface KeyAssign {
  layerIndex: number
  keyIndex: number
  keyCode?: number
  holdLayer?: number
}

function ke(layerIndex: number, keyIndex: number, keyCode: number): KeyAssign {
  return { layerIndex: layerIndex, keyIndex: keyIndex, keyCode }
}

function kl(
  layerIndex: number,
  keyIndex: number,
  holdLayer: number
): KeyAssign {
  return { layerIndex: layerIndex, keyIndex: keyIndex, holdLayer }
}

interface IKeyAssingsDataSet {
  keyNum: number
  layerNum: number
  keyAssigns: KeyAssign[]
}

//------------------------------------------------------------

function encodeHeaderBytes(
  useDualAssign: boolean,
  numKeys: number,
  numLayers: number
): number[] {
  const headerLength = 24
  const buffer = Array(headerLength).fill(0)
  writeUint16LE(buffer, 0, 0xfe02)
  writeUint8(buffer, 2, 0xff)
  writeUint8(buffer, 3, 0x01)
  writeUint8(buffer, 4, 0x01)
  writeUint8(buffer, 5, headerLength)
  writeUint8(buffer, 6, numKeys)
  writeUint8(buffer, 7, numLayers)
  writeUint8(buffer, 8, useDualAssign ? 1 : 0)

  return buffer
}

function encodeAssign(assign: KeyAssign) {
  if (assign.keyCode) {
    const assingType = AssignTypes.AssignType_KeyInput
    const trigger = Triggers.TrKeyDown
    const modifiers = 0
    const keyCode = assign.keyCode
    return (
      (1 << 15) |
      (assingType << 14) |
      (trigger << 12) |
      (modifiers << 8) |
      keyCode
    )
  } else if (assign.holdLayer) {
    const assingType = AssignTypes.AssignType_LayerInvocation
    const trigger = Triggers.TrKeyDown
    const operation = Operations.OpHoldLayer
    const targetLayer = assign.holdLayer
    return (
      (1 << 15) |
      (assingType << 14) |
      (trigger << 12) |
      (operation << 8) |
      targetLayer
    )
  }
  throw new Error('bad assign')
}

function encodeKeyAssigns(data: IKeyAssingsDataSet) {
  const { keyNum: numKeys, layerNum: numLayers, keyAssigns } = data
  const buffer = Array(numKeys * numLayers * 2).fill(0)
  keyAssigns.forEach((ka) => {
    const wordIndex = ka.layerIndex * numKeys + ka.keyIndex
    const data = encodeAssign(ka)
    buffer[wordIndex * 2] = data & 0xff
    buffer[wordIndex * 2 + 1] = (data >> 8) & 0xff
  })
  return buffer
}

export function makeKeyAssignsTransmitData(data: IKeyAssingsDataSet) {
  const headerBytes = encodeHeaderBytes(false, data.keyNum, data.layerNum)
  const bodyBytes = encodeKeyAssigns(data)
  return [...headerBytes, ...bodyBytes]
}

export function makeTestKeyAssignsData(): IKeyAssingsDataSet {
  //const keyNum = 12
  const keyNum = 48
  const layerNum = 3

  const laGlobal = 0
  const laMain = 1
  const laSub = 2
  const laFunc = 3

  const key0 = 0
  const key1 = 1
  const key2 = 2
  const key3 = 3
  const key4 = 4
  const key5 = 5
  const key6 = 6
  const key7 = 7
  const key8 = 8
  const key9 = 9
  const key10 = 10
  const key11 = 11

  const keyAssigns = [
    ke(laGlobal, key0, KC.K_A),
    ke(laGlobal, key1, KC.K_B),

    ke(laMain, key2, KC.K_C),
    ke(laMain, key3, KC.K_D),

    ke(laSub, key2, KC.K_Num_7),
    ke(laSub, key3, KC.K_Num_8),

    ke(laMain, key4, KC.K_E),
    ke(laMain, key5, KC.K_F),

    ke(laGlobal, key6, KC.K_Shift),
    kl(laGlobal, key7, laSub)
  ]

  return { keyNum, layerNum, keyAssigns }
}
