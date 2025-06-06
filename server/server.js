const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');
const accounts = require('./data/accounts.json');

const app = express();
app.use(express.json());

const ACCOUNTS_FILE = './server/data/accounts.json';
const FAVOURITES_FILE = './server/data/favourites.json';
const WATCHLISTS_FILE = './server/data/watchlists.json';
const JWT_SECRET = 'supersecretkey';

let likedMovies = [];

// Allowing the server on port 8081 sending requests.
app.use(
  cors({
    origin: 'http://localhost:8081',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// reading the content of the file.
function readFile(filePath) {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
}

// writing the content of the file.
function writeFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

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

// Here a new account is registered.
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const accounts = readFile(ACCOUNTS_FILE);

  console.log(req.body);

  if (accounts.find((account) => account.username === username)) {
    return res.status(400).json({ error: 'Account already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  accounts.push({ username, password: hashedPassword });
  writeFile(ACCOUNTS_FILE, accounts);

  console.log('Registration was successfull!');

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.status(201).json({ token, message: 'Account registered successfully' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const accounts = readFile(ACCOUNTS_FILE);

  const account = accounts.find((account) => account.username === username);
  if (!account || !(await bcrypt.compare(password, account.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.delete('/deleteAccount/:username', async (req, res) => {
  const { username } = req.params;
  if (!accounts.find((account) => account.username === username))
    res.status(400).json({ error: 'Account could not be deleted' });

  const updatedAccounts = readFile(ACCOUNTS_FILE).filter(
    (account) => account.username !== username,
  );
  writeFile(ACCOUNTS_FILE, updatedAccounts);

  res.json({ message: 'Account is deleted successfully.' });
});

// it responses an array of currently highlighted movies.
app.get('/movies/highlight', async (req, res) => {
  try {
    const response = await fetch(`${tmdbApiBaseUrl}/movie/popular`, tmdbApiOptions);
    const movies = (await response.json()).results;
    res.send(movies);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching movies');
  }
});

// it responses an array of currently highlighted tv series.
app.get('/tvSeries/highlight', async (req, res) => {
  try {
    const response = await fetch(`${tmdbApiBaseUrl}/tv/popular`, tmdbApiOptions);
    const tvSeries = (await response.json()).results;
    res.send(tvSeries);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching tv series');
  }
});

// it responses an object for the details of a movie.
// paramters:
//      movieId => the id of the movie.
app.get('/movies/details/:movieId', async (req, res) => {
  try {
    let movie;
    // basic details
    let response = await fetch(`${tmdbApiBaseUrl}/movie/${req.params.movieId}`, tmdbApiOptions);
    movie = await response.json();
    // "cast and crew" details
    response = await fetch(`${tmdbApiBaseUrl}/movie/${req.params.movieId}/credits`, tmdbApiOptions);
    movie.cast = (await response.json()).cast;
    // "trailers and teaser" details
    response = await fetch(`${tmdbApiBaseUrl}/movie/${req.params.movieId}/videos`, tmdbApiOptions);
    movie.trailers = (await response.json()).results;
    // keywords details
    response = await fetch(
      `${tmdbApiBaseUrl}/movie/${req.params.movieId}/keywords`,
      tmdbApiOptions,
    );
    movie.keywords = (await response.json()).keywords;

    res.send(movie);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching details of a movie');
  }
});

// it responses an object for the details of a tv serie.
// paramters:
//      tvSerieId => the id of the tv serie.
app.get('/tvSeries/details/:tvSerieId', async (req, res) => {
  try {
    let tvSerie;
    // basic details
    let response = await fetch(`${tmdbApiBaseUrl}/tv/${req.params.tvSerieId}`, tmdbApiOptions);
    tvSerie = await response.json();
    // "cast and crew" details
    response = await fetch(`${tmdbApiBaseUrl}/tv/${req.params.tvSerieId}/credits`, tmdbApiOptions);
    tvSerie.cast = (await response.json()).cast;
    // "trailers and teaser" details
    response = await fetch(`${tmdbApiBaseUrl}/tv/${req.params.tvSerieId}/videos`, tmdbApiOptions);
    tvSerie.trailers = (await response.json()).results;
    // keywords details
    response = await fetch(`${tmdbApiBaseUrl}/tv/${req.params.tvSerieId}/keywords`, tmdbApiOptions);
    tvSerie.keywords = (await response.json()).keywords;

    res.send(tvSerie);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching details of a tv serie');
  }
});

// it responses an array of movies as result of searching through genres.
// query:
//      genreId => id of genre. if theres more genres, give the ids seperated with comma. e.g. : 12,28
app.get('/movies/search', async (req, res) => {
  try {
    const response = await fetch(
      `${tmdbApiBaseUrl}/discover/movie?with_genres=${req.query.genreId}`,
      tmdbApiOptions,
    );
    const movies = (await response.json()).results;
    res.send(movies);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching movies of search request');
  }
});

app.get('/tvSeries/search', async (req, res) => {
  try {
    const response = await fetch(
      `${tmdbApiBaseUrl}/discover/tv?with_genres=${req.query.genreId}`,
      tmdbApiOptions,
    );
    const series = (await response.json()).results;
    res.send(series);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching tv series of search request');
  }
});

// it responses an array of all genres.
app.get('/genres', async (req, res) => {
  try {
    const response = await fetch(`${tmdbApiBaseUrl}/genre/movie/list`, tmdbApiOptions);
    const genres = (await response.json()).genres;
    res.send(genres);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching genres');
  }
});

app.get('/tvSeries/genres', async (req, res) => {
  try {
    const response = await fetch(`${tmdbApiBaseUrl}/genre/tv/list`, tmdbApiOptions);
    const genres = (await response.json()).genres;
    res.send(genres);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching tv series genres');
  }
});

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
