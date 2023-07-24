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
    minLength: [3, 'The number must be at least 3 characters long'],
    required: [true, 'The number field is required'],
    validate: {
      validator: function (value) {
        // Regular expression to match the 555-555-5555 format
        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
        return phoneRegex.test(value);
      },
      message: 'Invalid phone number format. Must be in the xxx-xxx-xxxx format.',
    },
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