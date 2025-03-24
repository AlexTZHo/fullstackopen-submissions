const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes
  }

  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null;

  const reducer = (max, blog) => {
    return blog.likes > max.likes ? blog : max
  }

  return blogs.reduce(reducer, blogs[0])
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}