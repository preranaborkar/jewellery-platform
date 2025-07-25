// config/passport.js - Replace your entire passport.js file with this
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const User = require('../models/User');
const { generateToken } = require('../utils/tokenService');

// Determine callback URL based on environment
const getCallbackURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return `${process.env.BACKEND_URL}/api/auth/google/callback`;
  }
  return 'http://localhost:5000/api/auth/google/callback';
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: getCallbackURL(),
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Processing Google OAuth for:', profile.displayName);
        
        // Check if user already exists
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          console.log('Existing Google user found:', existingUser.email);
          const token = generateToken(existingUser._id, existingUser.role);
          
          const userData = {
            _id: existingUser._id,
            email: existingUser.email,
            fullName: existingUser.fullName,
            firstName: existingUser.firstName || null,
            lastName: existingUser.lastName || null,
            avatar: existingUser.avatar,
            role: existingUser.role,
            isVerified: existingUser.isVerified,
            googleId: existingUser.googleId
          };
          
          return done(null, { user: userData, token });
        }

        // Create new user
        console.log('Creating new Google user...');
        
        const newUserData = {
          googleId: profile.id,
          email: profile.emails?.[0]?.value || `${profile.id}@gmail.com`,
          fullName: profile.displayName || 'Google User',
          avatar: profile.photos?.[0]?.value || null,
          role: 'customer',
          isVerified: true
        };

        console.log('New user data:', newUserData);
        
        const newUser = await User.create(newUserData);
        console.log('New Google user created successfully:', newUser._id);

        const token = generateToken(newUser._id, newUser.role);
        

        console.log('Generated token for new user:', token);
        const userData = {
          _id: newUser._id,
          email: newUser.email,
          fullName: newUser.fullName,
          firstName: newUser.firstName || null,
          lastName: newUser.lastName || null,
          avatar: newUser.avatar,
          role: newUser.role,
          isVerified: newUser.isVerified,
          googleId: newUser.googleId
        };

        
        
        done(null, { user: userData, token });

      } catch (error) {
        console.error('Google OAuth Strategy Error:', error);
        done(error, null);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((data, done) => {
  done(null, data);
});

// Deserialize user from the session
passport.deserializeUser((data, done) => {
  done(null, data);
});

module.exports = passport;