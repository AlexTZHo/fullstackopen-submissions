const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://alexanderho:${password}@cluster0.ifxfo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
//console.log('Accessing',url)

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  id: Number,
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)
if (!name && !number) {
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
} else {
  console.log('Adding')
  let peopleCount = 0
  Person.find({}).then(result => {
    console.log(result)
    peopleCount = result.length
  })
  const person = new Person({
    id: peopleCount + 1,
    name: name,
    number: number
  })

  person.save().then(result => {
    console.log(`${result}: added ${name} ${number} to the phonebook`)
    mongoose.connection.close()
  })
}