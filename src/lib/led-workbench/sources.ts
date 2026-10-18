// Every number the workbench uses comes from one of these documents (accessed 2026-10-11; lumimaxCf and nbsCopper 2026-10-18).
export const sources = {
  iec60063: {
    title: 'IEC 60063:2015, Preferred number series for resistors and capacitors, Table 1',
    url: 'https://webstore.iec.ch/en/publication/22011',
  },
  vishayESeries: {
    title: 'Vishay, Standard series values in a decade (E3 to E192, according to IEC 60063), doc. 28372',
    url: 'https://www.vishay.com/docs/28372/e-series.pdf',
  },
  lumimaxCf: {
    title: 'Lumimax Optoelectronic Technology datasheet: CF series carbon film fixed resistors, power rating at 70 °C',
    url: 'https://media.digikey.com/pdf/Data%20Sheets/Lumimax%20Optoelectronic%20Tech%20PDFs/CF%20Series.pdf',
  },
  kingbrightRed: {
    title: 'Kingbright WP7113SRD/D datasheet (super bright red, T-1 3/4)',
    url: 'https://www.kingbrightusa.com/images/catalog/SPEC/WP7113SRD-D.pdf',
  },
  kingbrightYellow: {
    title: 'Kingbright WP7113YD datasheet (yellow, T-1 3/4)',
    url: 'https://www.kingbrightusa.com/images/catalog/SPEC/WP7113YD.pdf',
  },
  kingbrightBlue: {
    title: 'Kingbright WP7113QBC/D datasheet (blue, T-1 3/4)',
    url: 'https://www.kingbrightusa.com/images/catalog/SPEC/WP7113QBC-D.pdf',
  },
  kingbrightWhite: {
    title: 'Kingbright WP7113QWC/D datasheet (white, T-1 3/4)',
    url: 'https://www.kingbrightusa.com/images/catalog/SPEC/WP7113QWC-D.pdf',
  },
  nbsCopper: {
    title: 'NBS Circular 31, Copper wire tables, 3rd edition, 1914 (annealed copper standard: 1/58 Ω·mm²/m and α = 0.00393 /°C at 20 °C)',
    url: 'https://www.govinfo.gov/content/pkg/GOVPUB-C13-3b218703c40cd48e0384d3a8b2aff743/pdf/GOVPUB-C13-3b218703c40cd48e0384d3a8b2aff743.pdf',
  },
  energizerEn91: {
    title: 'Energizer EN91 (AA alkaline) datasheet: nominal 1.5 V, nominal IR 150–300 mΩ fresh',
    url: 'https://data.energizer.com/pdfs/en91.pdf',
  },
  energizerIr: {
    title: 'Energizer, Battery internal resistance (pulse method, r = ΔV / ΔI)',
    url: 'https://data.energizer.com/pdfs/batteryir.pdf',
  },
} as const;

export type SourceId = keyof typeof sources;
