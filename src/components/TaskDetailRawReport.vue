<script setup lang="ts">

import { DeviceTaskLocale } from '../services/TaskService';
import { computed } from 'vue';
const props = defineProps<{ taskInfo: DeviceTaskLocale }>();

const fileName = computed(() => {
    return `${props.taskInfo.startName || props.taskInfo.endName}-${props.taskInfo.cycleCount}-${props.taskInfo.localStartTime.replace(/:/g, '-')}.raw.txt`;
});

function copyToClipBoard() {
    const input = document.createElement('textarea');
    input.value = props.taskInfo.blockContent;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);

}

function downloadFile() {
    const blob = new Blob([props.taskInfo.blockContent], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName.value;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
}
</script>

<template>
    <div>
        <teleport to=".affix-title">
            <div class="flex-r align-center">
                <ui5-button class="margin-lr-15 margin-t-15" icon="copy" @click="copyToClipBoard" style="width: 140px">复制到剪切板</ui5-button>
                <ui5-button class="margin-lr-5 margin-t-15" icon="download" @click="downloadFile" style="width: 140px">下载</ui5-button>
                <ui5-label class="margin-lr-15 margin-t-15">{{ fileName }}</ui5-label>
            </div>
        </teleport>

        <div class="h-100 scroll-y flex-r" style="justify-content: center">
            <pre style="">{{ props.taskInfo?.blockContent }}</pre>
        </div>

    </div>
</template>

<style scoped></style>
