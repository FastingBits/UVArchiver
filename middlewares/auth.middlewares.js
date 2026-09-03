const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
};

const isAdmin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  } else if (req.session.user.rol !== 1) {
    return res.render("404");
  }
  next();
}

const isUser = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  } else if (req.session.user.rol !== 3 && req.session.user.rol !== 4 && req.session.user.rol !== 1) {
    return res.render("404");
  }
  next();
}

module.exports = { isAuthenticated, isAdmin, isUser };