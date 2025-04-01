const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialPosts.map(post => new Blog(post))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('blog posts have id property instead of _id', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body
    
    blogs.forEach(blog => {
      assert.strictEqual(blog.id !== undefined, true)
      assert.strictEqual(blog._id === undefined, true)
    })
  })

test('Blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all posts are returned', async () => {
    const response = await api.get('/api/blogs')
  
    assert.strictEqual(response.body.length, helper.initialPosts.length)
})

test('a valid blog can be added ', async () => {
    const newPost =   {
        title: 'async/await simplifies making async calls',
        author: 'JS Author',
        url: 'https://js.com/',
        likes: 10
    }
  
    await api
      .post('/api/blogs')
      .send(newPost)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialPosts.length + 1)
  
    const titles = blogsAtEnd.map(n => n.title)
    assert(titles.includes('async/await simplifies making async calls'))
})

test('post without title is not added', async () => {
    const newPost =   {
        author: 'CSS Author',
        url: 'https://css.com/',
        likes: 11
    }
  
    await api
      .post('/api/blogs')
      .send(newPost)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialPosts.length)
})

test('there are two posts', async () => {
    const response = await api.get('/api/blogs')
  
    assert.strictEqual(response.body.length, helper.initialPosts.length)
})

test('the first blog is about HTTP methods', async () => {
    const response = await api.get('/api/blogs')
  
    const title = response.body.map(e => e.title)
    assert.strictEqual(title.includes('HTML is easy'), true)
})

test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()
  
    const blogToView = blogsAtStart[0]
  
  
    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    assert.deepStrictEqual(resultBlog.body, blogToView)
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
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    const titles = blogsAtEnd.map(r => r.title)
    assert(titles.includes(updatedBlog.title))
  
    assert.strictEqual(blogsAtEnd.length, helper.initialPosts.length)
})
  
test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
  
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    const titles = blogsAtEnd.map(r => r.title)
    assert(!titles.includes(blogToDelete.title))
  
    assert.strictEqual(blogsAtEnd.length, helper.initialPosts.length - 1)
  })


after(async () => {
  await mongoose.connection.close()
})