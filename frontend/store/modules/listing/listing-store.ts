import { createModule, mutation, action, getter } from 'vuex-class-component'
import {
  GetListings, GetListingsSchema,
  Listing, LISTING_TARGETS, LISTING_TYPES, ListingSelect,
  newListing,
  newTestListing, PostListing, PostListingSchema
} from '@backend/listing/listing'
import { ROUTE_NAMES } from '@backend/routes'
import { LocationSearchResult } from '@backend/listing/search'
import ApiCall from '~/store/api/api-call'
import UploadService from '~/store/api/app/upload-service'

export const VuexModule = createModule({
  namespaced: 'listing',
  strict: false,
  target: 'nuxt'
})

export class ListingStore extends VuexModule {
  apiCall: ApiCall = new ApiCall()
  uploadService: UploadService = new UploadService()

  listing: Listing = process.env.isDevMode ? newTestListing() : newListing()
  coverFile: File = new File([], '')
  listingFiles: File[] = []

  listings: Array<Listing> = []
  tableColumns: Array<any> = [
    {
      field: 'title',
      label: 'Title'
    },
    {
      field: 'price',
      label: 'Price'
    }
  ]

  coverPreviewUrl: string = ''
  listingPreviewUrls: Array<string> = []

  listingTypes: Array<ListingSelect> = LISTING_TYPES
  listingTargets: Array<ListingSelect> = LISTING_TARGETS

  @getter
  areFieldsFilled (): boolean {
    return true
  }

  @mutation deleteDropFile (index: number) {
    this.listingFiles.splice(index, 1)
    this.listingPreviewUrls.splice(index, 1)
  }

  @mutation mutateListing (mutatedListing: Listing) {
    this.listing = mutatedListing
  }

  @mutation mutateCoverFileName (coverFileName: string) {
    this.listing.coverFileName = coverFileName
  }

  @mutation mutateListingFileNames (listingFileNames: Array<string>) {
    this.listing.listingFileNames = listingFileNames
  }

  @mutation mutateListings (listings: Listing[]) {
    this.listings = listings
  }

  @mutation
  onFileUpdateCover (file: File) {
    this.coverPreviewUrl = URL.createObjectURL(file)
  }

  @mutation
  onFileUpdateListing (files: File[]) {
    this.listingPreviewUrls = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const url = URL.createObjectURL(f)
      this.listingPreviewUrls.push(url)
    }
  }

  @mutation
  onLocationSelect (selectedLocation: LocationSearchResult) {
    this.listing.location = selectedLocation.location
    this.listing.locationPk = selectedLocation.pk
    this.listing.locationSk = selectedLocation.sk
  }

  @action
  async loadListings () {
    const response = await this.apiCall.$get<GetListings, typeof GetListingsSchema>(
      ROUTE_NAMES.LISTINGS, GetListingsSchema)


    if (response && response.listings) {
      console.dir(response.listings)
      this.mutateListings(response.listings)
    }
  }

  @action
  async onSaveListing (): Promise<PostListing | undefined> {
    let count = this.coverFile.name.length ? 1 : 0
    count = this.listingFiles ? count + this.listingFiles.length : count

    if (count > 0) {
      const s3SignUrls = await this.uploadService.getSignedUploadUrls(count)

      await this.uploadService.uploadS3Post(s3SignUrls[0].url, this.coverFile)
      await this.mutateCoverFileName(s3SignUrls[0].fileName)

      if (s3SignUrls.length > 1) {
        const remaining = s3SignUrls.splice(1)
        for (let i = 0; i < remaining.length; i++) {
          await this.uploadService.uploadS3Post(remaining[i].url, this.listingFiles[i])
        }
        const remainingFileNames = remaining.map(r => r.fileName)
        await this.mutateListingFileNames(remainingFileNames)
      }
    }

    return await this.apiCall.$post<Listing, PostListing, typeof PostListingSchema>(
      ROUTE_NAMES.LISTINGS, this.listing, PostListingSchema)
  }
}
