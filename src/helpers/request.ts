import { request } from 'https';

const promiseRequest = (reqOptions: any) => {
  const options = {
    method: reqOptions.method,
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Length': Buffer.byteLength(body),
    },
  };

  let url: URL;
  try {
    url = new URL(reqOptions.url);
  } catch (err) {
    throw err;
  }

  return new Promise((resolve, reject) => {
    const req = request(url, options, (res) => {
      let result = '';
      let count = 0;
      res.on('data', (chunk: Buffer) => {
        console.log('count', count++);
        result += chunk.toString();
      });
      res.on('end', () => {
        resolve(result);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    // req.write(body);
    req.end();
  });
};

export const run = async () => {
  try {
    const result = await promiseRequest({
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
    });
    console.log('result after await: ', result);
  } catch (error) {
    console.log('err in await: ', error);
  }
};
