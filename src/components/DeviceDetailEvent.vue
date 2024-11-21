<script setup lang="ts">
import { DeviceEventLog, queryAllEventLogs } from '../api';
import { ref, onMounted } from 'vue';

const props = defineProps<{ did: string }>();
const devLogsQueryPage = { page: 0, size: 50 };
const devLogs = ref<DeviceEventLog[]>([]);
const eventLoading = ref(false);

onMounted(async () => {
    await fetchNextPage();
});

async function fetchNextPage() {
    console.log("fetchNextPage");
    devLogsQueryPage.page++;
    eventLoading.value = true;
    try {
        const resp = await queryAllEventLogs(props.did, devLogsQueryPage);
        if (resp.length == 0) {
            devLogsQueryPage.page--;
        }
        devLogs.value.push(...resp);
    }
    catch (e) {
        console.error(e);
        devLogsQueryPage.page--;
    }
    finally {
        eventLoading.value = false;
    }
}

function subExceedString(str: string) {
    if (str.length > 200) {
        return str.substring(0, 100) + "...";
    }
    return str;
}


const EVENT_LEVEL: {
    [k: string]: string,
} = {

    "ERROR": "错误",
    "WARNING": "警告",
    "INFO": "信息",
}


const EVENT_TYPE: {
    [k: string]: string,
} = {
    "DEV_CONNECT": "设备连接",
    "DEV_DISCONNECT": "设备断开",
    "DEV_CREATE": "设备创建",
    "LOCAL_SYS": "本地系统",
    "DEV_SYS": "设备系统",
    "DEV_ALARM": "设备告警",
    "DEV_ALARM_ACK": "设备告警确认",
    "DEV_ALARM_CLEAR": "设备告警清除",
}

</script>

<template>
    <ui5-table no-data-text="暂无数据" sticky-column-header growing="Scroll" :busy="eventLoading" @load-more="fetchNextPage()">
        <!-- Columns -->
        <ui5-table-column slot="columns">
            <span style="line-height: 1.4rem">等级</span>
        </ui5-table-column>

        <ui5-table-column slot="columns" popin-text="事件" demand-popin>
            <span style="line-height: 1.4rem">事件</span>
        </ui5-table-column>

        <ui5-table-column slot="columns" popin-text="消息" demand-popin>
            <span style="line-height: 1.4rem">消息</span>
        </ui5-table-column>

        <ui5-table-column slot="columns">
            <span style="line-height: 1.4rem">发生时间</span>
        </ui5-table-column>


        <ui5-table-row v-for="i of devLogs">
            <ui5-table-cell>
                <div class="double-line-content">
                    <span>{{ EVENT_LEVEL[i.level] }}</span>
                </div>
            </ui5-table-cell>
            <ui5-table-cell>
                <span>{{ EVENT_TYPE[i.event] }}</span>
            </ui5-table-cell>
            <ui5-table-cell>
                <span>{{ subExceedString(i.message) }}</span>
            </ui5-table-cell>
            <ui5-table-cell>
                <span>{{ new Date(Number(i.timestamp)).toLocaleString() }}</span>
            </ui5-table-cell>
        </ui5-table-row>
    </ui5-table>
</template>

<style scoped>
ui5-table ui5-table-column.table-header-text-alignment::part(column) {
    text-align: end;
}
</style>
