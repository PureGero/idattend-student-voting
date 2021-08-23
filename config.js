module.exports = {

  // # -------- #
  // | Settings |
  // # -------- #

  // Weighting to be applied to teacher votes
  teacherVoteWeighting: 2,



  // # ------------------ #
  // | Candidate students |
  // # ------------------ #

  // Can be Student ID, MISID, or Name (First and/or Last)
  students: [
    'Chaseling',
    'George',
    'Anastasi',
    'Richards',
    'Mortimer',
    'Cobb',
    'Marshall',
    'Jess',
    'Bella',
    'Mansfield',
    'Ly',
    'Skytte',
    'Charleigh',
    'Callan',
    'Keeley',
    'Eaton',
    'Ma',
    'Sadlier',
  ],



  // # --------------- #
  // | Server settings |
  // # --------------- #

  // Database expands to IDAttend2021 (or whatever the current year is)
  database: `IDAttend${new Date().getFullYear()}`,

  // A double \\ is a single \ when connecting to the server
  server: 'EQGBN9999005\\IDATTEND',

  // Login domain for both the database server and for students to login
  domain: 'GBN',

  // Url to download student photos from.
  // ${id} is replaced with the student id
  photoUrl: id => `http://EQGBN9999005/IDAttendWebPhotos/${id}.jpg`,



  // # --------------------------------------------------- #
  // | Table settings (You shouldn't need to change these) |
  // # --------------------------------------------------- #

  // Table to query students from
  table: 'dbo.tblStudents',

  // Mssql query to get a student by either id, misid, first name, last name,
  // first last name, or last first name (including preferred names)
  studentQuery: table => `
    select * from ${table}
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
    )
  `,

  // Table to query students from
  tableTeachers: 'dbo.tblTeachers',

  // Mssql query to get a teacher by misid
  teacherQuery: table => `
    select * from ${table}
    where Email LIKE CONCAT(@param, '@%')
  `,

};