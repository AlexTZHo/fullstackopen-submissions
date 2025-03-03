import { useState, useEffect } from 'react'
import phonebook from './server/phonebook'

const Persons = ({ persons, handleRemove }) => {
  return (
    <div>
      {persons.map((person) => (<PersonEntry key={person.id} person={person} handleRemove={handleRemove}/>))}
    </div>
  )
}

const PersonEntry = ({ person, handleRemove }) => {
  return (
    <div>
      <p>{person.name} {person.number}</p>
      <button onClick={() => handleRemove(person.id)}>delete</button>
    </div>
  )
} 

const PersonForm = ({ newName, newNumber, addPerson, handleNameChange, handleNumberChange }) => {
  return (
    <form onSubmit={addPerson}>
      <div>
        name: <input value={newName} onChange={handleNameChange}/>
      </div>
      <div>
        number: <input value={newNumber} onChange={handleNumberChange}/>
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Filter = ({ filter, handleFilterChange }) => {
  return (
    <div>
        filter shown with <input value={filter} onChange={handleFilterChange}/>
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    phonebook.getAll().then(response => {
      setPersons(response.data)
    })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()    
    const personObj = {
      name: newName,
      number: newNumber,
      id: (persons.length + 1).toString()
    }

    if (persons.find((person) => person.name === newName)) {
      const updatePerson = persons.find((person) => person.name === newName)
      if (window.confirm(`${newName} is already in this phonebook. Would you like to update their number?`)) {
        phonebook.update(updatePerson.id, personObj)
          .then((response) => {
            console.log("In update", response)
            setPersons(persons.map(person => person.id === updatePerson.id ? response.data : person))
          })
          .catch(error => console.error(error))
        return
      }
      return
    }

    phonebook.create(personObj)
      .then((response) => {
        const newPhoneBook = persons.concat(response.data)
        setPersons(newPhoneBook)
        setNewName("")
        setNewNumber("")
      })
      .catch(error => {
        console.error(error)
      })    
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const handleRemove = (id) => {
    if (window.confirm("Are you sure you want to remove this person?")) {
      phonebook.remove(id)
        .then(() => setPersons(persons.filter(person => person.id !== id)))
        .catch(error => console.error(error))
    } 
  }

  const personsToShow = filter === '' 
    ? persons
    : persons.filter((person) => person.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div>
      <h2>Phonebook</h2>
      <Filter filter={filter} handleFilterChange={handleFilterChange}/>
      <h2>add a new</h2>
      <PersonForm 
        newName={newName} 
        newNumber={newNumber} 
        addPerson={addPerson} 
        handleNameChange={handleNameChange} 
        handleNumberChange={handleNumberChange}
      />
      <h2>Numbers</h2>
      <Persons persons={personsToShow} handleRemove={handleRemove} />
    </div>
  )
}

export default App