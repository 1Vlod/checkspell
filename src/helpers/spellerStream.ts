import { Transform, TransformCallback } from 'stream';

export class SpellerCheck extends Transform {
  _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    const data = chunk.toString();
    console.log('data', data);
    callback(null, data + 1);
  }
}
