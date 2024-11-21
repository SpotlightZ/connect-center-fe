<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useSysConfigStore } from '../store';


const dialogContent = ref({ hospitalName: "", taskExportFilePath: "" });

const sysConfigStore = useSysConfigStore();

onMounted(() => {
    dialogContent.value.hospitalName = sysConfigStore.hospitalName;
    dialogContent.value.taskExportFilePath = sysConfigStore.taskExportFilePath;
})

function handleSaveConfig() {
    sysConfigStore.saveHospitalName(dialogContent.value.hospitalName);
    sysConfigStore.saveTaskExportFilePath(dialogContent.value.taskExportFilePath);
}

</script>

<template>
    <div class="pad-20">
        <div>
            <ui5-label for="hospital-name" class="margin-r-20" required show-colon>医院名称</ui5-label>
            <ui5-input v-model="dialogContent.hospitalName" id="hospital-name" required></ui5-input>
        </div>
        <div>
            <ui5-label for="hospital-name" class="margin-r-20" required show-colon>文件配置</ui5-label>
            <ui5-input v-model="dialogContent.taskExportFilePath" id="hospital-name" required></ui5-input>
        </div>
        <div>
            <ui5-button @click="handleSaveConfig">保存设置</ui5-button>
        </div>
    </div>
</template>

<style scoped></style>
