
<script setup lang="ts">
import { ref } from 'vue';
import { router } from '../router';
import { useUserStore } from '../store';

const username = ref("admin");
const password = ref("123456");
const userStore = useUserStore();
const loginLoading = ref(false);

function doLogin() {
    loginLoading.value = true;
    try {
        if (username.value == "") {
            alert("请输入用户名");
            return;
        }
        if (password.value == "") {
            alert("请输入密码");
            return;
        }
        if (password.value != "123456") {
            alert("密码错误");
            return;
        }
        if (username.value != "admin") {
            alert("用户名错误");
            return;
        }

        userStore.login(username.value);
        router.replace("/home");
    }
    finally {
        loginLoading.value = false;
    }

}

function handleKeyPress(event: KeyboardEvent) {
    if (event?.key == "Enter") {
        doLogin();
    }
}
</script>

<template>
    <div class="h-100" contenteditable="true" @keydown="handleKeyPress">
        <div class="flex-r h-100" contenteditable="false">
            <div class="left flex-c space-between">
                <div>
                    <div class="title pad-20 flex-r" style="align-items: center">
                        <img style="height: 55px" src="../assets/logo.svg" alt="">
                        <img style="height: 40px; margin-left: 15px;" src="../assets/logo-text.svg" alt="">
                    </div>
                </div>

                <div class="pad-20">
                    <ui5-label show-colon>用户名</ui5-label>
                    <ui5-input v-model="username" class="w-100" show-suggestions show-clear-icon>
                    </ui5-input>
                    <ui5-label style="margin-top: 15px;" show-colon>密码</ui5-label>
                    <ui5-input v-model="password" class="w-100" show-suggestions show-clear-icon type="Password"
                        style="width: 100%">
                    </ui5-input>

                    <ui5-button class="w-100" style="margin-top: 25px;" icon="employee" @click="doLogin">{{ loginLoading ?
                        '登录中...' : '登录' }}</ui5-button>
                </div>
                <div class="footer pad-20 flex-c">
                    <ui5-label>Version: __BUILD_VERSION__ @上海烁广科技</ui5-label>
                </div>
            </div>
            <div class="right flex-1">

            </div>
        </div>
    </div>
</template>

<style scoped>
.left {
    width: 380px;
    border-right: 3px solid #2E62A3;
}

.right {
    background-image: url("../assets/login-bg.png");
}

.title {
    padding: 20px;

}

.footer {
    margin-top: 80px;
}
</style>
