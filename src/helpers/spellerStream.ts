import { Transform, TransformCallback } from 'stream';

import config from '../../config.json';
import { MAX_URL_NUMBER, QUERY_META_LENGTH } from '../constants';
import { ISpellerInstance } from '../interfaces';
import { promiseRequest } from './request';

export class SpellerCheck extends Transform {
  async _transform(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: TransformCallback
  ) {
    try {
      const data = chunk.toString().split('\n');
      const url = new URL(config.url);
      const result = [];

      let urlLength = url.href.length;
      let dataInd = 0;

      for (const [lineInd, line] of data.entries()) {
        if (this.needToSendReq(line, urlLength)) {
          const correctedText = await correctText(
            url,
            data.slice(dataInd, lineInd)
          );

          dataInd = lineInd;
          result.push(...correctedText);

          url.searchParams.delete('text');
        }
        url.searchParams.append('text', line);
        urlLength = url.href.length;
      }
      const correctedText = await correctText(url, data.slice(dataInd));
      result.push(...correctedText);

      callback(null, result.join('\n'));
    } catch (error) {
      callback(error as Error);
    }
  }

  private needToSendReq(line: string, urlLength: number) {
    return line.length + urlLength + QUERY_META_LENGTH > MAX_URL_NUMBER;
  }
}

const correctText = async (url: URL, data: string[]) => {
  const result = [];
  const response = await promiseRequest({ method: 'GET', url });
  for (let i = 0; i < response.length; i++) {
    const line = data[i];
    const correctedLine = correctLine(response[i], line);

    if (correctedLine.length) {
      const fixedJoinedLine = correctedLine.join('');
      if (correctedLine.length >= line.length) {
        result.push(fixedJoinedLine);
      } else {
        result.push(fixedJoinedLine + ' ' + line.slice(fixedJoinedLine.length));
      }
    } else {
      result.push(line);
    }
  }
  return result;
};

const correctLine = (fixedLine: ISpellerInstance[], originLine: string) => {
  let startPosition = 0;
  return fixedLine.map((elem) => {
    if (elem.pos === 0) {
      startPosition = elem.len;
      if (elem.s?.length) {
        return typeof elem.s === 'string' ? elem.s : elem.s[0];
      }
      return elem.word;
    }

    if (startPosition === elem.pos) {
      startPosition += elem.len;
      if (elem.s?.length) {
        return typeof elem.s === 'string' ? elem.s : elem.s[0];
      }
      return elem.word;
    }

    let resp = originLine.slice(startPosition, elem.pos);
    startPosition = elem.pos + elem.len;
    if (elem.s?.length) {
      return typeof elem.s === 'string' ? resp + elem.s : resp + elem.s[0];
    }

    return resp + elem.word;
  });
};
