export interface CurrentLocationAddress {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  isBilling: boolean;
  isShipping: boolean;
}

interface NominatimAddress {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  footway?: string;
  neighbourhood?: string;
  suburb?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  hamlet?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

function pickFirst(...values: Array<string | undefined>): string {
  return values.find((v) => v && v.trim()) || '';
}

interface IpGeoData {
  city?: string;
  region?: string;
  postal?: string;
  country_code?: string;
}

async function getGeolocationAddress(): Promise<CurrentLocationAddress> {
  const position = await getCurrentPosition();
  const { latitude, longitude } = position.coords;

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&zoom=18&lat=${latitude}&lon=${longitude}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error('Could not find an address for your current location');
  }

  const data = (await res.json()) as { address?: NominatimAddress };
  const a = data.address || {};

  const street = pickFirst(a.road, a.pedestrian, a.footway, a.hamlet);
  const line1 = [a.house_number, street].filter(Boolean).join(', ');
  const line2 = pickFirst(a.neighbourhood, a.suburb, a.city_district, a.county);
  const city = pickFirst(a.city, a.town, a.village, a.municipality, a.county);
  const state = a.state || city;
  const zipCode = a.postcode || '';
  const country = (a.country_code || 'in').toUpperCase();

  if (!line1 || !city) {
    throw new Error('Could not find a complete address for your current location');
  }

  return {
    label: 'Current Location',
    line1,
    line2: line2 || undefined,
    city,
    state,
    zipCode,
    country,
    isDefault: true,
    isBilling: true,
    isShipping: true,
  };
}

async function getIpLocationAddress(): Promise<CurrentLocationAddress> {
  const res = await fetch('https://ipapi.co/json/');
  if (!res.ok) {
    throw new Error('Could not determine your location from your IP');
  }
  const data = (await res.json()) as IpGeoData;
  const city = data.city;
  if (!city) {
    throw new Error('Could not determine your city from your IP');
  }
  const state = data.region || city;
  const zipCode = data.postal || '';
  const country = (data.country_code || 'IN').toUpperCase();

  return {
    label: 'Current Location',
    line1: city,
    line2: state || undefined,
    city,
    state,
    zipCode,
    country,
    isDefault: true,
    isBilling: true,
    isShipping: true,
  };
}

export async function getCurrentLocationAddress(): Promise<CurrentLocationAddress> {
  try {
    return await getGeolocationAddress();
  } catch (geolocationError) {
    try {
      return await getIpLocationAddress();
    } catch {
      throw new Error('Could not find your current location. Please add your address manually.');
    }
  }
}
