const Header = ({ course }) => {
    return (
        <h2>{course}</h2>
    )
}

const Part = ({ part }) => {
    return (
        <div>
            <p>{part.name} {part.exercises}</p>
        </div>
    )
}

const Content = ({ parts }) => {
    return (
        <div>
            {parts.map((part) => <Part part={ part }/> ) }
        </div>
    )
}

const Total = ({ parts }) => {
    const sum = parts.reduce((s, p) => s + p.exercises, 0)
    console.log("reduce", sum)
    return (
        <div>
            <h3>Total of exercises: {sum}</h3>
        </div>
    )
}

const Course = ({ courses }) => {
    return (
        <div>
            {courses.map((course) => 
                <div key={course.id}>
                    <Header course={course.name}/>
                    <Content parts={course.parts}/>
                    <Total parts={course.parts}/>
                </div>
            )}
        </div>
    )
}

export default Course