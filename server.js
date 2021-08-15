/*
 * HTTP server to serve the voting website
 */

const cookieEncrypter = require('cookie-encrypter');
const express = require('express');
const fsPromises = require('fs').promises;
const login = require('./login.js');
const path = require('path');

const app = express();
let students;

app.use(express.static(path.join(__dirname, 'html')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(express.json());

app.post('/login', async (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).send({ error: 'Please enter a username and password' });
  }

  const username = req.body.username.toLowerCase();
  const password = req.body.password;

  const groups = await login(username, password);

  if (groups) {
    const token = {
      username,
      isWeightedVote: groups.toString().toLowerCase().indexOf('staff') >= 0
    };
    const loginToken = cookieEncrypter.encryptCookie(JSON.stringify(token), { key: process.env.LOGIN_SECRET });
    res.status(200).send({ success: 1, candidates: students, loginToken });
  } else {
    res.status(400).send({ error: 'Invalid username/password' });
  }
});

app.post('/submitVotes', async (req, res) => {
  if (!req.body || !req.body.loginToken || !req.body.votes) {
    return res.status(400).send({ error: 'Missing parameters' });
  }

  let token;

  try {
    token = JSON.parse(cookieEncrypter.decryptCookie(req.body.loginToken, { key: process.env.LOGIN_SECRET }));
  } catch (e) {
    return res.status(400).send({ error: 'Invalid login token - refresh the page and try again' });
  }

  if (!token.username) {
    return res.status(400).send({ error: 'Missing username' });
  }

  for (let i = 0; i < 10; i++) {
    if (!req.body.votes.length || req.body.votes.length > 10 || !req.body.votes[i]) {
      return res.status(400).send({ error: 'Vote one person for each number between 1 and 10' });
    }
  }

  await fsPromises.access(path.join(__dirname, 'votes')).catch(error =>
    fsPromises.mkdir(path.join(__dirname, 'votes'))
  );

  await fsPromises.writeFile(path.join(__dirname, 'votes', `${token.username}.json`), JSON.stringify({
    username: token.username,
    isWeightedVote: token.isWeightedVote,
    votes: req.body.votes
  }), 'utf8');

  res.status(200).send({ success: 1 });
});

module.exports = port => {
  students = JSON.parse(process.env.students);

  app.listen(port);
};