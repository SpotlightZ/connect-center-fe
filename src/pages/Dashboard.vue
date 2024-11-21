<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import VisionMC from '../components/scada/VisionMC.vue';
import { queryDashboardStatistic, queryLatestSensorRow } from '../api';
import { GridLayout, GridItem } from "vue3-grid-layout-next";
import Amsco from '../components/scada/Amsco.vue';
import { ChamberData, DashboardDeviceDataLocale, extractChamberData, localize } from '../services/DashboardService';


interface CardLayout {
    // ID
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    static: boolean;
}

type DashboardCardData = DashboardDeviceDataLocale & { chambers?: ChamberData };

const KEY_LAYOUT_LOCAL_STORAGE = 'dashboard:layout';

const MAX_COL = 24;
const cardLayout = ref<CardLayout[]>([]);
const serverOnline = ref(false);


// query all devices
// DeviceId - DashboardCardData
const dashboardData = reactive<Record<string, DashboardCardData>>({});


// query all device at the beginning
onMounted(async () => {
    // Load from local storage
    // If not exist, init the layout
    // If exist, load the layout and merge with the device data
    const storageLayout = await loadCardLayoutFromLocalStorage();
    await fetchDashboardData();

    const layoutMissMatchDeviceIds: string[] = [];
    if (storageLayout && storageLayout.length > 0) {
        // merge layout with device data
        for (let cardLayout of storageLayout) {
            if (dashboardData.hasOwnProperty(cardLayout.i)) {
                // 
            }
            else {
                // remove the layout
                layoutMissMatchDeviceIds.push(cardLayout.i);
            }
        }
        // remove the layout missing matched device
        cardLayout.value = storageLayout.filter((layout) => !layoutMissMatchDeviceIds.includes(layout.i));
    }
    else {
        cardLayout.value = initPanelLayout();
    }


    const fetchDashboard = async () => {
        await fetchDashboardData();
        setTimeout(() => {
            fetchDashboard();
        }, 10000);
    }

    const fetchChamber = async () => {
        await fetchChamberData();
        setTimeout(() => {
            fetchChamber();
        }, 1000);
    }
    await fetchDashboard();
    await fetchChamber();
});

function initPanelLayout() {
    let curX = 0;
    let curY = 0;
    let curW = 6;
    const FIX_HEIGHT = 5;
    //sort by modal alpha
    const cardList: CardLayout[] = [];
    Object.values(dashboardData)
        // Sort by modal
        .sort((a, b) => b.deviceInfo.modal.localeCompare(a.deviceInfo.modal))
        // 
        .forEach((statistics) => {
            switch (statistics.deviceInfo.modal) {
                case "Vision MC":
                    curW = 12;
                    break;
                default:
                    curW = 4;
                    break;
            }

            cardList.push({
                x: curX,
                y: curY,
                w: curW,
                h: FIX_HEIGHT,
                i: statistics.deviceInfo._id,
                static: false,
            });

            curX += curW;
            if (curX >= MAX_COL) {
                curX = 0;
                curY += FIX_HEIGHT;
            }
        });
    return cardList;
}


async function fetchDashboardData() {
    try {
        const data = localize(await queryDashboardStatistic());
        data.forEach((item) => {
            // already exist
            if(dashboardData.hasOwnProperty(item.deviceInfo._id)) {
                Object.assign(dashboardData[item.deviceInfo._id], item);
            }
            else {
                dashboardData[item.deviceInfo._id] = item;
            }
            
        });
        serverOnline.value = true;
    }
    catch (e) {
        serverOnline.value = false;
    }
}

async function fetchChamberData() {
    Object.values(dashboardData).forEach(async (item) => {
        const sensors = await queryLatestSensorRow(item.deviceInfo._id);
        item.chambers = sensors ? extractChamberData(item.deviceInfo.modal, sensors) : {};
    });
}

function loadCardLayoutFromLocalStorage() {
    const layout = localStorage.getItem(KEY_LAYOUT_LOCAL_STORAGE);
    if (layout) {
        return JSON.parse(layout) as CardLayout[];
    }
    return null;
}

function saveCardLayoutToLocalStorage(layout: CardLayout[]) {
    localStorage.setItem(KEY_LAYOUT_LOCAL_STORAGE, JSON.stringify(layout));
}

watch(cardLayout, async (layout) => {
    console.log("Save layout to local storage", layout);
    await saveCardLayoutToLocalStorage(layout);
}, { deep: true });

</script>
<template>
    <div class="dashboard w-100 h-100">
        <grid-layout :layout.sync="cardLayout" :col-num="MAX_COL" :row-height="30" :is-draggable="true"
            :is-resizable="true" :vertical-compact="true" :use-css-transforms="true">
            <grid-item v-for="item in cardLayout" :static="item.static" :x="item.x" :y="item.y" :w="item.w" :h="item.h"
                :i="item.i" :key="item.i">
                <div class="panel h-100">
                    <div class="title">{{ dashboardData[item.i].deviceInfo.name }} - {{
                        dashboardData[item.i].deviceInfo.modal }}
                    </div>
                    <div class="content">
                        <VisionMC class="h-100" :chambers="dashboardData[item.i].chambers ?? {}"
                            v-if="dashboardData[item.i].deviceInfo.modal === 'Vision MC'" />
                        <Amsco class="h-100" :chambers="dashboardData[item.i].chambers ?? {}"
                            v-else-if="dashboardData[item.i].deviceInfo.modal.startsWith('AMSCO')" />
                    </div>
                </div>
            </grid-item>
        </grid-layout>
    </div>
</template>
<style scoped>
.dashboard {
    padding: 5px 10px;
    box-sizing: border-box;
    overflow: scroll;
}

.panel {
    overflow: hidden;
    border-radius: 5px;
    box-sizing: border-box;
    box-shadow: 0 0 6px 0 rgba(100, 100, 100, 0.1);
    border: solid 1px transparent;
    /* background-color: #eeeeee; */
    transition: box-shadow, border 0.2s linear;
}

.panel:hover {
    border: solid 1px #cccccc;
    box-shadow: 0 0 8px 0 rgba(100, 100, 100, 0.3);
}

.panel .title {
    height: 34px;
    background-color: #FBFBFB;
    text-align: center;
    line-height: 34px;
    font-size: medium;
    color: #333333;
}

.panel .content {
    padding: 8px;
    height: calc(100% - 50px);
}

:deep(.vue-grid-item.vue-grid-placeholder) {
    background-color: #555555;
    border: 1px dashed #333333;
}

:deep(.vue-grid-item) {
    touch-action: none;
}
</style>