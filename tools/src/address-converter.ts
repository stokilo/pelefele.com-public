import path = require('path')

const fs = require('fs').promises
const parse = require('csv-parse/lib/sync')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

type Dictionary = {
  [key: string]: any
}

async function readCSV (path: string): Promise<Array<any>> {
  const fileContent = await fs.readFile(path)
  return parse(fileContent, {
    columns: true,
    bom: true,
    delimiter: ';',
    skipEmptyLines: true
  })
}

function stringFormat (value: string): string {
  if (value.length > 0) {
    return (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()).trim()
  }
  return value
}

(async function () {
  const provincesRecords = await readCSV(path.join(__dirname, '/../data/provinces.csv'))

  const provinces: Dictionary = {}
  const counties: Dictionary = {}
  const boroughs: Dictionary = {}

  for (let i = 0; i < provincesRecords.length; i++) {
    const rec = provincesRecords[i]
    const level = rec.POZIOM
    const name: string = stringFormat(rec.NAZWA as string)
    const provinceId: string = rec.WOJ as string
    const countyId: string = rec.POW as string
    const boroughId: string = rec.GMI as string
    if (level === '2') {
      provinces[provinceId] = name
    } else if (level === '4') {
      counties[`${provinceId}#${countyId}`] = name
    } else if (level === '5') {
      boroughs[`${provinceId}#${countyId}#${boroughId}`] = name
    }
  }

  const citiesRecords = await readCSV(path.join(__dirname, '/../data/cities.csv'))
  const cities = []
  const citiesMap: Dictionary = {}
  for (let i = 0; i < citiesRecords.length; i++) {
    const rec = citiesRecords[i]
    const RM: string = rec.RM as string
    const name: string = rec.NAZWA as string
    const provinceId: string = rec.WOJ as string
    const countyId: string = rec.POW as string
    const boroughId: string = rec.GMI as string
    const symbol: string = rec.SYM as string

    // RM;TYPE;DATE
    // 00;część;2013-02-28
    // 01;wieś;2013-02-28
    // 02;kolonia;2013-02-28
    // 03;przysiółek;2013-02-28
    // 04;osada;2013-02-28
    // 05;osada leśna;2013-02-28
    // 06;osiedle;2013-02-28
    // 07;schronisko turystyczne;2013-02-28
    // 95;dzielnica;2013-02-28
    // 96;miasto;2013-02-28
    // 98;delegatura;2013-02-28
    // 99;część miasta;2013-02-28

    if (['1', '6', '95', '96', '98', '99'].indexOf(RM)) {
      const provinceName = provinces[provinceId]
      const countyName = counties[`${provinceId}#${countyId}`]
      const boroughName = boroughs[`${provinceId}#${countyId}#${boroughId}`]

      const city = {
        name: stringFormat(name),
        provinceName: stringFormat(provinceName),
        provinceId,
        countyName: stringFormat(countyName),
        countyId,
        boroughName: stringFormat(boroughName),
        boroughId
      }
      cities.push(city)
      citiesMap[`${provinceId}#${countyId}#${boroughId}#${symbol}`] = city
    }
  }

  const streetsRecords = await readCSV(path.join(__dirname, '/../data/streets.csv'))
  const streets = []
  for (let i = 0; i < streetsRecords.length; i++) {
    const rec = streetsRecords[i]
    const name1: string = rec.NAZWA_1 as string
    const name2: string = rec.NAZWA_2 as string
    const name: string = `${stringFormat(name2)} ${stringFormat(name1)}`
    const provinceId: string = rec.WOJ as string
    const countyId: string = rec.POW as string
    const boroughId: string = rec.GMI as string
    const symbol: string = rec.SYM as string

    const provinceName = provinces[provinceId]
    const countyName = counties[`${provinceId}#${countyId}`]
    const boroughName = boroughs[`${provinceId}#${countyId}#${boroughId}`]
    const cityName = citiesMap[`${provinceId}#${countyId}#${boroughId}#${symbol}`].name

    const street = {
      name: stringFormat(name),
      provinceName: stringFormat(provinceName),
      provinceId,
      countyName: stringFormat(countyName),
      countyId,
      boroughName: stringFormat(boroughName),
      boroughId,
      cityName: stringFormat(cityName)
    }
    streets.push(street)
  }

  const addressImport = []
  for (const st of cities) {
    const pk = `PL#${st.provinceId}`
    const sk = `${st.provinceId}#${st.countyId}#${st.boroughId}#${st.name}`

    addressImport.push({
      pk,
      sk,
      provinceName: st.provinceName,
      countyName: st.countyName,
      boroughName: st.boroughName,
      cityName: st.name,
      streetName: ''
    })
  }
  for (const st of streets) {
    const pk = `PL#${st.provinceId}`
    const sk = `${st.provinceId}#${st.countyId}#${st.boroughId}#${st.cityName}#${st.name}`

    addressImport.push({
      pk,
      sk,
      provinceName: st.provinceName,
      countyName: st.countyName,
      boroughName: st.boroughName,
      cityName: st.cityName,
      streetName: st.name
    })
  }

  // fs.writeFile('./../lib/data/0.1/address-import.json', JSON.stringify(addressImport.slice(5000, 6000)))
  const csvWriter = createCsvWriter({
    path: './../lib/data/0.1/address-import.csv',
    header: [{
      id: 'pk',
      title: 'PK'
    }, {
      id: 'sk',
      title: 'SK'
    },
    {
      id: 'provinceName',
      title: 'PROVINCE'
    },
    {
      id: 'countyName',
      title: 'COUNTY'
    },
    {
      id: 'boroughName',
      title: 'BOROUGH'
    },
    {
      id: 'cityName',
      title: 'CITY'
    },
    {
      id: 'streetName',
      title: 'STREET'
    }]
  })

  // todo: only 1000 entries exported for testing
  csvWriter
    .writeRecords(addressImport)
    // .writeRecords(addressImport.slice(5000, 6000))
    .then(() => console.log('The CSV file was written successfully'))
})()
