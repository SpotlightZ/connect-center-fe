import { DeviceTask } from "../api";
import { localizeDateTime, localizeTimeSpan } from "./LocalizeUtil";

export interface StatusLocale {
    statusLocale: string;
    statusColor: string;
    statusIcon: string;
}

export interface DateTimeLocale {
    localStartTime: string;
    localEndTime: string;
    localTotalCycleTime: string;
}

export interface PhaseLocale {
    localDuration: string;
}

export type DeviceTaskLocale = Omit<DeviceTask, "phase"> & StatusLocale & DateTimeLocale & { phase: (DeviceTask["phase"][0] & PhaseLocale)[] };

export const STATUS_LOCALE_MAP: { [status: string]: StatusLocale } = {
    RUNNING: { statusLocale: "运行中", statusColor: "6", statusIcon: "pending" },
    COMPLETED: { statusLocale: "已完成", statusColor: "8", statusIcon: "message-success" },
    PAUSED: { statusLocale: "已暂停", statusColor: "6", statusIcon: "pause" },
    ERROR: { statusLocale: "错误", statusColor: "2", statusIcon: "message-error" },
    ABORTED: { statusLocale: "已取消", statusColor: "10", statusIcon: "cancel" },
    UNKNOWN: { statusLocale: "未知", statusColor: "1", statusIcon: "incident" }
}

export function localizeStatus(status: string): StatusLocale {
    return STATUS_LOCALE_MAP[status] || STATUS_LOCALE_MAP.UNKNOWN;
}


export function localize(tasks: DeviceTask | DeviceTask[]): DeviceTaskLocale | DeviceTaskLocale[] {
    if (!Array.isArray(tasks)) {
        return localizeTask(tasks);
    }
    return tasks.map(task => localizeTask(task));
}

function localizeTask(task: DeviceTask): DeviceTaskLocale {
    return Object.assign(task, {
        localStartTime: localizeDateTime(task.startTime),
        localEndTime: localizeDateTime(task.endTime),
        localTotalCycleTime: localizeTimeSpan(task.totalCycleTime),
        ...localizeStatus(task.status),
        phase: task.phase?.map(phase => Object.assign(phase, {
            localDuration: localizeTimeSpan(phase.duration)
        }))
    });
}