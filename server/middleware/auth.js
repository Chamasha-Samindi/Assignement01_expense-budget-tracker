const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Frontend එකෙන් එවන Token එක ලබාගැනීම
  const authHeader = req.header("Authorization");
  
  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // "Bearer <token>" කියන එකෙන් token කොටස පමණක් වෙන් කරගැනීම
    const token = authHeader.split(" ")[1];
    
    // Token එක හරිදැයි පරීක්ෂා කිරීම
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Request එකට අදාළ User ගේ ID එක ඇතුළත් කිරීම
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};