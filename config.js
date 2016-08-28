var env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    secret: 'ilovetraditionaljudo',
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/site-development'
  },
  test: {
    secret: 'ilovetraditionaljudo',
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/site-test'
  },
  production: {
    secret: 'ilovetraditionaljudo',
    port: process.env.PORT,
    db: ''
  }
}

module.exports = config[env];
