const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const initialPosts = [
  {
    title: 'HTML is okay',
    author: 'HTML Author',
    user: '67f010aee716e539bbb5418d',
    url: 'https://html.com/',
    likes: 10
  },
  {
    title: 'CSS is okay',
    author: 'CSS Author',
    user: '67f010aee716e539bbb5418d',
    url: 'https://css.com/',
    likes: 10
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
  }


const initialUser = {
  username: 'testuser',
  name: 'Test User',
  password: 'password'
}

const getTokenForUser = async (user) => {
  const userForToken = {
    username: user.username,
    id: user._id.toString()
  }
  return jwt.sign(userForToken, process.env.SECRET)
}

const createTestUser = async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash(initialUser.password, 10)
  const user = new User({
    username: initialUser.username,
    name: initialUser.name,
    passwordHash
  })
  const savedUser = await user.save()
  return savedUser
}

module.exports = {
  initialPosts, nonExistingId, blogsInDb, usersInDb, initialUser, getTokenForUser, createTestUser
}