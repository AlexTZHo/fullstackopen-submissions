const Header = ({ course }) => {
  return (
    <h1>{course.name}</h1>
  )
}

const Part = ({ part }) => {
  console.log(part)
  return (
    <div>
      <p>{part.name} {part.exercises}</p>
    </div>
  )
}

const Content = ({ parts }) => {
  console.log(parts)
  return (
    <div>
      <Part part={parts[0]} />
      <Part part={parts[1]} />
      <Part part={parts[2]} />
    </div>
  )
}

const Total = ({ parts }) => {
  console.log(parts)
  return (
    <div>
      <p>Number of exercises {parts[0].exercises + parts[1].exercises + parts[2].exercises}</p>
    </div>
  )
}

const App = () => {
  const course = {
    name: 'Half Stack application development',
    parts: [
      {
        name: 'Fundamentals of React',
        exercises: 10
      },
      {
        name: 'Using props to pass data',
        exercises: 7
      },
      {
        name: 'State of a component',
        exercises: 14
      }
    ]
  }
  console.log(course.parts)

  return (
    <div>
      <Header course={course} />
      <Content parts={course.parts} />
      <Total parts={course.parts} />
    </div>
  )
}

export default App