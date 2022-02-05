import { run } from './helpers/request';
import { createServer } from 'http';
import { SpellerCheck } from './helpers/spellerStream';

const SERVER_PORT = 8080;
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

  try {
    const transform = new SpellerCheck();
    req.pipe(transform).pipe(res);
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

server.listen(SERVER_PORT, () => {
  // if (!existsSync(UPLOADS_DIR_NAME)) {
  //   mkdirSync(UPLOADS_DIR_NAME);
  // }
  console.log(`Server started on ${SERVER_PORT} port`);
});

process.on('SIGINT', () => {
  process.exit(0);
});
