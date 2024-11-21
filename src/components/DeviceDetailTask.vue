<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { queryAllTasks, DeviceTaskQueryRequest } from '../api';
import { router } from '../router';
import { DeviceTaskLocale, localize  } from '../services/TaskService';

type TaskQuery = Omit<DeviceTaskQueryRequest, "did">;

const props = defineProps<{ did: string }>();
const devTasks = ref<(DeviceTaskLocale)[]>([]);
const queryParam = ref<TaskQuery>({});
const taskLoading = ref(false);
const devTaskQueryPage = { page: 1, size: 50 };

async function fetchNextPage() {
    devTaskQueryPage.page++;
    taskLoading.value = true;
    try {
        const resp = await queryAllTasks({ did: props.did, ...queryParam.value }, devTaskQueryPage);
        if (resp.length == 0) {
            devTaskQueryPage.page--;
        }
        devTasks.value.push(...localize(resp) as DeviceTaskLocale[]);
    }
    catch (e) {
        devTaskQueryPage.page--;
    }
    finally {
        taskLoading.value = false;
    }

}

async function handleSearch() {
    taskLoading.value = true;
    try {
        console.log("Search: ", queryParam.value);
        devTaskQueryPage.page = 1;
        devTasks.value = [];
        devTasks.value.push(...localize(await queryAllTasks({ did: props.did, ...queryParam.value }, devTaskQueryPage)) as DeviceTaskLocale[]);
    }
    finally {
        taskLoading.value = false;
    }
}

onMounted(async () => {
    handleSearch();
});

function handleDetailClick(taskId: string) {
    router.push(`/tasks/${taskId}`);
}

function handleDownloadReportClick(taskId: string) {
    console.log("Download report for task: ", taskId);
}

</script>

<template>
    <div>
        <teleport to=".affix-title">
            <div class="pad-15 flex-r align-center space-between" style="background-color: var(--sapBaseColor)">
                <div>
                    <span class="ib margin-r-15">
                        <ui5-label class="margin-r-15" show-colon for="taskNameSearchInput">任务名称</ui5-label>
                        <ui5-input v-model="queryParam.name" style="width: 150px;" id="taskNameSearchInput" show-clear-icon></ui5-input>
                    </span>

                    <span class="ib margin-r-15">
                        <ui5-label class="margin-r-15" show-colon for="taskCounterSearchInput">任务计数</ui5-label>
                        <ui5-input v-model="queryParam.cycleCount" style="width: 150px;" id="taskCounterSearchInput" show-clear-icon></ui5-input>
                    </span>

                    <span class="ib margin-r-15">
                        <ui5-label class="margin-r-15" show-colon for="taskDateTimeRangePicker">开始日期范围</ui5-label>
                        <ui5-daterange-picker style="width: 250px;" id="taskDateTimeRangePicker" formatPattern="YYYY-MM-dd" delimiter="," :value="queryParam.startTimeRange" @change="(ev: CustomEvent<{value: string}>)=>queryParam.startTimeRange = ev.detail.value"></ui5-daterange-picker>
                    </span>

                </div>

                <ui5-button style="min-width: 100px;" icon="search" @click="handleSearch" :disabled="taskLoading">搜索</ui5-button>
            </div>
        </teleport>

        <ui5-table no-data-text="暂无数据" sticky-column-header growing="Scroll" :busy="taskLoading" @load-more="fetchNextPage()">
            <!-- Columns -->
            <ui5-table-column slot="columns">
                <span style="line-height: 1.4rem">任务名称</span>
            </ui5-table-column>

            <ui5-table-column slot="columns">
                <span style="line-height: 1.4rem">任务计数</span>
            </ui5-table-column>

            <ui5-table-column slot="columns" min-width="800">
                <span style="line-height: 1.4rem">开始时间</span>
            </ui5-table-column>

            <ui5-table-column slot="columns" min-width="600" popin-text="结束时间" demand-popin>
                <span style="line-height: 1.4rem">结束时间</span>
            </ui5-table-column>

            <ui5-table-column slot="columns" min-width="600" popin-text="时长" demand-popin>
                <span style="line-height: 1.4rem">时长</span>
            </ui5-table-column>

            <ui5-table-column slot="columns" min-width="600" popin-text="状态" demand-popin>
                <span style="line-height: 1.4rem">状态</span>
            </ui5-table-column>

            <ui5-table-column slot="columns">
                <span style="line-height: 1.4rem"></span>
            </ui5-table-column>


            <ui5-table-row v-for="task of devTasks" :key="task._id">
                <ui5-table-cell>
                    <div class="double-line-content">
                        <span><b>{{ task.endName || task.startName }}</b></span>
                    </div>
                </ui5-table-cell>
                <ui5-table-cell>
                    <span>{{ task.cycleCount || "--" }}</span>
                </ui5-table-cell>
                <ui5-table-cell>
                    <span>{{ task.localStartTime }}</span>
                </ui5-table-cell>
                <ui5-table-cell>
                    <span>{{ task.localEndTime }}</span>
                </ui5-table-cell>
                <ui5-table-cell>
                    <span>{{ task.localTotalCycleTime }}</span>
                </ui5-table-cell>
                <ui5-table-cell>
                    <ui5-badge :color-scheme="task.statusColor">
                        <ui5-icon :name="task.statusIcon" slot="icon"></ui5-icon>
                        {{ task.statusLocale }}
                    </ui5-badge>
                </ui5-table-cell>
                <ui5-table-cell style="width: 180px;">
                    <span>
                        <ui5-button design="Transparent" @click="handleDetailClick(task._id)">详情</ui5-button>
                        <ui5-button design="Transparent" @click="handleDownloadReportClick(task._id)">下载报告</ui5-button>
                    </span>
                </ui5-table-cell>
            </ui5-table-row>
        </ui5-table>
    </div>
</template>

<style scoped>
ui5-table ui5-table-column.table-header-text-alignment::part(column) {
    text-align: end;
}

</style>
