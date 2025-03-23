require('dotenv').config()

const mongoose = require('mongoose')

mongoose.set('strictQuery',false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url).then(result => {
  console.log('connected to MongoDB:', result)
}).catch(error => {
  console.log('error connecting to MongoDB:', error.message)
})

const personSchema = new mongoose.Schema({
  name:  {
    type: String,
    minLength: 3,
    required: true
  },
  number:  {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      validator: function(v) {
        return /^(?:\d{2}-\d{6,7}|\d{3}-\d{3}-\d{4})$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number! Must be XX-XXXXXXX or XXX-XXX-XXXX.`
    }
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)