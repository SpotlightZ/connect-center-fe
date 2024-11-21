import { createApp } from 'vue'
import "normalize.css"
import './style.css'
import App from './App.vue'
import { router } from './router';
import { pinia } from './store';

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faAdd, faEthernet } from '@fortawesome/free-solid-svg-icons'





import "@ui5/webcomponents/dist/Assets";
import "@ui5/webcomponents-fiori/dist/Assets";
import "@ui5/webcomponents/dist/Icon";
import "@ui5/webcomponents-fiori/dist/Bar";
import "@ui5/webcomponents/dist/Input"
import "@ui5/webcomponents/dist/Table"
import "@ui5/webcomponents/dist/Button"
import "@ui5/webcomponents/dist/Label"
import "@ui5/webcomponents-fiori/dist/ShellBar"
import "@ui5/webcomponents-fiori/dist/ShellBarItem"
import "@ui5/webcomponents/dist/Card"
import "@ui5/webcomponents/dist/Toast"
import "@ui5/webcomponents/dist/CardHeader"
import "@ui5/webcomponents/dist/List";
import "@ui5/webcomponents/dist/Dialog";
import "@ui5/webcomponents/dist/StandardListItem";
import "@ui5/webcomponents/dist/CustomListItem";
import "@ui5/webcomponents/dist/features/InputSuggestions"
import "@ui5/webcomponents/dist/Popover";
import "@ui5/webcomponents-fiori/dist/ProductSwitch"
import "@ui5/webcomponents-fiori/dist/ProductSwitchItem"
import "@ui5/webcomponents/dist/TabContainer"
import "@ui5/webcomponents/dist/Tab";
import "@ui5/webcomponents/dist/TabSeparator";
import "@ui5/webcomponents/dist/TableColumn";
import "@ui5/webcomponents/dist/TableRow";
import "@ui5/webcomponents/dist/TableCell";
import "@ui5/webcomponents/dist/MessageStrip";
import "@ui5/webcomponents/dist/DateRangePicker.js";
import "@ui5/webcomponents/dist/Badge";

import "@ui5/webcomponents-base/dist/features/F6Navigation.js"

import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
setTheme("sap_horizon");


/* add each imported icon to the library */
library.add(faEthernet, faAdd)


import "@ui5/webcomponents-icons/dist/AllIcons";

createApp(App)
    .use(pinia)
    .use(router)
    .component('font-awesome-icon', FontAwesomeIcon)
    .mount('#app')
