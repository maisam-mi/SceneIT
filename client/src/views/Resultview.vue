<template>
    <div id="body">
        <NavbarComp></NavbarComp>
        <p>result</p>
    </div>
</template>

<script setup>
import NavbarComp from '../components/NavbarComp.vue';

</script>

<style lang="scss" scoped>
#body{
    background-image: url(images/background.png);
    background-position: center;
    background-size: cover;
    background-attachment: fixed;
}
</style>