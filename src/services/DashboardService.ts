import { DashboardDeviceCardData, RunningTask, SensorRow } from "../api";
import { localizeDateTime, localizeTimeSpan } from "./LocalizeUtil";

/* Date and time localize */

export interface DateTimeLocale {
    localStartTime: string,
    localEstimatedTotalCycleTime?: string;
    estimatedRestTime?: number;
    localEstimatedRestTime?: string;
}

export type RunningTaskLocale = RunningTask & DateTimeLocale;

export type DashboardDeviceDataLocale = Omit<DashboardDeviceCardData, "runningTasks"> & {
    runningTasks: RunningTaskLocale[];
};


export function localize(dataList: DashboardDeviceCardData[]): DashboardDeviceDataLocale[] {
    return dataList.map(devItem => {
        return Object.assign(devItem, {
            runningTasks: devItem.runningTasks.map(task => localizeRunningTask(task))
        });
    });
}

function calcEstimatedRestTime(runningTask: RunningTaskLocale) {
    const now = new Date();
    const newUtc = now.getTime() - now.getTimezoneOffset() * 60000;
    runningTask.estimatedRestTime = Number(runningTask.estimatedTotalCycleTime) - (newUtc - Number(runningTask.startTime));
    runningTask.localEstimatedRestTime = localizeTimeSpan(runningTask.estimatedRestTime);
}

function localizeRunningTask(task: RunningTask): RunningTaskLocale {
    const locale = Object.assign(task, {
        localStartTime: localizeDateTime(Number(task.startTime)),
    });
    calcEstimatedRestTime(locale);
    return locale;
}




/* Chamber data */

export type ChamberData = Record<string, Partial<ChamberSensor>>;

interface ChamberSensor {
    connected: boolean;
    rackPositioned: boolean;
    temperature: number;

    loadTablePositioned?: boolean;
    unloadTablePositioned?: boolean
}

function readDI(tag: string, sensor: SensorRow): boolean | undefined {
    return sensor.payload[tag].value as boolean | undefined;
}

function readAI(tag: string, sensor: SensorRow): number | undefined {
    return sensor.payload[tag].value as number | undefined;
}

export type VisionMultiChambers = "WashChamber" | "SonicChamber" | "RinseChamber" | "DryChamber";
export type VisionMultiChamberData = Partial<Record<VisionMultiChambers, Partial<ChamberSensor>>>;

export function extractChamberData(devModel: string, sensor: SensorRow): ChamberData {
    switch(devModel) {
        case "Vision MC": {
            return {
                "WashChamber": {
                    connected: readAI("Chamber1:1:I.0", sensor),
                    rackPositioned: readDI("Chamber1:2:I.0", sensor),
                    temperature: readAI("WcSumpTemperatureRTD", sensor),

                    loadTablePositioned: readDI("Chamber1:3:I.3", sensor)
                },
                "SonicChamber": {
                    connected: readAI("Chamber1A:1:I.0", sensor),
                    // Chamber1A:7:O.2 - Sonic Generator
                    // Rack or Generator is working are both considered as rack positioned
                    rackPositioned: readDI("Chamber1A:2:I.0", sensor) || readDI("Chamber1A:7:O.2", sensor),
                    temperature: readAI("ScSonicTemperatureRTD", sensor),
                },
                "RinseChamber": {
                    connected: readAI("Chamber2:1:I.0", sensor),
                    rackPositioned: readDI("Chamber2:2:I.0", sensor),
                    temperature: readAI("RcSumpTemperatureRTD", sensor),
                },
                "DryChamber": {
                    connected: readAI("Chamber3:1:I.0", sensor),
                    rackPositioned: readDI("Chamber3:2:I.0", sensor),
                    temperature: readAI("DcDryingTemperatureRTD", sensor),

                    unloadTablePositioned: readDI("Chamber3:2:I.2", sensor)
                },
            } as VisionMultiChamberData;
        }
        default:{
            return {};
        }
    }
}