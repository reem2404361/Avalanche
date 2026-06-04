const Appointment = require("../models/Appointment");

const bookAppointment = async (req, res) => {
  try {
    const { date, timeSlot, notes, fullName, email, phone } = req.body;

    if (!date || !timeSlot) {
      return res.status(400).json({ success: false, message: "Date and time slot are required." });
    }

    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format." });
    }

    if (appointmentDate < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ success: false, message: "Cannot book a past date." });
    }

    const existing = await Appointment.findOne({
      date: appointmentDate,
      timeSlot,
      status: { $ne: "cancelled" },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: "That time slot is already booked. Please pick another." });
    }

    const appointment = await Appointment.create({
      user: req.user.id,
      date: appointmentDate,
      timeSlot,
      notes: notes || "",
    });

    return res.status(201).json({
      success: true,
      redirectUrl: `/appointments/confirmation/${appointment._id}`,
    });
  } catch (error) {
    console.error("bookAppointment error:", error);
    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

const getConfirmationPage = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate("user");

    if (!appointment) {
      return res.status(404).render("404", {
        title: "Not Found",
        message: "Appointment not found in the registry.",
        user: req.user,
      });
    }

    if (
      req.user.role !== "admin" &&
      appointment.user._id.toString() !== req.user.id
    ) {
      return res.status(403).render("404", {
        title: "Access Denied",
        message: "You do not have permission to view this confirmation.",
        user: req.user,
      });
    }

    res.render("confirmed", {
      title: "Avalanche | Appointment Confirmed",
      appointmentId: appointment._id,
      bookingDetails: {
        fullName: appointment.user.name,
        email: appointment.user.email,
        phone: appointment.user.phone || "Not provided",
        selectedDate: new Date(appointment.date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        timeSlot: appointment.timeSlot,
        status: appointment.status,
      },
    });
  } catch (error) {
    console.error("getConfirmationPage error:", error);
    res.status(500).render("404", { title: "Error", message: error.message, user: req.user });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id })
      .sort({ date: 1 })
      .lean();

    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.json({ success: true, appointments });
    }

    res.render("userdash", {
      title: "Avalanche | My Appointments",
      appointments,
      user: req.user,
    });
  } catch (error) {
    console.error("getMyAppointments error:", error);
    res.status(500).render("404", { title: "Error", message: error.message, user: req.user });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("user", "name email")
      .sort({ date: 1 })
      .lean();

    const metrics = {
      revenue: "EGP 2,400,000",
      capacity: "840 kWp",
      activeNodes: "10 / 10",
    };

    res.render("Admin_Dashboard", {
      title: "Avalanche | Admin Control Core",
      appointments,
      metrics,
      user: req.user,
    });
  } catch (error) {
    console.error("getAdminDashboard error:", error);
    res.status(500).render("404", { title: "Error", message: error.message, user: req.user });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).render("404", {
        title: "Not Found",
        message: "Appointment not found.",
        user: req.user,
      });
    }

    if (req.user.role === "customer" && appointment.user.toString() !== req.user.id) {
      return res.status(403).render("404", {
        title: "Forbidden",
        message: "You cannot cancel someone else's appointment.",
        user: req.user,
      });
    }

    if (appointment.date < new Date()) {
      return res.status(400).render("404", {
        title: "Cannot Cancel",
        message: "Past appointments cannot be cancelled.",
        user: req.user,
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    if (req.user.role === "admin") {
      return res.redirect("/appointments/admin/dashboard");
    }
    return res.redirect("/appointments/my");
  } catch (error) {
    console.error("cancelAppointment error:", error);
    res.status(500).render("404", { title: "Error", message: error.message, user: req.user });
  }
};

module.exports = {
  bookAppointment,
  getConfirmationPage,
  getMyAppointments,
  getAdminDashboard,
  cancelAppointment,
};