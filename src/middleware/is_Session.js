

function isAuth(req, res, next) {
	if (req.session.User) {
	  next();
	} else {
	  res.status(401).json({ message: 'Unauthorized' });
	}
  }
  
  module.exports = isAuth;
  