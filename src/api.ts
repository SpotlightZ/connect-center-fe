import axios from "axios";

axios.defaults.timeout = 30000;

export interface PageRequest {
    page: number,
    size: number
}

export interface Device {
    _id: string,
    ipv4: string,
    name: string,
    type: string,
    series: string,
    modal: string,
    vendor: string,
    serialNumber: string,
    macAddress: string,
    disabled: boolean,
    deviceSerialNumber: string,
    status: "ONLINE" | "OFFLINE" | "CONNECTING" | "STOPPED"
}

export interface DeviceEventLog {
    deviceId: string,
    event: string,
    level: string,
    message: string,
    timestamp: number
}

export interface DeviceTask {
    _id: string,
    deviceId: string,
    startTime: number,
    endTime: number,
    startName: string,
    endName: string,
    cycleCount: number,
    totalCycleTime: number,
    blockContent: string,
    status: "RUNNING" | "COMPLETED" | "CANCELED" | "ERROR";
    extra: { [key: string]: any },
    phase: {
        type: string,
        duration: number,
        name: string,
        extra: { [key: string]: any }
    }[],
}

export interface DeviceResetOptionRequest {
    restoreStorage: boolean;
    restoreTask: boolean;
    restoreEvent: boolean;
};

export interface StorageRowQueryRequest {
    startIndex: number,
    endIndex?: number,
}

export interface DeviceTaskPhaseSensorData { [k: string]: (number | boolean | {[k: string]: any})[] }

export type DeviceCreateRequest = Pick<Device, "ipv4" | "name"> & { deviceSerialNumber: string };

export interface DeviceTaskQueryRequest {
    did: string
    name?: string,
    cycleCount?: string,
    startTimeRange?: string,
    endTimeRange?: string,
}

export interface TaskPhaseDataQueryRequest {
    types?: ("AI" | "DI" | "DO" | "AO")[],
    names?: string[]
}

interface Row {
    id: number,
    timestamp: string
}


export interface SensorRow extends Row {
    type: "SENSOR",
    payload: {
        [name: string]: {
            name: string,
            type: "AI" | "DI" | "DO" | "AO",
            description?: string,
            unitMark?: string,
            value: number | boolean
        }
    };
}

export interface RunningTask {
    cycleCount: string,
    cycleName: string,
    startTime: bigint,
    estimatedTotalCycleTime?: string;
}

export type DeviceStatistics = {
    [period in 'day' | 'week' | 'month']: {
        startTimestamp: number;
        endTimestamp: number;

        totalTaskCount: number;
        runningTaskCount: number;
        pausedTaskCount: number;
        abortedTaskCount: number;
        completedTaskCount: number;
    };
};

export type DashboardDeviceCardData = {
    deviceInfo: Device & { status: string };
    runningTasks: RunningTask[];
    statistics?: DeviceStatistics;
};


export async function queryAllDevices(): Promise<Device[]> {
    return axios.get("/api/devices")
}

export async function queryDeviceById(did: string): Promise<Device> {
    return axios.get("/api/devices/" + did)
}

export async function createDevice(body: DeviceCreateRequest): Promise<Device> {
    return axios.post("/api/devices", body);
}

export async function deleteDeviceById(did: string): Promise<void> {
    return axios.delete("/api/devices/" + did);
}

export async function resetDeviceById(did: string, body: DeviceResetOptionRequest): Promise<void> {
    return axios.post("/api/devices/" + did + "/reset", body);
}

export async function disableDeviceById(did: string): Promise<void> {
    return axios.post("/api/devices/" + did + "/disable");
}

export async function enableDeviceById(did: string): Promise<void> {
    return axios.post("/api/devices/" + did + "/enable");
}

export async function queryAllEventLogs(did: string, page: PageRequest): Promise<DeviceEventLog[]> {
    return axios.get(`/api/devices/${did}/logs`, { params: page });
}

export async function queryAllTasks(request: DeviceTaskQueryRequest, page: PageRequest): Promise<DeviceTask[]> {
    const { did, ...restQuery } = request;
    return axios.get(`/api/devices/${request.did}/tasks`, { params: { ...page, ...restQuery } });
}

export async function queryTaskById(tid: string): Promise<DeviceTask> {
    return axios.get(`/api/tasks/${tid}`);
}

export async function queryPhaseSensorData(tid: string): Promise<DeviceTaskPhaseSensorData> {
    return axios.get(`/api/tasks/${tid}/phase-sensor-data`);
}

export async function queryLatestSensorRow(did: string): Promise<SensorRow> {
    return axios.get(`/api/devices/${did}/sensor-data/latest`);
}

export async function querySensorRow(did: string, request: StorageRowQueryRequest) {
    return axios.get(`/api/devices/${did}/sensor-data`, { params: request });
}

export async function queryDashboardStatistic(): Promise<DashboardDeviceCardData[]> {
    return axios.get(`/api/statistics/dashboard`);
}

axios.interceptors.response.use(function (response) {
    if (response.data.code != 0) {
        throw response.data.message;
    }
    return response.data.data;
}, function (error) {
    return Promise.reject(error);
});