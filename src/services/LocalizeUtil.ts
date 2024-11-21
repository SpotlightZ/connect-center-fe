import moment from "moment";

/**
 * Time to YYYY-MM-DD HH:mm:ss
 * @param time Time in milliseconds
 * @returns YYYY-MM-DD HH:mm:ss
 */
export function localizeDateTime(time: number | undefined) {
    if (!time) {
        return "--"
    }
    return moment.unix(time / 1000).utc().format("YYYY-MM-DD HH:mm:ss");
}

/**
 * Time span to HH:mm:ss
 * @param time Time span in milliseconds
 * @returns HH:mm:ss
 */
export function localizeTimeSpan(time: number | undefined) {
    if (!time) {
        return "--"
    }
    const duration = moment.duration(time);
    return `${String(duration.hours()).padStart(2, "0")}:${String(duration.minutes()).padStart(2, "0")}:${String(duration.seconds()).padStart(2, "0")}`;
}