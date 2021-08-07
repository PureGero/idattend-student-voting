/*
 * HTTP server to serve the voting website
 */

const express = require('express');
const path = require('path');

const app = express();
let students;

app.use(express.static(path.join(__dirname, 'html')));

module.exports = port => {
  students = JSON.parse(process.env.students);

  app.listen(port);
};