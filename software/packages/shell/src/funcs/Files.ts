import fs from 'fs';
import * as path from 'path';

export const pathJoin = path.join;

export const pathResolve = path.resolve;

export const pathRelative = path.relative;

export const pathDirname = path.dirname;

export const pathBasename = path.basename;

export const pathExtname = path.extname;

export const fsWatch = fs.watch;

export const fsReadFileSync = fs.readFileSync;

export const fsWriteFileSync = fs.writeFileSync;

export const fsReaddirSync = fs.readdirSync;

export const fsLstatSync = fs.lstatSync;
