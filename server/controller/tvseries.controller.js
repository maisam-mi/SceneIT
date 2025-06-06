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
    const response = await fetch(`${tmdbApiBaseUrl}/tv/popular`, tmdbApiOptions);
    const tvSeries = (await response.json()).results;
    res.send(tvSeries);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching tv series');
  }
};

const getDetailsOfTvSerie = async (req, res) => {
  try {
    let tvSerie;
    // basic details
    let response = await fetch(`${tmdbApiBaseUrl}/tv/${req.params.tvSerieId}`, tmdbApiOptions);
    tvSerie = await response.json();
    // "cast and crew" details
    response = await fetch(`${tmdbApiBaseUrl}/tv/${req.params.tvSerieId}/credits`, tmdbApiOptions);
    tvSerie.cast = (await response.json()).cast;
    // "trailers and teaser" details
    response = await fetch(`${tmdbApiBaseUrl}/tv/${req.params.tvSerieId}/videos`, tmdbApiOptions);
    tvSerie.trailers = (await response.json()).results;
    // keywords details
    response = await fetch(`${tmdbApiBaseUrl}/tv/${req.params.tvSerieId}/keywords`, tmdbApiOptions);
    tvSerie.keywords = (await response.json()).keywords;

    res.send(tvSerie);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching details of a tv serie');
  }
};

const searchTvSeries = async (req, res) => {
  try {
    const response = await fetch(
      `${tmdbApiBaseUrl}/discover/tv?with_genres=${req.query.genreId}`,
      tmdbApiOptions,
    );
    const series = (await response.json()).results;
    res.send(series);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching tv series of search request');
  }
};

const getGenres = async (req, res) => {
  try {
    const response = await fetch(`${tmdbApiBaseUrl}/genre/tv/list`, tmdbApiOptions);
    const genres = (await response.json()).genres;
    res.send(genres);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching tv series genres');
  }
};

const getFavouriteList = async (req, res) => {
  const { username } = req.account;
  if (!account)
    res.status(404).json({ error: 'The favourite list for this account is not found!' });

  const favourite = readFile(FAVOURITES_FILE).find((favourite) => favourite.username === username);
  res.status(201).json(favourite.tvseries);
};

const addTvSerieToFavourite = async (req, res) => {
  const tvSerie = req.body.tvSerie;

  const favourites = readFile(FAVOURITES_FILE);

  const favourite = favourites.find((favourite) => favourite.username === req.account.username);
  if (!favourite) res.status(404).json({ message: 'The favourite list is not found!' });

  favourites.map((favourite) => {
    if (favourite.username === req.account.username) favourite.tvseries.push(tvSerie);
  });

  writeFile(FAVOURITES_FILE, favourites);

  res.status(201).json({ message: 'The TV serie is added to favourite list!' });
};

const deleteTvSerieFromFavourite = async (req, res) => {
  const { tvSerieId } = req.params;

  const favourites = readFile(FAVOURITES_FILE);

  const favourite = favourites.find((favourite) => favourite.username === req.account.username);
  if (!favourite) return res.status(404).json({ message: 'The favourite list is not found!' });

  favourites.forEach((favourite) => {
    if (favourite.username === req.account.username) {
      favourite.tvseries = favourite.tvseries.filter(
        (tvserie) => tvserie.id !== parseInt(tvSerieId),
      );
    }
  });

  try {
    writeFile(FAVOURITES_FILE, favourites);
    res.status(204).json({ message: 'The TV Serie is deleted form favourite list!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update favourites!' });
  }
};

module.exports = {
  getHighlights,
  getDetailsOfTvSerie,
  searchTvSeries,
  getGenres,
  getFavouriteList,
  addTvSerieToFavourite,
  deleteTvSerieFromFavourite,
};
