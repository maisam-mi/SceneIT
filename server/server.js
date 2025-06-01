const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');
const accounts = require('../accounts.json');

const app = express();
app.use(express.json());

const ACCOUNTS_FILE = './accounts.json';
const JWT_SECRET = 'supersecretkey';

app.use(cors());

function readAccounts() {
  if (!fs.existsSync(ACCOUNTS_FILE)) fs.writeFileSync(ACCOUNTS_FILE, '[]');
  const data = fs.readFileSync(ACCOUNTS_FILE);
  return JSON.parse(data);
}

function writeAccounts(accounts) {
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
}

app.use(express.static(path.join(__dirname, 'files')));

const url = 'https://api.themoviedb.org/3/authentication';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZmFkNDlhMGQ1ZmFjMjg1ODc5MGUxYWUzMTQzYzY2ZSIsIm5iZiI6MS43NDIyMzYxMDM2NTc5OTk4ZSs5LCJzdWIiOiI2N2Q4NjljNzAyZTVhYWM0NDMwMTE0YjkiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.utCg0oq0jdlR6AjmPNyIqcdclwsIfVwmlMUbPZ867gA',
  },
};

//hi
app.get('/hello', (req, res) => {
  res.send('Hello BugBusters!');
});

// Here a new account is registered.
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const accounts = readAccounts();

  console.log(req.body);

  if (accounts.find((account) => account.username === username)) {
    return res.status(400).json({ error: 'Account already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  accounts.push({ username, password: hashedPassword });
  writeAccounts(accounts);

  console.log('Registration was successfull!');

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.status(201).json({ token, message: 'Account registered successfully' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const accounts = readAccounts();

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

  const updatedAccounts = readAccounts().filter(account => account.username !== username);
  writeAccounts(updatedAccounts);

  res.json({ message: 'Account is deleted successfully.' });
});

// it responses an array of currently highlighted movies.
app.get('/movies/highlight', async (req, res) => {
  try {
    const response = await fetch('https://api.themoviedb.org/3/movie/popular', options);
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
    const response = await fetch('https://api.themoviedb.org/3/tv/popular', options);
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
    let response = await fetch(`https://api.themoviedb.org/3/movie/${req.params.movieId}`, options);
    movie = await response.json();
    // "cast and crew" details
    response = await fetch(
      `https://api.themoviedb.org/3/movie/${req.params.movieId}/credits`,
      options,
    );
    movie.cast = (await response.json()).cast;
    // "trailers and teaser" details
    response = await fetch(
      `https://api.themoviedb.org/3/movie/${req.params.movieId}/videos`,
      options,
    );
    movie.trailers = (await response.json()).results;
    // keywords details
    response = await fetch(
      `https://api.themoviedb.org/3/movie/${req.params.movieId}/keywords`,
      options,
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
    let response = await fetch(`https://api.themoviedb.org/3/tv/${req.params.tvSerieId}`, options);
    tvSerie = await response.json();
    // "cast and crew" details
    response = await fetch(
      `https://api.themoviedb.org/3/tv/${req.params.tvSerieId}/credits`,
      options,
    );
    tvSerie.cast = (await response.json()).cast;
    // "trailers and teaser" details
    response = await fetch(
      `https://api.themoviedb.org/3/tv/${req.params.tvSerieId}/videos`,
      options,
    );
    tvSerie.trailers = (await response.json()).results;
    // keywords details
    response = await fetch(
      `https://api.themoviedb.org/3/tv/${req.params.tvSerieId}/keywords`,
      options,
    );
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
      `https://api.themoviedb.org/3/discover/movie?with_genres=${req.query.genreId}`,
      options,
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
      `https://api.themoviedb.org/3/discover/tv?with_genres=${req.query.genreId}`,
      options,
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
    const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list`, options);
    const genres = (await response.json()).genres;
    res.send(genres);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching genres');
  }
});

app.get('/tvSeries/genres', async (req, res) => {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/genre/tv/list`, options);
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
    const response = await fetch(`https://api.themoviedb.org/3/person/popular`, options);
    const actors = (await response.json()).results;
    res.send(actors);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching actors');
  }
});

app.listen(3100);

console.log('Server now listening on http://localhost:3100/');
