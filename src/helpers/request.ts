import { request } from 'https';
import { IResponse } from '../interfaces';

export const promiseRequest = (reqOptions: {
  method: string;
  url: URL;
}): Promise<IResponse> => {
  const options = {
    method: reqOptions.method,
  };

  return new Promise((resolve, reject) => {
    const req = request(reqOptions.url, options, (res) => {
      if (res.statusCode && (res.statusCode < 200 || res.statusCode > 299)) {
        return reject(new Error(`HTTP status code ${res.statusCode}`));
      }
      let result = '';
      res.on('data', (chunk: Buffer) => {
        result += chunk.toString();
      });
      res.on('end', () => {
        let parsedResult;
        try {
          parsedResult = JSON.parse(result) as IResponse;
          resolve(parsedResult);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });
    req.end();
  });
};
