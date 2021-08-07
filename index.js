const cluster = require('cluster');
const config = require('./config.js');
const os = require('os');

const PORT = 80;
const NODES = os.cpus().length;

if (cluster.isMaster) {
  (async () => {
    try {
      const students = await require('./students.js')();
      process.env.students = JSON.stringify(students);

      if (NODES == 1) {
        console.log('Starting web server in single process mode');
        require('./server.js')(PORT);
      } else {
        console.log(`Starting ${NODES} workers`);
        [...new Array(NODES)].forEach(() => cluster.fork());

        cluster.on('exit', (worker, code, signal) => {
          console.log(`worker ${worker.process.pid} died, restarting it`);
          cluster.fork();
        });
      }

      console.log(`Students can access the webpage at http://${os.hostname}${PORT == 80 ? '' : `:${PORT}`}/`);
    } catch (e) {
      console.error();
      console.error(`Error: ${e}`);
      process.exit(1);
    }
  })();
} else {
  require('./server.js')(PORT);
}
