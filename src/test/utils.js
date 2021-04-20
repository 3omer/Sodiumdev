/* eslint-disable */

const mongoose = require('mongoose')
const supertest = require('supertest')
const config = require('../utils/config')

const connectMongo = async () => {
  await mongoose.connect(
    config.db.uri,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
    (err) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
    }
  )
  console.log('connected to ', mongoose.connection.name)
}

const closeMongo = async () => {
  await mongoose.disconnect()
  console.log('db connection closed')
}

async function postForm(request, url, form) {
  return await request
    .post(url)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send(form)
    .redirects(1)
}

module.exports = { connectMongo, closeMongo, postForm }
