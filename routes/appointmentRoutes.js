const express = require("express");
const router = express.Router();
const {
  bookAppointment,
  getConfirmationPage,
  getMyAppointments,
  getAdminDashboard,
  cancelAppointment,
} = require("../controllers/appointmentController");
const { auth } = require("../middleware/auth");

const roleAuth = (...roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) return next();
  return res.status(403).render("404", {
    title: "Access Denied",
    message: "You do not have permission to access this area.",
    user: req.user,
  });
};

router.use(auth);

router.post("/", roleAuth("customer"), bookAppointment);

router.get("/my", roleAuth("customer"), getMyAppointments);

router.get("/confirmation/:id", roleAuth("customer", "admin"), getConfirmationPage);

router.get("/admin/dashboard", roleAuth("admin"), getAdminDashboard);

router.post("/:id/cancel", roleAuth("customer", "admin"), cancelAppointment);

module.exports = router;