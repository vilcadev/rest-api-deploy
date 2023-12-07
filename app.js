const express = require('express') // require -> commonJS
const crypto = require('node:crypto')

const movies = require('./movies.json')
const { validateMovie,validatePartialMovie } = require('./schemas/movies')


const app = express()
app.use(express.json()) //middleware

app.disable('x-powered-by') // deshabilitar el header x-powered-by: express


// métodos normales: GET/HEAD/POST
// métodos complejos: PUT/PATCH/DELETE


//CORS PRE-Flight
// OPTIONS


// ***** npm install cors , instala un middleware de cors**** 
// Esto lo que hace es simplificar lo que hemos hecho de CORS
// const cors = require('cors')

// app.use(cors({
//     origin: (origin, callback) => {
//       const ACCEPTED_ORIGINS = [
//         'http://localhost:8080',
//         'http://localhost:1234',
//         'https://movies.com',
//         'https://midu.dev'
//       ]
  
//       if (ACCEPTED_ORIGINS.includes(origin)) {
//         return callback(null, true)
//       }
  
//       if (!origin) {
//         return callback(null, true)
//       }
  
//       return callback(new Error('Not allowed by CORS'))
//     }
//   }))



app.get('/',(req,res)=>{
    res.json({message:'hola mundo'})
})

const ACCEPTED_ORIGINS =[
    'htpp://localhost:8080',
    'http://movies.com',
    'http://vilca.dev',
    'http://127.0.0.1:5500'
]

// Todos los recursos que sean MOVIES se identiica con /movies
app.get('/movies',(req,res)=>{

    const origin = req.header('origin')
    // Cuando la petición es del mismo origen, entonces el navegador no te devuelve el header,
    // - ya que sería el mismo http://localhost:1234 -> http://localhost:1234

    if(ACCEPTED_ORIGINS.includes(origin) || !origin){
        // Con * le dices que puede acceder cualquier origen, puedes restringirlo colocando solo
        // la url de origen, por ejemplo http://localhost:8080
        res.header('Access-Control-Allow-Origin',origin)
    }

    const { genre } = req.query
    if(genre){
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

app.get('/movies/:id',(req,res)=>{ //path-to-regexp
    const {id} = req.params
    const movie = movies.find(movie => movie.id === id)
    if(movie) return res.json(movie)
    res.status(404).json({messsage:'Movie not found'})
})

app.post('/movies',(req, res)=>{

   const result = validateMovie(req.body)

   if(result.error){
    return res.status(400).json({error: JSON.parse(result.error.message) })
   }
    const newMovie ={
        id: crypto.randomUUID(), //uuid v4
        ...result.data
    }
    // Esto no sería REST, porque estamos guardando el estado de la aplicación en memoria
    movies.push(newMovie)
    res.status(201).json(newMovie) 
})


app.delete('/movies/:id',(req, res)=>{
  
    const origin = req.header('origin')
    // Cuando la petición es del mismo origen, entonces el navegador no te devuelve el header,
    // - ya que sería el mismo http://localhost:1234 -> http://localhost:1234

    if(ACCEPTED_ORIGINS.includes(origin) || !origin){
        // Con * le dices que puede acceder cualquier origen, puedes restringirlo colocando solo
        // la url de origen, por ejemplo http://localhost:8080
        res.header('Access-Control-Allow-Origin',origin)
    }
    
   
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
  
    if (movieIndex === -1) {
      return res.status(404).json({ message: 'Movie not found' })
    }
  
    movies.splice(movieIndex, 1)
  
    return res.json({ message: 'Movie deleted' })
})


app.patch('/movies/:id',(req, res)=>{
    
    const result = validatePartialMovie(req.body)
    
    if(!result.success){
        return res.status(400).json({error: JSON.parse(result.error.message) })
    }
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if(movieIndex === -1){
        return res.status(404).json({ message:'Movie not found' })
    }

    const updateMovie ={
       ...movies[movieIndex],
       ...result.data 
    }
    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
})


app.options('/movies/:id',(req, res)=>{
    const origin = req.header('origin')
    // Cuando la petición es del mismo origen, entonces el navegador no te devuelve el header,
    // - ya que sería el mismo http://localhost:1234 -> http://localhost:1234
    if(ACCEPTED_ORIGINS.includes(origin) || !origin){
        // Con * le dices que puede acceder cualquier origen, puedes restringirlo colocando solo
        // la url de origen, por ejemplo http://localhost:8080
        res.header('Access-Control-Allow-Origin',origin)
        res.header('Access-Control-Allow-Methods', 'GET , POST, PUT, PATCH, DELETE')
    }
    res.send(200)
})

// Si el puerto me viene por variable de entorno (si se despliega la api lo 
// dará el hosting), entonces lo asigna, sino utiliza el puerto 3000
// !Nota: Las variables de Entorno siempre son en mayúsculas

const PORT = process.env.PORT ?? 3000

app.listen(PORT,()=>{
    console.log(`server listening on port http://localhost:${PORT}`)
})