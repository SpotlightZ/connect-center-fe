<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { EChartsCoreOption, init } from 'echarts';
import { DeviceTaskLocale } from '../services/TaskService';


const props = defineProps<{ taskInfo: DeviceTaskLocale }>();
const charts = ref<HTMLElement>();

function initChart() {
    const option: EChartsCoreOption = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {},
        grid: {
            left: 70,
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
            type: 'category',
            boundaryGap: true,
            data: props.taskInfo.extra.record.map((r: any) => r.type + " " + r.time),
        },
        yAxis: [
            {
                name: 'Temperature',
                type: 'value',
                axisLabel: {
                    formatter: '{value} °C'
                },
                position: 'right',
                max: 80,
                min: 20
            },
            {
                name: 'Pressure',
                type: 'value',
                axisLabel: {
                    formatter: '{value} Torr'
                },
                position: 'left',
                
            }
        ],
        series: [
            {
                yAxisIndex: 0,
                name: 'Temperature',
                type: 'line',
                data: props.taskInfo.extra.record.map((r: any) => r.temperature),
            
                markPoint: {
                    data: [
                        { type: 'max', name: 'Max' },
                    ]
                },
                showSymbol: false,
            },
            {
                yAxisIndex: 1,
                name: 'Pressure',
                type: 'line',
                data: props.taskInfo.extra.record.map((r: any) => r.pressure),

                markPoint: {
                    data: [
                        { type: 'max', name: 'Max' },
                    ]
                },
                showSymbol: false,

            }
        ]
    };
    const charInstance = init(charts.value);
    charInstance.setOption(option);
    window.addEventListener('resize', () => {
        charInstance.resize();
    });
}

onMounted(async () => {
    initChart();
    console.log(props.taskInfo.extra.record);
});
</script>

<template>
    <div>
        <div class="h-100 scroll-y">
            <div>
                <div ref="charts" class="charts"></div>
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
