<script setup lang="ts">
import Chamber from './Chamber.vue';
</script>

<template>
    <div class="flex-r gap-10 align-end">
        <Chamber status="unknown" />
    </div>

</template>

<style scoped>
.chamber {
    border-radius: 5px;
    height: 100%;
    width: 163px;
}

.table {
    border-radius: 5px;
    height: 100%;
    width: 163px;
}

.running {
    background-color: #0AB86F;
}

.error {
    background-color: #FF0000;
}

.warning {
    background-color: #FFA500;
}

.idle {
    background-color: #626262;
}
</style>
