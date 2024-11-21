<script setup lang="ts">
import { VueElement, onMounted, ref } from 'vue';
import { Device, queryDeviceById, queryTaskById } from '../api';
import { useRoute } from 'vue-router';
import { DeviceTaskLocale, localize } from '../services/TaskService';
import TaskDetailRawReport from '../components/TaskDetailRawReport.vue';
import TaskDetailFullReport from '../components/TaskDetailFullReport.vue';
import TaskDetailPhase from '../components/TaskDetailPhase.vue';
import TaskDetailTempPressure from '../components/TaskDetailTempPressure.vue';
import { getMeta } from '../meta/DeviceMetaInfo';

interface TabContent {
    component: VueElement,
    config: any,
}

const tabIndex = ref(0);
const currentActiveTab = ref<TabContent>();
const tabTitles = ref<string[]>([]);
const tabContentList: TabContent[] = [];


const tabContentComponentsMap: { [k: string]: any } = {
    "Phase": TaskDetailPhase,
    "FullReport": TaskDetailFullReport,
    "RawReport": TaskDetailRawReport,
    "TemperaturePressure": TaskDetailTempPressure
};


const showHeadInfo = ref(true);

const { params: { id: taskId } } = useRoute();

const taskInfo = ref<DeviceTaskLocale & { [k: string]: any }>();
const deviceInfo = ref<Device>();
const taskExtraInfoItems = ref<{ label: string, value: string }[]>([]);


async function loadApplyMetaInfo(deviceModal: string) {
    const devMeta = await getMeta(deviceModal);
    // For tab
    tabTitles.value = devMeta.tabModules.map(i => i.label.zh);
    tabContentList.push(...devMeta.tabModules.map(i => ({
        component: tabContentComponentsMap[i.module],
        config: i.config,
    })));
    // For extra info
    // extract value from taskInfo.extra for each field key
    const labelData = devMeta.fields.map(i => ({
        label: i.label.en,
        value: taskInfo.value?.extra[i.field]
    }))
    taskExtraInfoItems.value.push(...labelData);
}


async function fetchPageData(tid: string) {
    taskInfo.value = localize(await queryTaskById(tid)) as DeviceTaskLocale;
    deviceInfo.value = await queryDeviceById(taskInfo.value.deviceId);

    // Load meta info
    loadApplyMetaInfo(deviceInfo.value.modal);

}

onMounted(async () => {
    await fetchPageData(taskId as string);
    console.log(taskInfo, deviceInfo);

    tabIndex.value = 0;
    currentActiveTab.value = tabContentList[0];
});


function onTabSelected(event: CustomEvent<{ tabIndex: number }>) {
    tabIndex.value = event.detail.tabIndex;
    currentActiveTab.value = tabContentList[event.detail.tabIndex];
}

function handleToggleHeadInfo() {
    showHeadInfo.value = !showHeadInfo.value;
}

</script>

<template>
    <div class="flex-c flex-1">
        <div class="flex-r align-baseline">
            <ui5-title class="pad-l-30 pad-top-10" level="H2">{{ taskInfo?.endName || taskInfo?.startName }}</ui5-title>
            <ui5-title class="pad-lr-20 pad-top-10" level="H4">{{ taskInfo?.cycleCount }}</ui5-title>
            <ui5-badge :color-scheme="taskInfo?.statusColor"><ui5-icon :name="taskInfo?.statusIcon"
                    slot="icon"></ui5-icon> {{ taskInfo?.statusLocale }}
            </ui5-badge>
        </div>

        <Transition>
            <div class="info pad-lr-30 pad-bottom-10 flex-r" v-show="showHeadInfo">

                <div class="flex-1" style="columns: 300px 8;">
                    <div>
                        <div>
                            <ui5-label class="margin-r-10 margin-t-15">Start Time:</ui5-label>
                            <ui5-label>{{ taskInfo?.localStartTime ?? "--" }}</ui5-label>
                        </div>
                        <div>
                            <ui5-label class="margin-r-10 margin-t-15">Complete Time:</ui5-label>
                            <ui5-label>{{ taskInfo?.localEndTime ?? "--" }}</ui5-label>
                        </div>
                        <div>
                            <ui5-label class="margin-r-10 margin-t-15">Duration:</ui5-label>
                            <ui5-label>{{ taskInfo?.localTotalCycleTime ?? "--" }}</ui5-label>
                        </div>
                    </div>
                    <div>

                    </div>
                    <div>
                        <div>
                            <ui5-label class="margin-r-10 margin-t-15">Device Name:</ui5-label>
                            <ui5-label>{{ deviceInfo?.name ?? "--" }}</ui5-label>
                        </div>

                        <div>
                            <ui5-label class="margin-r-10 margin-t-15">Device Modal:</ui5-label>
                            <ui5-label>{{ deviceInfo?.modal ?? "--" }}</ui5-label>
                        </div>
                        <div>
                            <ui5-label class="margin-r-10 margin-t-15">Serial Number:</ui5-label>
                            <ui5-label>{{ deviceInfo?.serialNumber ?? "--" }}</ui5-label>
                        </div>
                    </div>

                    <div v-for="i of taskExtraInfoItems">
                        <ui5-label class="margin-r-10 margin-t-15">{{ i.label }}:</ui5-label>
                        <ui5-label>{{ i.value }}</ui5-label>
                    </div>
                </div>
            </div>
        </Transition>

        <div class="p-relative">
            <ui5-tabcontainer collapsed fixed tabs-overflow-mode="StartAndEnd" @tab-select="onTabSelected">
                <ui5-tab v-for="title of tabTitles" :text="title">
                </ui5-tab>

            </ui5-tabcontainer>
            <ui5-button class="p-absolute" style="position: absolute; right: 10px; bottom: 5px;"
                :icon="showHeadInfo ? 'navigation-up-arrow' : 'navigation-down-arrow'" design="Transparent"
                @click="handleToggleHeadInfo"></ui5-button>
        </div>


        <div class="content flex-1 p-relative" style="background-color: #f4f4f6;">
            <div class="p-absolute inset-0 flex-c"
                style="overflow: hidden; margin: 15px; border-radius: 10px; background-color: var(--sapBaseColor);">


                <div class="affix-title"></div>

                <div class="h-100 scroll-y" v-if="taskInfo">
                    <component :is="currentActiveTab?.component as any" :config="currentActiveTab?.config  as any" :taskInfo="taskInfo  as any"></component>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
