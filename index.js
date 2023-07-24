const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const Person = require('./models/person');

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError'){
    return response.status(400).send({ error: 'malformatted id' });
  }

  next(error);
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
}

app.use(cors());
app.use(express.json());
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
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person);  
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson);
    })
    .catch(error => next(error));
})

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
