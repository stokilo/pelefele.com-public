import Vue from 'vue'
import VueLogger, { Log } from 'vuejs-logger'
import { initializeLog } from '~/utils/api'

// @ts-ignore
const accessor: Plugin = () => {
  const options = {
    isEnabled: true,
    logLevel: process.env.isDevMode ? 'debug' : 'info',
    stringifyArguments: false,
    showLogLevel: true,
    showMethodName: false,
    separator: '|',
    showConsoleColors: true
  }

  // @ts-ignore
  Vue.use(VueLogger, options)
  // @ts-ignore
  initializeLog(Vue.$log)
}

export default accessor

declare module 'vue/types/vue' {
  interface Vue {
    $log: Log
  }
}
