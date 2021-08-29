/*
 * Resolve teacher usernames from the database for weighted votes
 */

const config = require('./config.js');
const database = require('./database.js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const sql = require('mssql');

module.exports = async () => {
  const pool = await database();

  const teachers = {};

  const result = await pool.request()
    .query(config.teachersQuery(config.tableTeachers));
  
  if (!result.recordset.length) {
    console.log('[WARN] No teachers found');
  }

  for (let i = 0; i < result.recordset.length; i++) {
    const record = result.recordset[i];
    teachers[record.MISID] = true;
  }

  return teachers;
};