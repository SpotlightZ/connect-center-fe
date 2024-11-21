<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Popover from "@ui5/webcomponents/Popover.d.ts";
import { router } from '../router';
import { useRoute } from 'vue-router';
import { useSysConfigStore, useUserStore } from '../store';

interface MenuItem {
  title: string,
  subTitle: string,
  icon: string,
  go: string,
  param?: string
}
const menuItems: MenuItem[] = [
  {
    title: "设备管理",
    subTitle: "Device Management",
    icon: "add-equipment",
    go: "/home"
  },
  {
    title: "设备状态",
    subTitle: "Status Dashboard",
    icon: "bbyd-dashboard",
    go: "/dashboard"
  },
  {
    title: "洁净区看板",
    subTitle: "Clean Area Kanban",
    icon: "bbyd-dashboard",
    go: "/kanban?mode=clean"
  },
  {
    title: "污染区看板",
    subTitle: "Polluted Area Kanban",
    icon: "bbyd-dashboard",
    go: "/kanban?mode=polluted"
  }
];


const userStore = useUserStore();
const sysConfigStore = useSysConfigStore();
const route = useRoute();

let selectedItem = ref(menuItems[0]);

const switchPanel = ref<Popover>()
const profilePopover = ref<Popover>()

const canGoBack = computed(() => !/^\/home(\/)?$/.test(route.path));

onMounted(() => {
  selectedItem.value = menuItems.find(i => i.go === route.path) ?? menuItems[0];
});


function onOpenSwitchPanel(event: { detail: { targetRef: HTMLElement } }) {
  if (switchPanel.value!.opened) {
    switchPanel.value!.close();
  } else {
    switchPanel.value!.showAt(event.detail.targetRef);
  }
}

function onMenuItemClick(item: MenuItem) {
  selectedItem.value = item;
  item.go && router.push(item.go);
}


function onGoBack() {
  router.back();
}

function handleProfileClick(event: CustomEvent<{ targetRef: HTMLElement }>) {
  profilePopover.value!.showAt(event.detail.targetRef);
}

function handleProfileItemClick(event: CustomEvent) {
  if (event.detail.item.getAttribute("data-key") == "logged-out") {
    userStore.logout();
    router.replace("/login");
  }
  profilePopover.value!.close();
}

</script>

<template>
  <ui5-shellbar primary-title="Connect Center" :secondary-title="sysConfigStore.hospitalName"
    :show-product-switch="sysConfigStore.isShowPopoverNavigator ? true : undefined"
    @product-switch-click="onOpenSwitchPanel" @-profile-click="handleProfileClick">
    <ui5-button icon="nav-back" slot="startButton" @click="() => onGoBack()" v-show="canGoBack"></ui5-button>
    <ui5-avatar slot="profile" icon="customer"></ui5-avatar>
  </ui5-shellbar>

  <ui5-popover ref="switchPanel" placement-type="Bottom">
    <ui5-product-switch>
      <ui5-product-switch-item v-for="item in menuItems" :title-text="item.title" :subtitle-text="item.subTitle"
        :icon="item.icon" :selected="item.title === selectedItem.title"
        @click="() => onMenuItemClick(item)"></ui5-product-switch-item>
    </ui5-product-switch>
  </ui5-popover>

  <ui5-popover ref="profilePopover" placement-type="Bottom" id="action-popover-1">
    <div class="action-popover-header">
      <ui5-title style="padding: 0.25rem 1rem 0rem 1rem">{{ userStore.username }}</ui5-title>
    </div>
    <div style="margin-top: 1rem;">
      <ui5-list @item-click="handleProfileItemClick" separators="None">
        <ui5-li data-key="logged-out" icon="log">退出登录</ui5-li>
      </ui5-list>
    </div>
  </ui5-popover>
</template>

<style scoped></style>
