const proxyquire = require('proxyquire').noCallThru();
const assert = require('assert');
const mockedLdapjs = require('./mocked/ldapjs');

const login = proxyquire('../login.js', {
  ldapjs: mockedLdapjs
});

describe('login.js', () => {
  it('should return true when ldap binds', async () => {
    mockedLdapjs.setBindResult(null);
    assert.strictEqual(await login('username', 'password'), true);
  });
  it('should return false when ldap fails to bind', async () => {
    mockedLdapjs.setBindResult('error');
    assert.strictEqual(await login('username', 'password'), false);
  });
});