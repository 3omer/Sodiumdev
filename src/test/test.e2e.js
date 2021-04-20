/* eslint-disable */

const supertest = require('supertest')
const { expect } = require('chai')
const mongoose = require('mongoose')
const app = require('../app')
const utils = require('./utils')

const User = mongoose.model('User')
const Article = mongoose.model('Article')

describe('articles operation', async () => {
  let user

  before(async () => {
    await User.deleteMany({})
    await Article.deleteMany({})
    await mongoose.connection.collection('sessions').deleteMany({})

    // reusable user
    user = new User({ username: 'test', password: 'test123456', email: 'test@test.com' })
    await user.save()
  })
  after(async () => {
    mongoose.connection.close()
  })

  it('should publish a user article', async () => {
    // login a user
    const request = supertest.agent(app)
    let res = await utils.postForm(request, '/login', {
      email: 'test@test.com',
      password: 'test123456',
    })

    expect(res.status).to.equal(200)
    expect(res.text).to.contain('Welcome')

    const articleForm = {
      title: 'test',
      content: 'article content article content',
    }

    // submit
    res = await utils.postForm(request, '/dashboard/editor', articleForm)

    expect(res.status).to.eq(200)
    expect(res.text).to.contains(articleForm.content)
  })

  it('should open an article for edition only by the author', async () => {
    // create an article to open for edition
    const article = new Article({ title: 'test editing', content: 'testing testing', author: user })
    await article.save()

    // first login
    const request = supertest.agent(app)
    let res = await utils.postForm(request, '/login', {
      email: 'test@test.com',
      password: 'test123456',
    })
    expect(res.status).to.equal(200)

    // open article for editing
    res = await request.get(`/dashboard/editor?edit=${article.blogID}`)

    expect(res.status).to.equal(200)
    expect(res.text).to.contain(article.content)
  })

  it('should save the content after submiting edition by author', async () => {
    const request = supertest.agent(app)

    // login
    let res = await utils.postForm(request, '/login', { email: user.email, password: 'test123456' })
    expect(res.status).to.equal(200)

    // get an article
    let article = await new Article({ title: 'test', content: 'test', author: user }).save()

    // edit the content and save
    res = await utils.postForm(request, '/dashboard/editor', {
      id: article.blogID,
      title: `${article.title} edited`,
      content: 'edited edited',
    })

    expect(res.status).to.equal(302)
    article = await Article.findById(article.id)
    expect(article.title).to.eq('test edited')
  })
})
