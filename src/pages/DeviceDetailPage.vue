<script setup lang="ts">
import { useRoute } from 'vue-router';
import DeviceDetailEvent from '../components/DeviceDetailEvent.vue';
import DeviceDetailMonitor from '../components/DeviceDetailMonitor.vue';
import DeviceDetailTask from '../components/DeviceDetailTask.vue';
import { ref, onMounted } from 'vue';
import { Device, queryDeviceById } from '../api';
import { getMeta } from '../meta/DeviceMetaInfo';

const { params } = useRoute();

const tabContentComponents = [DeviceDetailTask, DeviceDetailEvent, DeviceDetailMonitor];

const tabIndex = ref(0);
const tabContent = ref();
const devInfo = ref<Device>();
const devImage = ref("");


function onTabSelected(event: CustomEvent<{ tabIndex: number }>) {
    console.log(event.detail.tabIndex, event);
    
    tabIndex.value = event.detail.tabIndex;
    tabContent.value = tabContentComponents[event.detail.tabIndex];
    console.log(tabContent.value);
}

onMounted(async () => {
    devInfo.value = await queryDeviceById(params.id as string);
    tabContent.value = tabContentComponents[tabIndex.value];

    const meta = getMeta(devInfo.value.modal);
    devImage.value = meta.image;
});
</script>

<template>
    <div class="flex-c flex-1">
        <ui5-title class="pad-lr-30 pad-top-10" level="H2">{{ devInfo?.name }}</ui5-title>
        <div class="info pad-lr-30 pad-top-10 flex-r">

            <div class="flex-1 flex-r gap-150" style="padding-right: 100px">
                <div>
                    <div><ui5-label class="margin-r-10">Serial Number:</ui5-label>
                        <ui5-label>{{ devInfo?.serialNumber }}</ui5-label>
                    </div>
                    
                    <div><ui5-label class="margin-r-10 margin-t-15">IPv4
                            Address:</ui5-label><ui5-label>{{ devInfo?.ipv4 }}</ui5-label></div>
                    <div><ui5-label class="margin-r-10 margin-t-15">
                            MAC Address:</ui5-label><ui5-label>{{ devInfo?.macAddress }}</ui5-label></div>
                </div>
                <div>
                    <div><ui5-label class="margin-r-10">Model:</ui5-label><ui5-label>{{ devInfo?.modal }}</ui5-label>
                    </div>
                    <div><ui5-label class="margin-r-10 margin-t-15">Series:</ui5-label><ui5-label>{{ devInfo?.series
                    }}</ui5-label></div>
                    <div><ui5-label class="margin-r-10 margin-t-15">Vendor:</ui5-label><ui5-label>{{ devInfo?.vendor
                    }}</ui5-label></div>
                </div>
                <div>
                    <div><ui5-label class="margin-r-10">
                            Device serial number:</ui5-label><ui5-label>{{ devInfo?.deviceSerialNumber }}</ui5-label></div>
                </div>
            </div>
            <img class="dev-pic" :src="devImage" alt="">
        </div>

        <ui5-tabcontainer collapsed fixed tabs-overflow-mode="StartAndEnd" @tab-select="onTabSelected">
            <ui5-tab text="任务" selected>
            </ui5-tab>
            <ui5-tab text="事件">
            </ui5-tab>
            <!-- <ui5-tab text="实时监控">
            </ui5-tab> -->
        </ui5-tabcontainer>
        <div class="content flex-1 p-relative" style="background-color: #f4f4f6;">
            <div class="p-absolute inset-0 flex-c"
                style="overflow: hidden; margin: 15px; border-radius: 10px; background-color: var(--sapBaseColor);">

                
                <div class="affix-title"></div>

                <div class="h-100 scroll-y">
                    <component :is="tabContent" :did="(params.id as string)"></component>
                </div>

            </div>

        </div>
    </div>
</template>

<style scoped>
.info {
    font-family: "72override", var(--sapFontFamily);
    color: var(--sapContent_LabelColor);
}

.dev-pic {
    height: 110px;
    width: 110px;
    object-fit: contain;
}
</style>
