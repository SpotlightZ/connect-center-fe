<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { queryDashboardStatistic, queryLatestSensorRow, SensorRow } from '../api';
import { useRoute } from "vue-router";
import { router } from "../router";
import { localize, DashboardDeviceDataLocale } from '../services/DashboardService';


const dashboardData = ref<DashboardDeviceDataLocale[]>();
const serverOnline = ref(false);

const positionedSensor = ref<(boolean | null)[]>([]);
const mode = ref("");

const route = useRoute();

onMounted(async () => {
    mode.value = route.query.mode as string;
    const recursiveFetch = async () => {
        await fetchDeviceInfo();
        setTimeout(recursiveFetch, 3000);
    }
    await recursiveFetch();
});

if (route.query.mode === undefined) {
    router.push("/kanban?mode=clean");
}

watch(() => route.query, async (query) => {
    mode.value = query.mode as string;
}, { deep: true });


function colorMapping(value: boolean | null) {
    if (value === undefined) {
        return "gray";
    }
    return value ? "blue" : "green";
}

function textMapping(value: boolean | null) {
    if (value === undefined) {
        return "";
    }
    return value ? "满" : "空";
}

function getLoadTablePositioned(sensors: SensorRow) {
    return sensors.payload["Chamber1:3:I.3"].value as boolean;
}

function getUnloadTablePositioned(sensors: SensorRow) {
    return sensors.payload["Chamber3:2:I.2"].value as boolean;
}

async function fetchDeviceInfo() {
    try {
        dashboardData.value = localize(await queryDashboardStatistic());
        dashboardData.value.forEach(dev => {
            dev.runningTasks = dev.runningTasks.filter(task => { 
                return (Number(task.estimatedRestTime) ?? 0) > 0; 
            }) ;
        });
        serverOnline.value = true;
    }
    catch (e) {
        serverOnline.value = false;
    }
    dashboardData.value?.forEach(async (dev, index) => {
        try {
            const sensors = await queryLatestSensorRow(dev.deviceInfo._id);
            switch (dev.deviceInfo.modal) {
                case "Vision MC": {
                    positionedSensor.value[index] = mode.value === "clean"
                        ? getUnloadTablePositioned(sensors)
                        : getLoadTablePositioned(sensors);

                    break;
                }
            }
        }
        catch (e) {
            positionedSensor.value[index] = null;
        }
    });
}

</script>

<template>
    <div style="text-align: center;">
        <h3>{{ mode === 'clean' ? '洁净区看板' : '污染区看板' }} </h3>
    </div>

    <div class="kanban ">
        <div :class="['card', colorMapping(positionedSensor[index])]" v-for="(item, index) in dashboardData">
            <div class="title">{{ item.deviceInfo.name }}</div>
            <div class="content">
                <span>{{ textMapping(positionedSensor[index]) }}</span>
            </div>
            <div class="bottom" v-if="item.runningTasks.length > 0">
                <div class="task-time-list">
                    <div class="row">
                        <div>任务</div>
                        <div>预估剩余时间</div>
                    </div>
                    <div class="row" v-for="runningTask in item.runningTasks">
                        <div>#{{ runningTask.cycleCount }}</div>
                        <div>{{ runningTask.localEstimatedRestTime }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.kanban {
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
}

.card {
    display: flex;
    flex-direction: column;
    width: 300px;
    height: 350px;
    margin: 15px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);

    border-radius: 8px;
    overflow: hidden;
}

.card .title {
    text-align: center;
    font-size: 30px;
    color: white;
    padding: 15px;
}

.card .content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 60px;
    color: white;
}

.card .bottom {
    text-align: center;
    font-size: 20px;
    color: white;
    padding: 20px;
}

.task-time-list {
    font-size: 18px;
}

.task-time-list .row {
    display: flex;
    flex-direction: row;
}

.task-time-list .row div {
    flex: 1;
    padding: 5px;
}

.task-time-list .row :last-child {
    flex: 2;
}


@media screen and (max-width: 1080px) {
    .card {
        width: 210px;
        height: 250px;
    }

    .card .content {
        padding-top: 50px;
        font-size: 50px;
    }

    .card .title {
        font-size: 25px;
    }

    .task-time-list {
        font-size: 14px;
    }

}

.green {
    background-color: green;
}

.blue {
    background-color: #4a7cc8;
}

.gray {
    background-color: #787878;
}
</style>
