/*
 * Resolve teacher usernames from the database for weighted votes
 */

const config = require('./config.js');
const database = require('./database.js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const sql = require('mssql');

module.exports = async yearLevel => {
  const pool = await database();

  const students = {};

  const result = await pool.request()
    .input('param', sql.Int, yearLevel)
    .query(config.studentsQuery(config.table));
  
  if (!result.recordset.length) {
    console.log(`[WARN] No students found for year level ${yearLevel}`);
  }

  for (let i = 0; i < result.recordset.length; i++) {
    const record = result.recordset[i];
    students[record.MISID] = true;
  }

  return students;
};