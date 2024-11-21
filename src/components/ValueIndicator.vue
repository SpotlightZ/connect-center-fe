<script setup lang="ts">

</script>

<template>
    <div class="indicator">
        <div class="value"><span>60.00</span> <span class="unit">℃</span></div>
        <div class="label">清洗仓温度</div>
    </div>
</template>

<style scoped>
.indicator {
    color: white;
    display: inline-block;
    min-width: 130px;
    border-radius: 10px;
    padding: 3px;
    background: var(--sapPositiveElementColor);
    font-family: "72override",var(--sapFontFamily);
}
.value {
    box-sizing: border-box;
    padding: 12px;
    font-size: 25px;
    border-radius: 9px;
    background-color: white;
    color: var(--sapPositiveTextColor);
}

.value .unit {
    margin-left: 10px;
    font-size: 20px;
}
.label{
    font-size: var(--sapFontSize);
    font-family: "72override",var(--sapFontFamily);
    padding: 6px 10px 4px 10px;
}
</style>
