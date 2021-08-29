/*
 * Resolve candidate students from an mssql database
 */

const config = require('./config.js');
const database = require('./database.js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const sql = require('mssql');

async function mapCandidates(candidates) {
  // Reduce candidates to only what's needed
  candidates = candidates.map(student => ({
    name: `${student.PreferredName || student.FirstName} ${student.PreferredLastName || student.LastName}`,
    id: student.ID
  }));

  // Create candidates' photos folder
  if (!fs.existsSync(path.join(__dirname, 'photos'))) {
    fs.mkdirSync(path.join(__dirname, 'photos'), { recursive: true });
  }

  // Download the candidates' photos
  console.log(`Downloading candidate photos from ${config.photoUrl('{STUDENT_ID}')}`);
  await Promise.all(candidates.map(student => fetch(config.photoUrl(student.id)).then(res => {
    const dest = fs.createWriteStream(path.join(__dirname, `photos/${student.id}.jpg`));
    res.body.pipe(dest);
  }).catch(console.error)));

  return candidates;
}

module.exports = async () => {
  const pool = await database();

  const candidates = await Promise.all(config.candidates.map(async student => {
    const result = await pool.request()
      .input('param', sql.VarChar(200), student)
      .query(config.studentQuery(config.table));
    if (result.recordset.length == 0) {
      console.log(`No student matching ${student}`);
      return;
    }
    if (result.recordset.length > 1) {
      console.log(`Multiple candidates matching ${student}:`);
      result.recordset.forEach(record => console.log(`  ${record.ID} ${record.PreferredName} ${record.PreferredLastName} (${record.MISID})`));
      return;
    }
    return result.recordset[0];
  }));

  if (candidates.includes()) {
    return reject('Could not find all candidates.\nPlease fix these candidates in config.js then try again.');
  }

  return await mapCandidates(candidates);
};