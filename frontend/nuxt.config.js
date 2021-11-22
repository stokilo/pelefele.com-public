import * as awsConfig from './aws-config.json'

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const isDevMode = process.env.STAGE_NAME !== 'prod'

export default {
  mode: 'spa',
  target: 'static',
  router: {
    base: '/',
    mode: 'history',
    middleware: 'auth',
    prefetchLinks: false
  },
  /*
  ** Headers of the page
  */
  head: {
    htmlAttrs: {
      lang: 'en'
    },
    titleTemplate: 'Real estate',
    title: 'Real estate portal',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, shrink-to-fit=no' },
      { hid: 'description', name: 'description', content: 'pelefele.com - real estate search engine' },
      { hid: 'keywords', name: 'keywords', content: 'property, properties, rent, buy, sale, apartment, apartments, home, homes, land' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    bodyAttrs: {
      class: ''
    }
  },
  /*
  ** Customize the progress-bar color
  */
  loadingIndicator: {
    name: 'pulse',
    color: '#3B8070',
    background: 'white'
  },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/amplify.ts', mode: 'client' },
    { src: '~/plugins/buefy.js', mode: 'client' },
    { src: '~/plugins/logger.ts', mode: 'client' },
    { src: '~/plugins/i18n.js', mode: 'client' },
    { src: '~/plugins/overlay.ts', mode: 'client' },
    { src: '~/plugins/vee-validate.js', mode: 'client' },
    { src: '~/plugins/axios-accessor.ts', mode: 'client' }
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxt/typescript-build',
    '@aceforth/nuxt-optimized-images'
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap'
  ],
  robots: [
    { UserAgent: '*', Disallow: '/api' },
    { UserAgent: '*', Disallow: '/login' },
    { UserAgent: '*', Disallow: '/signup' },
    { UserAgent: '*', Disallow: '/logout' },
    { UserAgent: '*', Disallow: '/app' },
    { Sitemap: 'https://pelefele.com/sitemap.xml' }
  ],
  sitemap: {
    hostname: 'pelefele.com',
    gzip: true,
    exclude: [
      '/api',
      '/api/**',
      '/login',
      '/signup',
      '/logout',
      '/app',
      '/app/**'
    ]
  },

  proxy: {
    '/api': awsConfig.apiEndpoint
  },

  axios: {
    baseURL: awsConfig.apiEndpoint
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
      config.output.publicPath = './_nuxt/'

      if (!config.resolve) {
        config.resolve = {}
      }
      if (!config.resolve.plugins) {
        config.resolve.plugins = []
      }
      config.resolve.plugins.push(new TsconfigPathsPlugin({ configFile: './tsconfig.json' }))
    },
    analyze: false,
    babel: {
      compact: true
    },
    parallel: true,
    cache: true,
    hardSource: isDevMode,
    transpile: ['vue-debounce-decorator']
  },

  components: false,

  optimizedImages: {
    optimizeImages: true,
    optimizeImagesInDev: false
  },
  env: {
    stage: process.env.STAGE_NAME,
    isMockMode: false,
    isDevMode
  }
}
