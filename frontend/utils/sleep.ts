// eslint-disable-next-line require-await
export default async function sleep (time: number): Promise<any> {
  // eslint-disable-next-line promise/param-names
  return new Promise(r => setTimeout(r, time))
}
