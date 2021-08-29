/*
 * Dump the votes into a csv file with the results
 */

const config = require('./config.js');
const fsPromises = require('fs').promises;
const path = require('path');

module.exports = async (votesDir) => {
  const csv = await votesToCsv(votesDir);
  
  await fsPromises.writeFile(path.join(__dirname, 'votes_non_weighted_only.csv'), csv, 'utf8');
};

const votesToCsv = module.exports.votesToCsv = async (votesDir) => {
  const files = await fsPromises.readdir(votesDir);
  const votes = {};

  await Promise.all(files.map(async file => {
    if (!file.endsWith('.json')) return;
    try {
      const data = await fsPromises.readFile(path.join(votesDir, file), 'utf8');
      const json = JSON.parse(data);

      if (!json.weightedVote) {
        for (let i = 0; i < json.votes.length; i ++) {
          const student = json.votes[i];
          if (!votes[student]) votes[student] = 0;
          votes[student] += config.basePoints + i + 1;
        }
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