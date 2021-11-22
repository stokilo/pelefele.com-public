<template>
  <div>
    <div id="app">
      <section class="hero is-light" :class="{ 'is-fullheight': !showFiltersMode }">
        <div class="hero-body  p-b-30 ">
          <div class="container">
            <ValidationObserver ref="form" v-slot="{ invalid }">
              <fieldset :disabled="isFormDisabled">
                <div class="columns">
                  <div class="column">
                    <ValidationProvider v-slot="{ valid, failedRules }" rules="required|min:5|max:250" vid="title">
                      <b-field
                        :label="$t('listing.title')"
                        :type="{ 'is-danger': !valid, 'is-success': valid }"
                        :message="formError(valid, failedRules)"
                      >
                        <b-input v-model="listingStore.listing.title" maxlength="249" name="title" />
                      </b-field>
                    </ValidationProvider>
                    <ValidationProvider v-slot="{ valid, failedRules }" rules="required|min:5|max:250" vid="location">
                      <b-field
                        label="Location"
                        :type="{ 'is-danger': !valid, 'is-success': valid }"
                        :message="formError(valid, failedRules)"
                      >
                        <b-autocomplete
                          v-model="listingStore.listing.location"
                          field="location"
                          :data="locationSearchStore.locationData"
                          placeholder="Warszawa"
                          :loading="locationSearchStore.isFetching"
                          @typing="searchAddress"
                          @select="onLocationSelect"
                        >
                          <template slot-scope="props">
                            <div class="media">
                              <div class="media-content">
                                {{ props.option.location }}
                                <br>
                              </div>
                            </div>
                          </template>
                        </b-autocomplete>
                      </b-field>
                    </ValidationProvider>
                  </div>
                </div>

                <div class="columns">
                  <div class="column is-one-third">
                    <div class="columns">
                      <div class="column is-half">
                        <b-field label="Type">
                          <b-select v-model="listingStore.listing.type" placeholder="Select a type">
                            <option
                              v-for="option in listingStore.listingTypes"
                              :key="option.id"
                              :value="option.id"
                            >
                              {{ option.value }}
                            </option>
                          </b-select>
                        </b-field>
                      </div>
                      <div class="column is-half">
                        <b-field label="Target">
                          <b-select v-model="listingStore.listing.target" placeholder="Select a target">
                            <option
                              v-for="option in listingStore.listingTargets"
                              :key="option.id"
                              :value="option.id"
                            >
                              {{ option.value }}
                            </option>
                          </b-select>
                        </b-field>
                      </div>
                    </div>
                  </div>

                  <div class="column is-two-thirds">
                    <div class="columns">
                      <div class="column is-half">
                        <ValidationProvider v-slot="{ valid, failedRules }" rules="required" vid="area">
                          <b-field
                            :label="$t('listing.area')"
                            :type="{ 'is-danger': !valid, 'is-success': valid }"
                            :message="formError(valid, failedRules)"
                          >
                            <b-input v-model="listingStore.listing.area" maxlength="249" name="area" type="number" />
                          </b-field>
                        </ValidationProvider>
                      </div>

                      <div class="column is-half">
                        <ValidationProvider v-slot="{ valid, failedRules }" rules="required" vid="price">
                          <b-field
                            :label="$t('listing.price')"
                            :type="{ 'is-danger': !valid, 'is-success': valid }"
                            :message="formError(valid, failedRules)"
                          >
                            <b-input v-model="listingStore.listing.price" maxlength="249" name="price" type="number" />
                          </b-field>
                        </ValidationProvider>
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>
              <br>
              <section>
                <b-field class="file">
                  <b-upload v-model="listingStore.coverFile" expanded @input="listingStore.onFileUpdateCover">
                    <a class="button is-primary is-fullwidth">
                      <b-icon icon="upload" />
                      <span>{{ listingStore.coverFile.name || $t('listing.upload.clickToUpload') }}</span>
                    </a>
                  </b-upload>
                </b-field>
                <b-field>
                  <b-upload
                    v-model="listingStore.listingFiles"
                    multiple
                    drag-drop
                    expanded
                    @input="listingStore.onFileUpdateListing"
                  >
                    <section class="section">
                      <div class="content has-text-centered">
                        <p>
                          <b-icon icon="upload" size="is-large" />
                        </p>
                        <p>{{ $t('listing.upload.dropFilesToUpload') }}</p>
                      </div>
                    </section>
                  </b-upload>
                </b-field>

                <div v-if="listingStore.coverPreviewUrl.length" class="columns">
                  <div class="column">
                    <div class="box">
                      <b-image
                        :src="listingStore.coverPreviewUrl"
                        alt="Preview"
                        :rounded="true"
                        class="image is-128x128"
                      />
                    </div>
                  </div>
                </div>

                <div class="tags">
                  <span v-for="(file, index) in listingStore.listingFiles" :key="index" class="tag is-primary">
                    {{ file.name }}
                    <button class="delete is-small" type="button" @click="listingStore.deleteDropFile(index)" />
                  </span>
                </div>

                <div class="box">
                  <div class="columns is-multiline">
                    <div
                      v-for="(file, index) in listingStore.listingPreviewUrls"
                      :key="index"
                      class="column"
                    >
                      <b-field>
                        <b-tag
                          type="is-danger"
                          attached
                          closable
                          aria-close-label="Close tag"
                          @close="listingStore.deleteDropFile(index)"
                        >
                          Delete
                        </b-tag>
                      </b-field>

                      <b-image
                        :src="file"
                        alt="Preview"
                        :rounded="true"
                        class="image is-128x128"
                      />
                    </div>
                  </div>
                </div>
              </section>
              <hr>
              <b-button type="is-primary" class="pb-2" :disabled="invalid" @click="onSaveListing">
                Create
              </b-button>
            </ValidationObserver>
            <div><br></div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Debounce } from 'vue-debounce-decorator'
import { LocationSearchResult } from '@backend/listing/search'
import { proxy } from '~/store/store'
import { $i18n, $loader } from '~/utils/api'
import { ListingStore } from '~/store/modules/listing/listing-store'
import { LocationSearchStore } from '~/store/modules/search/location-search-store'

@Component
export default class CreateListing extends Vue {
  listingStore: ListingStore = proxy.listingStore
  locationSearchStore: LocationSearchStore = proxy.locationSearchStore
  isFormDisabled: boolean = false
  isListingSend: boolean = false
  listingSendErrorMessage: string = ''
  showFiltersMode: boolean = false

  get isFormFilled () {
    return this.listingStore.areFieldsFilled
  }

  get isGlobalFormError (): boolean {
    return !!this.listingSendErrorMessage.length
  }

  async onSaveListing () {
    this.isFormDisabled = true
    const loader = $loader.show()

    try {
      const formSaveResponse = await this.listingStore.onSaveListing()
      this.$log.info(formSaveResponse)
      if (formSaveResponse) {
        if (formSaveResponse.validation.passed && formSaveResponse.status.success) {
          this.isListingSend = true
          this.$buefy.toast.open({
            message: $i18n.t('listing.messages.created'),
            type: 'is-success'
          })
        }

        // specific form field errors
        if (!formSaveResponse.validation.passed) {
          // @ts-ignore
          this.$refs.form.setErrors(
            formSaveResponse.validation.errors
          )
        }

        // general error message for form processing
        if (!formSaveResponse.status.success) {
          this.listingSendErrorMessage = formSaveResponse.status.errorMessage as string
        }
      }
    } catch (e) {
      this.$log.error(e)
      this.$buefy.toast.open({
        message: $i18n.t('api.error-msg-content'),
        type: 'is-danger'
      })
    }

    this.isFormDisabled = false
    setTimeout(() => {
      loader.hide()
    }, 400)
  }

  @Debounce(500)
  async searchAddress (name: string) {
    if (name.length >= 3) {
      await this.locationSearchStore.onSearch(name)
    } else {
      this.locationSearchStore.mutateLocationData([])
    }
  }

  async onLocationSelect (selectedLocation: LocationSearchResult) {
    if (selectedLocation) {
      await this.listingStore.onLocationSelect(selectedLocation)
    }
  }
}
</script>
