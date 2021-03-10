const express = require('express')
const cors = require('cors')
const { v4: uuidv4, v4 } = require('uuid')

const app = express()

app.use(cors())
app.use(express.json())

const users = []

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find((user) => user.username === username)
  if (!user) return response.status(400).json({ error: 'User not found' })
  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const existingUser = users.find((user) => user.username === username)
  if (existingUser) return response.status(400).json({ error: 'Username already exists' })
  const user = {
    id: v4(),
    name,
    username,
    todos: []
  }
  users.push(user)
  
  return response.status(201).send(user)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user
  return response.status(200).send(todos)
})

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request
  const todo = {
    id: v4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todo)

  response.status(201).send(todo)
})

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body
  const { todos } = request.user
  const todo = todos.find((todo) => todo.id === id)
  if (!todo) return response.status(404).json({ error: 'Could not find todo' })
  todo.title = title
  todo.dealine = new Date(deadline)
  return response.status(200).send(todo)
})

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { todos } = request.user
  const todo = todos.find((todo) => todo.id === id)
  if (!todo) return response.status(404).json({ error: 'Could not find todo' })
  todo.done = true
  return response.status(200).send(todo)
})

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { todos } = request.user
  const todo = todos.find((todo) => todo.id === id)
  if (!todo) return response.status(404).json({ error: 'Could not find todo' })
  todos.splice(todos.indexOf(todo), 1)
  return response.status(204).send()
})

module.exports = app;