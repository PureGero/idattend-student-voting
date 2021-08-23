let bindResult = null;

class LdapClient {
  bind(username, password, callback) {
    callback(bindResult);
  }
}

module.exports.createClient = () => {
  return new LdapClient();
};

module.exports.setBindResult = result => {
  bindResult = result;
};