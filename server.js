/*
 * HTTP server to serve the voting website
 */

const config = require('./config.js');
const cookieEncrypter = require('cookie-encrypter');
const express = require('express');
const fs = require('fs');
const fsPromises = fs.promises;
const login = require('./login.js');
const path = require('path');

const isFile = file => fsPromises.access(file, fs.constants.F_OK).then(() => true).catch(() => false);
const getVoteFile = username => path.join(__dirname, 'votes', `${username}.json`);

const app = express();
let candidates;
let teachers;
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
    if (config.preventReVoting && await isFile(getVoteFile(username))) {
      return res.status(400).send({ message: 'You have already voted' });
    }

    const loginToken = cookieEncrypter.encryptCookie(username, { key: loginSecret });
    res.status(200).send({
      success: 1,
      candidates,
      loginToken,
      voteCount: config.voteCount
    });
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

  for (let i = 0; i < config.voteCount; i++) {
    if (!req.body.votes.length || req.body.votes.length > config.voteCount || !req.body.votes[i]) {
      return res.status(400).send({ error: `Vote one person for each number between 1 and ${config.voteCount}` });
    }
  }

  await fsPromises.access(path.join(__dirname, 'votes')).catch(error =>
    fsPromises.mkdir(path.join(__dirname, 'votes'))
  );

  console.log(`${username} has voted`);

  await fsPromises.writeFile(getVoteFile(username), JSON.stringify({
    username,
    weightedVote: username in teachers,
    votes: req.body.votes
  }), 'utf8');

  res.status(200).send({ success: 1 });
});

module.exports = (port, secret, candidateList, teacherList) => new Promise((resolve, reject) => {
  loginSecret = secret;
  candidates = candidateList;
  teachers = teacherList;

  const httpServer = app.listen(port, () => resolve(httpServer));
});