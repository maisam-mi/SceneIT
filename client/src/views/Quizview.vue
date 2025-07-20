<template>
  <main>
    <section class="quiz">
      <h2>Do you prefer films or series?</h2>

      <!-- Schritt 1: Auswahl Filme/Serien -->
      <div v-if="step === 1" class="options">
        <label>
          <input type="radio" value="movie" v-model="prefers" />
          Films
        </label>
        <label>
          <input type="radio" value="tv" v-model="prefers" />
          Series
        </label>
      </div>

      <button v-if="step === 1" @click="goToNextStep" :disabled="!prefers" class="next-btn">
        Next
      </button>

      <!-- Schritt 2: Genres & Keywords -->
      <div v-if="step === 2" class="selections">
        <h3>Choose your preferred genres</h3>
        <div class="checkbox-list">
          <label v-for="genre in genres" :key="genre.name" class="checkbox">
            <input type="checkbox" :value="genre.name" v-model="selectedGenres" />
            {{ genre.name }}
          </label>
        </div>

        <h3>Choose your preferred keywords</h3>
        <div class="checkbox-list">
          <label v-for="keyword in keywords" :key="keyword.name" class="checkbox">
            <input type="checkbox" :value="keyword.name" v-model="selectedKeywords" />
            {{ keyword.name }}
          </label>
        </div>

        <button @click="submitQuiz" :disabled="isLoading || !canSubmit">
          {{ isLoading ? 'Lädt...' : 'End Quiz' }}
        </button>

        <p v-if="message" class="message">{{ message }}</p>
      </div>
    </section>
  </main>
</template>

<script>
import { SceneITStore } from '../stores/store';

const myStore = SceneITStore();

export default {
  name: 'Quiz',
  data() {
    return {
      step: 1,
      prefers: '',
      selectedGenres: [],
      selectedKeywords: [],
      isLoading: false,
      message: '',
      genres: [
        { name: 'Action' },
        { name: 'Adventure' },
        { name: 'Animation' },
        { name: 'Comedy' },
        { name: 'Crime' },
        { name: 'Documentary' },
        { name: 'Drama' },
        { name: 'Family' },
        { name: 'Fantasy' },
        { name: 'History' },
        { name: 'Horror' },
        { name: 'Music' },
        { name: 'Mystery' },
        { name: 'Romance' },
        { name: 'Science Fiction' },
        { name: 'Thriller' },
        { name: 'Western' },
      ],
      keywords: [
        { name: 'superhero' },
        { name: 'time travel' },
        { name: 'based on true story' },
        { name: 'based on novel or book' },
        { name: 'post-apocalyptic' },
        { name: 'coming of age' },
        { name: 'friendship' },
        { name: 'revenge' },
        { name: 'alien' },
        { name: 'zombie' },
        { name: 'magic' },
        { name: 'heist' },
      ],
    };
  },
  computed: {
    canSubmit() {
      return this.selectedGenres.length > 0;
    },
  },
  methods: {
    goToNextStep() {
      if (!this.prefers) {
        this.message = 'Bitte wähle zuerst Filme oder Serien.';
        return;
      }
      this.message = '';
      this.step = 2;
    },
    async submitQuiz() {
      if (!this.canSubmit) {
        this.message = 'Bitte wähle mindestens ein Genre.';
        return;
      }
      this.isLoading = true;
      this.message = '';

      console.log(this.prefers);
      console.log(this.selectedGenres);
      console.log(this.selectedKeywords);

      try {
        const response = await fetch('http://localhost:3100/quiz/save-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
          body: JSON.stringify({
            mediaType: this.prefers,
            genres: this.selectedGenres,
            keywords: this.selectedKeywords,
          }),
        });

        const data = await response.json();
        myStore.setQuizData(this.prefers, this.selectedGenres, this.selectedKeywords);

        if (response.ok) {
          this.message = 'Empfehlungen erhalten! Schau dir die Ergebnisse an.';
          // Optional: emit or navigate
          this.$router.push("/")
        } else {
          this.message = data.message || 'Fehler bei der Anfrage';
        }
      } catch (error) {
        this.message = 'Netzwerkfehler: ' + error.message;
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
main {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom, #341812, #b98c6b);
  padding: 1rem;
  box-sizing: border-box;
  color: #f0f0f0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.quiz {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 2rem 3rem;
  border-radius: 12px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.3);
}

.quiz h2 {
  margin-bottom: 1rem;
  font-weight: 700;
  text-align: center;
}

.quiz h3 {
  margin-top: 1.8rem;
  margin-bottom: 1rem;
  font-weight: 600;
  border-bottom: 1px solid #555;
  padding-bottom: 0.3rem;
}

.options {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.checkbox-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1rem;
  max-height: 180px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.checkbox {
  flex: 1 1 45%;
  user-select: none;
  cursor: pointer;
  font-weight: 500;
}

.checkbox input {
  margin-right: 0.5rem;
  cursor: pointer;
}

button {
  margin-top: 1.8rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #764ba2;
  border: none;
  border-radius: 8px;
  color: #f0f0f0;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  background-color: #5a3680;
}

.message {
  margin-top: 1rem;
  text-align: center;
  font-weight: 600;
  color: #ffd700;
}

@media (max-width: 600px) {
  .quiz {
    padding: 1.5rem 1.5rem;
  }

  .checkbox {
    flex: 1 1 100%;
  }

  .options {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
