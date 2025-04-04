const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)

let testUser
let authToken

beforeEach(async () => {
  await Blog.deleteMany({})

  // Create a test user and get a token
  testUser = await helper.createTestUser()
  authToken = await helper.getTokenForUser(testUser)

  // Create blogs and associate them with the test user
  const blogObjects = helper.initialPosts.map(post => new Blog({
    ...post,
    user: testUser._id
  }))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)

  // Update the user with the blog IDs
  const savedBlogs = await Blog.find({})
  testUser.blogs = savedBlogs.map(blog => blog._id)
  await testUser.save()
})

test('blog posts have id property instead of _id', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
    const blogs = response.body

    blogs.forEach(blog => {
      assert.strictEqual(blog.id !== undefined, true)
      assert.strictEqual(blog._id === undefined, true)
    })
  })

test('Blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all posts are returned', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)

    assert.strictEqual(response.body.length, helper.initialPosts.length)
})

test('a valid blog can be added ', async () => {
    const newPost = {
      "title": "Who Goes There",
      "author": "Matti Luukkainen",
      "url": "www.tt.com",
      "likes": "5"
    }

    await api
      .post('/api/blogs')
      .send(newPost)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialPosts.length + 1)

    const titles = blogsAtEnd.map(n => n.title)
    assert(titles.includes('Who Goes There'))
})

test('post without title is not added', async () => {
    const newPost = {
        author: 'Matti Luukkainen',
        url: 'https://css.com/',
        likes: 11
    }

    await api
      .post('/api/blogs')
      .send(newPost)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialPosts.length)
})

test('blog cannot be added without token', async () => {
    const newPost = {
      title: 'This should not be added',
      author: 'No Token User',
      url: 'https://example.com',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newPost)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialPosts.length)
})

test('blog cannot be added with invalid token', async () => {
    const newPost = {
      title: 'This should not be added',
      author: 'Invalid Token User',
      url: 'https://example.com',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newPost)
      .set('Authorization', 'Bearer invalidtoken')
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialPosts.length)
})

test('there are two posts', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)

    assert.strictEqual(response.body.length, helper.initialPosts.length)
})

test('the first blog is about HTTP methods', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)

    const title = response.body.map(e => e.title)
    assert.strictEqual(title.includes('HTML is okay'), true)
})

test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    // Compare only the relevant fields to avoid ObjectId comparison issues
    assert.strictEqual(resultBlog.body.id, blogToView.id)
    assert.strictEqual(resultBlog.body.title, blogToView.title)
    assert.strictEqual(resultBlog.body.author, blogToView.author)
    assert.strictEqual(resultBlog.body.url, blogToView.url)
    assert.strictEqual(resultBlog.body.likes, blogToView.likes)
})

test('a blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = {
      title: 'updated title',
      author: 'updated author',
      url: 'updated url',
      likes: 100
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()

    const titles = blogsAtEnd.map(r => r.title)
    assert(titles.includes(updatedBlog.title))

    assert.strictEqual(blogsAtEnd.length, helper.initialPosts.length)
})

test('a blog can be deleted by the user who created it', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    const titles = blogsAtEnd.map(r => r.title)
    assert(!titles.includes(blogToDelete.title))

    assert.strictEqual(blogsAtEnd.length, helper.initialPosts.length - 1)
  })

test('a blog cannot be deleted without token', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
  })

test('a blog cannot be deleted with invalid token', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', 'Bearer invalidtoken')
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
  })

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
      await User.deleteMany({})

      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })

      await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes(newUser.username))
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('expected `username` to be unique'))

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('creation fails with proper statuscode and message if username too short', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'ab',  // Less than 3 characters
        name: 'Short Username',
        password: 'validpassword',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('shorter than the minimum allowed length'))

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('creation fails with proper statuscode and message if password too short', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'validuser',
        name: 'Valid User',
        password: 'ab',  // Less than 3 characters
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('password must be at least 3 characters'))

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('creation fails with proper statuscode and message if username missing', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        name: 'No Username',
        password: 'validpassword',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('`username` is required'))

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('creation fails with proper statuscode and message if password missing', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'validuser',
        name: 'Valid User',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('password is required'))

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
  })

  after(async () => {
    await mongoose.connection.close()
  })