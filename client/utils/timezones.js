import moment from 'moment-timezone';

let depricatedTimezones = ["Etc"]
let depricatedTimezoneRegex = `^${depricatedTimezones.join("|^")}`

let filtTimezones = Object.keys(moment.tz._zones)
.map((k) => {
  let val = moment.tz._zones[k].split('|')[0]
  return {
    name: val.split('_').join(' '),
    value: val,
  }
})
.filter((z) => { 
  return z.value.indexOf('/') >= 0 && !new RegExp(depricatedTimezoneRegex).test(z.value)
})

export const filteredTimezones = filtTimezones.sort((a, b) => {
  if (a.name < b.name) return -1
  return a.name > b.name ? 1 : 0
})

const timezones = moment.tz
  .names()
  .sort((a, b) => {
    const diff =
      moment.tz.zone(a).utcOffset(moment()) - moment.tz.zone(b).utcOffset(moment());
    if (diff === 0) {
      if (a < b) return -1;
      if (a > b) return 1;
    }
    return diff;
  })
  .map(timezone => ({
    value: timezone,
    name: timezone,
  }));

export default timezones;