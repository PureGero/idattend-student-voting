/*
 * Resolve students from an mssql database
 */

const config = require('./config.js');
const database = require('./database.js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const sql = require('mssql');

async function mapStudents(students) {
  // Reduce students to only what's needed
  students = students.map(student => ({
    name: `${student.PreferredName || student.FirstName} ${student.PreferredLastName || student.LastName}`,
    id: student.ID
  }));

  // Create students' images folder
  if (!fs.existsSync(path.join(__dirname, 'images'))) {
    fs.mkdirSync(path.join(__dirname, 'images'), { recursive: true });
  }

  // Download the students' images
  console.log(`Downloading student photos from ${config.photoUrl('{STUDENT_ID}')}`);
  await Promise.all(students.map(student => fetch(config.photoUrl(student.id)).then(res => {
    const dest = fs.createWriteStream(path.join(__dirname, `images/${student.id}.jpg`));
    res.body.pipe(dest);
  }).catch(console.error)));

  return students;
}

module.exports = async () => {
  const pool = await database();

  const students = await Promise.all(config.students.map(async student => {
    const result = await pool.request()
      .input('param', sql.VarChar(200), student)
      .query(config.studentQuery(config.table));
    if (result.recordset.length == 0) {
      console.log(`No student matching ${student}`);
      return;
    }
    if (result.recordset.length > 1) {
      console.log(`Multiple students matching ${student}:`);
      result.recordset.forEach(record => console.log(`  ${record.ID} ${record.PreferredName} ${record.PreferredLastName} (${record.MISID})`));
      return;
    }
    return result.recordset[0];
  }));

  if (students.includes()) {
    return reject('Could not find all students.\nPlease fix these students in config.js then try again.');
  }

  return await mapStudents(students);
};