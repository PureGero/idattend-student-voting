const cluster = require('cluster');
const config = require('./config.js');
const crypto = require('crypto');
const os = require('os');

// Constants
const PORT = 80;
const NODES = os.cpus().length;

if (cluster.isMaster) {
  // Master loads the students then begins the slaves
  (async () => {
    // Parse arguments
    const argv = require('minimist')(process.argv.slice(2));
    if (argv.csv) {
      return await require('./votes_to_csv.js')();
    } else if (Object.keys(argv).length != 1) {
      console.log('usage: node . [--csv]');
      process.exit(1);
    }
    
    try {
      const students = await require('./students.js')();
      process.env.students = JSON.stringify(students);

      if (!process.env.LOGIN_SECRET) {
        process.env.LOGIN_SECRET = crypto.randomBytes(16).toString('hex');
      }

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
  // Slaves run the http server
  require('./server.js')(PORT, process.env.LOGIN_SECRET, JSON.parse(process.env.students));
}
