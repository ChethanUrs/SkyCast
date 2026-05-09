const axios = require('axios');

async function test() {
  const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude: 48.85,
      longitude: 2.35,
      current: 'temperature_2m',
      timezone: 'auto'
    }
  });
  console.log(JSON.stringify(data, null, 2));
}

test();
