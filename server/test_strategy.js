const GoogleStrategy = require('passport-google-oauth20').Strategy;
try {
  const strategy = new GoogleStrategy({
    clientID: 'your_google_oauth_client_id',
    clientSecret: 'your_google_oauth_client_secret',
    callbackURL: 'http://localhost:5001/api/auth/google/callback'
  }, () => {});
  console.log('Strategy initialized successfully');
} catch (e) {
  console.error('Strategy initialization failed:', e.message);
}
