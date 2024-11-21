<script setup lang="ts">
import { VisionMultiChamberData } from '../../services/DashboardService';
import Chamber from './Chamber.vue';
import { StatusEnum } from './ChamberStatusEnum';
import LoadTable from './LoadTable.vue';

const props = defineProps<{ chambers: VisionMultiChamberData }>();

function positionedStatus(value: boolean | undefined): StatusEnum {
    if (value === undefined) {
        return StatusEnum.UNKNOWN;
    }
    return value ? StatusEnum.RUNNING : StatusEnum.IDLE;
}

</script>

<template>
    <div class="flex-r gap-10 align-end">
        <LoadTable :status="positionedStatus(props.chambers.WashChamber?.loadTablePositioned)" class="table"
            title="装载台" />
        <Chamber v-if="props.chambers.WashChamber?.connected" :status="positionedStatus(props.chambers.WashChamber?.rackPositioned)" title="清洗舱" />
        <Chamber v-if="props.chambers.SonicChamber?.connected" :status="positionedStatus(props.chambers.SonicChamber?.rackPositioned)" title="超声舱" />
        <Chamber v-if="props.chambers.RinseChamber?.connected" :status="positionedStatus(props.chambers.RinseChamber?.rackPositioned)" title="冲洗舱" />
        <Chamber v-if="props.chambers.DryChamber?.connected" :status="positionedStatus(props.chambers.DryChamber?.rackPositioned)" title="干燥舱" />
        <LoadTable :status="positionedStatus(props.chambers.DryChamber?.unloadTablePositioned)" class="table"
            title="卸载台" />
    </div>

</template>

<style scoped>
.chamber {
    border-radius: 5px;
    height: 100%;
    width: 163px;
}

.table {
    height: 50%;
}
</style>
