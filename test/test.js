/*
 * High-level test of a user logging in, voting, then getting the results.
 */

const proxyquire = require('proxyquire').noCallThru();
const assert = require('assert');
const fetch = require('node-fetch');
const fs = require('fs');
const mockedMssql = require('./mocked/mssql');
const path = require('path');
const tmp = require('tmp-promise');

const PORT = 25463;

const server = proxyquire('../server.js', {
  './login.js': () => true
});

const votesToCsv = proxyquire('../votes_to_csv.js', {
  './database.js': () => mockedMssql.connect()
});

const candidates = new Array(20).fill().map((value, index) => ({
  name: `F${index} L${index}`,
  id: `${index}`
}));
const votes = new Array(10).fill().map((value, index) => `F${index} L${index},${index}`);

describe('test.js', () => {
  let voteDir;

  before(async () => {
    voteDir = await tmp.dir({ unsafeCleanup: true });
  });

  describe('server.js', () => {
    let loginToken;
    let httpServer;

    before(async () => {
      httpServer = await server(PORT, new Array(32).fill('a').join(''), candidates, {}, null, voteDir.path);
    });

    it('should be able to login', async () => {
      loginToken = await fetch(`http://localhost:${PORT}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'username', password: 'password' })
      })
      .then(response => response.json())
      .then(data => {
        if (data.candidates) {
          return data.loginToken;
        } else {
          throw new Error(data.error || data);
        }
      });
    });

    it('should be able to vote for candidates', async () => {
      return await fetch(`http://localhost:${PORT}/submitVotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginToken,
          votes
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          return true;
        } else {
          throw new Error(data.error || data);
        }
      });
    });

    after(() => {
      httpServer.close();
    });
  });

  describe('votes_to_csv.js', () => {
    it('should dump the correct number of votes in descending order', async () => {
      const expectedCsv = votes.map((candidate, index) => [candidate, index + 1])
                               .sort((a, b) => b[1] - a[1])
                               .map(a => a.join(','))
                               .join('\n');
  
      const csv = await votesToCsv.votesToCsv(voteDir.path);
  
      assert.strictEqual(csv, expectedCsv);
    });
  });

  after(() => {
    voteDir.cleanup();
  });
});