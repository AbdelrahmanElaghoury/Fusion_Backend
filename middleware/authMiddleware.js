exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Accept JWT from Authorization header or from cookie
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  req.user = user;
  next();
});
