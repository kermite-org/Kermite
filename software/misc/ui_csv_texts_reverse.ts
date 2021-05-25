// npx ts-node ui_csv_texts_reverse.ts

import * as fs from 'fs';
import { uniqueArrayItems } from '../src/shared/funcs/Utils';
import {
  textSourceEnglish,
  textSourceJapanese,
} from '../src/ui/common/base/UiTextData';

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
const rows = lines.map((line) => line.split(';'));

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

const reversedCsv = rows.map((row) => row.join(';')).join('\n');

// console.log(reversedCsv);

fs.writeFileSync('ui_texts.csv', reversedCsv, { encoding: 'utf-8' });

console.log('done');
