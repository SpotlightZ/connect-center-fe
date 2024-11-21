<script setup lang="ts">
import Dialog from "@ui5/webcomponents/dist/Dialog.d.ts";
import { Ref, computed, reactive, ref, watch } from "vue";
import { FileNameValidator, IPValidator } from "../utils/validator/Validator";
import { onMounted } from "vue";
import { Device, createDevice, deleteDeviceById, queryAllDevices, resetDeviceById, disableDeviceById, enableDeviceById } from '../api';
import { router } from '../router';
import Popover from "@ui5/webcomponents/dist/Popover.d.js";
import Toast from "@ui5/webcomponents/dist/Toast.d.js";

const createDeviceDialog: Ref<Dialog | undefined> = ref<Dialog>();
const createDeviceDialogResult = reactive({ success: true, message: "", loading: false });
const createDeviceDialogContent = reactive({ ipv4: "", deviceName: "", deviceSerialNumber: "" });
const createDeviceDialogError = reactive({ ipv4: true, deviceName: true });
const canCreateDeviceDialogSubmit = computed(() => {
    return !createDeviceDialogError.ipv4 && !createDeviceDialogError.deviceName &&
        createDeviceDialogContent.deviceName.length > 0 && createDeviceDialogContent.ipv4.length > 0;
});

const resetDeviceDialog: Ref<Dialog | undefined> = ref<Dialog>();
const resetDeviceDialogResult = reactive({ success: true, message: "", loading: false });
const resetDeviceDialogContent = reactive({ restoreStorage: false, restoreTask: false, restoreEvent: false });
const canResetDeviceDialogSubmit = computed(() => {
    return resetDeviceDialogContent.restoreStorage || resetDeviceDialogContent.restoreTask || resetDeviceDialogContent.restoreEvent;
})

const deviceStatusChangeLoading = ref(false);


const cardPopover: Ref<Popover | undefined> = ref<Popover>();
const cardPopoverCurrentDevice = ref<Device>();


const serverOnline = ref(false);

const toast: Ref<Toast | undefined> = ref<Toast>();

const ipValidator = new IPValidator();
const fileNameValidator = new FileNameValidator();

const deviceList = ref<Device[]>();

onMounted(async () => {
    const recursiveFetch = async () => {
        await fetchDeviceList();
        setTimeout(recursiveFetch, 3000);
    }
    await recursiveFetch();
});

// setup validators
watch(createDeviceDialogContent, (content) => {
    createDeviceDialogError.ipv4 = !ipValidator.validate(content.ipv4);
    createDeviceDialogError.deviceName = !fileNameValidator.validate(content.deviceName);
})



async function fetchDeviceList() {
    try {
        deviceList.value = await queryAllDevices();
        serverOnline.value = true;
    }
    catch (e) {
        serverOnline.value = false;
    }
}

function onAddClick() {
    console.log(createDeviceDialog.value)
    createDeviceDialog.value!.show()
}

function onCloseCreateDeviceDialog() {
    createDeviceDialog.value!.close();
}

function onCloseResetDeviceDialog() {
    resetDeviceDialog.value!.close();
}

function onCardClick(dev: Device) {
    router.push("/devices/" + dev._id)
}

function onCardIconClick(e: MouseEvent, dev: Device) {
    e.stopPropagation();
    if (!cardPopover.value) {
        return;
    }
    cardPopoverCurrentDevice.value = dev;
    cardPopover.value.headerText = `操作 ${dev.name}`;
    cardPopover.value.setAttribute("deviceId", dev._id);
    cardPopover.value.setAttribute("deviceName", dev.name);
    cardPopover.value.showAt(e.target as HTMLElement);
}

async function onDelDeviceClick() {
    cardPopover.value?.close();
    try {
        await deleteDeviceById(cardPopoverCurrentDevice.value?._id!);
        showToast(`设备 ${cardPopoverCurrentDevice.value?.name} 删除成功`);
    }
    catch (err) {
        showToast(`设备删除失败: ${err}`);
    }
}

async function onResetDeviceClick() {
    cardPopover.value?.close();
    resetDeviceDialogContent.restoreEvent = resetDeviceDialogContent.restoreStorage = resetDeviceDialogContent.restoreTask = false;
    resetDeviceDialog.value!.show();
}

function showToast(msg: string) {
    if (toast.value) {
        toast.value.textContent = msg;
        toast.value.show();
    }
}

async function onCreateDevice() {
    try {
        createDeviceDialogResult.loading = true;
        await createDevice({ ipv4: createDeviceDialogContent.ipv4, name: createDeviceDialogContent.deviceName, deviceSerialNumber: createDeviceDialogContent.deviceSerialNumber });
        createDeviceDialog.value!.close();
        createDeviceDialogResult.success = true;

        showToast(`设备 ${createDeviceDialogContent.deviceName} 添加成功`);
    }
    catch (err) {
        createDeviceDialogResult.success = false;
        createDeviceDialogResult.message = String(err);
    }
    finally {
        createDeviceDialogResult.loading = false;
        fetchDeviceList();
    }
}

async function onResetDevice() {
    try {
        resetDeviceDialogResult.loading = true;
        await resetDeviceById(cardPopoverCurrentDevice.value?._id!, resetDeviceDialogContent);
        resetDeviceDialog.value!.close();
        resetDeviceDialogResult.success = true;

        showToast(`设备 ${createDeviceDialogContent.deviceName} 重置成功`);
    }
    catch (err) {
        resetDeviceDialogResult.success = false;
        resetDeviceDialogResult.message = String(err);
    }
    finally {
        resetDeviceDialogResult.loading = false;
        fetchDeviceList();
    }
}

async function onDisableDeviceClick() {
    try {
        deviceStatusChangeLoading.value = true;
        await disableDeviceById(cardPopoverCurrentDevice.value?._id!);
        showToast(`设备 ${cardPopoverCurrentDevice.value?.name} 禁用成功`);
    }
    catch (err) {
        showToast(`设备禁用失败: ${err}`);
    }
    finally {
        deviceStatusChangeLoading.value = false;
        cardPopover.value?.close();
        fetchDeviceList();
    }
    
}

async function onEnableDeviceClick() {
    try {
        deviceStatusChangeLoading.value = true;
        await enableDeviceById(cardPopoverCurrentDevice.value?._id!);
        showToast(`设备 ${cardPopoverCurrentDevice.value?.name} 启用成功`);
    }
    catch (err) {
        showToast(`设备启用失败: ${err}`);
    }
    finally {
        deviceStatusChangeLoading.value = false;
        cardPopover.value?.close();
        fetchDeviceList();
    }
}


const deviceCounts = computed(() => {
    return {
        total: deviceList.value?.length || 0,
        online: deviceList.value?.filter(d => d.status === "ONLINE").length || 0
    }
});

const statusClassMap: { [key: string]: string } = {
    "ONLINE": "success-box",
    "CONNECTING": "warning-box",
    "OFFLINE": "error-box",
    "STOPPED": ""
};

const statusTextMap: { [key: string]: string } = {
    "ONLINE": "在线",
    "CONNECTING": "连接中",
    "OFFLINE": "离线",
    "STOPPED": "已停止"
};

</script>

<template>
    <div class="pad-15 flex-1 flex-c">
        <!-- Main content -->
        <div class="flex-1 p-relative">
            <div class="p-absolute inset-0 scroll-y" style="padding: 3px;">
                <!-- Card grid -->
                <div class="flex-r gap-15 flex-wrap">
                    <div style="width: 330px;" v-for="dev of deviceList">
                        <ui5-card @click="() => onCardClick(dev)">
                            <div class="pad-15 flex-r">
                                <div :class="['ib', 'margin-r-10', dev.disabled ? 'disabled-box' : statusClassMap[dev.status]]"
                                    style="height: 30px; padding: 8px; padding-bottom: 0; border-radius: 4px;" @click="(e) => onCardIconClick(e, dev)">
                                    <ui5-icon :name="dev.disabled ? 'cancel' : dev.status === 'ONLINE' ? 'connected' : 'disconnected'"
                                        :class="['ib', dev.disabled ? 'disabled-box' : statusClassMap[dev.status]]"
                                        style="width: 22px; height: 22px;"></ui5-icon>
                                </div>
                                <div class="flex-1">
                                    <div class="flex-r space-between">
                                        <div class="font-card-title" style="padding-bottom: 8px;">{{ dev.name }}</div>
                                        <ui5-label class="font-small">{{ dev.serialNumber }}</ui5-label>
                                    </div>
                                    <div class="flex-r space-between">
                                        <ui5-label>{{ dev.ipv4 }}</ui5-label>
                                        <ui5-label class="font-small">{{ dev.modal }}</ui5-label>
                                    </div>
                                </div>
                            </div>

                            
                            <div class="pad-15">
                                <div class="flex-r space-between">
                                    <ui5-label>启用状态</ui5-label>
                                    <ui5-label>{{ dev.disabled ? "禁用" : "启用" }}</ui5-label>
                                </div>
                                <div class="flex-r space-between margin-t-5">
                                    <ui5-label>连接状态</ui5-label>
                                    <ui5-label>{{ dev.disabled ? '--' : statusTextMap[dev.status]}}</ui5-label>
                                </div>
                            </div>

                            <!-- 设备空闲状态 -->
                            <!-- 
                            <div class="pad-15">
                                <div class="status-indicator si-green">
                                    <div class="status">空闲</div>
                                </div>
                            </div>
                            -->
                        </ui5-card>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer bar -->
        <ui5-bar class="z-100" design="FloatingFooter">
            <div slot="startContent">
                <ui5-badge :color-scheme="serverOnline ? 8 : 2" class="margin-r-10">{{ serverOnline ? "服务器在线" : "服务器离线"
                }}</ui5-badge>
                <ui5-label class="font-medium">设备: {{ deviceCounts.total }}, 在线: {{ deviceCounts.online
                }}</ui5-label>
            </div>


            <ui5-button @click="onAddClick" slot="endContent" style="color: var(--sapButton_Handle_TextColor)">
                <font-awesome-icon icon="fa-solid fa-ethernet" class="margin-r-10" />添加新的设备连接</ui5-button>
        </ui5-bar>
    </div>

    <ui5-popover ref="cardPopover">
        <div class="popover-content">
            <div class="flex-column">
                <ui5-button @click="onDisableDeviceClick" v-if="!cardPopoverCurrentDevice?.disabled" :disabled="deviceStatusChangeLoading" design="Attention" class="margin-r-15">禁用设备</ui5-button>
                <ui5-button @click="onEnableDeviceClick" v-if="cardPopoverCurrentDevice?.disabled" :disabled="deviceStatusChangeLoading" design="Positive" class="margin-r-15">启用设备</ui5-button>
                <ui5-button @click="onResetDeviceClick" design="Attention" class="margin-r-15">重置设备</ui5-button>
                <ui5-button @click="onDelDeviceClick" design="Negative">删除设备</ui5-button>
            </div>
        </div>

    </ui5-popover>

    <ui5-toast ref="toast" placement="BottomCenter"></ui5-toast>

    <ui5-dialog ref="createDeviceDialog" draggable header-text="添加新的设备连接" style="width: 400px;">
        <span slot="header">
            <div class="ui5-popup-header-text" style="padding: 13px 0px;">
                <font-awesome-icon icon="fa-solid fa-ethernet" class="margin-r-10" />添加新的设备连接
            </div>
        </span>
        <section>
            <ui5-message-strip design="Negative" style="padding-bottom: 15px;" v-if="!createDeviceDialogResult.success"
                @click="() => createDeviceDialogResult.success = true">
                {{ createDeviceDialogResult.message }}
            </ui5-message-strip>
            <div class="flex-r align-center space-between w-100">
                <ui5-label for="设备名称" required>设备名称 </ui5-label>
                <ui5-input show-suggestions
                    :value-state="createDeviceDialogContent.deviceName.length == 0 ? 'None' : createDeviceDialogError.deviceName ? 'Error' : 'Success'"
                    :value="createDeviceDialogContent.deviceName"
                    @input="createDeviceDialogContent.deviceName = $event.target.value" style="width: 240px">
                    <div slot="valueStateMessage">设备名称不可包含 &lt &gt : " / \ | ? * 字符</div>
                </ui5-input>
            </div>

            <div class="flex-r align-center space-between w-100">
                <ui5-label for="IPv4" required>IPv4</ui5-label>
                <ui5-input show-suggestions
                    :value-state="createDeviceDialogContent.ipv4.length == 0 ? 'None' : createDeviceDialogError.ipv4 ? 'Error' : 'Success'"
                    :value="createDeviceDialogContent.ipv4" @input="createDeviceDialogContent.ipv4 = $event.target.value"
                    style="width: 240px">
                    <div slot="valueStateMessage">IPv4地址格式为: 192.168.1.1</div>
                </ui5-input>
            </div>

            <div class="flex-r align-center space-between w-100">
                <ui5-label for="IPv4" required>设备序列号</ui5-label>
                <ui5-input show-suggestions @input="createDeviceDialogContent.deviceSerialNumber = $event.target.value"
                    style="width: 240px">
                </ui5-input>
            </div>
        </section>
        <div slot="footer" class="flex-r align-center space-between w-100">
            <ui5-button @click="onCloseCreateDeviceDialog" style="min-width: 100px;">关闭</ui5-button>

            <ui5-button @click="onCreateDevice" design="Emphasized" :disabled="!canCreateDeviceDialogSubmit" style="min-width: 100px;">
                <font-awesome-icon icon="fa-solid fa-plus" class="margin-r-10"
                    :disabled="createDeviceDialogResult.loading" />添加</ui5-button>
        </div>
    </ui5-dialog>


    <ui5-dialog ref="resetDeviceDialog" draggable header-text="重置设备数据" style="width: 400px;">
        <span slot="header">
            <div class="ui5-popup-header-text" style="padding: 13px 0px; vertical-align: middle; display: flex;">
                <ui5-icon name="alert" class="margin-r-10"
                    style="color: var(----sapPageHeader_TextColor); height: 16px; width: 16px;"></ui5-icon>
                <span>重置设备数据</span>
            </div>
        </span>
        <section>
            <ui5-message-strip design="Negative" style="padding-bottom: 15px;" v-if="!resetDeviceDialogResult.success"
                @click="() => resetDeviceDialogResult.success = true">
                {{ resetDeviceDialogResult.message }}
            </ui5-message-strip>
            <div class="flex-r align-center space-between w-100">
                <ui5-checkbox text="重置本地存储数据" value-state="Warning" :checked="resetDeviceDialogContent.restoreStorage"
                    @change="resetDeviceDialogContent.restoreStorage = $event.target.checked">
                </ui5-checkbox>
                <ui5-label>将重新同步历史数据</ui5-label>
            </div>
            <div class="flex-r align-center space-between w-100">
                <ui5-checkbox text="重置任务列表" value-state="Warning" :checked="resetDeviceDialogContent.restoreTask"
                    @change="resetDeviceDialogContent.restoreTask = $event.target.checked">
                </ui5-checkbox>
            </div>
            <div class="flex-r align-center space-between w-100">
                <ui5-checkbox text="重置事件列表" value-state="Warning" :checked="resetDeviceDialogContent.restoreEvent"
                    @change="resetDeviceDialogContent.restoreEvent = $event.target.checked">
                </ui5-checkbox>
            </div>
        </section>
        <div slot="footer" class="flex-r align-center space-between w-100">
            <ui5-button @click="onCloseResetDeviceDialog" style="min-width: 100px;">关闭</ui5-button>

            <ui5-button @click="onResetDevice" design="Attention" :disabled="!canResetDeviceDialogSubmit || resetDeviceDialogResult.loading" style="min-width: 100px;">
                重置</ui5-button>
        </div>
    </ui5-dialog>
</template>

<style scoped>
.status-indicator {
    height: 80px;
    border-radius: 8px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.si-green {
    background-color: green;
}

.si-blue {
    background-color: #4a7cc8;
}

.status-indicator .status {
    font-size: 30px;
    color: white;
}
</style>
