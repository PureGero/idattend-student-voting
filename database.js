/*
 * Create an mssql connection
 */

const config = require('./config.js');
const optimist = require('optimist');
const prompt = require('prompt');
const sql = require('mssql');

prompt.override = optimist.argv;

const properties = [
  {
    name: 'username'
  },
  {
    name: 'password',
    hidden: true
  }
];

prompt.start();

module.exports = () => new Promise((resolve, reject) => {
  prompt.get(properties, async (err, prompts) => {
    if (err) reject(err);

    const sqlConfig = {
      user: prompts.username,
      password: prompts.password,
      database: config.database,
      server: config.server,
      domain: config.domain,
      options: {
        encrypt: true, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
      }
    }

    try {
      console.log(`Connecting to database ${sqlConfig.database} on ${sqlConfig.server} with username ${sqlConfig.user}`);
      resolve(await sql.connect(sqlConfig));
    } catch (e) {
      reject(e);
    }
  });
});
