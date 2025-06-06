const tmdbApiBaseUrl = 'https://api.themoviedb.org/3';
const tmdbApiOptions = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZmFkNDlhMGQ1ZmFjMjg1ODc5MGUxYWUzMTQzYzY2ZSIsIm5iZiI6MS43NDIyMzYxMDM2NTc5OTk4ZSs5LCJzdWIiOiI2N2Q4NjljNzAyZTVhYWM0NDMwMTE0YjkiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.utCg0oq0jdlR6AjmPNyIqcdclwsIfVwmlMUbPZ867gA',
  },
};

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

module.exports = { getHighlights, getDetailsOfMovie, searchMovies, getGenres };
