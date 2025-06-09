const { readFile, writeFile } = require('../fileMethods');

const omdbApiBaseUrl = 'http://www.omdbapi.com';
const omdbapiAPIkey = '2213abc8';

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

    response = await fetch(`${omdbApiBaseUrl}/?apikey=${omdbapiAPIkey}&t=${movie.original_title}`);
    movie.ratings = (await response.json()).Ratings;
    
    res.send(movie);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching details of a movie');
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
  const favourites = readFile(FAVOURITES_FILE);

  const favouriteEntry = favourites.find((favourite) => favourite.username === username);

  if (!favouriteEntry) {
    return res.status(404).json({ error: 'The favourite list for this account is not found!' });
  }

  const favouriteMovieIds = favouriteEntry.movies; // Get the list of IDs

  // If there are no favourited movies, return an empty array immediately
  if (favouriteMovieIds.length === 0) {
      return res.status(200).json([]);
  }

  try {
    // Fetch details for each movie ID concurrently
    const movieDetailPromises = favouriteMovieIds.map(async (movieId) => {
      const response = await fetch(`${tmdbApiBaseUrl}/movie/${movieId}`, tmdbApiOptions);
      if (!response.ok) {
        console.warn(`Could not fetch details for movie ID ${movieId}. Status: ${response.status}`);
        return null; // Return null or throw error if you want to fail the whole request
      }
      return await response.json();
    });

    const detailedMovies = await Promise.all(movieDetailPromises);

    // Filter out any nulls if some fetches failed
    const validDetailedMovies = detailedMovies.filter(movie => movie !== null);

    return res.status(200).json(validDetailedMovies);
  } catch (err) {
    console.error('Error fetching detailed favourite movies:', err);
    return res.status(500).json({ message: 'Error fetching favourite movies details.' });
  }
};


const addMovieToFavourite = async (req, res) => {
  const { movie } = req.body; // The movie object is still sent from the frontend
  const movieId = movie.id; // Extract only the ID

  const favourites = readFile(FAVOURITES_FILE);

  const favourite = favourites.find((favourite) => favourite.username === req.account.username);
  if (!favourite) {
    // If it can, you might want to create a new entry here.
    return res.status(404).json({ message: 'The favourite list is not found for this user!' });
  }

  // Prevent duplicates: Check if the movie is already in the list
  if (favourite.movies.includes(movieId)) {
    return res.status(409).json({ message: 'Movie already in favourites!' }); // 409 Conflict
  }

  favourites.map((favouriteEntry) => { // Renamed 'favourite' to 'favouriteEntry' to avoid shadowing
    if (favouriteEntry.username === req.account.username) {
      favouriteEntry.movies.push(movieId); // Push only the ID
    }
  });

  writeFile(FAVOURITES_FILE, favourites);

  res.status(201).json({ message: 'The Movie is added to favourite list!' });
};

const deleteMovieFromFavourite = async (req, res) => {
  const { movieId } = req.params; // This is already the ID

  const favourites = readFile(FAVOURITES_FILE);

  const favourite = favourites.find((favourite) => favourite.username === req.account.username);
  if (!favourite) {
    return res.status(404).json({ message: 'The favourite list is not found!' });
  }

  favourites.forEach((favouriteEntry) => {
    if (favouriteEntry.username === req.account.username) {
      favouriteEntry.movies = favouriteEntry.movies.filter(
        (id) => id !== parseInt(movieId) // 'id' here is now just the integer ID
      );
    }
  });

  try {
    writeFile(FAVOURITES_FILE, favourites);
    return res.status(204).send(); // Send 204 No Content, no body
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update favourites!' });
  }
};


module.exports = {
  getHighlights,
  getDetailsOfMovie,
  getGenres,
  getFavouriteList,
  addMovieToFavourite,
  deleteMovieFromFavourite,
};
