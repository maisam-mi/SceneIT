<template>
  <main id="body" class="mukta-regular">
    <section v-show="!token" class="hero">
      <h2>What is your favorite movie?</h2>
      <div class="steps">
        <article>
          <img src="@/assets/profile.png" alt="" />
          <p>1. Create an account</p>
        </article>
        <article>
          <img src="@/assets/question-mark.png" alt="" />
          <p>2. Choose preferences</p>
        </article>
        <article>
          <img src="@/assets/movie.png" alt="" />
          <p>3. Get recommendations</p>
        </article>
      </div>
      <div class="options">
        <RouterLink to="/register" class="primary-button"> Get Started </RouterLink>
        <RouterLink to="/login" class="secondary-button"> Log in </RouterLink>
      </div>
    </section>

   <section v-show="token" class="top-picks-section2">
  <div class="popular-header">
    <h2>Recommended</h2>
  </div>
  <div v-show="showMovies2" class="scroll-container" id="topPicksScroll">
    <div 
      class="movie-card" 
      v-for="item in (prefers === 'movie' ? recommendedMovies : recommendedSeries)" 
      :key="item.id"
    >
      <RouterLink 
        :to="prefers === 'movie' 
          ? `/moviedetail/${item.id}` 
          : `/seriedetail/${item.id}`">
        <img 
          :src="`https://image.tmdb.org/t/p/w300${item.poster_path}`" 
          :alt="prefers === 'movie' ? item.title : item.name" 
        />
        <div class="info">
          <p>{{ prefers === 'movie' ? item.original_title : (item.original_name || item.original_name) }}</p>
          <div class="genre-rating">
            <span class="genre">{{ item.genres }}</span>
            <span class="rating">{{ item.vote_average.toFixed(1) }}</span>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</section>  


    <section v-show="token" class="top-picks-section">
      <div class="popular-header">
        <h2>Favourites</h2>
        <div class="toggle-switch">
          <button
            :class="['toggle-btn', favouriteTab === 'movie' ? 'active' : '']"
            @click="setFavouriteTab('movie')"
          >
            Movie
          </button>
          <button
            :class="['toggle-btn', favouriteTab === 'tv' ? 'active' : '']"
            @click="setFavouriteTab('tv')"
          >
            TV
          </button>
        </div>
      </div>

      <!-- Keine Favoriten -->
      <div
        v-if="likedMovies.length === 0 && likedSeries.length === 0"
        class="no-favourites-message"
      >
        <p>You haven't liked any movies or series yet.</p>
      </div>

      <!-- Lieblingsfilme -->
      <div v-show="favouriteTab === 'movie'" class="scroll-container">
        <div class="movie-card" v-for="movie in likedMovies" :key="movie.id">
          <RouterLink :to="`/moviedetail/${movie.id}`">
            <img :src="`https://image.tmdb.org/t/p/w300${movie.poster_path}`" :alt="movie.title" />
            <div class="info">
              <p>{{ movie.original_title }}</p>
              <div class="genre-rating">
                <span class="rating">{{ movie.vote_average.toFixed(1) }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Lieblingsserien -->
      <div v-show="favouriteTab === 'tv'" class="scroll-container">
        <div class="movie-card" v-for="serie in likedSeries" :key="serie.id">
          <RouterLink :to="`/seriedetail/${serie.id}`">
            <img :src="`https://image.tmdb.org/t/p/w300${serie.poster_path}`" :alt="serie.name" />
            <div class="info">
              <h3>{{ serie.name }}</h3>
              <div class="genre-rating">
                <span class="rating">{{ serie.vote_average.toFixed(1) }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="top-picks-section">
      <div class="popular-header">
        <h2>Popular</h2>
        <div class="toggle-switch">
          <button :class="['toggle-btn', activeTab === 'movie' ? 'active' : '']" @click="setActive('movie')">
            Movie
          </button>
          <button :class="['toggle-btn', activeTab === 'tv' ? 'active' : '']" @click="setActive('tv')">
            TV
          </button>
        </div>
      </div>
      <div v-show="showMovies" class="scroll-container" id="topPicksScroll">
        <div class="movie-card" v-for="movie in myStore.movies" :key="movie">
          <RouterLink :to="`/moviedetail/${movie.id}`">
            <img :src="`https://image.tmdb.org/t/p/w300${movie.poster_path}`" :alt="movie.title" />
            <div class="info">
              <p>{{ movie.original_title }}</p>
              <div class="genre-rating">
                <span class="genre">{{ movie.genres }}</span>
                <span class="rating">{{ movie.vote_average.toFixed(1) }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
      <div v-show="!showMovies" class="scroll-container" id="topPicksScroll">
        <div class="movie-card" v-for="serie in myStore.series" :key="serie">
          <RouterLink :to="`/seriedetail/${serie.id}`">
            <img :src="`https://image.tmdb.org/t/p/w300${serie.poster_path}`" :alt="serie.title" />
            <div class="info">
              <p>{{ serie.name }}</p>
              <div class="genre-rating">
                <span class="genre">{{ serie.genres }}</span>
                <span class="rating">{{ serie.vote_average.toFixed(1) }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>
    
    <section class="top-picks-section">
      <h2>Popular actors</h2>
      <div class="scroll-container">
        <div class="actor-card" v-for="actor in myStore.actors" :key="actor.id">
          <img :src="`https://image.tmdb.org/t/p/w300${actor.profile_path}`" :alt="actor.name" />
          <h3>{{ actor.name }}</h3>
        </div>
      </div>
    </section>

    <footer class="footer">
      <p>&copy; 2025 SceneIt — All rights reserved.</p>
    </footer>
  </main>
</template>

<script setup>
import NavbarComp from '../components/NavbarComp.vue';
import { SceneITStore } from '../stores/store';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const token = ref(localStorage.getItem('token'));

const likedMovies = computed(() => {
  return myStore.account.favourites;
});

const likedSeries = computed(() => {
  return myStore.account.tvSeriesFavourites;
});


const myStore = SceneITStore();

const recommendedMovies = ref([]);
const recommendedSeries = ref([]);

const prefers = myStore.quizPrefers;


const getRecommendations = async () => {
  try {
    const response = await fetch('http://localhost:3100/quiz/recommendations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    recommendedMovies.value = data || [];
    recommendedSeries.value = data || [];
    
  } catch (error) {
    console.error('Fehler beim Laden der Empfehlungen:', error);
  }
};

onMounted(async () => { 
  getRecommendations();
  myStore.getMovies();
  myStore.getSeries();
  myStore.getActors();
  myStore.getAccountFavourites();
  myStore.getAccountTvFavourites();
});


const activeTab = ref('movie');
const showMovies = ref(true);
const showMovies2 = ref(true);

const setActive = (tab) => {
  activeTab.value = tab;
  if (tab == 'movie') showMovies.value = true;
  else showMovies.value = false;
};

const setActive2 = (tab) => {
  activeTab.value = tab;
  if (tab == 'movie') showMovies2.value = true;
  else showMovies2.value = false;
};

const favouriteTab = ref('movie');
const setFavouriteTab = (tab) => {
  favouriteTab.value = tab;
};
</script>

<style lang="scss" scoped>
html,
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

main {
  color: var(--text-light);
  height: 100vh;
  padding-left: 20rem;
  padding-right: 20rem;
  display: flex;
  flex-direction: column;
  align-items: center;

}

.hero {
  background: linear-gradient(to right, #c94b32, #a03020);
  padding: 50px;
  border-radius: 20px;
  margin: 6rem auto 1rem auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 1200px;
  /* Maximalbreite begrenzen */
  width: 85%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hero h2 {
  font-size: 24px;
  margin-bottom: 10px;
  color: white;
  font-weight: bold;
}

.steps {
  display: flex;
  justify-content: space-evenly;
  align-content: center;
}

.steps article {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.steps img {
  width: 6rem;
}

.steps p {
  width: 15rem;
  text-align: center;
}

.options {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.options a {
  text-decoration: none;
  padding: 0.75rem 0.75rem;
  border-radius: 0.75rem;
}

.top-picks-section {
  margin: 0 auto;
  padding-top: 1rem;
  padding-bottom: 1rem;
  color: white;
  width: 85%;
  box-sizing: border-box;
}

.top-picks-section2 {
  margin: 0 auto;
  padding-top: 7rem;
  padding-bottom: 1rem;
  color: white;
  width: 85%;
  box-sizing: border-box;
}

.popular-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.toggle-switch {
  display: flex;
  border-radius: 0.5rem;
  border-color: white;
  padding: 3px;
  gap: 2px;
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

.scroll-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
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

.movie-card .info,
.actor-card h3 {
  position: absolute;
  bottom: 0;
  width: 100%;
  margin: 0;
  padding: 0.6rem 0.5rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  font-size: 1rem;
  text-align: center;
  font-weight: bold;
  box-sizing: border-box;
  z-index: 2;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
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
  box-sizing: border-box;
}

.footer {
  text-align: center;
  padding: 1rem;
  background: var(--primary-color);
  color: white;
  font-size: 0.9rem;
  margin-top: 2rem;
  background-color: transparent;
  width: 100%;
  box-sizing: border-box;
}

/* Responsive: Mobile */
@media screen and (max-width: 600px) {
  main {
    padding-left: 1px;
    padding-right: 1px;
  }

  .hero {
    padding: 1rem;
    margin: 6rem 0rem 1rem 0rem;
    text-align: center;
    border-radius: 0rem;
  }

  .hero h2 {
    font-size: 20px;
  }

  .steps {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-content: center;
    gap: 1rem;
  }

  .steps article {
    flex-direction: row;
    align-items: flex-start;
    gap: 1rem;
  }

  .steps img {
    width: 2.5rem;
  }

  .steps p {
    text-align: start;
  }

  .options {
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
  }

  .top-picks-section {
    padding: 1rem;
    box-sizing: border-box;
    width: 100%;
  }

  .popular-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .toggle-switch {
    margin: 0 auto;
    gap: 0.5rem;
  }
}
</style>
