const https = require('https');

https.get('https://api.open-meteo.com/v1/forecast?latitude=48.85&longitude=2.35&current=temperature_2m&timezone=auto', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data));
});
