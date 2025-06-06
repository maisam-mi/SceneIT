const express = require('express');
const controller = require('../controller/movies.controller');

const router = express.Router();

// it responses an array of currently highlighted movies.
router.get('/highlight', controller.getHighlights);

// it responses an object for the details of a movie.
// paramters:
//      movieId => the id of the movie.
router.get('/details/:movieId', controller.getDetailsOfMovie);

// it responses an array of movies as result of searching through genres.
// query:
//      genreId => id of genre. if theres more genres, give the ids seperated with comma. e.g. : 12,28
router.get('/search', controller.searchMovies);

// it responses an array of all genres.
router.get('/genres', controller.getGenres);

module.exports = router;
