const PersonEntry = ({ person, handleRemove }) => {
    return (
        <div>
            <p>{person.name} {person.number}</p>
            <button onClick={() => handleRemove(person.id)}>delete</button>
        </div>
    )
} 

export default PersonEntry