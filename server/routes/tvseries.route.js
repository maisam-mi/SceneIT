const express = require('express');
const { authMiddleware } = require('../authorization');
const controller = require('../controller/tvseries.controller');

const router = express.Router();

// it responses an array of currently highlighted tv series.
router.get('/highlight', controller.getHighlights);

// it responses an object for the details of a tv serie.
// paramters:
//      tvSerieId => the id of the tv serie.
router.get('/details/:tvSerieId', controller.getDetailsOfTvSerie);

// it responses an array of tv series as result of searching through genres.
// query:
//      genreId => id of genre. if theres more genres, give the ids seperated with comma. e.g. : 12,28
router.get('/search', controller.searchTvSeries);

// it responses an array of all genres.
router.get('/genres', controller.getGenres);

// protected endpoint, it responses an array of favourites tv series.
router.get('/favourite', authMiddleware, controller.getFavouriteList);

// protected endpoint, it adds a tv serie as favourite for an account.
router.post('/favourite', authMiddleware, controller.addTvSerieToFavourite);

// protected endpoint, it deletes a tv serie from the favourite list for an account.
router.delete('/favourite/:tvSerieId', authMiddleware, controller.deleteTvSerieFromFavourite);

module.exports = router;
