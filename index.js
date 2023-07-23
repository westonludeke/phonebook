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
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

// app.get('/', (request, response) => {
//   response.send('<h1>Hello World!</h1>');
// });

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons);
  })
});

// const generateId = () => {
//   const maxId = persons.length > 0
//     ? Math.max(...persons.map(n => n.id))
//     : 0
//   return maxId + 1
// };

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) return response.status(400).json({ error: 'name or number missing' });

  const nameExists = persons.some((person) => person.name === body.name);
  if (nameExists) return response.status(409).json({ error: 'name must be unique' });

  const person = {
    name: body.name,
    number: body.number,
    // id: generateId(),
  };

  persons = persons.concat(person);

  response.json(person);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);

  if (person) response.json(person);
  else response.status(404).end();
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);

  response.status(204).end();
});

app.get('/info', (request, response) => {
  const numberOfPeople = persons.length;

  // Get the current date and time in Central Standard Time (CST)
  const currentDate = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });

  const infoMessage = `Phonebook has info for ${numberOfPeople} people.`;
  const timestampMessage = `Timestamp: ${currentDate}`;

  // Concatenate both messages and send as the response
  const fullMessage = `${infoMessage} ${timestampMessage}`;
  response.send(fullMessage);
});

app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
