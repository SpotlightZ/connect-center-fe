<script setup lang="ts">
import TitleBar from '../components/TitleBar.vue';

</script>

<template>
    <div class="flex-c h-100">
        <TitleBar></TitleBar>
        <router-view/>
    </div>
</template>

<style scoped></style>
