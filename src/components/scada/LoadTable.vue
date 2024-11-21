<script setup lang="ts">
import { StatusEnum } from './ChamberStatusEnum';

defineProps({
    status: {
        type: String,
        default: "idle"
    },
    title: {
        type: String,
        default: "Load Table"
    }
});

</script>

<template>
    <div :class="['chamber', 'flex-c', 'align-center', 'justify-center', status]">
        <span class="title">{{ title }}</span>
        <div class="flex-c flex-1 text-lg align-center justify-center">
            <div v-if="status === StatusEnum.RUNNING" class="breathe">满</div>
            <div v-else-if="status === StatusEnum.IDLE">空</div>
            <div v-else>未知</div>
        </div>
    </div>
</template>

<style scoped>
.chamber {
    border-radius: 5px;
    color: white;
    font-size: 12px;
}

.chamber .title {
    height: 30px;
    line-height: 30px;
}

.running {
    background-color: #3d8dd7;
}

.error {
    background-color: #FF0000;
}

.warning {
    background-color: #FFA500;
}

.idle {
    background-color: #0AB86F;
}

.unknown {
    background-color: #626262;
}

.text-lg {
    font-size: 18px;
}
</style>
