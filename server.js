/*
 * HTTP server to serve the voting website
 */

const express = require('express');
const login = require('./login.js');
const path = require('path');

const app = express();
let students;

app.use(express.static(path.join(__dirname, 'html')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(express.json());

app.post('/login', (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).send({ error: 'Please enter a username and password' });
  }
  if (login(req.body.username, req.body.password)) {
    res.status(200).send({ success: 1, candidates: students });
  } else {
    res.status(400).send({ error: 'Invalid username/password' });
  }
});

module.exports = port => {
  students = JSON.parse(process.env.students);

  app.listen(port);
};