module.exports = {

  // Students for the voting page
  // Can be Student ID, MISID, or Name
  students: [
    'Georgia Brown',
  ],

  // Server settings
  database: `IDAttend${new Date().getFullYear()}`, // IDAttend2021
  server: 'GEORGE\\SQLEXPRESS',
  domain: 'GEORGE',

  // Table settings (You shouldn't need to change these)
  table: 'dbo.tblStudents',


};