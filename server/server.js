const express = require('express');
const cors = require('cors');
const path = require('path');

const accountRoute = require('./routes/account.route');
const moviesRoute = require('./routes/movies.route');
const tvSeriesRoute = require('./routes/tvseries.route');

const app = express();
app.use(express.json());

const FAVOURITES_FILE = './server/data/favourites.json';
const WATCHLISTS_FILE = './server/data/watchlists.json';

let likedMovies = [];

// Allowing the server on port 8081 sending requests.
app.use(
  cors({
    origin: 'http://localhost:8081',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.static(path.join(__dirname, 'files')));

const tmdbApiBaseUrl = 'https://api.themoviedb.org/3';
const tmdbApiOptions = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZmFkNDlhMGQ1ZmFjMjg1ODc5MGUxYWUzMTQzYzY2ZSIsIm5iZiI6MS43NDIyMzYxMDM2NTc5OTk4ZSs5LCJzdWIiOiI2N2Q4NjljNzAyZTVhYWM0NDMwMTE0YjkiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.utCg0oq0jdlR6AjmPNyIqcdclwsIfVwmlMUbPZ867gA',
  },
};

// An endpoint to check the server.
app.get('/hello', (req, res) => {
  res.send('Hello BugBusters!');
});

// All account requests forwarded to this route. 
app.use('/account', accountRoute);

// All movies requests forwarded to this route.
app.use('/movies', moviesRoute);

// All tv series requests forwarded to this route. 
app.use('/tvSeries', tvSeriesRoute);

// it responses an array of currently popular actors.
app.get('/actors', async (req, res) => {
  try {
    const response = await fetch(`${tmdbApiBaseUrl}/person/popular`, tmdbApiOptions);
    const actors = (await response.json()).results;
    res.send(actors);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching actors');
  }
});

// alle gelikten Filme abrufen
app.get('/api/liked-movies', (req, res) => {
  res.json(likedMovies);
});

// Filme liken
app.post('/api/liked-movies', (req, res) => {
  const movie = req.body;
  if (!likedMovies.some((m) => m.id === movie.id)) {
    likedMovies.push(movie);
    res.status(201).json(movie);
  }
});

// Like entfernen
app.delete('/api/liked-movies/:id', (req, res) => {
  const { id } = req.params;
  likedMovies = likedMovies.filter((movie) => movie.id !== parseInt(id));
  res.status(204).send();
});

app.listen(3100);

console.log('Server now listening on http://localhost:3100/');
