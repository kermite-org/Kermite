type TLogColor =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white';

const LogColorTable: { [color in TLogColor]: string } = {
  black: '\u001b[30m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  magenta: '\u001b[35m',
  cyan: '\u001b[36m',
  white: '\u001b[37m',
};
const resetCode = '\u001b[0m';

export function coloredLog(text: string, color: TLogColor) {
  console.log(`${LogColorTable[color]}${text}${resetCode}`);
}
