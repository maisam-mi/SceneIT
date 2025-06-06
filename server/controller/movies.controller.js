const { readFile, writeFile } = require('../fileMethods');

const tmdbApiBaseUrl = 'https://api.themoviedb.org/3';
const tmdbApiOptions = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZmFkNDlhMGQ1ZmFjMjg1ODc5MGUxYWUzMTQzYzY2ZSIsIm5iZiI6MS43NDIyMzYxMDM2NTc5OTk4ZSs5LCJzdWIiOiI2N2Q4NjljNzAyZTVhYWM0NDMwMTE0YjkiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.utCg0oq0jdlR6AjmPNyIqcdclwsIfVwmlMUbPZ867gA',
  },
};

const FAVOURITES_FILE = './server/data/favourites.json';

const getHighlights = async (req, res) => {
  try {
    const response = await fetch(`${tmdbApiBaseUrl}/movie/popular`, tmdbApiOptions);
    const movies = (await response.json()).results;
    res.send(movies);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching movies');
  }
};

const getDetailsOfMovie = async (req, res) => {
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
};

const searchMovies = async (req, res) => {
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
};

const getGenres = async (req, res) => {
  try {
    const response = await fetch(`${tmdbApiBaseUrl}/genre/movie/list`, tmdbApiOptions);
    const genres = (await response.json()).genres;
    res.send(genres);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching genres');
  }
};

const getFavouriteList = async (req, res) => {
  const { username } = req.account;
  if (!account)
    res.status(404).json({ error: 'The favourite list for this account is not found!' });

  const favourite = readFile(FAVOURITES_FILE).find((favourite) => favourite.username === username);
  res.status(201).json(favourite.movies);
};

const addMovieToFavourite = async (req, res) => {
  const movie = req.body.movie;
  console.log(req.body.movie);

  const favourites = readFile(FAVOURITES_FILE);

  const favourite = favourites.find((favourite) => favourite.username === req.account.username);
  if (!favourite) res.status(404).json({ message: 'The favourite list is not found!' });

  favourites.map((favourite) => {
    if (favourite.username === req.account.username) favourite.movies.push(movie);
  });

  writeFile(FAVOURITES_FILE, favourites);

  res.status(201).json({ message: 'The Movie is added to favourite list!' });
};

const deleteMovieFromFavourite = async (req, res) => {
  const { movieId } = req.params;

  const favourites = readFile(FAVOURITES_FILE);

  const favourite = favourites.find((favourite) => favourite.username === req.account.username);
  if (!favourite) return res.status(404).json({ message: 'The favourite list is not found!' });

  favourites.forEach((favourite) => {
    if (favourite.username === req.account.username) {
      favourite.movies = favourite.movies.filter((movie) => movie.id !== parseInt(movieId));
    }
  });

  try {
    writeFile(FAVOURITES_FILE, favourites);
    res.status(204).json({ message: 'The Movie is deleted form favourite list!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update favourites!' });
  }
};

module.exports = {
  getHighlights,
  getDetailsOfMovie,
  searchMovies,
  getGenres,
  getFavouriteList,
  addMovieToFavourite,
  deleteMovieFromFavourite,
};
