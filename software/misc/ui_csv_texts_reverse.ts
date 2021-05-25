// npx ts-node ui_csv_texts_reverse.ts

import * as fs from 'fs';
import { uniqueArrayItems } from '../src/shared/funcs/Utils';
import {
  textSourceEnglish,
  textSourceJapanese,
} from '../src/ui/common/base/UiTextData';

function splitRowText(line: string) {
  // "“と”"で囲まれる','を$__COMMA__に一旦退避して、その後','で行を分割し、分割して得た要素それぞれを再度もとの','に戻す
  const line1 = line.replace(/"“(.*?)”"/g, (m, p1) => {
    return p1.replace(',', '$__COMMA__');
  });
  const cellTexts = line1.split(',');
  return cellTexts.map((text) => text.replace('$__COMMA__', ','));
}

function quoteIfIncludesComma(text: string) {
  if (text.includes(',')) {
    return `"“${text}”"`;
  } else {
    return text;
  }
}

const keys = uniqueArrayItems([
  ...Object.keys(textSourceEnglish),
  ...Object.keys(textSourceJapanese),
]);

const sourceDefs = keys.map((key) => {
  const us = (textSourceEnglish as any)[key];
  const ja = (textSourceJapanese as any)[key];
  return { key, us, ja };
});

const csvText = fs.readFileSync('ui_texts.csv', { encoding: 'utf-8' });
const lines = csvText.split(/\r?\n/);
const rows = lines.map((line) => splitRowText(line));

sourceDefs.forEach((sd, index) => {
  const row = rows.find((lc) => lc[0] === sd.key);
  if (row) {
    row[1] = sd.us;
    row[2] = sd.ja;
  } else {
    let inserted = false;
    const prevSourceDef = sourceDefs[index - 1];
    if (prevSourceDef) {
      const prevLineIndex = rows.findIndex((lc) => lc[0] === prevSourceDef.key);
      if (prevLineIndex !== -1) {
        rows.splice(prevLineIndex + 1, 0, [sd.key, sd.us, sd.ja]);
        inserted = true;
      }
    }
    if (!inserted) {
      rows.push([sd.key, sd.us, sd.ja]);
    }
  }
});

const reversedCsv = rows
  .map((row) => row.map(quoteIfIncludesComma).join(','))
  .join('\n');

// console.log(reversedCsv);

fs.writeFileSync('ui_texts.csv', reversedCsv, { encoding: 'utf-8' });

console.log('done');
