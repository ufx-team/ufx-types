import * as fs from "fs-extra";

export * from 'fs';

export interface DirCopy {
  src: string;
  dist: string;
  encoding?: string;
  ignore?: string[];
  silent?: boolean;
  filenameTransformer?: (name?: string) => string;
}

export interface ufxFs {
  dirCopy(options: DirCopy): void;
  fileCopy(options: DirCopy): void;
  [key: string]: any;
}

export function dirCopy(options: DirCopy): void;
export function fileCopy(options: DirCopy): void;
export function move(oldPath: string, newPath: string): void;
export function remove(file: string): void;
