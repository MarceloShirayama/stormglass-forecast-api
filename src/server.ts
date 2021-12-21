import express from 'express'

const app = express()
const port = process.env.SERVER_PORT
const project = process.env.PROJECT_NAME

app.get('/', (req, res) => res.send(project))

app.listen(port, () => {
  return console.log(`${project} run in: http://localhost:${port}`)
})
