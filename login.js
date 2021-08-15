/**
 * Handle login requests
 */

const config = require('./config.js');
const ldap = require('ldapjs');

module.exports = (username, password) => new Promise((resolve, reject) => {

  const client = ldap.createClient({
    url: `ldap://${config.domain}/`,
    timeout: 5000,
    connectTimeout: 10000
  });

  client.bind(username, password, error => {
    resolve(!error);
  });
  
});