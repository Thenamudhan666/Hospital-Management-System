const express = require("express");
const router = express.Router();
const db = require("./db");

// Middleware to check for x-user-id header
const authMiddleware = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: Missing x-user-id header" });
  }
  req.userId = userId;
  next();
};

// Create a new appointment (Singular table 'appointment')
router.post("/appointments", authMiddleware, (req, res) => {
  const { timing, docid, reservation_id, appdate, service_type, notes } = req.body;

  if (!timing || !docid || !appdate) {
    return res.status(400).json({ error: "Timing, docid, and appdate are required" });
  }

  // Schema: appid, reservation_id, docid, timing, appdate, status, duration, notes, service_type, created_at
  const query = `
    INSERT INTO appointment 
    (timing, docid, reservation_id, appdate, service_type, notes, status, duration) 
    VALUES (?, ?, ?, ?, ?, ?, 'pending', 45)
  `;

  db.query(
    query,
    [
      timing, 
      docid, 
      reservation_id || null, 
      appdate, 
      service_type || "General Consultation", 
      notes || ""
    ],
    (err, result) => {
      if (err) {
        console.error("DEBUG: MySQL Error creating appointment:", {
          message: err.message,
          code: err.code,
          sqlState: err.sqlState,
          sql: err.sql
        });
        return res.status(500).json({ error: "Database error", details: err.message });
      }
      res.status(201).json({
        message: "Appointment created successfully",
        appointmentId: result.insertId
      });
    }
  );
});

// Fetch appointments for a specific reservation_id (Patient)
router.get("/appointments", (req, res) => {
  const { reservation_id } = req.query;
  
  if (!reservation_id) {
    return res.status(400).json({ error: "reservation_id query parameter is required" });
  }

  const query = "SELECT * FROM appointment WHERE reservation_id = ? ORDER BY appdate DESC, timing DESC";
  
  db.query(query, [reservation_id], (err, results) => {
    if (err) {
      console.error("Error fetching appointments:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
});

// Fetch all available slots (where reservation_id is NULL)
router.get("/available-slots", (req, res) => {
  const query = `
    SELECT a.*, d.docname as doctor_name, d.docspe as doctor_specialization 
    FROM appointment a
    JOIN doctor d ON a.docid = d.docid
    WHERE a.reservation_id IS NULL AND a.status = 'pending'
    ORDER BY a.appdate ASC, a.timing ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching available slots:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
});

// Fetch doctor's full schedule (added route)
router.get("/doctor/:docid/appointments", (req, res) => {
  const docid = req.params.docid;
  
  const query = `
    SELECT a.*, u.username as patient_name 
    FROM appointment a
    LEFT JOIN user u ON a.reservation_id = u.userid
    WHERE a.docid = ?
    ORDER BY a.appdate ASC, a.timing ASC
  `;

  db.query(query, [docid], (err, results) => {
    if (err) {
      console.error("Error fetching doctor schedule:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
});

// Book a specific slot
router.post("/appointments/:id/book", authMiddleware, (req, res) => {
  const appId = req.params.id;
  const userId = req.userId; // From authMiddleware header x-user-id

  const query = `
    UPDATE appointment 
    SET reservation_id = ?, status = 'confirmed' 
    WHERE appid = ? AND reservation_id IS NULL
  `;

  db.query(query, [userId, appId], (err, result) => {
    if (err) {
      console.error("DEBUG: MySQL Error booking appointment:", {
        message: err.message,
        code: err.code,
        sqlState: err.sqlState,
        sql: err.sql
      });
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Slot already booked or not found" });
    }
    res.status(200).json({ message: "Appointment booked successfully" });
  });
});

module.exports = router;
