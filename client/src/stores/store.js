import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export const useDefaultStore = defineStore('DefaultId', () => {
  return {};
});

export const SceneITStore = defineStore('SceneIT', () => {
  const movies = ref([]);
  const series = ref([]);
  const actors = ref([]);
  const movie = ref({});
  const serie = ref({});
  const actor = ref({});

  const quizPrefers = ref('');
  const quizGenres = ref([]);
  const quizKeywords = ref([]);

  const account = reactive({
    username: null,
    favourites: [],
    tvSeriesFavourites: [],
    watchlist: []
  });

  const setQuizData = (prefers, genres, keywords) => {
    quizPrefers.value = prefers;
    quizGenres.value = genres;
    quizKeywords.value = keywords;
    localStorage.setItem('quizPrefers', prefers);
    localStorage.setItem('quizGenres', genres);
    localStorage.setItem('quizKeywords', keywords);
  };

  const getMovies = async () => {
    try {
      const res = await fetch('http://localhost:3100/movies/highlight');
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      movies.value = await res.json();
      console.log("movies: ", movies.value);

    } catch (err) {
      console.error('Fehler beim Laden der Filme:', err);
    }
  };

  const getSeries = async () => {
    try {
      const res = await fetch('http://localhost:3100/tvSeries/highlight');
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      series.value = await res.json();
      console.log('series: ', series.value);
    } catch (err) {
      console.error('Fehler beim Laden der series:', err);
    }
  };

  const getActors = async () => {
    try {
      const res = await fetch('http://localhost:3100/actors');
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      actors.value = await res.json();
      console.log('actors: ', actors.value);
    } catch (err) {
      console.error('Fehler beim Laden der series:', err);
    }
  };

  const getMovie = async (id) => {
    try {
      const res = await fetch(`http://localhost:3100/movies/details/${id}`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      movie.value = await res.json();
      console.log("movie: ", movie.value);
    } catch (err) {
      console.error('Fehler beim Laden der Filme:', err);
    }
  };

  const getSerie = async (id) => {
    try {
      const res = await fetch(`http://localhost:3100/tvSeries/details/${id}`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      serie.value = await res.json();
      console.log('movie: ', serie.value);
    } catch (err) {
      console.error('Fehler beim Laden der Serie:', err);
    }
  };



  const getAccountFavourites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        account.favourites = []; // Clear favourites if no token
        return;
      }
      const res = await fetch('http://localhost:3100/movies/favourite', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          console.warn('Authentication failed for fetching favourites. User might be logged out.');
          localStorage.removeItem('token');
          account.username = null;
          account.favourites = [];
          account.tvSeriesFavourites = [];
          account.watchlist = [];
        }
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      account.favourites = await res.json();
      console.log("Account Favourites: ", account.favourites);
    } catch (err) {
      console.error('Error fetching account favourites:', err);
      account.favourites = []; // Ensure favourites are cleared on error
    }
  };

  const getAccountTvFavourites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        account.tvSeriesFavourites = []; // Clear if no token
        return;
      }
      const res = await fetch('http://localhost:3100/tvseries/favourite', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          console.warn('Authentication failed for fetching TV series favourites. User might be logged out.');
          localStorage.removeItem('token');
          account.username = null;
          account.favourites = [];
          account.tvSeriesFavourites = [];
          account.watchlist = [];
        }
        const errorData = await res.json().catch(() => ({ message: 'Failed to fetch TV series favourites' }));
        throw new Error(`HTTP error! Status: ${res.status} - ${errorData.message}`);
      }
      account.tvSeriesFavourites = await res.json();
      console.log("Account TV Series Favourites: ", account.tvSeriesFavourites);
    } catch (err) {
      console.error('Error fetching account TV series favourites:', err);
      account.tvSeriesFavourites = [];
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const response = await fetch('http://localhost:3100/account/changePassword', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      return data.message; // z.B. "Password updated successfully"
    } catch (error) {
      throw error; // Weiterreichen, damit Component UI es behandeln kann
    }
  };


  return {
    movies, getMovies,
    series, getSeries,
    actors, getActors,
    movie, getMovie,
    serie, getSerie,
    account,
    getAccountFavourites,
    getAccountTvFavourites,
    changePassword,
    quizPrefers,
    quizGenres,
    quizKeywords,
    setQuizData,
  };
});
