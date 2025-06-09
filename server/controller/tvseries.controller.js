const { readFile, writeFile } = require('../fileMethods');

const omdbApiBaseUrl = 'http://www.omdbapi.com';
const omdbapiAPIkey = '2213abc8';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '0fb85046bace36532f9e8ccb89101157';

const FAVOURITES_FILE = './server/data/favourites.json';

// Helper function to build URLs with query parameters for fetch
const buildUrlWithQueryParams = (baseUrl, params) => {
    const url = new URL(baseUrl);
    for (const key in params) {
        if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
        }
    }
    return url.toString();
};

const getHighlights = async (req, res) => {
    try {
        const url = buildUrlWithQueryParams(`${TMDB_API_BASE_URL}/tv/popular`, { api_key: TMDB_API_KEY, language: 'en-US', with_original_language: 'en' });
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            console.error(`TMDB Highlight API Error: ${response.status} - ${errorBody.status_message || response.statusText}`);
            return res.status(response.status).send('Error fetching tv series highlights');
        }
        const tvSeries = (await response.json()).results;
        res.send(tvSeries);
    } catch (err) {
        console.error('Error fetching tv series highlights:', err);
        res.status(500).send('Error fetching tv series highlights');
    }
};

const getDetailsOfTvSerie = async (req, res) => {
    try {
        let tvSerie;
        // basic details
        const detailsUrl = buildUrlWithQueryParams(`${TMDB_API_BASE_URL}/tv/${req.params.tvSerieId}`, { api_key: TMDB_API_KEY, language: 'en-US' });
        let response = await fetch(detailsUrl);
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            console.error(`TMDB Details API Error (${req.params.tvSerieId}): ${response.status} - ${errorBody.status_message || response.statusText}`);
            return res.status(response.status).send('Error fetching basic tv series details');
        }
        tvSerie = await response.json();

        // "cast and crew" details
        const creditsUrl = buildUrlWithQueryParams(`${TMDB_API_BASE_URL}/tv/${req.params.tvSerieId}/credits`, { api_key: TMDB_API_KEY, language: 'en-US' });
        response = await fetch(creditsUrl);
        if (!response.ok) {
            console.warn(`TMDB Credits API Error (${req.params.tvSerieId}): ${response.status}`);
        } else {
            tvSerie.cast = (await response.json()).cast;
        }

        // "trailers and teaser" details
        const videosUrl = buildUrlWithQueryParams(`${TMDB_API_BASE_URL}/tv/${req.params.tvSerieId}/videos`, { api_key: TMDB_API_KEY, language: 'en-US' });
        response = await fetch(videosUrl);
        if (!response.ok) {
            console.warn(`TMDB Videos API Error (${req.params.tvSerieId}): ${response.status}`);
        } else {
            tvSerie.trailers = (await response.json()).results;
        }

        // keywords details
        const keywordsUrl = buildUrlWithQueryParams(`${TMDB_API_BASE_URL}/tv/${req.params.tvSerieId}/keywords`, { api_key: TMDB_API_KEY, language: 'en-US' });
        response = await fetch(keywordsUrl);
        if (!response.ok) {
            console.warn(`TMDB Keywords API Error (${req.params.tvSerieId}): ${response.status}`);
        } else {
            tvSerie.keywords = (await response.json()).keywords;
        }

        response = await fetch(
          `${omdbApiBaseUrl}/?apikey=${omdbapiAPIkey}&t=${tvSerie.original_title}`,
        );
        tvSerie.ratings = (await response.json()).Ratings;

        res.send(tvSerie);
    } catch (err) {
        console.error('Error fetching details of a tv serie:', err);
        res.status(500).send('Error fetching details of a tv serie');
    }
};

const searchTvSeries = async (req, res) => {
    try {
        const url = buildUrlWithQueryParams(`${tmdbApiBaseUrl}/discover/tv`, {
            api_key: TMDB_API_KEY,
            with_genres: req.query.genreId,
            language: 'en-US',
            with_original_language: 'en'
        });
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            console.error(`TMDB Search API Error: ${response.status} - ${errorBody.status_message || response.statusText}`);
            return res.status(response.status).send('Error fetching tv series for search request');
        }
        const series = (await response.json()).results;
        res.send(series);
    } catch (err) {
        console.log('Error fetching tv series of search request:', err);
        res.status(500).send('Error fetching tv series of search request');
    }
};

const getGenres = async (req, res) => {
    try {
        const url = buildUrlWithQueryParams(`${tmdbApiBaseUrl}/genre/tv/list`, { api_key: TMDB_API_KEY, language: 'en-US' });
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            console.error(`TMDB Genres API Error: ${response.status} - ${errorBody.status_message || response.statusText}`);
            return res.status(response.status).send('Error fetching tv series genres');
        }
        const genres = (await response.json()).genres;
        res.send(genres);
    } catch (err) {
        console.log('Error fetching tv series genres:', err);
        res.status(500).send('Error fetching tv series genres');
    }
};


const getFavouriteTvList = async (req, res) => {
    const { username } = req.account;
    const favourites = readFile(FAVOURITES_FILE);

    const favouriteEntry = favourites.find((favourite) => favourite.username === username);

    if (!favouriteEntry) {
        return res.status(404).json({ error: 'The favourite list for this account is not found!' });
    }

    const favouriteTvSerieIds = favouriteEntry.tvseries || []; // Ensure it's an array

    if (favouriteTvSerieIds.length === 0) {
        return res.status(200).json([]);
    }

    try {
        const tvSerieDetailPromises = favouriteTvSerieIds.map(async (tvSerieId) => {
            const url = buildUrlWithQueryParams(`${TMDB_API_BASE_URL}/tv/${tvSerieId}`, { api_key: TMDB_API_KEY, language: 'en-US' });
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`Could not fetch details for TV Serie ID ${tvSerieId}. Status: ${response.status}`);
                try {
                    const errorBody = await response.json();
                    console.warn(`  TMDB Error for ${tvSerieId}: ${errorBody.status_message || JSON.stringify(errorBody)}`);
                } catch (e) {}
                return null;
            }
            return await response.json();
        });

        const detailedTvSeries = await Promise.all(tvSerieDetailPromises);
        const validDetailedTvSeries = detailedTvSeries.filter(tv => tv !== null);

        return res.status(200).json(validDetailedTvSeries);
    } catch (err) {
        console.error('Error fetching detailed favourite TV series:', err);
        return res.status(500).json({ message: 'Error fetching favourite TV series details.' });
    }
};


const addTvSerieToFavourite = (req, res) => { 
    if (!req.body || !req.body.tvSeries || typeof req.body.tvSeries.id === 'undefined') {
        console.error('Invalid request body for addTvSerieToFavourite:', req.body);
        return res.status(400).json({ message: 'Missing TV series data (id).' });
    }

    const { tvSeries } = req.body; // Full object sent from FE
    const tvSerieId = tvSeries.id;

    const favourites = readFile(FAVOURITES_FILE);

    const favourite = favourites.find((fav) => fav.username === req.account.username);
    if (!favourite) {
        return res.status(404).json({ message: 'The favourite list is not found for this user!' });
    }

    // Ensure `tvseries` array exists for the user in `favourites.json`
    if (!favourite.tvseries) {
        favourite.tvseries = [];
    }

    if (favourite.tvseries.includes(tvSerieId)) {
        return res.status(409).json({ message: 'TV Serie already in favourites!' });
    }

    favourites.map((favEntry) => {
        if (favEntry.username === req.account.username) {
            favEntry.tvseries.push(tvSerieId);
        }
        return favEntry;
    });


    try {
        writeFile(FAVOURITES_FILE, favourites);
        res.status(201).json({ message: 'The TV Serie is added to favourite list!' });
    } catch (error) {
        console.error('Error writing to favourites file in addTvSerieToFavourite:', error);
        res.status(500).json({ message: 'Failed to add TV series to favourite list due to file error.' });
    }
};


const deleteTvSerieFromFavourite = (req, res) => { 
    const { tvSerieId } = req.params;

    const favourites = readFile(FAVOURITES_FILE);

    const favourite = favourites.find((fav) => fav.username === req.account.username);
    if (!favourite) {
        return res.status(404).json({ message: 'The favourite list is not found!' });
    }

    // Ensure `tvseries` array exists
    if (!favourite.tvseries) {
        favourite.tvseries = [];
    }

    const initialLength = favourite.tvseries.length;
    favourites.forEach((favEntry) => {
        if (favEntry.username === req.account.username) {
            favEntry.tvseries = favEntry.tvseries.filter(
                (id) => id !== parseInt(tvSerieId)
            );
        }
    });

    try {
        writeFile(FAVOURITES_FILE, favourites);

        const updatedFavouriteEntry = favourites.find((fav) => fav.username === req.account.username);
        const finalLength = updatedFavouriteEntry ? updatedFavouriteEntry.tvseries.length : initialLength;

        if (finalLength === initialLength) {
          return res.status(404).json({ message: 'TV series not found in favourites to delete.' });
        }

        return res.status(204).send(); // No content
    } catch (error) {
        console.error('Error writing to favourites file in deleteTvSerieFromFavourite:', error);
        return res.status(500).json({ message: 'Failed to remove TV series from favourites due to file error.' });
    }
};


module.exports = {
    getHighlights,
    getDetailsOfTvSerie,
    searchTvSeries,
    getGenres,
    getFavouriteList: getFavouriteTvList, 
    addTvSerieToFavourite,
    deleteTvSerieFromFavourite,
};