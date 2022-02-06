import { createServer } from 'http';
import { pipeline } from 'stream';

import config from '../config.json';
import { SpellerCheck } from './helpers/spellerStream';

const server = createServer((req, res) => {
  console.log('req.url:', req.url);
  console.log('req.method:', req.method);
  if (req.url !== '/check' || req.method !== 'POST') {
    res.statusCode = 404;
    res.end(
      JSON.stringify({
        statusCode: 404,
        error: 'Not Found',
        message: 'Not Found',
      })
    );
    return;
  }

  const spellerCheckStream = new SpellerCheck();
  try {
    pipeline(req, spellerCheckStream, res, (err) => {
      if (err) {
        console.log('pipeline error: ', err);
        throw err;
      }
      console.log('Pipeline succeed');
    });
    return;
  } catch (error) {
    console.log('error', error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        statusCode: 500,
        error: 'Internal server error',
        message: JSON.stringify(error),
      })
    );
  }
});

server.listen(config.SERVER_PORT, () => {
  console.log(`Server started on ${config.SERVER_PORT} port`);
});

process.on('SIGINT', () => {
  process.exit(0);
});
