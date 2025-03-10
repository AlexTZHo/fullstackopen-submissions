import { useState, useEffect } from 'react'
import phonebook from './server/phonebook'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Filter from './components/Filter'
import Notification from './components/Notification'

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [notificationColor, setNotificationColor] = useState('red')

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
            setErrorMessage(`Updated ${personObj.name}`)
            setNotificationColor('green')
            setTimeout(() => {
              setErrorMessage(null)
            }, 5000)
          })
          .catch(error => {
            console.error(error)
            setErrorMessage("Error occurred while updating")
            setNotificationColor('red')
            setTimeout(() => {
              setErrorMessage(null)
            }, 5000)
          })
        return
      }
      return
    }

    phonebook.create(personObj)
      .then((response) => {
        const newPhoneBook = persons.concat(response.data)
        setPersons(newPhoneBook)
        setErrorMessage(`Added ${personObj.name}`)
        setNotificationColor('green')
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setNewName("")
        setNewNumber("")
      })
      .catch(error => {
        console.error(error)
        setErrorMessage("Error occurred while adding")
        setNotificationColor('red')
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
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
      const person = persons.find(person => person.id === id)
      phonebook.remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
          setErrorMessage(`Removed ${person.name}`)
          setNotificationColor('green')
        })
        .catch(error => {
          console.error(error)
          setErrorMessage(`Information for ${person.name} has already been removed`)
          setNotificationColor('red')
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        })
    } 
  }

  const personsToShow = filter === '' 
    ? persons
    : persons.filter((person) => person.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification className='error' message={errorMessage} color={notificationColor}/>
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