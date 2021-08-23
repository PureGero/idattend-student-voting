let queryResult = { recordset: [] };

class MssqlClient {
  request() {
    return this;
  }

  input() {
    return this;
  }

  query() {
    return queryResult;
  }
}

module.exports.connect = () => {
  return new MssqlClient();
};

module.exports.setQueryResult = result => {
  queryResult = result;
};