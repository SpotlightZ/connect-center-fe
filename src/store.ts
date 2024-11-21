import { createPinia, defineStore } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'


const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const useUserStore = defineStore("user",
    {
        state: () => ({
            username: "",
            isLoggedIn: false
        }),
        actions: {
            logout() {
                this.isLoggedIn = false;
                this.username = "";
            },
            login(username: string) {
                this.isLoggedIn = true;
                this.username = username;
            }
        },
        persist: true
    }
);

const useSysConfigStore = defineStore("sys-config",
    {
        state: () => ({
            hospitalName: "",
            departmentName: "",
            taskExportFilePath: "",
            isShowPopoverNavigator: true,
        }),
        actions: {
            saveHospitalName(name: string) {
                this.hospitalName = name;
            },
            saveTaskExportFilePath(path: string) {
                this.taskExportFilePath = path;
            }
        },
        persist: true
    }
);


export { useUserStore, useSysConfigStore,  pinia }