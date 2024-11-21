import taskDetailMetaInfo from "./DeviceMetaInfo.json";

export function getMeta(modal: string) {
    return (<{ [key: string]: TaskDetailMetaInfo }><unknown>taskDetailMetaInfo)[modal];
}

export interface TaskDetailMetaInfo {
    image: string;
    fields: FieldMetaInfo[];
    tabModules: TabModuleMetaInfo[];
}

export interface FieldMetaInfo {
    field: string;
    label: {
        en: string;
        zh: string;
    };
}

export interface TabModuleMetaInfo {
    module: string;
    config: {
        [k: string]: any,
        fields: {
            label: {
                en: string;
                zh: string;
            }, field: string
        }[]
    },
    label: {
        en: string;
        zh: string;
    };
}