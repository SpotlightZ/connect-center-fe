<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { EChartsCoreOption, init } from 'echarts';
import { DeviceTaskLocale } from '../services/TaskService';
import { DeviceTaskPhaseSensorData, queryPhaseSensorData } from '../api';

interface FieldMeta {
    label: { zh: string, en: string },
    field: string
}

const props = defineProps<{ taskInfo: DeviceTaskLocale, config: { isShowChart: boolean, fields: FieldMeta[] } }>();
const charts = ref<HTMLElement>();
const cycleStagesInfo = ref<{ label: string, value: string }[][]>([]);
const tabIndex = ref(0);

let sensorData: DeviceTaskPhaseSensorData = {};

function handleStageTabSelected(event: CustomEvent<{ tabIndex: number }>) {
    tabIndex.value = event.detail.tabIndex;
}

async function fetchSensor() {
    if(props.taskInfo.status === 'RUNNING') {
        sensorData = await queryPhaseSensorData(props.taskInfo._id);
    }
    else {
        sensorData = props.taskInfo.extra.sensor;
    }
    
}


function initChart() {
    const option: EChartsCoreOption = {
        useUTC: true,
        tooltip: {
            trigger: 'axis'
        },
        legend: {},
        grid: {
            left: 50,
            top: 100,
            right: 50,
            bottom: 20
        },
        toolbox: {
            show: true,
            feature: {
                dataView: { readOnly: false },
                magicType: { type: ['line', 'bar'] },
                restore: {},
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'time',
            boundaryGap: true
        },
        yAxis: [],
        series: [],

    };

    const series = (option.series as Record<string, any>[]);
    const yAxis = (option.yAxis as Record<string, any>[]);
    if (sensorData["temperature"]) {
        yAxis.push({
            name: 'Temperature',
            type: 'value',
            axisLabel: {
                formatter: '{value} °C'
            },
            position: 'left'
        });
        series.push({
            name: 'Temperature',
            yAxisIndex: 0,
            type: 'line',
            data: sensorData["temperature"].map((temp: any, index: number) => [sensorData.timestamp[index], temp.toFixed(2)]),
            markPoint: {
                data: [{ type: 'max', name: 'Max' }]
            },
            markLine: {
                symbol: ['none', 'none'],
                label: { show: true },
                data: [
                    { type: 'average', name: 'Avg', symbol: 'line' },
                    ...Object.keys(sensorData.chamberTemperatureIndexRange ?? {})
                        .map((k: string) => [k, (<any>sensorData.chamberTemperatureIndexRange)[k]])
                        .map(([k, [s, e]]) => [
                            { xAxis: sensorData.timestamp[s], name: k, label: { formatter: `${k} Start`, position: "insideEndBottom" } },
                            { xAxis: sensorData.timestamp[e], name: k, label: { formatter: `${k} End`, position: "insideEndTop" } }])
                        .flatMap(r => [...<any>r])
                ]
            },
            showSymbol: false,
        });
    }

    if (true && sensorData["pressure"]) {
        yAxis.push({
            name: 'Pressure',
            type: 'value',
            axisLabel: {
                formatter: '{value} psi'
            },
            position: 'right',
        });
        (<any>option.grid).right = 60;
        series.push({
            name: 'Pressure',
            yAxisIndex: 1,
            type: 'line',
            data: sensorData["pressure"].map((temp: any, index: number) => [sensorData.timestamp[index], temp.toFixed(2)]),

            markPoint: {
                data: [{ type: 'max', name: 'Max' }]
            },
            markLine: {
                symbol: ['none', 'none'],
                label: { show: true },
                data: [
                    { type: 'average', name: 'Avg', symbol: 'line' }
                ]
            },
            showSymbol: false,
        });
    }


    const charInstance = init(charts.value);
    charInstance.setOption(option);
    window.addEventListener('resize', () => {
        charInstance.resize();
    });
}

onMounted(async () => {
    console.log(props.taskInfo)
    props.taskInfo.phase.forEach(p => {
        const labelData = props.config.fields.map(i => ({
            label: i.label.en,
            value: p.extra[i.field]
        })).filter(i => i.value !== undefined && i.value !== "");
        console.log(props.config.fields, p.extra)
        cycleStagesInfo.value.push(labelData)
    })

    console.log("TaskDetailPhase onMounted")
    if (props.config.isShowChart) {
        await fetchSensor();
        initChart();
    }
    
});
</script>

<template>
    <div>
        <teleport to=".affix-title">
            <ui5-tabcontainer fixed collapsed tab-layout="Standard" @tab-select="handleStageTabSelected">
                <ui5-tab v-for="phase of taskInfo?.phase" :text="phase.name"
                    :additional-text="phase.localDuration"></ui5-tab>
            </ui5-tabcontainer>
        </teleport>

        <div class="h-100 scroll-y">
            <div>
                <h5 class="margin-lr-15">阶段信息</h5>
                <div class="margin-lr-15" style="columns: 300px 8;">
                    <div v-for="stage of cycleStagesInfo[tabIndex]">
                        <ui5-label class="margin-r-10 margin-t-15">{{ stage.label }}:</ui5-label>
                        <ui5-label>{{ stage.value }}</ui5-label>
                    </div>
                </div>
                <div v-if="props.config.isShowChart">
                    <h5 class="margin-lr-15">{{ "温度图表" + (taskInfo.status === 'RUNNING' ? "（实时）" : "") }}</h5>
                    <div ref="charts" class="charts"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.charts {
    width: 100%;
    height: 500px;
    background-color: var(--sapBaseColor);
}
</style>
