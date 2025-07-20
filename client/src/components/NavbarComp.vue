<template>
  <header class="navbar">
    <RouterLink to="/" class="title">
      <div onclick="window.tvshowtion.href='index.html'">
        <img src="@/assets/logo.png" alt="Logo" class="logo-image" />
        <span class="mukta-bold">SceneIT</span>
      </div>
    </RouterLink>

    <div class="search-container">
      <input
        class="search-input"
        type="text"
        placeholder="Search for movies or shows..."
        v-model="searchQuery"
        @keyup.enter="handleSearch"
      />
      <img src="@/assets/lupe.png" alt="Lupe" class="search-img" @click="handleSearch" />
    </div>

    <RouterLink to="/login" class="tertiary-button login-button" v-if="!myStore.account.username">
      Log In
    </RouterLink>
    <RouterLink to="/account" v-else>
      <div class="tertiary-button nav-buttons">
        <button onclick="">{{ myStore.account.username }}</button>
      </div>
    </RouterLink>
  </header>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { SceneITStore } from '../stores/store';
import { ref } from 'vue';

const myStore = SceneITStore();
const router = useRouter();

const searchQuery = ref('');

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    alert('Please enter a search term.');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3100/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
    const data = await response.json();

    if (data.success) {
      // Redirect to the detail page
      const path = data.media_type === 'movie' ? `/moviedetail/${data.id}` : `/seriedetail/${data.id}`;
      router.push(path);
      searchQuery.value = ''; // Clear the search input after successful search
    } else {
      // No results found or other message from backend
      alert(data.message || 'No results found for that name.');
    }
  } catch (error) {
    console.error('Error during search:', error);
    alert('An error occurred during search. Please try again.');
  }
};
</script>

<style scoped>
.navbar {
  position: fixed;
  z-index: 3;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background-color: var(--primary-color);
  color: var(--text-light);
  box-sizing: border-box;
  /*padding wird in breite mitgerechnet*/
  padding-left: 20rem;
  padding-right: 20rem;
}

.title {
  flex-grow: 2;
  text-decoration: none;
  color: var(--text-light);
  font-weight: bold;
}

.logo-image {
  max-width: 100px;
  height: auto;
}

.search-container {
  flex-grow: 6;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0rem 0rem 0.2rem 0.2rem #33333320 inset;
  border: none;
  outline: none;
}

.search-img {
  width: 1.8rem;
  height: 1.8rem;
}

.login-button {
  flex-grow: 2;
  display: flex;
  flex-flow: row-reverse;
}

/* Responsive behavior */
@media only screen and (max-width: 1400px) {
  .navbar {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 600px) {
  .navbar {
    gap: 0rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    flex-wrap: nowrap;
  }

  span {
    display: none;
  }

  .logo-image {
    max-width: 60px;
  }

  .search-container {
    gap: 0.2rem;
  }

  .search-input {
    font-size: 0.85rem;
    padding: 0.3rem 0.6rem;
  }

  .search-img {
    width: 1.2rem;
    height: 1.2rem;
  }

  .nav-buttons button {
    font-size: 0.85rem;
    padding: 0.3rem 0.8rem;
  }
}
</style>
