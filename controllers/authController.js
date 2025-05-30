const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Hjälpfunktioner
const signToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const sendResponse = (res, statusCode, user = null, token = null) => {
  // Ta bort lösenordet från svaret om user finns
  if (user && user.password) user.password = undefined;

  res.status(statusCode).json({
    status: statusCode < 400 ? 'success' : 'fail',
    ...(token && { token }),
    ...(user && { data: { user } }),
    ...(statusCode >= 400 && !user && { message: token }) // Använd token som felmeddelande
  });
};

// Controllers
exports.register = async (req, res) => {
  try {
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role
    });
    
    sendResponse(res, 201, newUser, signToken(newUser._id));
  } catch (error) {
    sendResponse(res, 400, null, error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Kontrollera om email och lösenord finns
    if (!email || !password) 
      return sendResponse(res, 400, null, 'Ange både e-post och lösenord');
    
    // Kontrollera om användaren finns och lösenordet är korrekt
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password)))
      return sendResponse(res, 401, null, 'Felaktig e-post eller lösenord');
    
    sendResponse(res, 200, user, signToken(user._id));
  } catch (error) {
    sendResponse(res, 400, null, error.message);
  }
};