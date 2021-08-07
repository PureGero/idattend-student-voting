module.exports = {

  // Students for the voting page
  // Can be Student ID, MISID, or Name (First and/or Last)
  students: [
    'Jess Smith',
    'Robert Brown',
  ],

  // Server settings
  database: `IDAttend${new Date().getFullYear()}`, // IDAttend2021
  server: 'GEORGE\\SQLEXPRESS',
  domain: 'GEORGE',

  // Table settings (You shouldn't need to change these)
  table: 'dbo.tblStudents',

  studentQuery: table => 
    `select * from ${table}
    where Active = 1 and (
      ID = @param
      or MISID = @param
      or StudentEmail = @param
      or PreferredName = @param
      or PreferredLastName = @param
      or FirstName = @param
      or LastName = @param
      or CONCAT(PreferredName,' ',PreferredLastName) = @param
      or CONCAT(FirstName,' ',PreferredLastName) = @param
      or CONCAT(PreferredName,' ',LastName) = @param
      or CONCAT(FirstName,' ',LastName) = @param
    )`,

};