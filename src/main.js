import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// 深色模式跟随系统
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const updateDarkMode = (e) => {
  if (e.matches) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// 初始化
updateDarkMode(darkModeMediaQuery);

// 监听系统主题变化
darkModeMediaQuery.addEventListener('change', updateDarkMode);

createApp(App).mount('#app')
