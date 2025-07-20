const express = require('express');
const { authMiddleware } = require('../authorization');
const controller = require('../controller/movies.controller');

const router = express.Router();

// it responses an array of currently highlighted movies.
router.get('/highlight', controller.getHighlights);

// it responses an object for the details of a movie.
// paramters:
//      movieId => the id of the movie.
router.get('/details/:movieId', controller.getDetailsOfMovie);


// it responses an array of all genres.
router.get('/genres', controller.getGenres);

// protected endpoint, it responses an array of favourites movies.
router.get('/favourite', authMiddleware, controller.getFavouriteList);

// protected endpoint, it adds a movie as favourite for an account.
router.post('/favourite', authMiddleware, controller.addMovieToFavourite);

// protected endpoint, it deletes a movie from the favourite list for an account.
router.delete('/favourite/:movieId', authMiddleware, controller.deleteMovieFromFavourite);

module.exports = router;
