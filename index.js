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

prompt.get(properties, async (err, prompts) => {
  if (err) throw err;
  const sqlConfig = {
    user: prompts.username,
    password: prompts.password,
    database: config.database,
    server: config.server,
    options: {
      encrypt: true, // for azure
      trustServerCertificate: true // change to true for local dev / self-signed certs
    }
  }
  console.log(`Connecting to database ${sqlConfig.database} on ${sqlConfig.server} with username ${sqlConfig.user}`);
  await sql.connect(sqlConfig);
  const result = await sql.query(`select top 5 * from ${config.table}`);
  console.dir(result);
});