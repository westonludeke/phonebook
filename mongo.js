require('dotenv').config();

const mongoose = require('mongoose');

if (process.argv.length<3) {
  console.log('give password as argument');
  process.exit(1);
}

const password = process.argv[2];

const url = process.env.MONGO_DB_URL;

mongoose.set('strictQuery',false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

const person = new Person({
  name: 'Lance Boyle',
  number: '444-555-5555',
});

person.save().then(result => {
  console.log(`added ${person.name} with number ${person.number} to phonebook`);
  mongoose.connection.close();
});

Person.find({}).then(result => {
  console.log('phonebook:');
  result.forEach(person => {
    console.log(`${person.name} ${person.number}`);
  })
  mongoose.connection.close();
});