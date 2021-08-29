const cluster = require('cluster');
const config = require('./config.js');
const crypto = require('crypto');
const os = require('os');

require('log-timestamp')(() => `[${new Date().toISOString().split('T')[1].split('.')[0]}] %s`);

// Constants
const NODES = os.cpus().length;

if (cluster.isMaster) {
  // Master loads the database data then begins the slaves
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
      const teachers = await require('./teachers.js')();
      const candidates = await require('./candidates.js')();

      let students = null;
      if (config.restrictToYearLevel) {
        students = await require('./students.js')(config.restrictToYearLevel);
      }

      if (!process.env.LOGIN_SECRET) {
        process.env.LOGIN_SECRET = crypto.randomBytes(16).toString('hex');
      }

      if (NODES == 1) {
        console.log('Starting web server in single process mode');
        require('./server.js')(config.port, process.env.LOGIN_SECRET, candidates, teachers, students);
      } else {
        cluster.on('fork', worker => {
          worker.send({ teachers, candidates, students });
        });

        cluster.on('exit', (worker, code, signal) => {
          console.log(`worker ${worker.process.pid} died, restarting it`);
          cluster.fork();
        });

        console.log(`Starting ${NODES} workers`);
        [...new Array(NODES)].forEach(() => cluster.fork());
      }

      console.log(`Voters can access the webpage at http://${os.hostname}${config.port == 80 ? '' : `:${config.port}`}/`);
    } catch (e) {
      console.error();
      console.error(`Error: ${e}`);
      process.exit(1);
    }
  })();
} else {
  // Slaves run the http server
  process.on('message', message => {
    if (message.candidates) {
      require('./server.js')(config.port, process.env.LOGIN_SECRET, message.candidates, message.teachers, message.students);
    }
  });
}
