<template>
  <footer class="page-footer">
    <div class="footer-content">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12 col-sm-6">
            <p class="mb-0 text-muted">
              Real estate app (pelefele.com) {{ releaseInfo.version }}
            </p>
          </div>
          <div class="col-sm-6 d-none d-sm-block">
            <ul class="breadcrumb pt-0 pr-0 float-right">
              <li class="breadcrumb-item mb-0">
                <a href="/" class="btn-link">Main</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import releaseData from '~/data/release-version.json'

@Component
export default class DefaultFooter extends Vue {
  releaseInfo: Object = releaseData
}

</script>
