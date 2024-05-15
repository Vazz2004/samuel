import express, { json } from 'express'
import fs from 'fs'

const PORT = process.env.PORT ?? 3000
const app = express()
app.disable('x-powered-by')
app.use(json())

const readData = (path, colback) => {
  fs.readFile(path, 'utf8', (error, data) => {
    if (error) {
      return colback(error)
    }
    try {
      const datos = JSON.parse(data)
      return colback(null, datos)
    } catch (error) {
      return colback(error)
    }
  })
}

app.get('/', (req, res) => {
  readData('./db/characters.json', (error, datos) => {
    if (error) {
      return new Error(error)
    } else {
      res.json(datos)
    }
  })
})

app.get('/:id', (req, res) => {
  const { id } = req.params
  readData('./db/characters.json', (error, datos) => {
    if (error) {
      res.status(500).send('Error al leer la base de datos')
    } else {
      const objeto = datos.find(item => item.id === id)
      if (objeto) {
        res.send(objeto)
      }
    }
  })
})

app.post('/', (req, res) => {
  const envioDatos = req.body
  const newCharacter = {
    ...envioDatos
  }

  readData('./db/characters.json', (error, datos) => {
    if (error) {
      res.status(502).send('Error al escribir  en la base de datos')
    } else {
      datos.push(newCharacter)
      fs.writeFile('./db/characters.json', JSON.stringify(datos, null, 2), err => {
        if (err) console.log(err)
      })
      res.json(newCharacter)
    }
  })
})

app.put('/:id', (req, res) => {
  const envioDatos = req.body
  const { id } = req.params

  readData('./db/characters.json', (error, datos) => {
    if (error) {
      res.status(502).send('Error al escribir  en la base de datos')
    } else {
      const objeto = datos.findIndex(item => item.id === id)
      if (objeto) {
        const changeDato = {
          ...datos[objeto],
          ...envioDatos
        }
        datos[objeto] = changeDato
        fs.writeFile('./db/characters.json', JSON.stringify(datos, null, 2), err => {
          if (err) console.log(err)
        })
        res.json(changeDato)
      }
    }
  })
})

app.delete('/:id', (req, res) => {
  const { id } = req.params
  readData('./db/characters.json', (error, jsonData) => {
    if (error) {
      res.status(500).send('Error al leer la base de datos')
    } else {
      const index = jsonData.findIndex(item => item.id === id)
      if (index === -1) {
        res.status(404).send('El elemento no fue encontrado en la base de datos')
      } else {
        jsonData.splice(index, 1)
        fs.writeFile('./db/characters.json', JSON.stringify(jsonData, null, 2), (writeError) => {
          if (writeError) {
            res.status(500).send('Error al escribir en la base de datos')
          } else {
            res.status(200).send({ message: 'Dato eliminado correctamente' })
          }
        })
      }
    }
  })
})

app.listen(PORT, function () {
  console.log(`server listening on port http://localhost:${PORT}`)
})
