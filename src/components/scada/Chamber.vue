<script setup lang="ts">
import { StatusEnum } from './ChamberStatusEnum';

defineProps({
    status: {
        type: String,
        default: StatusEnum.IDLE,
        validator: (value: StatusEnum) => Object.values(StatusEnum).includes(value)
    },
    title: {
        type: String,
        default: "Chamber"
    }
});


</script>

<template>
    <div :class="['chamber', 'flex-c', 'align-center', 'justify-center', status]" >
        <span class="title">{{ title }}</span>
        <div class="flex-c flex-1 text-lg align-center justify-center">
            <div v-if="status === StatusEnum.RUNNING" class="breathe">运行</div>
            <div v-else-if="status === StatusEnum.ERROR">错误</div>
            <div v-else-if="status === StatusEnum.WARNING">警告</div>
            <div v-else-if="status === StatusEnum.IDLE">空闲</div>
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
    background-color: #23aa72;
}

.unknown {
    background-color: #626262;
}


.text-lg {
    font-size: 18px;
}

</style>
