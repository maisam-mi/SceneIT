const express = require('express');
const path = require('path');

const app = express();

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

app.get('/hello', (req, res) => {
  res.send('Hello BugBusters!');
});

// it responses an array of right now highlighted movies. 
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

// it responses an object for the details of a movie.
// paramters: 
//      movieId => the id of the movie.
app.get('/movies/details/:movieId', async (req, res) => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${req.params.movieId}`, options);
      const movie = await response.json();
      res.send(movie);
    } catch (err) {
      console.log(err);
      res.status(500).send('Error fetching details of a movie');
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


// Added extra for extra details
// Fetch movie credits (cast and crew) 
app.get('/movies/credits/:movieId', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${req.params.movieId}/credits`, 
      options
    );
    const credits = await response.json();
    res.send(credits);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching credits');
  }
});

// Fetch movie videos (trailers, teasers)
app.get('/movies/videos/:movieId', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${req.params.movieId}/videos`, 
      options
    );
    const videos = await response.json();
    res.send(videos);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching videos');
  }
});


app.listen(3100);

console.log('Server now listening on http://localhost:3100/');
