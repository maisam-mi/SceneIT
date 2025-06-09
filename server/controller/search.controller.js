const TMDB_API_KEY = '0fb85046bace36532f9e8ccb89101157'; 
const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';

// Helper function to build URLs with query parameters 
const buildUrlWithQueryParams = (baseUrl, params) => {
    const url = new URL(baseUrl);
    for (const key in params) {
        if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
        }
    }
    return url.toString();
};

const searchMedia = async (req, res) => {
    const query = req.query.q; // Get the search query from URL parameters

    if (!query) {
        return res.status(400).json({ message: 'Search query is required.' });
    }

    try {
        // Use the TMDB /search/multi endpoint to search for both movies and TV shows
        const searchParams = {
            api_key: TMDB_API_KEY,
            language: 'en-US',
            query: query,
            page: 1,
            include_adult: false,
        };

        const url = buildUrlWithQueryParams(`${TMDB_API_BASE_URL}/search/multi`, searchParams);
        const response = await fetch(url);

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            console.error(`TMDB Search API Error: ${response.status} - ${errorBody.status_message || response.statusText || 'Unknown error'}`);
            return res.status(response.status).json({ message: 'Failed to fetch search results from TMDB.' });
        }

        const data = await response.json();
        const results = data.results || [];

        // Filter results to only include 'movie' or 'tv' media types
        const relevantResults = results.filter(
            (item) => item.media_type === 'movie' || item.media_type === 'tv'
        );

        if (relevantResults.length > 0) {
            // Return the first relevant result. This fits the "redirect to THE movie/show" logic.
            const firstResult = relevantResults[0];
            return res.status(200).json({
                success: true,
                id: firstResult.id,
                media_type: firstResult.media_type,
                title: firstResult.media_type === 'movie' ? firstResult.title : firstResult.name,
            });
        } else {
            // No relevant results found
            return res.status(200).json({
                success: false,
                message: 'No movie or TV show found matching your search.',
            });
        }
    } catch (error) {
        console.error('Error in searchMedia:', error);
        return res.status(500).json({ message: 'An internal server error occurred during search.' });
    }
};

module.exports = {
    searchMedia,
};