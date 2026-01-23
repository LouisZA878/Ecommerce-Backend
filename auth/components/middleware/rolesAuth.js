const rolesAuth = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).send({
        error: [],
        data: {},
        success: false,
        description: "Unsuccesfully accessed route",
      });
    }
    next();
  };
};

module.exports = rolesAuth;
