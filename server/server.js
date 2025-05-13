const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'files')));

const url = 'https://api.themoviedb.org/3/authentication';
const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZmFkNDlhMGQ1ZmFjMjg1ODc5MGUxYWUzMTQzYzY2ZSIsIm5iZiI6MS43NDIyMzYxMDM2NTc5OTk4ZSs5LCJzdWIiOiI2N2Q4NjljNzAyZTVhYWM0NDMwMTE0YjkiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.utCg0oq0jdlR6AjmPNyIqcdclwsIfVwmlMUbPZ867gA',
    },
};
//hi
app.get('/hello', (req, res) => {
    res.send('Hello BugBusters!');
});

// it responses an array of currently highlighted movies. 
app.get('/movies/highlight', async(req, res) => {
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
app.get('/tvSeries/highlight', async(req, res) => {
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
app.get('/movies/details/:movieId', async(req, res) => {
    try {
        let movie;
        // basic details  
        let response = await fetch(
            `https://api.themoviedb.org/3/movie/${req.params.movieId}`,
            options,
        );
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
app.get('/tvSeries/details/:tvSerieId', async(req, res) => {
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
app.get('/movies/search', async(req, res) => {
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

app.get('/tvSeries/search', async(req, res) => {
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
app.get('/genres', async(req, res) => {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list`, options);
        const genres = (await response.json()).genres;
        res.send(genres);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error fetching genres');
    }
});

app.get('/tvSeries/genres', async(req, res) => {
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
app.get('/actors', async(req, res) => {
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