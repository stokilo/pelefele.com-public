<template>
  <div class='main-flex pl-3 pt-3 pr-3 pb-1'>
    <b-modal
      v-model='isComponentModalActive'
      has-modal-card
      trap-focus
      :destroy-on-hide='false'
      aria-role='dialog'
      aria-label='Example Modal'
      aria-modal
    >
      <div class='modal-card' style='width: auto'>
        <AuthForm />
      </div>
    </b-modal>

    <b-navbar :shadow='true'>
      <template #brand>
        <b-navbar-item tag='router-link' :to="{ path: '/' }">
          <img
            src='~/assets/img/spade.svg'
            width='60'
            height='60'
            alt=''
          >
        </b-navbar-item>
      </template>
      <template #start>
        <b-navbar-item
          v-if='isAuth'
          tag='router-link'
          :to="{ path: '/listing/search' }"
          class='is-size-7 is-size-4-mobile has-background-warning'
        >
          Find Now!
        </b-navbar-item>
        <b-navbar-item v-if='!isAuth' href='#' class='is-size-7 is-size-4-mobile'>
          Home
        </b-navbar-item>
        <b-navbar-item
          v-if='isAuth'
          tag='router-link'
          :to="{ path: '/listing/create' }"
          class='is-size-7 is-size-4-mobile'
        >
          Create Listing
        </b-navbar-item>
        <b-navbar-item
          v-if='isAuth'
          tag='router-link'
          :to="{ path: '/listing/list' }"
          class='is-size-7 is-size-4-mobile'
        >
          Show my listings
        </b-navbar-item>
        <b-navbar-dropdown label='Info' class='is-size-7 is-size-4-mobile'>
          <b-navbar-item href='https://github.com/stokilo' class='is-size-7 is-size-4-mobile'>
            Github
          </b-navbar-item>
          <b-navbar-item href='https://slawomirstec.com' class='is-size-7 is-size-4-mobile'>
            Website
          </b-navbar-item>
        </b-navbar-dropdown>
        <b-navbar-item
          v-if='isAuth'
          class='is-size-7 is-size-4-mobile has-background-warning'
          @click='signOut'
        >
          SignOut
        </b-navbar-item>
      </template>

      <template #end>
        <b-navbar-item tag='div'>
          <div class='buttons'>
            <b-button
              v-if='!isAuth'
              label='Log in'
              type='is-primary is-light'
              size='is-small'
              @click='isComponentModalActive = true'
            />
          </div>
        </b-navbar-item>
      </template>
    </b-navbar>

    <div class='section-flex'>
      <Nuxt />
    </div>

    <footer class='footer'>
      <div class='content has-text-centered'>
        <p>
          Real estate listings <a href='https://pelefele.com'>pelefele.com</a>
        </p>
        <p>
          stage: <b>{{ stage }}</b> isDevMode: <b>{{ isDevMode }}</b>
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
.main-flex {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background: whitesmoke;
}

.section-flex {
  flex: 1;
}
</style>
<script lang='ts'>

import Vue from 'vue'
import Component from 'vue-class-component'
import { Auth } from '@aws-amplify/auth'
import AuthForm from '~/components/auth/AuthForm.vue'

@Component({ components: { AuthForm } })
export default class DefaultLayout extends Vue {
  isComponentModalActive = false
  isAuth = false

  get stage() {
    return process.env.stage
  }

  get isDevMode() {
    return process.env.isDevMode
  }

  async mounted() {
    this.isAuth = await this.isLogIn()
  }

  async isLogIn(): Promise<boolean> {
    try {
      await Auth.currentAuthenticatedUser()
    } catch {
      return false
    }
    return true
  }

  async signOut(): Promise<void> {
    await Auth.signOut()
  }
}
</script>
