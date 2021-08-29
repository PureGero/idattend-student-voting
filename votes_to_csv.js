/*
 * Dump the votes into a csv file with the results
 */

const config = require('./config.js');
const database = require('./database.js');
const fsPromises = require('fs').promises;
const path = require('path');
const sql = require('mssql');

module.exports = async () => {
  const csv = await votesToCsv();
  
  await fsPromises.writeFile(path.join(__dirname, 'votes.csv'), csv, 'utf8');

  console.log('The vote results csv has been written to: votes.csv');
};

const votesToCsv = module.exports.votesToCsv = async () => {
  const pool = await database();

  const files = await fsPromises.readdir(path.join(__dirname, 'votes'));
  const votes = {};

  await Promise.all(files.map(async file => {
    if (!file.endsWith('.json')) return;
    try {
      const data = await fsPromises.readFile(path.join(__dirname, 'votes', file), 'utf8');
      const json = JSON.parse(data);

      let weighting = 1;

      const result = await pool.request()
        .input('param', sql.VarChar(200), json.username)
        .query(config.teacherQuery(config.tableTeachers));
      if (result.recordset.length) {
        weighting = config.teacherVoteWeighting;
      }

      for (let i = 0; i < json.votes.length; i ++) {
        const student = json.votes[i];
        if (!votes[student]) votes[student] = 0;
        votes[student] += (config.basePoints + i + 1) * weighting;
      }
    } catch (e) {
      console.error('Error while reading', file);
      console.error(e);
    }
  }));

  const csv = Object.entries(votes)
                    .sort((a, b) => b[1] - a[1])
                    .map(a => a.join(','))
                    .join('\n');

  return csv;
}