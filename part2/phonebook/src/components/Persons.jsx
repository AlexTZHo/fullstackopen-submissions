import PersonEntry from "./PersonEntry"

const Persons = ({ persons, handleRemove }) => {
    return (
        <div>
            {persons.map((person) => (<PersonEntry key={person.id} person={person} handleRemove={handleRemove}/>))}
        </div>
    )
}

export default Persons