<template>
  <main :style="backgroundStyle" id="body">
    <div class="background-image"></div>
    <div class="main-content">
      <main id="movieDetails" class="movie-details-container">
        <div class="movie-header">
          <img
            class="movie-poster"
            :src="`https://image.tmdb.org/t/p/w300${myStore.movie.poster_path}`"
            :alt="myStore.movie.title"
          />
          <div class="movie-info">
            <h1>{{ myStore.movie.title }}</h1>

            <div class="movie-details">
              <div>
                <p>{{ new Date(myStore.movie.release_date).toLocaleDateString() }}</p>
                <p>{{ myStore.movie.runtime }} min</p>
              </div>
              <div class="ratings">
                <p><strong>TMDB rating:</strong> {{ myStore.movie.vote_average.toFixed(1) }}</p>
                <p v-for="rating in myStore.movie.ratings" :key="rating">
                  <strong>{{ rating.Source }}:</strong> {{ rating.Value }}
                </p>
              </div>
            </div>

            <p>
              <span v-for="genre in myStore.movie.genres" :key="genre.id" class="keyword">
                {{ genre.name }}
              </span>
            </p>

            <div class="movie-details">
              <p><strong>Director:</strong> {{ director?.name || 'N/A' }}</p>
              <p>
                <strong>Author:</strong>
                {{
                  myStore.movie.writers
                    ? myStore.movie.writers.map((w) => w.name).join(', ')
                    : 'N/A'
                }}
              </p>
            </div>

            <div class="movie-buttons">
              <button v-if="trailer" class="trailer-button" @click="openModal(trailer.key)">
                Watch Trailer
              </button>

              <button
                class="btn-like"
                @click="toggleLike(myStore.movie)"
                :style="{ backgroundColor: liked ? 'red' : '' }"
              >
                <img src="@/assets/heart.png" alt="Like" class="icon" />
              </button>

              <!-- <button
                class="btn-save"
                @click="toggleSave"
                :style="{ backgroundColor: saved ? 'red' : '' }"
              >
                <img src="@/assets/save.png" alt="Save" class="icon" />
              </button> -->
            </div>
          </div>
        </div>

        <p class="overview-lalala">{{ myStore.movie.overview }}</p>

        <div class="movie-actors">
          <h3>Actors:</h3>
          <div class="actors-list">
            <div class="actor-card" v-for="actor in credits.cast" :key="actor.id">
              <img
                :src="`https://image.tmdb.org/t/p/w300${actor.profile_path}`"
                :alt="actor.name"
              />
              <h3>{{ actor.name }}</h3>
            </div>
          </div>
        </div>
      </main>

      <footer class="footer">
        <p>&copy; 2025 SceneIt — All rights reserved.</p>
      </footer>

      <!-- Trailer Modal -->
      <div id="trailerModal" class="modal" ref="trailerModal">
        <div class="modal-content">
          <span class="close" @click="closeModal">&times;</span>
          <iframe
            id="trailerFrame"
            width="100%"
            height="400"
            frameborder="0"
            allowfullscreen
            :src="trailerUrl"
          ></iframe>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, ref, watchEffect, onMounted, watch } from 'vue';
import NavbarComp from '../components/NavbarComp.vue';
import { SceneITStore } from '../stores/store';
import { useRoute } from 'vue-router'; // Import useRoute to get current ID

// Props
const props = defineProps({
  id: String,
});

// States
const liked = ref(false);

const credits = ref({ cast: [], crew: [] });
const videos = ref([]);
const director = ref(null);
const trailer = ref(null);

// Store
const myStore = SceneITStore();
const route = useRoute(); // Use useRoute to get the current movie ID reliably

// Fetch movie details
myStore.getMovie(props.id);

// Set background
const backgroundStyle = computed(() => ({
  backgroundImage: `url(https://image.tmdb.org/t/p/original${
    myStore.movie.backdrop_path || myStore.movie.poster_path
  })`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
}));

// Initialize liked state and fetch favourites
onMounted(async () => {
  // Ensure account favourites are fetched
  await myStore.getAccountFavourites(); // Make sure this completes before checking liked status
  // Now check if the current movie (by ID) is in the account.favourites array
  const movieId = parseInt(props.id); // Ensure ID is a number for comparison
  liked.value = myStore.account.favourites.some((favMovie) => favMovie.id === movieId);
});

// Watch for changes in myStore.account.favourites to re-evaluate liked state
watch(
  () => myStore.account.favourites,
  (newFavourites) => {
    const movieId = parseInt(props.id);
    liked.value = newFavourites.some((favMovie) => favMovie.id === movieId);
  },
  { deep: true },
); // Use deep: true if favourite objects themselves might change, otherwise not strictly needed for ID comparison

// Toggle like
async function toggleLike(movie) {
  // Ensure movie object has an ID
  if (!movie || !movie.id) {
    console.error('Movie object or ID is missing for toggleLike.');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('User not logged in. Cannot toggle TV series favourite.');
    alert('Please log in to add movies to your favourites!');
    return;
  }

  try {
    let response;
    if (liked.value) {
      // If currently liked, then delete
      response = await fetch(`http://localhost:3100/movies/favourite/${movie.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });
      if (response.status === 204) {
        // 204 No Content is a successful deletion
        console.log('Movie deleted from favourites.');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error deleting movie.' }));
        console.error('Failed to delete movie:', errorData);
        alert(`Failed to delete movie: ${errorData.message}`);
      }
    } else {
      // If not liked, then add
      response = await fetch('http://localhost:3100/movies/favourite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ movie }), // Send the full movie object, backend will extract ID
      });
      if (response.ok) {
        // 201 Created or 200 OK
        console.log('Movie added to favourites.');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error adding movie.' }));
        console.error('Failed to add movie:', errorData);
        alert(`Failed to add movie: ${errorData.message}`);
      }
    }

    // After successfully adding/deleting, refresh the favourite list in the store
    // This is crucial for consistency across components
    await myStore.getAccountFavourites();
  } catch (error) {
    console.error('Error toggling favourite:', error);
    alert('An error occurred while updating your favourites.');
  }
}

function toggleSave() {
  saved.value = !saved.value;
  // This needs to interact with a backend watchlist, not local storage
}

// Watch movie data for credits and trailer
watchEffect(() => {
  if (myStore.movie && myStore.movie.cast) {
    credits.value = {
      cast: myStore.movie.cast || [],
      crew: myStore.movie.crew || [],
    };

    videos.value = myStore.movie.trailers || [];

    director.value = credits.value.crew.find((p) => p.job === 'Director') || null;
    trailer.value = videos.value.find((v) => v.type === 'Trailer' && v.site === 'YouTube') || null;
  }
});

// Modal handling
const trailerModal = ref(null);
const trailerUrl = ref('');

function openModal(key) {
  trailerUrl.value = `https://www.youtube.com/embed/${key}?autoplay=1`;
  if (trailerModal.value) {
    trailerModal.value.style.display = 'flex';
  }
}

function closeModal() {
  if (trailerModal.value) {
    trailerModal.value.style.display = 'none';
    trailerUrl.value = ''; // Stop video playback
  }
}
</script>

<style lang="scss" scoped>
#body {
  background-position: center;
  background-size: cover;
  background-attachment: fixed;
  color: var(--text-light);
  padding: 1rem 5vw;
}

.filmstrip-side {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100px;
  background-image: url('@/assets/streifen.png');
  background-repeat: repeat-y;
  background-size: contain;
  z-index: 0;
  opacity: 1;
}

button {
  background-color: var(--text-light);
  color: var(--text-dark);
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 0.7rem;
  margin: 0rem 0.2rem 0.2rem 0.2rem;
}

.logo {
  display: flex;
  align-items: center;
  margin-left: 20px;
}

.logo-image {
  width: 40px;
  height: auto;
  margin-right: 10px;
}

.search-container {
  flex: 1;
  display: flex;
  justify-content: center;
  position: relative;
  background-color: #341812;
  z-index: 3;
}

.search-wrapper {
  display: flex;
  align-items: center;
  max-width: 600px;
  width: 100%;
  background-color: #a03020;
  position: relative;
  z-index: 3;
}

.search-input {
  width: 100%;
  padding: 8px 30px 8px 8px;
  border-radius: 20px;
  border: 1px solid #ccc;
  background-color: white;
  color: #333;
  z-index: 3;
}

.search-img {
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  pointer-events: none;
  z-index: 3;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%) translateX(-8px);
  font-size: 18px;
  color: #fff;
  pointer-events: none;
  z-index: 3;
}

.search-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  z-index: 3;
}

.nav-buttons {
  display: flex;
  gap: 10px;
}

.nav-buttons button {
  background-color: rgba(0, 0, 255, 0);
  color: var(--text-light);
  font-size: 1rem;
}

.modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: var(--bg-dark);
  color: var(--text-dark);
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 1500px;
  position: relative;
}

.modal-content .close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
  color: #888;
}

#actors {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding: 1rem 0;
}

.scroll-container {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 1rem;
  scroll-snap-type: x mandatory;
}

.actor-card {
  flex: 0 0 auto;
  width: 120px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.actor-card img {
  width: 100%;
  height: auto;
  display: block;
}

.actor-card h3 {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0;
  padding: 6px 4px;
  font-size: 0.9rem;
  color: white;
  text-align: center;
  z-index: 2;
}

.actor-card::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  z-index: 1;
}

.movie-header {
  max-width: 800px;
  margin: 30px auto;
  display: flex;
  gap: 16px;
  align-items: stretch;
  padding: 16px;
  background-color: transparent;
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  margin-top: 5vw;
}

.movie-actors {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 16px;
}

.actors-list {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  scroll-snap-type: x mandatory;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
  padding: 1rem 0;
}

/* Posterbild */

.movie-poster {
  width: 220px;
  height: 330px;
  /* feste Höhe */
  object-fit: cover;
  border-radius: 8px;
}

/* Info-Bereich */

.movie-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0vh;
  /* Weniger vertikaler Platz */
}

/* Titel */

.movie-info h1 {
  font-size: 22px;
  margin: 0;
  color: var(--text-light);
}

/* Laufzeit, Jahr, Bewertung */

.movie-details {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 14px;
  /* Weniger Abstand zw. Infos */
  font-size: 16px;
  color: var(--text-light);
  margin: 0;
}

.movie-details div {
  display: flex;
  gap: 2rem;
}

/* Genres */

.genre {
  margin-right: 10px;
}

/* Keywords */

.keywords {
  margin-top: 4px;
}

.keyword-list {
  gap: 6px;
  max-height: 2.4em;
  overflow: hidden;
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

/* Buttons */

.movie-buttons {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.movie-buttons button {
  padding: 6px 14px;
  font-size: 13px;
}

.trailer-button {
  background-color: white;
  color: black;
}

.btn-like img.icon {
  color: #333;
  width: 30px;
  height: 30px;
}

.btn-save img.icon {
  color: #333;
  width: 30px;
  height: 30px;
}

.overview-lalala {
  max-width: 800px;
  margin: 12px auto 0 auto;
  padding: 12px 16px;
  font-size: 15px;
  line-height: 1.5;
  color: var(--text-light);
  background-color: transparent;
  border-radius: 8px;
}

.top-picks-section {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
  overflow: hidden;
  color: white;
}

.scroll-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px 0;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

#topPicksScroll {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  overflow-x: auto;
}

#movieDetails {
  background-color: rgba(0, 0, 0, 0.7);
  /* dunkler Hintergrund, damit Text lesbar bleibt */
  padding: 2rem;
  border-radius: 16px;
  color: white;
  max-width: 1000px;
  margin: auto;
}

/* Media Queries für kleinere Bildschirme */
/*
@media (max-width: 768px) {
  .hero {
    padding: 20px;
  }
  .hero h2 {
    font-size: 20px;
  }
  .hero ol {
    margin-left: 15px;
  }
  .hero button {
    padding: 8px 16px;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 15px;
  }
  .hero h2 {
    font-size: 18px;
  }
  .hero ol {
    margin-left: 10px;
  }
  .hero button {
    padding: 6px 12px;
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 1rem;
  }
}

@media (max-width: 600px) {
  .movie-header {
    flex-direction: column;
    align-items: center;
  }
  .movie-poster {
    width: 100%;
    height: auto;
  }
  .movie-info {
    width: 100%;
    gap: 1rem;
  }
}
*/
.footer {
  text-align: center;
  padding: 1rem;
  background: var(--primary-color);
  color: white;
  font-size: 0.9rem;
  margin-top: 2rem;
  background-color: transparent;
}

.btn-like.liked {
  background-color: red; /* Hintergrund wenn geliked */
}

.btn-save.saved {
  background-color: red; /* Hintergrund wenn geliked */
}

@media (max-width: 600px) {
  .movie-header {
    flex-direction: column;
    align-items: center;
  }

  .movie-poster {
    width: 100%;
    height: auto;
  }

  .movie-info {
    width: 100%;
    gap: 1rem;
    margin-top: 1rem;
    text-align: left;
  }

  .ratings {
    flex-direction: column;
    margin-bottom: 1rem;
  }

  .ratings p {
    margin: 0rem;
  }
}
</style>
