(() => {
  // src/shared/defs/CommandDefinitions.ts
  var SystemParameter;
  (function(SystemParameter2) {
    SystemParameter2[SystemParameter2["EmitKeyStroke"] = 0] = "EmitKeyStroke";
    SystemParameter2[SystemParameter2["EmitRealtimeEvents"] = 1] = "EmitRealtimeEvents";
    SystemParameter2[SystemParameter2["KeyHoldIndicatorLed"] = 2] = "KeyHoldIndicatorLed";
    SystemParameter2[SystemParameter2["HeartbeatLed"] = 3] = "HeartbeatLed";
    SystemParameter2[SystemParameter2["MasterSide"] = 4] = "MasterSide";
    SystemParameter2[SystemParameter2["SystemLayout"] = 5] = "SystemLayout";
    SystemParameter2[SystemParameter2["WiringMode"] = 6] = "WiringMode";
    SystemParameter2[SystemParameter2["GlowActive"] = 7] = "GlowActive";
    SystemParameter2[SystemParameter2["GlowColor"] = 8] = "GlowColor";
    SystemParameter2[SystemParameter2["GlowBrightness"] = 9] = "GlowBrightness";
    SystemParameter2[SystemParameter2["GlowPattern"] = 10] = "GlowPattern";
    SystemParameter2[SystemParameter2["GlowDirection"] = 11] = "GlowDirection";
    SystemParameter2[SystemParameter2["GlowSpeed"] = 12] = "GlowSpeed";
  })(SystemParameter || (SystemParameter = {}));
  var systemActionToLabelTextMap = {
    None: "none",
    GlowToggle: "led on^",
    GlowPatternRoll: "led p>",
    GlowColorPrev: "led <c",
    GlowColorNext: "led c>",
    GlowBrightnessMinus: "led b-",
    GlowBrightnessPlus: "led b+"
  };

  // src/shared/defs/KeyboardDesign.ts
  function createFallbackPersistKeyboardDesign() {
    return {
      formatRevision: "LA01",
      setup: {
        placementUnit: "KP 19",
        placementAnchor: "center",
        keySizeUnit: "KP 19",
        keyIdMode: "auto"
      },
      keyEntities: [],
      outlineShapes: [],
      transformationGroups: []
    };
  }

  // src/shared/defs/LogicalKey.ts
  var LogicalKey;
  (function(LogicalKey2) {
    LogicalKey2[LogicalKey2["LK_NONE"] = 0] = "LK_NONE";
    LogicalKey2[LogicalKey2["LK_A"] = 1] = "LK_A";
    LogicalKey2[LogicalKey2["LK_B"] = 2] = "LK_B";
    LogicalKey2[LogicalKey2["LK_C"] = 3] = "LK_C";
    LogicalKey2[LogicalKey2["LK_D"] = 4] = "LK_D";
    LogicalKey2[LogicalKey2["LK_E"] = 5] = "LK_E";
    LogicalKey2[LogicalKey2["LK_F"] = 6] = "LK_F";
    LogicalKey2[LogicalKey2["LK_G"] = 7] = "LK_G";
    LogicalKey2[LogicalKey2["LK_H"] = 8] = "LK_H";
    LogicalKey2[LogicalKey2["LK_I"] = 9] = "LK_I";
    LogicalKey2[LogicalKey2["LK_J"] = 10] = "LK_J";
    LogicalKey2[LogicalKey2["LK_K"] = 11] = "LK_K";
    LogicalKey2[LogicalKey2["LK_L"] = 12] = "LK_L";
    LogicalKey2[LogicalKey2["LK_M"] = 13] = "LK_M";
    LogicalKey2[LogicalKey2["LK_N"] = 14] = "LK_N";
    LogicalKey2[LogicalKey2["LK_O"] = 15] = "LK_O";
    LogicalKey2[LogicalKey2["LK_P"] = 16] = "LK_P";
    LogicalKey2[LogicalKey2["LK_Q"] = 17] = "LK_Q";
    LogicalKey2[LogicalKey2["LK_R"] = 18] = "LK_R";
    LogicalKey2[LogicalKey2["LK_S"] = 19] = "LK_S";
    LogicalKey2[LogicalKey2["LK_T"] = 20] = "LK_T";
    LogicalKey2[LogicalKey2["LK_U"] = 21] = "LK_U";
    LogicalKey2[LogicalKey2["LK_V"] = 22] = "LK_V";
    LogicalKey2[LogicalKey2["LK_W"] = 23] = "LK_W";
    LogicalKey2[LogicalKey2["LK_X"] = 24] = "LK_X";
    LogicalKey2[LogicalKey2["LK_Y"] = 25] = "LK_Y";
    LogicalKey2[LogicalKey2["LK_Z"] = 26] = "LK_Z";
    LogicalKey2[LogicalKey2["LK_Num_0"] = 27] = "LK_Num_0";
    LogicalKey2[LogicalKey2["LK_Num_1"] = 28] = "LK_Num_1";
    LogicalKey2[LogicalKey2["LK_Num_2"] = 29] = "LK_Num_2";
    LogicalKey2[LogicalKey2["LK_Num_3"] = 30] = "LK_Num_3";
    LogicalKey2[LogicalKey2["LK_Num_4"] = 31] = "LK_Num_4";
    LogicalKey2[LogicalKey2["LK_Num_5"] = 32] = "LK_Num_5";
    LogicalKey2[LogicalKey2["LK_Num_6"] = 33] = "LK_Num_6";
    LogicalKey2[LogicalKey2["LK_Num_7"] = 34] = "LK_Num_7";
    LogicalKey2[LogicalKey2["LK_Num_8"] = 35] = "LK_Num_8";
    LogicalKey2[LogicalKey2["LK_Num_9"] = 36] = "LK_Num_9";
    LogicalKey2[LogicalKey2["LK_Escape"] = 37] = "LK_Escape";
    LogicalKey2[LogicalKey2["LK_Space"] = 38] = "LK_Space";
    LogicalKey2[LogicalKey2["LK_Enter"] = 39] = "LK_Enter";
    LogicalKey2[LogicalKey2["LK_Tab"] = 40] = "LK_Tab";
    LogicalKey2[LogicalKey2["LK_BackSpace"] = 41] = "LK_BackSpace";
    LogicalKey2[LogicalKey2["LK_F1"] = 42] = "LK_F1";
    LogicalKey2[LogicalKey2["LK_F2"] = 43] = "LK_F2";
    LogicalKey2[LogicalKey2["LK_F3"] = 44] = "LK_F3";
    LogicalKey2[LogicalKey2["LK_F4"] = 45] = "LK_F4";
    LogicalKey2[LogicalKey2["LK_F5"] = 46] = "LK_F5";
    LogicalKey2[LogicalKey2["LK_F6"] = 47] = "LK_F6";
    LogicalKey2[LogicalKey2["LK_F7"] = 48] = "LK_F7";
    LogicalKey2[LogicalKey2["LK_F8"] = 49] = "LK_F8";
    LogicalKey2[LogicalKey2["LK_F9"] = 50] = "LK_F9";
    LogicalKey2[LogicalKey2["LK_F10"] = 51] = "LK_F10";
    LogicalKey2[LogicalKey2["LK_F11"] = 52] = "LK_F11";
    LogicalKey2[LogicalKey2["LK_F12"] = 53] = "LK_F12";
    LogicalKey2[LogicalKey2["LK_Dot"] = 54] = "LK_Dot";
    LogicalKey2[LogicalKey2["LK_Comma"] = 55] = "LK_Comma";
    LogicalKey2[LogicalKey2["LK_Exclamation"] = 56] = "LK_Exclamation";
    LogicalKey2[LogicalKey2["LK_Question"] = 57] = "LK_Question";
    LogicalKey2[LogicalKey2["LK_Colon"] = 58] = "LK_Colon";
    LogicalKey2[LogicalKey2["LK_Semicolon"] = 59] = "LK_Semicolon";
    LogicalKey2[LogicalKey2["LK_Underscore"] = 60] = "LK_Underscore";
    LogicalKey2[LogicalKey2["LK_Plus"] = 61] = "LK_Plus";
    LogicalKey2[LogicalKey2["LK_Minus"] = 62] = "LK_Minus";
    LogicalKey2[LogicalKey2["LK_Asterisk"] = 63] = "LK_Asterisk";
    LogicalKey2[LogicalKey2["LK_Slash"] = 64] = "LK_Slash";
    LogicalKey2[LogicalKey2["LK_Equal"] = 65] = "LK_Equal";
    LogicalKey2[LogicalKey2["LK_Ampersand"] = 66] = "LK_Ampersand";
    LogicalKey2[LogicalKey2["LK_VerticalBar"] = 67] = "LK_VerticalBar";
    LogicalKey2[LogicalKey2["LK_Hat"] = 68] = "LK_Hat";
    LogicalKey2[LogicalKey2["LK_Tilde"] = 69] = "LK_Tilde";
    LogicalKey2[LogicalKey2["LK_AtMark"] = 70] = "LK_AtMark";
    LogicalKey2[LogicalKey2["LK_Sharp"] = 71] = "LK_Sharp";
    LogicalKey2[LogicalKey2["LK_Dollar"] = 72] = "LK_Dollar";
    LogicalKey2[LogicalKey2["LK_Yen"] = 73] = "LK_Yen";
    LogicalKey2[LogicalKey2["LK_Percent"] = 74] = "LK_Percent";
    LogicalKey2[LogicalKey2["LK_BackSlash"] = 75] = "LK_BackSlash";
    LogicalKey2[LogicalKey2["LK_SingleQuote"] = 76] = "LK_SingleQuote";
    LogicalKey2[LogicalKey2["LK_DoubleQuote"] = 77] = "LK_DoubleQuote";
    LogicalKey2[LogicalKey2["LK_BackQuote"] = 78] = "LK_BackQuote";
    LogicalKey2[LogicalKey2["LK_LeftParenthesis"] = 79] = "LK_LeftParenthesis";
    LogicalKey2[LogicalKey2["LK_RightParenthesis"] = 80] = "LK_RightParenthesis";
    LogicalKey2[LogicalKey2["LK_LeftSquareBracket"] = 81] = "LK_LeftSquareBracket";
    LogicalKey2[LogicalKey2["LK_RightSquareBracket"] = 82] = "LK_RightSquareBracket";
    LogicalKey2[LogicalKey2["LK_LeftCurlyBrace"] = 83] = "LK_LeftCurlyBrace";
    LogicalKey2[LogicalKey2["LK_RightCurlyBrace"] = 84] = "LK_RightCurlyBrace";
    LogicalKey2[LogicalKey2["LK_LessThan"] = 85] = "LK_LessThan";
    LogicalKey2[LogicalKey2["LK_GreaterThan"] = 86] = "LK_GreaterThan";
    LogicalKey2[LogicalKey2["LK_Shift"] = 87] = "LK_Shift";
    LogicalKey2[LogicalKey2["LK_Ctrl"] = 88] = "LK_Ctrl";
    LogicalKey2[LogicalKey2["LK_Alt"] = 89] = "LK_Alt";
    LogicalKey2[LogicalKey2["LK_Gui"] = 90] = "LK_Gui";
    LogicalKey2[LogicalKey2["LK_Home"] = 91] = "LK_Home";
    LogicalKey2[LogicalKey2["LK_End"] = 92] = "LK_End";
    LogicalKey2[LogicalKey2["LK_Insert"] = 93] = "LK_Insert";
    LogicalKey2[LogicalKey2["LK_Delete"] = 94] = "LK_Delete";
    LogicalKey2[LogicalKey2["LK_PageUp"] = 95] = "LK_PageUp";
    LogicalKey2[LogicalKey2["LK_PageDn"] = 96] = "LK_PageDn";
    LogicalKey2[LogicalKey2["LK_LeftArrow"] = 97] = "LK_LeftArrow";
    LogicalKey2[LogicalKey2["LK_RightArrow"] = 98] = "LK_RightArrow";
    LogicalKey2[LogicalKey2["LK_UpArrow"] = 99] = "LK_UpArrow";
    LogicalKey2[LogicalKey2["LK_DownArrow"] = 100] = "LK_DownArrow";
    LogicalKey2[LogicalKey2["LK_PrintScreen"] = 101] = "LK_PrintScreen";
    LogicalKey2[LogicalKey2["LK_CapsLock"] = 102] = "LK_CapsLock";
    LogicalKey2[LogicalKey2["LK_ScrollLockk"] = 103] = "LK_ScrollLockk";
    LogicalKey2[LogicalKey2["LK_PauseBreak"] = 104] = "LK_PauseBreak";
    LogicalKey2[LogicalKey2["LK_Menu"] = 105] = "LK_Menu";
    LogicalKey2[LogicalKey2["LK_HankakuZenkaku"] = 106] = "LK_HankakuZenkaku";
    LogicalKey2[LogicalKey2["LK_KatakanaHiragana"] = 107] = "LK_KatakanaHiragana";
    LogicalKey2[LogicalKey2["LK_Muhenkan"] = 108] = "LK_Muhenkan";
    LogicalKey2[LogicalKey2["LK_Henkan"] = 109] = "LK_Henkan";
    LogicalKey2[LogicalKey2["LK_Special_0"] = 110] = "LK_Special_0";
    LogicalKey2[LogicalKey2["LK_Special_1"] = 111] = "LK_Special_1";
    LogicalKey2[LogicalKey2["LK_Special_2"] = 112] = "LK_Special_2";
    LogicalKey2[LogicalKey2["LK_Special_3"] = 113] = "LK_Special_3";
    LogicalKey2[LogicalKey2["LK_Special_4"] = 114] = "LK_Special_4";
    LogicalKey2[LogicalKey2["LK_Special_5"] = 115] = "LK_Special_5";
    LogicalKey2[LogicalKey2["LK_Special_6"] = 116] = "LK_Special_6";
    LogicalKey2[LogicalKey2["LK_Special_7"] = 117] = "LK_Special_7";
    LogicalKey2[LogicalKey2["LK_Special_8"] = 118] = "LK_Special_8";
    LogicalKey2[LogicalKey2["LK_Special_9"] = 119] = "LK_Special_9";
    LogicalKey2[LogicalKey2["LK_Special_10"] = 120] = "LK_Special_10";
    LogicalKey2[LogicalKey2["LK_Special_11"] = 121] = "LK_Special_11";
    LogicalKey2[LogicalKey2["LK_Special_12"] = 122] = "LK_Special_12";
    LogicalKey2[LogicalKey2["LK_Special_13"] = 123] = "LK_Special_13";
    LogicalKey2[LogicalKey2["LK_Special_14"] = 124] = "LK_Special_14";
    LogicalKey2[LogicalKey2["LK_Special_15"] = 125] = "LK_Special_15";
    LogicalKey2[LogicalKey2["LK_F13"] = 126] = "LK_F13";
    LogicalKey2[LogicalKey2["LK_F14"] = 127] = "LK_F14";
    LogicalKey2[LogicalKey2["LK_F15"] = 128] = "LK_F15";
    LogicalKey2[LogicalKey2["LK_F16"] = 129] = "LK_F16";
    LogicalKey2[LogicalKey2["LK_F17"] = 130] = "LK_F17";
    LogicalKey2[LogicalKey2["LK_F18"] = 131] = "LK_F18";
    LogicalKey2[LogicalKey2["LK_F19"] = 132] = "LK_F19";
    LogicalKey2[LogicalKey2["LK_F20"] = 133] = "LK_F20";
    LogicalKey2[LogicalKey2["LK_F21"] = 134] = "LK_F21";
    LogicalKey2[LogicalKey2["LK_F22"] = 135] = "LK_F22";
    LogicalKey2[LogicalKey2["LK_F23"] = 136] = "LK_F23";
    LogicalKey2[LogicalKey2["LK_F24"] = 137] = "LK_F24";
    LogicalKey2[LogicalKey2["LK_NumPad_0"] = 138] = "LK_NumPad_0";
    LogicalKey2[LogicalKey2["LK_NumPad_1"] = 139] = "LK_NumPad_1";
    LogicalKey2[LogicalKey2["LK_NumPad_2"] = 140] = "LK_NumPad_2";
    LogicalKey2[LogicalKey2["LK_NumPad_3"] = 141] = "LK_NumPad_3";
    LogicalKey2[LogicalKey2["LK_NumPad_4"] = 142] = "LK_NumPad_4";
    LogicalKey2[LogicalKey2["LK_NumPad_5"] = 143] = "LK_NumPad_5";
    LogicalKey2[LogicalKey2["LK_NumPad_6"] = 144] = "LK_NumPad_6";
    LogicalKey2[LogicalKey2["LK_NumPad_7"] = 145] = "LK_NumPad_7";
    LogicalKey2[LogicalKey2["LK_NumPad_8"] = 146] = "LK_NumPad_8";
    LogicalKey2[LogicalKey2["LK_NumPad_9"] = 147] = "LK_NumPad_9";
    LogicalKey2[LogicalKey2["LK_NumPad_Dot"] = 148] = "LK_NumPad_Dot";
    LogicalKey2[LogicalKey2["LK_NumPad_Plus"] = 149] = "LK_NumPad_Plus";
    LogicalKey2[LogicalKey2["LK_NumPad_Minus"] = 150] = "LK_NumPad_Minus";
    LogicalKey2[LogicalKey2["LK_NumPad_Asterisc"] = 151] = "LK_NumPad_Asterisc";
    LogicalKey2[LogicalKey2["LK_NumPad_Slash"] = 152] = "LK_NumPad_Slash";
    LogicalKey2[LogicalKey2["LK_NumPad_Equal"] = 153] = "LK_NumPad_Equal";
    LogicalKey2[LogicalKey2["LK_NumPad_Enter"] = 154] = "LK_NumPad_Enter";
    LogicalKey2[LogicalKey2["LK_NumPad_BackSpace"] = 155] = "LK_NumPad_BackSpace";
    LogicalKey2[LogicalKey2["LK_NumPad_00"] = 156] = "LK_NumPad_00";
    LogicalKey2[LogicalKey2["LK_NumLock"] = 157] = "LK_NumLock";
    LogicalKey2[LogicalKey2["LK_LShift"] = 158] = "LK_LShift";
    LogicalKey2[LogicalKey2["LK_LCtrl"] = 159] = "LK_LCtrl";
    LogicalKey2[LogicalKey2["LK_LAlt"] = 160] = "LK_LAlt";
    LogicalKey2[LogicalKey2["LK_LGui"] = 161] = "LK_LGui";
    LogicalKey2[LogicalKey2["LK_RShift"] = 162] = "LK_RShift";
    LogicalKey2[LogicalKey2["LK_RCtrl"] = 163] = "LK_RCtrl";
    LogicalKey2[LogicalKey2["LK_RAlt"] = 164] = "LK_RAlt";
    LogicalKey2[LogicalKey2["LK_RGui"] = 165] = "LK_RGui";
    LogicalKey2[LogicalKey2["LK_NN"] = 166] = "LK_NN";
    LogicalKey2[LogicalKey2["LK_LTU"] = 167] = "LK_LTU";
    LogicalKey2[LogicalKey2["LK_UU"] = 168] = "LK_UU";
    LogicalKey2[LogicalKey2["LK_NextDouble"] = 169] = "LK_NextDouble";
    LogicalKey2[LogicalKey2["LK_PostDouble"] = 170] = "LK_PostDouble";
    LogicalKey2[LogicalKey2["LK_U0"] = 171] = "LK_U0";
    LogicalKey2[LogicalKey2["LK_U1"] = 172] = "LK_U1";
    LogicalKey2[LogicalKey2["LK_U2"] = 173] = "LK_U2";
    LogicalKey2[LogicalKey2["LK_U3"] = 174] = "LK_U3";
    LogicalKey2[LogicalKey2["LK_U4"] = 175] = "LK_U4";
    LogicalKey2[LogicalKey2["LK_U5"] = 176] = "LK_U5";
    LogicalKey2[LogicalKey2["LK_U6"] = 177] = "LK_U6";
    LogicalKey2[LogicalKey2["LK_U7"] = 178] = "LK_U7";
    LogicalKey2[LogicalKey2["LK_U8"] = 179] = "LK_U8";
    LogicalKey2[LogicalKey2["LK_U9"] = 180] = "LK_U9";
    LogicalKey2[LogicalKey2["LK_RoutingSource_Any"] = 181] = "LK_RoutingSource_Any";
    LogicalKey2[LogicalKey2["LK_RoutingDestination_Keep"] = 182] = "LK_RoutingDestination_Keep";
  })(LogicalKey || (LogicalKey = {}));

  // src/shared/defs/ProfileData.ts
  var profileFormatRevisionLatest = "PRF05";
  var fallbackProfileData = {
    projectId: "",
    keyboardDesign: createFallbackPersistKeyboardDesign(),
    settings: {
      assignType: "single",
      useShiftCancel: false
    },
    layers: [
      {
        layerId: "la0",
        layerName: "main",
        defaultScheme: "block",
        exclusionGroup: 0,
        initialActive: true
      }
    ],
    assigns: {},
    mappingEntries: []
  };

  // src/shared/defs/RouterDefinitions.ts
  var routerConstants = {
    RoutingChannelValueAny: 15,
    KeyCodeSourceValueNone: LogicalKey.LK_NONE,
    KeyCodeSourceValueAny: LogicalKey.LK_RoutingSource_Any,
    KeyCodeDestinationValueKeep: LogicalKey.LK_RoutingDestination_Keep,
    ModifierSourceValueNone: 0,
    ModifierSourceValueAny: 255,
    ModifierDestinationValueKeep: 254
  };

  // src/shared/defs/VirtualKeyTexts.ts
  var VirtualKeyTexts = {
    K_NONE: "none",
    K_A: "A",
    K_B: "B",
    K_C: "C",
    K_D: "D",
    K_E: "E",
    K_F: "F",
    K_G: "G",
    K_H: "H",
    K_I: "I",
    K_J: "J",
    K_K: "K",
    K_L: "L",
    K_M: "M",
    K_N: "N",
    K_O: "O",
    K_P: "P",
    K_Q: "Q",
    K_R: "R",
    K_S: "S",
    K_T: "T",
    K_U: "U",
    K_V: "V",
    K_W: "W",
    K_X: "X",
    K_Y: "Y",
    K_Z: "Z",
    K_Num_1: "1",
    K_Num_2: "2",
    K_Num_3: "3",
    K_Num_4: "4",
    K_Num_5: "5",
    K_Num_6: "6",
    K_Num_7: "7",
    K_Num_8: "8",
    K_Num_9: "9",
    K_Num_0: "0",
    K_Enter: "enter",
    K_Escape: "esc",
    K_BackSpace: "bksp",
    K_Tab: "tab",
    K_Space: "space",
    K_HankakuZenkaku: "E/J",
    K_CapsLock: "cpslk",
    K_F1: "F1",
    K_F2: "F2",
    K_F3: "F3",
    K_F4: "F4",
    K_F5: "F5",
    K_F6: "F6",
    K_F7: "F7",
    K_F8: "F8",
    K_F9: "F9",
    K_F10: "F10",
    K_F11: "F11",
    K_F12: "F12",
    K_PrintScreen: "prtsc",
    K_Insert: "ins",
    K_Home: "home",
    K_PageUp: "pgup",
    K_Delete: "del",
    K_End: "end",
    K_PageDn: "pgdn",
    K_RightArrow: "\u2192",
    K_LeftArrow: "\u2190",
    K_DownArrow: "\u2193",
    K_UpArrow: "\u2191",
    K_KatakanaHiragana: "\u304B\u306A",
    K_Henkan: "\u5909\u63DB",
    K_Muhenkan: "\u7121\u5909",
    K_Exclamation: "!",
    K_AtMark: "@",
    K_Semicolon: ";",
    K_Colon: ":",
    K_Plus: "+",
    K_Asterisk: "*",
    K_Comma: ",",
    K_Dot: ".",
    K_Question: "?",
    K_Minus: "-",
    K_Underscore: "_",
    K_BackSlash: "\\",
    K_Yen: "\xA5",
    K_DoubleQuote: '"',
    K_Sharp: "#",
    K_Dollar: "$",
    K_Percent: "%",
    K_Ampersand: "&",
    K_SingleQuote: "'",
    K_LeftParenthesis: "(",
    K_RightParenthesis: ")",
    K_Equal: "=",
    K_Hat: "^",
    K_Tilde: "~",
    K_VerticalBar: "|",
    K_BackQuote: "`",
    K_LeftSquareBracket: "[",
    K_RightSquareBracket: "]",
    K_LeftCurlyBrace: "{",
    K_RightCurlyBrace: "}",
    K_LessThan: "<",
    K_GreaterThan: ">",
    K_Slash: "/",
    K_Ctrl: "ctrl",
    K_Shift: "shift",
    K_Alt: "alt",
    K_Gui: "os",
    K_NN: "NN",
    K_LTU: "LTU",
    K_UU: "UU",
    K_NextDouble: "ND",
    K_PostDouble: "RP",
    K_U0: "U0",
    K_U1: "U1",
    K_U2: "U2",
    K_U3: "U3",
    K_U4: "U4",
    K_U5: "U5",
    K_U6: "U6",
    K_U7: "U7",
    K_U8: "U8",
    K_U9: "U9"
  };

  // src/shared/funcs/Utils.ts
  function flattenArray(arr) {
    const res = [];
    for (const ar of arr) {
      res.push(...ar);
    }
    return res;
  }
  function createDictionaryFromKeyValues(arr) {
    const res = Object.fromEntries(arr);
    return res;
  }
  function convertUndefinedToDefaultValue(value, defaultValue) {
    return value === void 0 ? defaultValue : value;
  }
  var degToRad = (deg) => deg * Math.PI / 180;
  function rotateCoord(p, theta) {
    const tmpX = p.x * Math.cos(theta) - p.y * Math.sin(theta);
    const tmpY = p.x * Math.sin(theta) + p.y * Math.cos(theta);
    p.x = tmpX;
    p.y = tmpY;
  }
  function translateCoord(p, ax, ay) {
    p.x += ax;
    p.y += ay;
  }
  function convertNullToUndefinedRecursive(src) {
    if (src === null) {
      return void 0;
    }
    if (Array.isArray(src)) {
      return src.map(convertNullToUndefinedRecursive);
    } else if (typeof src === "object") {
      const dst = {};
      for (const key in src) {
        dst[key] = convertNullToUndefinedRecursive(src[key]);
      }
      return dst;
    } else {
      return src;
    }
  }

  // src/shared/modules/PlacementUnitHelper.ts
  function getCoordUnitFromUnitSpec(unitSpec) {
    if (unitSpec === "mm") {
      return {mode: "mm"};
    }
    const [p0, p1, p2] = unitSpec.split(" ");
    if (p0 === "KP") {
      const x = p1 && parseFloat(p1) || 19;
      const y = p2 && parseFloat(p2) || x;
      return {mode: "KP", x, y};
    }
    throw new Error("invalid unit spec");
  }
  function getStdKeySize(shapeSpec, sizeUnit) {
    if (shapeSpec.startsWith("std")) {
      const [, p1, p2] = shapeSpec.split(" ");
      const pw = p1 && parseFloat(p1) || void 0;
      const ph = p2 && parseFloat(p2) || void 0;
      if (sizeUnit.mode === "mm") {
        const w = pw || 10;
        const h = ph || pw || 10;
        return [w, h];
      } else if (sizeUnit.mode === "KP") {
        const baseW = sizeUnit.x || 19;
        const baseH = sizeUnit.y || sizeUnit.x || 19;
        const uw = pw || 1;
        const uh = ph || 1;
        return [uw * baseW - 1, uh * baseH - 1];
      }
    }
    return [18, 18];
  }
  function getKeySize(shapeSpec, sizeUnit) {
    if (shapeSpec === "ext circle") {
      return [18, 18];
    } else if (shapeSpec === "ext isoEnter") {
      return [27, 37];
    }
    return getStdKeySize(shapeSpec, sizeUnit);
  }

  // src/shared/modules/DisplayKeyboardDesignLoader.ts
  var DisplayKeyboardDesignLoader;
  (function(DisplayKeyboardDesignLoader2) {
    function transformOutlineShape(shape, isMirror, design) {
      const mi = isMirror ? -1 : 1;
      const groupIndex = convertUndefinedToDefaultValue(shape.groupIndex, -1);
      const {groupX, groupY, groupAngle} = getGroupTransAmount(design.transformationGroups[groupIndex]);
      const groupRot = degToRad(groupAngle);
      const points = shape.points.map((p0) => {
        const p = {x: p0.x * mi, y: p0.y};
        rotateCoord(p, groupRot * mi);
        translateCoord(p, groupX * mi, groupY);
        return p;
      });
      return {
        points
      };
    }
    function getGroupTransAmount(group) {
      const groupX = group?.x || 0;
      const groupY = group?.y || 0;
      const groupAngle = group?.angle || 0;
      return {groupX, groupY, groupAngle};
    }
    const isoEnterPathPoints = [
      [-16.125, -18.5],
      [-16.125, -0.5],
      [-11.375, -0.5],
      [-11.375, 18.5],
      [11.375, 18.5],
      [11.375, -18.5]
    ];
    function getKeyShape(shapeSpec, sizeUnit) {
      if (shapeSpec === "ext circle") {
        return {type: "circle", radius: 9};
      } else if (shapeSpec === "ext isoEnter") {
        return {
          type: "polygon",
          points: isoEnterPathPoints.map(([x, y]) => ({x, y}))
        };
      }
      const [w, h] = getStdKeySize(shapeSpec, sizeUnit);
      return {
        type: "rect",
        width: w,
        height: h
      };
    }
    function transformKeyEntity(ke, mke, coordUnit, sizeUnit, design) {
      const isMirror = !!mke;
      const mi = isMirror ? -1 : 1;
      const keyX = coordUnit.mode === "KP" ? ke.x * coordUnit.x : ke.x;
      const keyY = coordUnit.mode === "KP" ? ke.y * coordUnit.y : ke.y;
      const keyAngle = convertUndefinedToDefaultValue(ke.angle, 0);
      const keyShape = convertUndefinedToDefaultValue(ke.shape, "std 1");
      const keyGroupIndex = convertUndefinedToDefaultValue(ke.groupIndex, -1);
      const {groupX, groupY, groupAngle} = getGroupTransAmount(design.transformationGroups[keyGroupIndex]);
      const groupRot = degToRad(groupAngle);
      const {placementAnchor} = design.setup;
      const [w, h] = getKeySize(keyShape, sizeUnit);
      const p = {x: 0, y: 0};
      if (placementAnchor === "topLeft") {
        translateCoord(p, w / 2 + 0.5, h / 2 + 0.5);
      }
      translateCoord(p, keyX * mi, keyY);
      rotateCoord(p, groupRot * mi);
      translateCoord(p, groupX * mi, groupY);
      return {
        keyId: mke ? mke.keyId : ke.keyId,
        x: p.x,
        y: p.y,
        angle: (keyAngle + groupAngle) * mi,
        keyIndex: convertUndefinedToDefaultValue(mke ? mke.keyIndex : ke.keyIndex, -1),
        shapeSpec: keyShape,
        shape: getKeyShape(keyShape, sizeUnit)
      };
    }
    function getBoundingBox(keyEntities, outlineShapes) {
      const xs = [];
      const ys = [];
      keyEntities.forEach((ke) => {
        const {shape} = ke;
        if (shape.type === "circle") {
          xs.push(ke.x - shape.radius);
          xs.push(ke.x + shape.radius);
          ys.push(ke.y - shape.radius);
          ys.push(ke.y + shape.radius);
        }
        if (shape.type === "rect") {
          const keyX = ke.x;
          const keyY = ke.y;
          const keyRot = degToRad(ke.angle);
          const hw = shape.width / 2;
          const hh = shape.height / 2;
          const points = [
            [-hw, -hh],
            [-hw, hh],
            [hw, -hh],
            [hw, hh]
          ];
          points.forEach(([px, py]) => {
            const p = {x: px, y: py};
            rotateCoord(p, keyRot);
            translateCoord(p, keyX, keyY);
            xs.push(p.x);
            ys.push(p.y);
          });
        }
        if (shape.type === "polygon") {
          const keyX = ke.x;
          const keyY = ke.y;
          const keyRot = degToRad(ke.angle);
          shape.points.forEach((p0) => {
            const p = {x: p0.x, y: p0.y};
            rotateCoord(p, keyRot);
            translateCoord(p, keyX, keyY);
            xs.push(p.x);
            ys.push(p.y);
          });
        }
      });
      outlineShapes.forEach((shape) => {
        shape.points.forEach((p) => {
          xs.push(p.x);
          ys.push(p.y);
        });
      });
      if (xs.length === 0 || ys.length === 0) {
        xs.push(-80);
        xs.push(80);
        ys.push(-60);
        ys.push(60);
      }
      const left = Math.min(...xs);
      const right = Math.max(...xs);
      const top = Math.min(...ys);
      const bottom = Math.max(...ys);
      return {
        centerX: (left + right) / 2,
        centerY: (top + bottom) / 2,
        width: right - left,
        height: bottom - top
      };
    }
    function getJoinedIfCenterEdgeSharedForMirrorShape(shape, group) {
      if (group.angle === 0 && group.x === 0) {
        const {points} = shape;
        const sharedEdgePointIndex = points.findIndex((point, idx) => {
          const nextPoint = points[(idx + 1) % points.length];
          return point.x === 0 && nextPoint.x === 0;
        });
        if (sharedEdgePointIndex !== -1) {
          const sortedPoints = points.map((_, idx) => points[(sharedEdgePointIndex + 1 + idx) % points.length]);
          const altSidePoints = sortedPoints.slice().reverse().slice(1, sortedPoints.length - 1).map((p) => ({x: -p.x, y: p.y}));
          const newPoints = [...sortedPoints, ...altSidePoints];
          return {
            groupIndex: shape.groupIndex,
            points: newPoints
          };
        }
      }
      return void 0;
    }
    function loadDisplayKeyboardDesign(design) {
      const coordUnit = getCoordUnitFromUnitSpec(design.setup.placementUnit);
      const sizeUnit = getCoordUnitFromUnitSpec(design.setup.keySizeUnit);
      const keyEntities = flattenArray(design.keyEntities.map((ke) => {
        if ("mirrorOf" in ke) {
          return [];
        } else {
          const groupIndex = convertUndefinedToDefaultValue(ke.groupIndex, -1);
          const group = design.transformationGroups[groupIndex];
          if (group?.mirror) {
            const mke = design.keyEntities.find((k) => "mirrorOf" in k && k.mirrorOf === ke.keyId);
            return [
              transformKeyEntity(ke, void 0, coordUnit, sizeUnit, design),
              transformKeyEntity(ke, mke, coordUnit, sizeUnit, design)
            ];
          } else {
            return [
              transformKeyEntity(ke, void 0, coordUnit, sizeUnit, design)
            ];
          }
        }
      }));
      const outlineShapes = flattenArray(design.outlineShapes.map((shape) => {
        if (shape.points.length < 3) {
          return [];
        }
        const groupIndex = convertUndefinedToDefaultValue(shape.groupIndex, -1);
        const group = design.transformationGroups[groupIndex];
        if (group?.mirror) {
          const joinedShape = getJoinedIfCenterEdgeSharedForMirrorShape(shape, group);
          if (joinedShape) {
            return [transformOutlineShape(joinedShape, false, design)];
          }
          return [
            transformOutlineShape(shape, false, design),
            transformOutlineShape(shape, true, design)
          ];
        } else {
          return [transformOutlineShape(shape, false, design)];
        }
      }));
      const boundingBox = getBoundingBox(keyEntities, outlineShapes);
      return {
        keyEntities,
        outlineShapes,
        displayArea: boundingBox
      };
    }
    DisplayKeyboardDesignLoader2.loadDisplayKeyboardDesign = loadDisplayKeyboardDesign;
  })(DisplayKeyboardDesignLoader || (DisplayKeyboardDesignLoader = {}));

  // src/shell/loaders/ProfileDataConverter.ts
  var ProfileDataConverter;
  (function(ProfileDataConverter2) {
    function convertAssignsArrayToDictionary(assigns) {
      return createDictionaryFromKeyValues(assigns.map((assign) => {
        const {layerId, keyId, usage} = assign;
        const address = `${layerId}.${keyId}`;
        return [address, usage];
      }));
    }
    ProfileDataConverter2.convertAssignsArrayToDictionary = convertAssignsArrayToDictionary;
    function convertAssingsDictionaryToArray(assigns) {
      return Object.keys(assigns).map((address) => {
        const [layerId, keyId] = address.split(".");
        const usage = assigns[address];
        return {
          layerId,
          keyId,
          usage
        };
      });
    }
    ProfileDataConverter2.convertAssingsDictionaryToArray = convertAssingsDictionaryToArray;
    function convertProfileDataToPersist(source) {
      return {
        formatRevision: profileFormatRevisionLatest,
        projectId: source.projectId,
        keyboardDesign: source.keyboardDesign,
        settings: source.settings,
        layers: source.layers,
        assigns: convertAssingsDictionaryToArray(source.assigns),
        mappingEntries: source.mappingEntries
      };
    }
    ProfileDataConverter2.convertProfileDataToPersist = convertProfileDataToPersist;
    function convertProfileDataFromPersist(source) {
      return {
        projectId: source.projectId,
        keyboardDesign: source.keyboardDesign,
        settings: source.settings,
        layers: source.layers,
        assigns: convertAssignsArrayToDictionary(source.assigns),
        mappingEntries: source.mappingEntries
      };
    }
    ProfileDataConverter2.convertProfileDataFromPersist = convertProfileDataFromPersist;
  })(ProfileDataConverter || (ProfileDataConverter = {}));

  // src/shell/loaders/LayoutDataMigrator.ts
  var LayoutDataMigrator;
  (function(LayoutDataMigrator2) {
    function patchOldFormatLayoutData(layout) {
      if (!layout.formatRevision) {
        throw new Error("layout file format too old");
      }
      if (layout.formatRevision === "LA00") {
        layout.formatRevision = "LA01";
        if (layout.setup.keySizeUnit === "KP") {
          if (layout.setup.placementUnit.startsWith("KP")) {
            layout.setup.keySizeUnit = layout.setup.placementUnit;
          } else {
            layout.setup.keySizeUnit = "KP 19";
          }
        }
      }
    }
    LayoutDataMigrator2.patchOldFormatLayoutData = patchOldFormatLayoutData;
  })(LayoutDataMigrator || (LayoutDataMigrator = {}));

  // src/shell/loaders/ProfileDataMigrator.ts
  var ProfileDataMigrator;
  (function(ProfileDataMigrator2) {
    function fixProfileDataPRF03toPRF04(profile) {
      console.log(`PRF03 --> PRF04`);
      const _profile = profile;
      _profile.formatRevision = "PRF04";
      if (!_profile.settings.assignType && _profile.assignType) {
        _profile.settings.assignType = _profile.assignType;
      }
      LayoutDataMigrator.patchOldFormatLayoutData(profile.keyboardDesign);
      if (!Array.isArray(profile.assigns)) {
        profile.assigns = ProfileDataConverter.convertAssingsDictionaryToArray(profile.assigns);
      }
    }
    function fixProfileDataPRF04toPRF05(profile) {
      console.log(`PRF04 --> PRF05`);
      profile.formatRevision = "PRF05";
      profile.mappingEntries = [];
    }
    function fixProfileData(profile) {
      if (!profile.formatRevision) {
        throw new Error("profile file format too old");
      }
      if (profile.formatRevision === "PRF03") {
        fixProfileDataPRF03toPRF04(profile);
      }
      if (profile.formatRevision === "PRF04") {
        fixProfileDataPRF04toPRF05(profile);
      }
      return profile;
    }
    ProfileDataMigrator2.fixProfileData = fixProfileData;
  })(ProfileDataMigrator || (ProfileDataMigrator = {}));

  // src/ui/common-svg/keyUnitCardModels/KeyUnitCardViewModelCommon.ts
  function getAssignOperationText(op, layers) {
    if (op?.type === "keyInput") {
      const keyText = VirtualKeyTexts[op.virtualKey] || "";
      if (op.attachedModifiers) {
        const modText = op.attachedModifiers.map((m) => VirtualKeyTexts[m]?.charAt(0)).join("+");
        return `${modText}+${keyText}`;
      }
      return keyText;
    }
    if (op?.type === "layerClearExclusive") {
      return "ex-clear";
    }
    if (op?.type === "layerCall") {
      const layer = layers.find((la) => la.layerId === op.targetLayerId);
      if (layer && op.invocationMode === "turnOff") {
        return layer.layerName + "-off";
      }
      return layer?.layerName || "";
    }
    if (op?.type === "modifierCall") {
      return VirtualKeyTexts[op.modifierKey] || "";
    }
    if (op?.type === "systemAction") {
      return systemActionToLabelTextMap[op.action] || "";
    }
    return "";
  }
  function getAssignEntryTexts(assign, layers) {
    if (assign) {
      if (assign.type === "block" || assign.type === "layerFallbackBlock") {
        return {
          primaryText: "\u25A1",
          secondaryText: "",
          isLayerFallback: assign.type === "layerFallbackBlock"
        };
      }
      if (assign.type === "transparent" || assign.type === "layerFallbackTransparent") {
        return {
          primaryText: "\u21A1",
          secondaryText: "",
          isLayerFallback: assign.type === "layerFallbackTransparent"
        };
      }
      if (assign.type === "single") {
        return {
          primaryText: getAssignOperationText(assign.op, layers),
          secondaryText: "",
          isLayerFallback: false
        };
      }
      if (assign.type === "dual") {
        const prmText = getAssignOperationText(assign.primaryOp, layers);
        const secText = getAssignOperationText(assign.secondaryOp, layers);
        const terText = getAssignOperationText(assign.tertiaryOp, layers);
        if (assign.tertiaryOp) {
          return {
            primaryText: `${prmText} ${terText}`,
            secondaryText: secText,
            isLayerFallback: false
          };
        } else {
          return {
            primaryText: prmText,
            secondaryText: secText,
            isLayerFallback: false
          };
        }
      }
    }
    return {
      primaryText: "",
      secondaryText: "",
      isLayerFallback: false
    };
  }
  function getAssignForKeyUnitWithLayerFallback(keyUnitId, layerId, layers, assigns) {
    const assign = assigns[`${layerId}.${keyUnitId}`];
    if (!assign) {
      const layer = layers.find((la) => la.layerId === layerId);
      const defaultScheme = layer?.defaultScheme;
      if (defaultScheme === "transparent") {
        return {type: "layerFallbackTransparent"};
      }
      if (defaultScheme === "block") {
        return {type: "layerFallbackBlock"};
      }
    }
    return assign;
  }

  // src/outward/kermite_core_functions.ts
  function createKeyUnitTextDisplayModel(ke, targetLayerId, layers, assigns) {
    const keyId = ke.keyId;
    const assign = getAssignForKeyUnitWithLayerFallback(keyId, targetLayerId, layers, assigns);
    const {primaryText, secondaryText, isLayerFallback} = getAssignEntryTexts(assign, layers);
    return {
      primaryText,
      secondaryText,
      isLayerFallback
    };
  }
  function createProfileLayersDisplayModel(sourcePersistProfileData) {
    const nullReplaced = convertNullToUndefinedRecursive(sourcePersistProfileData);
    const formatFixed = ProfileDataMigrator.fixProfileData(nullReplaced);
    const profileData = ProfileDataConverter.convertProfileDataFromPersist(formatFixed);
    const keyboardDesign = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(profileData.keyboardDesign);
    const keyUnits = keyboardDesign.keyEntities.map((ke) => ({
      keyId: ke.keyId,
      x: ke.x,
      y: ke.y,
      angle: ke.angle || 0,
      shape: ke.shape
    }));
    const {layers, assigns} = profileData;
    const outLayers = layers.map((la) => ({
      layerId: la.layerId,
      layerName: la.layerName
    }));
    const layerKeyUnitTexts = createDictionaryFromKeyValues(layers.map((la) => {
      const keyUnitTextDisplayModelsDict = createDictionaryFromKeyValues(keyboardDesign.keyEntities.map((ke) => {
        const textDispalyModel = createKeyUnitTextDisplayModel(ke, la.layerId, layers, assigns);
        return [ke.keyId, textDispalyModel];
      }));
      return [la.layerId, keyUnitTextDisplayModelsDict];
    }));
    const completedKeyUnitTexts = layerKeyUnitTexts.la0;
    return {
      displayArea: keyboardDesign.displayArea,
      outlineShapes: keyboardDesign.outlineShapes,
      layers: outLayers,
      keyUnits,
      layerKeyUnitTexts,
      completedKeyUnitTexts
    };
  }
  window.KermiteCoreFunctions = {
    createProfileLayersDisplayModel
  };
})();
