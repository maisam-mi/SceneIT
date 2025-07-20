<template>
  <main id="body">
    <div class="profile-container">
      <!-- Linke Seite -->
      <section class="profile-section">
        <h2>{{ myStore.account.username }}</h2>

        <input
          type="password"
          v-model="oldPassword"
          placeholder="Old password"
          class="profile-input"
        />
        <input
          type="password"
          v-model="newPassword"
          placeholder="New password"
          class="profile-input"
        />

        <button class="btn primary" @click="changePassword">Change Password</button>
        <button class="btn logout" @click="retake">Retake Quiz</button>
        <button class="btn danger" @click="deleteAccount">Delete Account</button>
        <button class="btn logout" @click="logout">Log out</button>
      </section>

      <!-- Rechte Seite -->
      <section class="quiz-summary-section">
        <h2>Quiz Summary</h2>
        <div class="summary-box">
          <div class="summary-item">
            <strong>Preferred Type:</strong>
            <div class="summary-value">{{ prefers }}</div>
          </div>
          <div class="summary-item">
            <strong>Selected Genres:</strong>
            <div class="summary-value">
              <span v-for="genre in genres" :key="genre" class="tag">{{ genre }}</span>
            </div>
          </div>
          <div class="summary-item">
            <strong>Selected Keywords:</strong>
            <div class="summary-value">
              <span v-for="keyword in keywords" :key="keyword" class="tag">{{ keyword }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <section class="top-picks-section">
      <div class="popular-header">
        <h2>Favourite Movies</h2>
      </div>

      <div
        v-if="!myStore.account.favourites || myStore.account.favourites.length === 0"
        class="no-favourites-message"
      >
        <p>
          You haven't added any movies to your favorites yet. Start by exploring our popular movies!
        </p>
      </div>
      <div v-else class="scroll-container" id="likedMoviesScroll">
        <div class="movie-card" v-for="movie in myStore.account.favourites" :key="movie.id">
          <RouterLink :to="`/moviedetail/${movie.id}`">
            <img :src="`https://image.tmdb.org/t/p/w300${movie.poster_path}`" :alt="movie.title" />
            <div class="info">
              <h3>{{ movie.original_title }}</h3>
              <div class="genre-rating">
                <span class="rating">{{ movie.vote_average?.toFixed(1) }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="top-picks-section">
      <div class="popular-header">
        <h2>Favourite TV Shows</h2>
      </div>

      <div
        v-if="
          !myStore.account.tvSeriesFavourites || myStore.account.tvSeriesFavourites.length === 0
        "
        class="no-favourites-message"
      >
        <p>
          You haven't added any TV series to your favorites yet. Start by exploring our popular TV
          shows!
        </p>
      </div>
      <div v-else class="scroll-container" id="likedTvSeriesScroll">
        <div class="movie-card" v-for="serie in myStore.account.tvSeriesFavourites" :key="serie.id">
          <RouterLink :to="`/seriedetail/${serie.id}`">
            <img :src="`https://image.tmdb.org/t/p/w300${serie.poster_path}`" :alt="serie.name" />
            <div class="info">
              <h3>{{ serie.name }}</h3>
              <div class="genre-rating">
                <span class="rating">{{ serie.vote_average?.toFixed(1) }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <footer class="footer">
      <p>© 2025 SceneIt — All rights reserved.</p>
    </footer>
  </main>
</template>

<script setup>
import NavbarComp from '../components/NavbarComp.vue';
import { SceneITStore } from '../stores/store';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import Quizview from './Quizview.vue';

const router = useRouter();
const myStore = SceneITStore();

const oldPassword = ref('');
const newPassword = ref('');

const prefers = localStorage.getItem('quizPrefers');
const genres = localStorage.getItem('quizGenres');
const keywords = localStorage.getItem('quizKeywords');

// Fetch both movie and TV series favourites when the component mounts
onMounted(async () => {
  await myStore.getAccountFavourites();
  await myStore.getAccountTvFavourites();
});

const deleteAccount = async () => {
  try {
    const res = await fetch(`http://localhost:3100/account/`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    });
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    localStorage.removeItem('token');
    localStorage.removeItem('quizPrefers');
    localStorage.removeItem('quizGenres');
    localStorage.removeItem('quizKeywords');
    myStore.account.username = null;
    myStore.account.favourites = [];
    myStore.account.tvSeriesFavourites = [];
    myStore.account.watchlist = [];
    window.alert((await res.json()).message);
    router.push('/');
  } catch (err) {
    console.error('Account could not be deleted:', err);
  }
};

const changePassword = async () => {
  try {
    const res = await fetch(`http://localhost:3100/account/changePassword`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify({
        oldPassword: oldPassword.value,
        newPassword: newPassword.value,
      }),
    });

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const result = await res.json();
    window.alert(result.message);
  } catch (err) {
    console.error('The Password could not be changed:', err);
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('quizPrefers');
  localStorage.removeItem('quizGenres');
  localStorage.removeItem('quizKeywords');
  myStore.account.username = null;
  myStore.account.favourites = [];
  myStore.account.tvSeriesFavourites = [];
  myStore.account.watchlist = [];
  router.push('/');
};

const retake = () => {
  router.push('/quizview');
};
</script>

<style lang="scss" scoped>
#body {
  background-image: url(/images/background.png);
  background-repeat: repeat-y;
  background-position: center;
  background-size: cover;
  background-attachment: fixed;
  color: var(--text-light);
  background-color: #341812;

  max-width: 1400px;
  width: 100%;
  margin: 0 auto; // zentriert horizontal
  padding: 0 2rem; // etwas Innenabstand für kleine Bildschirme

  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-section {
  flex: 1 1 45%; /* Nimmt ca. 45% der Breite ein */
  /* Optional: Anpassungen entfernen, z.B. padding-right: 60rem; */
  padding: 2rem;
}

.quiz-summary-section {
  flex: 1 1 45%; /* Nimmt ca. 45% der Breite ein */
  padding: 2rem;
}

h2 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.profile-container {
  display: flex;
  justify-content: space-between; /* Abstand links und rechts */
  align-items: flex-start; /* Oben ausrichten */
  gap: 4rem; /* Optional: Abstand zwischen den Seiten */
  max-width: 1200px; /* Max. Breite, damit es nicht zu breit wird */
  margin: 0 auto; /* Zentriert horizontal */
  padding: 2rem;
  box-sizing: border-box;
  padding-top: 5rem;
}

.profile-input {
  width: 100%;
  max-width: 300px;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: none;
  background-color: #fff;
  font-size: 1rem;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  gap: 3rem;
  margin-bottom: 1rem;
}

.btn {
  width: 100%;
  max-width: 300px;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: none;
  text-align: center;
}

.btn.primary {
  background-color: transparent;
  color: white;
  border: 1px solid white;
  margin-bottom: 1rem;
}

.btn.danger {
  background-color: transparent;
  color: rgb(246, 151, 151);
  border: 1px solid rgb(246, 151, 151);
  margin-bottom: 1rem;
}

.btn.logout {
  background-color: transparent;
  color: white;
  border: 1px solid white;
  margin-bottom: 1rem;
}

.btn:hover {
  opacity: 0.85;
  transform: scale(0.98);
}

.hero {
  background: linear-gradient(to right, #c94b32, #a03020);
  padding: 50px;
  border-radius: 20px;
  margin: 3vw auto 30px auto; // zentriert mit margin auto
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 800px; // max width für Hero
  box-sizing: border-box;
}

.hero h2 {
  font-size: 24px;
  margin-bottom: 10px;
  color: white;
  font-weight: bold;
}

.hero ol {
  margin-left: 20px;
  margin-bottom: 20px;
  color: white;
}

.hero button {
  margin-right: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: white;
  color: #a03020;
  font-weight: bold;
  cursor: pointer;
}

.top-picks-section {
  margin: 0 auto;
  padding: 1rem 0;
  overflow: hidden;
  color: white;
  width: 100%;
  max-width: 1200px;
  box-sizing: border-box;
  align-items: center;
}

.popular-header {
  display: flex;
  gap: 1rem;
  color: white;
  justify-content: space-between;
  align-items: center;
}

.toggle-switch {
  display: flex;
  border-radius: 0.5rem;
  border: 1px solid white;
  padding: 3px;
  gap: 2px;
  /* entfernt fixed margin für bessere Responsivität */
}

.toggle-btn {
  border: none;
  background-color: #4b2e2800;
  padding: 8px 16px;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
  color: var(--text-light);
}

.toggle-btn.active {
  background-color: white;
  color: black;
}

.scroll-container,
#topPicksScroll {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.movie-card,
.actor-card {
  position: relative;
  width: 180px;
  flex: 0 0 auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  scroll-snap-align: start;
}

.movie-card img,
.actor-card img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.movie-card .info {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0.6rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  font-size: 1rem;
  text-align: center;
  font-weight: bold;
  box-sizing: border-box;
  z-index: 2;
}

.movie-card .info h3 {
  margin: 0;
}

.movie-card .info .genre-rating {
  font-size: 0.85rem;
  margin-top: 0.3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.movie-card .info .genre-rating .genre {
  font-weight: normal;
}

.movie-card .info .genre-rating .rating {
  background-color: rgba(255, 255, 255, 0.3);
  padding: 0.2rem 0.5rem;
  border-radius: 5px;
}

.movie-card::after,
.actor-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  pointer-events: none;
  z-index: 1;
}

#actors {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding: 1rem 0;
  width: 100%;
  max-width: 1200px;
  box-sizing: border-box;
}

.keyword,
.tag {
  background-color: rgb(37, 36, 36);
  padding: 4px 8px;
  margin: 2px 2px;
  border-radius: 12px;
  font-size: 13px;
  gap: 3vw;
  border: 2px solid white;
}

.summary-item {
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.tag {
  background-color: rgb(37, 36, 36);
  padding: 4px 8px;
  margin: 2px 2px;
  border-radius: 12px;
  font-size: 13px;
  gap: 3vw;
  border: 2px solid white;
}

.footer {
  text-align: center;
  padding: 1rem;
  background: var(--primary-color);
  color: white;
  font-size: 0.9rem;
  margin-top: 2rem;
  background-color: transparent;
}

@media (max-width: 600px) {
  #body {
    padding: 0 1rem;
  }

  .profile-container {
    flex-direction: column;
    gap: 0rem; /* Optional: Abstand zwischen den Seiten */
    padding: 0rem;
  }

  .profile-section {
    padding: 1rem 1rem;
    width: 100%;
    align-items: center;
    text-align: center;
    padding-top: 4rem;
    gap: 3rem;
    flex-direction: column;
  }

  .quiz-summary-section {
    padding: 0rem;
  }
  .hero {
    padding: 20px;
    margin-top: 1rem;

    ol {
      margin-left: 15px;
    }

    button {
      width: 100%;
    }

    .scroll-container,
    #topPicksScroll {
      padding: 1rem 0;
    }

    .movie-card,
    .actor-card {
      width: 140px;
    }
    .movie-card,
    .actor-card {
      position: relative;
      width: 180px;
      flex: 0 0 auto;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      scroll-snap-align: start;

      img {
        width: 100%;
        height: auto;
        display: block;
        object-fit: cover;
      }

      .info {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0.6rem;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
        color: white;
        font-size: 1rem;
        text-align: center;
        font-weight: bold;
        box-sizing: border-box;
        z-index: 2;

        h3 {
          margin: 0;
        }

        .genre-rating {
          font-size: 0.85rem;
          margin-top: 0.3rem;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .genre {
            font-weight: normal;
          }

          .rating {
            background-color: rgba(255, 255, 255, 0.3);
            padding: 0.2rem 0.5rem;
            border-radius: 5px;
          }
        }
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 40%;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
        pointer-events: none;
        z-index: 1;
      }
    }

    #actors {
      display: flex;
      overflow-x: auto;
      gap: 1rem;
      padding: 1rem 0;
      width: 100%;
      max-width: 1200px;
      box-sizing: border-box;
    }

    .keyword {
      background-color: rgb(37, 36, 36);
      padding: 4px 8px;
      margin: 2px 2px;
      border-radius: 12px;
      font-size: 13px;
      gap: 3vw;
      border: 2px solid white;
    }
    .keyword,
    .tag {
      background-color: rgb(37, 36, 36);
      padding: 4px 8px;
      margin: 2px 2px;
      border-radius: 12px;
      font-size: 13px;
      gap: 3vw;
      border: 2px solid white;
    }

    .quiz-summary-section {
      padding: 1rem;
      max-width: 600px;
      margin: 0 auto;
      font-family: Arial, sans-serif;
    }

    .summary-item {
      margin-bottom: 1rem;
    }

    .tag {
      background-color: rgb(37, 36, 36);
      padding: 4px 8px;
      margin: 2px 2px;
      border-radius: 12px;
      font-size: 13px;
      gap: 3vw;
      border: 2px solid white;
    }
    .summary-item {
      margin-bottom: 1rem;
    }

    .footer {
      text-align: center;
      padding: 1rem;
      background: var(--primary-color);
      color: white;
      font-size: 0.9rem;
      margin-top: 2rem;
      background-color: transparent;
    }
  }
}
/* --- Responsive Design --- */
</style>
