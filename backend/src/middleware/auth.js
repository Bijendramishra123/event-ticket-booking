// Complete auth bypass - NO authentication checks
const auth = (req, res, next) => {
  // Simply attach a demo user and continue
  req.user = {
    _id: '507f1f77bcf86cd799439011',
    email: 'demo@example.com',
    name: 'Demo User'
  };
  
  // Log for debugging
  console.log('✅ Auth bypassed - User attached:', req.user.name);
  
  next();
};

const generateToken = (user) => {
  return 'demo_token_' + Date.now();
};

module.exports = {
  auth,
  generateToken,
  DEMO_USER: {
    _id: '507f1f77bcf86cd799439011',
    email: 'demo@example.com',
    name: 'Demo User'
  }
};