const http = require('http');
const { handleRequest } = require('./router');

const PORT = 3000;

http.createServer(handleRequest).listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
