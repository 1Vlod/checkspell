export interface ISpellerInstance {
  code: number;
  pos: number;
  row: number;
  col: number;
  len: number;
  word: string;
  s?: string[] | string;
}

export type IResponse = ISpellerInstance[][];
