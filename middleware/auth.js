const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware för att skydda rutter som kräver inloggning
exports.protect = async (req, res, next) => {
  try {
    // Hämta token från headers
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Kontrollera om token finns
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Du är inte inloggad. Logga in för att få åtkomst.'
      });
    }

    // Verifiera token och hämta användare
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'Användaren existerar inte längre.'
      });
    }
    
    // Lägg till användaren på request-objektet
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'fail',
      message: 'Ogiltig token eller autentiseringsfel'
    });
  }
};

// Middleware för att begränsa åtkomst baserat på användarroll
exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      status: 'fail',
      message: 'Du har inte behörighet att utföra denna åtgärd'
    });
  }
  next();
};
