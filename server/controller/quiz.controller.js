const { readFile, writeFile } = require('../fileMethods');

const TMDB_API_KEY = '0fb85046bace36532f9e8ccb89101157';
const ACCOUNTS_FILE = './server/data/accounts.json';
const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';

// TMDB Genre ID Mappings (separated for Movies and TV Shows)
const TMDB_MOVIE_GENRE_MAP = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  'Science Fiction': 878,
  'TV Movie': 10770,
  Thriller: 53,
  War: 10752,
  Western: 37,
};

const TMDB_TV_GENRE_MAP = {
  'Action & Adventure': 10759,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Kids: 10762,
  Mystery: 9648,
  News: 10763,
  Reality: 10764,
  'Sci-Fi & Fantasy': 10765,
  Soap: 10766,
  Talk: 10767,
  'War & Politics': 10768,
  Western: 37,
};

// Static TMDB Keyword ID Mapping
const TMDB_KEYWORD_MAP = {
  superhero: 9715,
  'time travel': 4379,
  'based on true story': 9672,
  'based on novel or book': 818,
  'post-apocalyptic': 350774,
  'coming of age': 10683,
  friendship: 6054,
  revenge: 9748,
  alien: 9951,
  zombie: 12377,
  magic: 2343,
  heist: 10051,
};

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

const saveQuizResults = async (req, res) => {



  const { mediaType, genres, keywords } = req.body;
  const username = req.account.username; // Comes from authMiddleware

  if (!username || !mediaType || !Array.isArray(genres) || !Array.isArray(keywords)) {
    return res
      .status(400)
      .json({ message: 'Missing required quiz data (mediaType, genres, keywords).' });
  }
  if (mediaType !== 'movie' && mediaType !== 'tv') {
    return res.status(400).json({ message: 'Invalid mediaType. Must be "movie" or "tv".' });
  }

  try {
    // Select the correct genre map based on mediaType
    const genreMap = mediaType === 'movie' ? TMDB_MOVIE_GENRE_MAP : TMDB_TV_GENRE_MAP;

    // Convert genre names to TMDB IDs
    const genreIds = genres
      .map((genreName) => genreMap[genreName])
      .filter((id) => id !== undefined);

    // Convert keyword names to TMDB IDs
    const keywordIds = keywords
      .map((keywordName) => TMDB_KEYWORD_MAP[keywordName])
      .filter((id) => id !== undefined);

    // Save quiz results to accounts.json
    const accounts = readFile(ACCOUNTS_FILE);
    const accountIndex = accounts.findIndex((acc) => acc.username === username);

    if (accountIndex === -1) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    // Update the quizResult for the account
    accounts[accountIndex].quizResult = {
      type: mediaType,
      genres: genres,
      genre_ids: genreIds,
      keywords: keywords,
      keyword_ids: keywordIds,
    };
    writeFile(ACCOUNTS_FILE, accounts);

    return res.status(200).json({ message: 'Quiz results saved successfully.' });
  } catch (error) {
    console.error('Error saving quiz results:', error);
    return res.status(500).json({ message: 'Failed to save quiz results.' });
  }
};

const getQuizRecommendations = async (req, res) => {
  const username = req.account.username;

  try {
    const accounts = readFile(ACCOUNTS_FILE);
    const account = accounts.find((acc) => acc.username === username);

    if (!account) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    if (!account.quizResult || !account.quizResult.type) {
      return res
        .status(404)
        .json({ message: 'No quiz results found for this account. Please submit the quiz first.' });
    }

    const { type: mediaType, genre_ids: genreIds, keyword_ids: keywordIds } = account.quizResult;


    const fetchRecommendations = async (params, endpoint = `/discover/${mediaType}`) => {
      const url = buildUrlWithQueryParams(`${TMDB_API_BASE_URL}${endpoint}`, params);
      const response = await fetch(url);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error(
          `TMDB API Error: ${response.status} - ${errorBody.status_message || response.statusText || 'Unknown error'
          }`,
        );
        // Throw an error to trigger fallback logic
        throw new Error(`TMDB API request failed with status ${response.status}`);
      }
      const data = await response.json();
      return data.results || []; // Ensure we always return an array
    };

    let recommendations = []; // Initialize to empty array

    // Initial, most strict parameters
    let currentDiscoverParams = {
      api_key: TMDB_API_KEY,
      language: 'en-US',
      with_original_language: 'en',
      sort_by: 'popularity.desc', // or 'vote_average.desc'
      include_adult: false,
      'vote_count.gte': 100,
      page: 1,
    };

    if (genreIds && genreIds.length > 0) {
      currentDiscoverParams.with_genres = genreIds.join(',');
    }
    if (keywordIds && keywordIds.length > 0) {
      currentDiscoverParams.with_keywords = keywordIds.join(',');
    }

    // Attempt 1: Strict Query
    try {
      recommendations = await fetchRecommendations(currentDiscoverParams);
      if (recommendations.length > 0) {
        console.log('Quiz: Recommendations found with strict query.');
        return res.status(200).json(recommendations);
      }
    } catch (error) {
      console.warn(
        'Quiz: Initial TMDB query failed or returned no results. Trying fallbacks. Error:',
        error.message,
      );
    }

    // Fallback 1: Remove Keywords
    console.log('Quiz: No results from strict query. Removing keywords and retrying...');
    let fallbackParams1 = { ...currentDiscoverParams };
    delete fallbackParams1.with_keywords;
    try {
      recommendations = await fetchRecommendations(fallbackParams1);
      if (recommendations.length > 0) {
        console.log('Quiz: Recommendations found after removing keywords.');
        return res.status(200).json(recommendations);
      }
    } catch (error) {
      console.warn('Quiz: Fallback 1 failed. Error:', error.message);
    }

    // Fallback 2: Remove Keywords AND Genres
    console.log('Quiz: Still no results. Removing both genres and keywords and retrying...');
    let fallbackParams2 = { ...currentDiscoverParams };
    delete fallbackParams2.with_keywords;
    delete fallbackParams2.with_genres;
    try {
      recommendations = await fetchRecommendations(fallbackParams2);
      if (recommendations.length > 0) {
        console.log('Quiz: Recommendations found after removing keywords and genres.');
        return res.status(200).json(recommendations);
      }
    } catch (error) {
      console.warn('Quiz: Fallback 2 failed. Error:', error.message);
    }

    // Fallback 3: Generic Popular/Trending (Last Resort)
    console.log('Quiz: Still no results. Falling back to general popular titles.');
    let fallbackParams3 = {
      api_key: TMDB_API_KEY,
      language: 'en-US',
      with_original_language: 'en',
      page: 1,
    };
    try {
      // Endpoint changes to /movie/popular or /tv/popular
      recommendations = await fetchRecommendations(fallbackParams3, `/${mediaType}/popular`);
      if (recommendations.length > 0) {
        console.log('Quiz: Recommendations found by falling back to popular titles.');
        return res.status(200).json(recommendations);
      }
    } catch (error) {
      console.error(
        'Quiz: Fallback 3 (popular titles) failed. This is unexpected. Error:',
        error.message,
      );
    }

    // If after all fallbacks, still no recommendations
    console.warn('Quiz: No recommendations found even after all broadening attempts.');
    return res
      .status(200)
      .json({
        message: 'No specific recommendations found for your choices. Please try different quiz answers or check back later.',
        recommendations: [] // Ensure recommendations array is always sent, even if empty
      });
  } catch (error) {
    console.error('Error getting quiz recommendations (outer catch):', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ message: 'Failed to retrieve recommendations.' });
  }
};


module.exports = {
  saveQuizResults,
  getQuizRecommendations,
};