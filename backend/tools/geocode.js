// backend/tools/geocode.js
// Converts a text address to { lat, lng } using Google Geocoding API

const fetch = require('node-fetch');

async function geocodeAddress(address) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.results || !data.results.length) {
    throw new Error('Address not found');
  }

  const loc = data.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng };
}

module.exports = { geocodeAddress };
