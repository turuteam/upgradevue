const separators = ['/', '-', '.'];

// US format (month first)
const baseAllowedDateFormatsUs = [
  /// Dates without time
  'MM/DD/YYYY',
  'MM/D/YYYY',
  'M/DD/YYYY',
  'M/D/YYYY',

  /// Dates with time
  'MM/DD/YYYY HH:mm:ss',
  'MM/DD/YYYY H:mm:ss',
  'MM/DD/YYYY HH:mm',
  'MM/DD/YYYY H:mm',
  'MM/DD/YYYY hh:mm:ss a',
  'MM/DD/YYYY h:mm:ss a',
  'MM/DD/YYYY hh:mm a',
  'MM/DD/YYYY h:mm a',

  'MM/D/YYYY HH:mm:ss',
  'MM/D/YYYY H:mm:ss',
  'MM/D/YYYY HH:mm',
  'MM/D/YYYY H:mm',
  'MM/D/YYYY hh:mm:ss a',
  'MM/D/YYYY h:mm:ss a',
  'MM/D/YYYY hh:mm a',
  'MM/D/YYYY h:mm a',

  'M/DD/YYYY HH:mm:ss',
  'M/DD/YYYY H:mm:ss',
  'M/DD/YYYY HH:mm',
  'M/DD/YYYY H:mm',
  'M/DD/YYYY hh:mm:ss a',
  'M/DD/YYYY h:mm:ss a',
  'M/DD/YYYY hh:mm a',
  'M/DD/YYYY h:mm a',

  'M/D/YYYY HH:mm:ss',
  'M/D/YYYY H:mm:ss',
  'M/D/YYYY HH:mm',
  'M/D/YYYY H:mm',
  'M/D/YYYY hh:mm:ss a',
  'M/D/YYYY h:mm:ss a',
  'M/D/YYYY hh:mm a',
  'M/D/YYYY h:mm a',

  'MMM DD, YYYY [at] hh:mm a',
  'MMM D, YYYY [at] hh:mm a',
  'MMM DD, YYYY [at] h:mm a',
  'MMM D, YYYY [at] h:mm a',
];

// International format (day first)
const baseAllowedDateFormatsInternational = [
  /// Dates without time
  'DD/MM/YYYY',
  'D/MM/YYYY',
  'DD/M/YYYY',
  'D/M/YYYY',

  /// Dates with time
  'DD/MM/YYYY HH:mm:ss',
  'DD/MM/YYYY H:mm:ss',
  'DD/MM/YYYY HH:mm',
  'DD/MM/YYYY H:mm',
  'DD/MM/YYYY hh:mm:ss a',
  'DD/MM/YYYY h:mm:ss a',
  'DD/MM/YYYY hh:mm a',
  'DD/MM/YYYY h:mm a',

  'D/MM/YYYY HH:mm:ss',
  'D/MM/YYYY H:mm:ss',
  'D/MM/YYYY HH:mm',
  'D/MM/YYYY H:mm',
  'D/MM/YYYY hh:mm:ss a',
  'D/MM/YYYY h:mm:ss a',
  'D/MM/YYYY hh:mm a',
  'D/MM/YYYY h:mm a',

  'DD/M/YYYY HH:mm:ss',
  'DD/M/YYYY H:mm:ss',
  'DD/M/YYYY HH:mm',
  'DD/M/YYYY H:mm',
  'DD/M/YYYY hh:mm:ss a',
  'DD/M/YYYY h:mm:ss a',
  'DD/M/YYYY hh:mm a',
  'DD/M/YYYY h:mm a',

  'D/M/YYYY HH:mm:ss',
  'D/M/YYYY H:mm:ss',
  'D/M/YYYY HH:mm',
  'D/M/YYYY H:mm',
  'D/M/YYYY hh:mm:ss a',
  'D/M/YYYY h:mm:ss a',
  'D/M/YYYY hh:mm a',
  'D/M/YYYY h:mm a',

  'DD MMM YYYY hh:mm a',
  'ddd, DD MMM YYYY hh:mm a',
];

// Common format (year first)
const baseAllowedDateFormatsCommon = [
  /// Dates without time
  'YYYY/MM/DD',
  'YYYY/MM/D',
  'YYYY/M/DD',
  'YYYY/M/D',

  /// Dates with time
  'YYYY/MM/DD HH:mm:ssZ',
  'YYYY/MM/DD HH:mm:ss',
  'YYYY/MM/DD HH:mm',
  'YYYY/MM/DD hh:mm:ss a',
  'YYYY/MM/DD hh:mm a',
  'YYYY/MM/DD h:mm:ss a',
  'YYYY/MM/DD h:mm a',

  'YYYY/MM/D HH:mm:ssZ',
  'YYYY/MM/D HH:mm:ss',
  'YYYY/MM/D HH:mm',
  'YYYY/MM/D hh:mm:ss a',
  'YYYY/MM/D hh:mm a',
  'YYYY/MM/D h:mm:ss a',
  'YYYY/MM/D h:mm a',

  'YYYY/M/DD HH:mm:ssZ',
  'YYYY/M/DD HH:mm:ss',
  'YYYY/M/DD HH:mm',
  'YYYY/M/DD hh:mm:ss a',
  'YYYY/M/DD hh:mm a',
  'YYYY/M/DD h:mm:ss a',
  'YYYY/M/DD h:mm a',

  'YYYY/M/D HH:mm:ssZ',
  'YYYY/M/D HH:mm:ss',
  'YYYY/M/D HH:mm',
  'YYYY/M/D hh:mm:ss a',
  'YYYY/M/D hh:mm a',
  'YYYY/M/D h:mm:ss a',
  'YYYY/M/D h:mm a',

  'YYYY/MM/DDTHH:mm:ssZ',
  'YYYY/MM/DD[T]HH:mm:ss',
];


export const allowedDateFormatsUs = (function () {
  const concatBaseDates = baseAllowedDateFormatsUs.concat(baseAllowedDateFormatsCommon)
  return concatBaseDates.map(
    dateFormat => separators.map(
      separator => dateFormat.replaceAll("/", separator))
  ).flat()
}())


export const allowedDateFormatsInternational = (function () {
  const concatBaseDates = baseAllowedDateFormatsInternational.concat(baseAllowedDateFormatsCommon)
  return concatBaseDates.map(
    dateFormat => separators.map(
      separator => dateFormat.replaceAll("/", separator))
  ).flat()
}())


export const allowedDateFormats = (function () {
  const concatBaseDates = baseAllowedDateFormatsInternational.concat(baseAllowedDateFormatsCommon, baseAllowedDateFormatsUs)
  return concatBaseDates.map(
    dateFormat => separators.map(
      separator => dateFormat.replaceAll("/", separator))
  ).flat()
}())
