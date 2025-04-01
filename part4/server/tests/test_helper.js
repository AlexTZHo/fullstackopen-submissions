const Blog = require('../models/blog')
const User = require('../models/user')

const initialPosts = [
  {
    title: 'HTML is easy',
    author: 'HTML Author',
    url: 'https://html.com/',
    likes: 10
  },
  {
    title: 'CSS is easy',
    author: 'CSS Author',
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
  

module.exports = {
  initialPosts, nonExistingId, blogsInDb, usersInDb
}