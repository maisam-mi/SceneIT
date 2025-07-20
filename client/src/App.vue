<template>
  <div>
    <NavbarComp></NavbarComp>
    <RouterView/>
  </div>
</template>

<script setup>
import NavbarComp from './components/NavbarComp.vue';
import { RouterView } from 'vue-router';

</script>

<style>
:root {
    --primary-color: #341812;
    --secondary-color: #BC2E0F;
    --text-light: #EEEEEE;
    --text-dark: #333333;
}

/* the mukta styles*/

.mukta-extralight {
    font-family: "Mukta", sans-serif;
    font-weight: 200;
    font-style: normal;
}

.mukta-light {
    font-family: "Mukta", sans-serif;
    font-weight: 300;
    font-style: normal;
}

.mukta-regular {
    font-family: "Mukta", sans-serif;
    font-weight: 400;
    font-style: normal;
}

.mukta-medium {
    font-family: "Mukta", sans-serif;
    font-weight: 500;
    font-style: normal;
}

.mukta-semibold {
    font-family: "Mukta", sans-serif;
    font-weight: 600;
    font-style: normal;
}

.mukta-bold {
    font-family: "Mukta", sans-serif;
    font-weight: 700;
    font-style: normal;
}

.mukta-extrabold {
    font-family: "Mukta", sans-serif;
    font-weight: 800;
    font-style: normal;
}


* {
  margin: 0;
  box-sizing: border-box;
}


.primary-button {
    background-color: var(--text-light);
    color: var(--text-dark);
    border: none;
}

.primary-button:hover {
    color: var(--text-dark);
}

.secondary-button {
    background-color: transparent;
    color: var(--text-light);
    border-color: var(--text-light);
}

.secondary-button:hover {
    color: var(--text-light);
}

.tertiary-button {
    border: none;
    color: var(--text-light);
    /* if the tag is a tag 'a' */
    text-decoration: none;
}

.tertiary-button :hover {
    color: var(--text-light);
}
</style>
