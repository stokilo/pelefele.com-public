import Vue from 'vue'
import Buefy from 'buefy'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import 'buefy/dist/buefy.css'
import '~/assets/css/custom-bulma.scss'
import cdnUrl from '~/utils/assets'

library.add(fas)
Vue.component('VueFontawesome', FontAwesomeIcon)

Vue.filter('cdnUrl', function (url) {
  if (url) {
    return cdnUrl(url)
  }
  return url
})

Vue.use(Buefy, {
  defaultIconComponent: 'vue-fontawesome',
  defaultIconPack: 'fas',
  customIconPacks: {
    fas: {
      sizes: {
        default: 'lg',
        'is-small': '1x',
        'is-medium': '2x',
        'is-large': '3x',
      },
      iconPrefix: '',
    },
  },
})
