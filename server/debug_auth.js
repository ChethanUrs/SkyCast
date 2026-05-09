require('dotenv').config();
try {
  console.log('Requiring passport...');
  const passport = require('passport');
  console.log('Requiring config/passport...');
  require('./config/passport');
  console.log('Requiring routes/auth...');
  const authRoutes = require('./routes/auth');
  console.log('Auth routes loaded successfully:', !!authRoutes);
} catch (e) {
  console.error('Error loading auth routes:', e.message);
  console.error(e.stack);
}
