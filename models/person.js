const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = process.env.MONGO_DB_URL;

console.log('connecting to', url);

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  })

const personSchema = new mongoose.Schema({
  name: { 
    type: String,
    minLength: [3, 'The name must be at least 3 characters long'],
    required: [true, 'The name field is required'] 
  },
  number: { 
    type: String,
    minLength: 3,
    required: true 
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Person', personSchema);