
export function generateRandomName() {
  const fNameList = ['Martin', 'Armin', 'Calvin', 'Flux', 'Major', 'Alison', 'Katy', 'Ellie', 'Nina'];
  const lNameList = ['Garrix', 'van Buuren', 'Harris', 'Pavillion', 'Lazer', 'Wonderland', 'Perry', 'Goulding', 'Las Vegas'];
  return `${fNameList[Math.floor(Math.random()*fNameList.length)]} ${lNameList[Math.floor(Math.random()*lNameList.length)]}`;
}

export function generateRandomCity() {
  const cityList = ['Sydney', 'Vancouver', 'New York', 'Las Vegas', 'Melbourne', 'London', 'Manchester', 'Edinburgh', 'Brisbane', 'San Francisco', 'Paris', 'Miami', 'Chicago'];
  return cityList[Math.floor(Math.random()*cityList.length)];
}

export function generateRandomCountry() {
  const countryList = ['Australia', 'United States', 'United Kingdom', 'New Zealand', 'France'];
  return countryList[Math.floor(Math.random()*countryList.length)];
}

export function generateRandomNumber({minMajor = 1, maxMajor = 2, minor = 0, min = null, max = null}) {
  const major = minMajor === maxMajor ? maxMajor : Math.random() * (maxMajor - minMajor) + minMajor;
  if(min && max) {
    return (Math.random()*(max-min+1)+min).toFixed(minor);
  } else {
    return (Math.random() * (Math.pow(10, major))).toFixed(minor);
  }
}

export function generateRandomString(len = 5) {
  return Math.random().toString(36).substring(0, len);
};
