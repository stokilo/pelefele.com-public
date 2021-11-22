export default function cdnUrl (url: string) {
  return `http://${process.env.stage}-assets.pelefele.com/${url}`
}
