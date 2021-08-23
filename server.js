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
let loginSecret;

app.use(express.static(path.join(__dirname, 'html')));
app.use('/photos', express.static(path.join(__dirname, 'photos')));

app.use(express.json());

app.post('/login', async (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).send({ error: 'Please enter a username and password' });
  }

  const username = req.body.username.toLowerCase();
  const password = req.body.password;

  if (await login(username, password)) {
    const loginToken = cookieEncrypter.encryptCookie(username, { key: loginSecret });
    res.status(200).send({ success: 1, candidates: students, loginToken });
  } else {
    res.status(400).send({ error: 'Invalid username/password' });
  }
});

app.post('/submitVotes', async (req, res) => {
  if (!req.body || !req.body.loginToken || !req.body.votes) {
    return res.status(400).send({ error: 'Missing parameters' });
  }

  let username;

  try {
    username = cookieEncrypter.decryptCookie(req.body.loginToken, { key: loginSecret });
  } catch (e) {
    return res.status(400).send({ error: 'Invalid login token - refresh the page and try again' });
  }

  if (!username) {
    return res.status(400).send({ error: 'Invalid username token' });
  }

  for (let i = 0; i < 10; i++) {
    if (!req.body.votes.length || req.body.votes.length > 10 || !req.body.votes[i]) {
      return res.status(400).send({ error: 'Vote one person for each number between 1 and 10' });
    }
  }

  await fsPromises.access(path.join(__dirname, 'votes')).catch(error =>
    fsPromises.mkdir(path.join(__dirname, 'votes'))
  );

  await fsPromises.writeFile(path.join(__dirname, 'votes', `${username}.json`), JSON.stringify({
    username,
    votes: req.body.votes
  }), 'utf8');

  res.status(200).send({ success: 1 });
});

module.exports = (port, secret, studentList) => new Promise((resolve, reject) => {
  loginSecret = secret;
  students = studentList;

  const httpServer = app.listen(port, () => resolve(httpServer));
});