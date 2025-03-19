let records = [
  {id: 1, username: 'jack', password: 'secret', displayName: 'Jack', emails: [{value: 'jack@example.com'}]}
  , {id: 2, username: 'jill', password: 'birthday', displayName: 'Jill', emails: [{value: 'jill@example.com'}]}
  , {id: 3, username: 'admin', password: '123', displayName: 'Jill', emails: [{value: 'jill@example.com'}]}
  , {id: 4, username: 'think', password: 'think', displayName: 'Jill', emails: [{value: 'jill@example.com'}]}
];

exports.findById = function (id, cb) {
  let idx = id - 1;
  if (records[idx]) {
    cb(null, records[idx]);
  } else {
    cb(new Error('User ' + id + ' does not exist'));
  }
};

exports.findByUsername = function (username, cb) {
  for (let i = 0, len = records.length; i < len; i++) {
    let record = records[i];
    if (record.username === username) {
      return cb(null, record);
    }
  }
  return cb(null, null);
};
