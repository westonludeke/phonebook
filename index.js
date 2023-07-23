const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
require('dotenv').config();

// Define a custom morgan token to log the request body for POST requests
morgan.token('req-body', (req) => JSON.stringify(req.body));

const Person = require('./models/person');

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
}

// Use the custom morgan token in the format
app.use(cors());
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'));
app.use(requestLogger);
app.use(express.static('build'));

let persons = [
]

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then(persons => {
      response.json(persons);
    })
    .catch(error => {
      if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
        // Handle timeout error
        console.error('Timeout error fetching persons:', error);
        response.status(504).json({ error: 'Timeout Error' });
      } else {
        // Handle other errors
        console.error('Error fetching persons:', error);
        response.status(500).json({ error: 'Internal Server Error' });
      }
    });
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) return response.status(400).json({ error: 'name or number missing' });

  const nameExists = persons.some((person) => person.name === body.name);
  if (nameExists) return response.status(409).json({ error: 'name must be unique' });

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(person);
  })
});

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person);
  });
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);

  response.status(204).end();
});

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
