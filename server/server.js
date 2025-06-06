const express = require('express');
const cors = require('cors');
const path = require('path');

const accountRoute = require('./routes/account.route');
const moviesRoute = require('./routes/movies.route');
const tvSeriesRoute = require('./routes/tvseries.route');
const actorsRoute = require('./routes/actors.route');

const app = express();
app.use(express.json());

let likedMovies = [];

// Allowing the server on port 8081 sending requests.
app.use(
  cors({
    origin: 'http://localhost:8081',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.static(path.join(__dirname, 'files')));

// An endpoint to check the server.
app.get('/hello', (req, res) => {
  res.send('Hello BugBusters!');
});

// All account requests forwarded to this route. 
app.use('/account', accountRoute);

// All movies requests forwarded to this route.
app.use('/movies', moviesRoute);

// All tv series requests forwarded to this route. 
app.use('/tvSeries', tvSeriesRoute);

// All actors requests forwarded to this route. 
app.use('/actors', actorsRoute);

app.listen(3100);

console.log('Server now listening on http://localhost:3100/');
