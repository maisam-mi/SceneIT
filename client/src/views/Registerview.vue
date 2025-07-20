<template>
  <main class="mukta-regular">
    <section>
      <h2>Signup</h2>
      <p>Create an account and use our features freely.</p>
      <form @submit.prevent="register">
        <div>
          <label for="username">Username</label>
          <input id="username" v-model="username" type="text" placeholder="Username" required />
        </div>

        <div>
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" placeholder="Password" required />
        </div>

        <div class="options">
          <RouterLink class="login-link" to="/login"> Already have an account? </RouterLink>

          <button type="reset" class="secondary-button">Reset</button>
          <button type="submit" class="primary-button">Sign up</button>
        </div>
        <p v-if="message" class="error">{{ message }}</p>
      </form>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import NavbarComp from '../components/NavbarComp.vue';
import { SceneITStore } from '../stores/store';

const myStore = SceneITStore();

const router = useRouter();

const username = ref('');
const password = ref('');
const message = ref('');
const success = ref(false);

const register = async () => {
  message.value = '';
  success.value = false;

  try {
    const response = await fetch('http://localhost:3100/account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }


    success.value = true;
    message.value = data.message;
    myStore.account.username = username.value;
    username.value = '';
    password.value = '';
    console.log(data.token);
    localStorage.setItem('token', data.token);

    console.log(myStore.account.username);


    router.push('/quizview');
  } catch (err) {
    message.value = err.message;
    success.value = false;
  }
};

</script>

<style scoped>
main {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url(images/background.png);
  background-position: center;
  background-size: cover;
  background-attachment: fixed;
  color: var(--text-light);
  padding-left: 20rem;
  padding-right: 20rem;
}

section {
  width: 35rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5em;
  border-radius: 8px;
}

label {
  display: block;
  margin: 0.3em 0.6rem;
}

input {
  width: 100%;
  padding: 0.5em 1rem;
  margin-bottom: 1em;
  border-radius: 0.8rem;
  box-shadow: 0rem 0rem 0.2rem 0.2rem #33333320 inset;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

button {
  padding: 0.75em 0em;
  border-radius: 0.75rem;
  cursor: pointer;
}

.login-link {
  color: var(--text-light);
  text-decoration: underline;
  text-decoration-color: #eeeeee;
}

.error {
  margin-top: 1rem;
}

@media only screen and (min-width: 1400px) {
  main {
    padding-left: 0rem;
    padding-right: 0rem;
  }

  button {
    flex-grow: 1;
  }

  .login-link {
    flex-grow: 3;
  }
}

@media only screen and (max-width: 1400px) {
  main {
    padding-left: 0rem;
    padding-right: 0rem;
  }

  button {
    flex-grow: 1;
  }

  .login-link {
    flex-grow: 3;
  }
}

@media only screen and (max-width: 600px) {
  section {
    gap: 1.2rem;
  }

  .options {
    flex-direction: column;
  }

  button {
    width: 100%;
  }

  .login-link {
    margin: 1rem 0rem;
  }
}
</style>
