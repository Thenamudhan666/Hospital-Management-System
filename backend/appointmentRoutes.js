const express = require("express");
const router = express.Router();
const { db } = require("./index");

// Auth Middleware: checks for x-user-id header
const authMiddleware = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = userId;
  next();
};

// GET /api/appointments — fetch all (admin), with optional ?reservation_id= and ?status= query filters
router.get("/", authMiddleware, (req, res) => {
  const { reservation_id, status } = req.query;
  let query = `
    SELECT a.*, u.username as patient_name, d.docname as doctor_name
    FROM appointments a
    LEFT JOIN user u ON a.reservation_id = u.userid
    LEFT JOIN doctor d ON a.docid = d.docid
  `;
  let params = [];

  const conditions = [];
  if (reservation_id) {
    conditions.push("a.reservation_id = ?");
    params.push(reservation_id);
  }
  if (status) {
    conditions.push("a.status = ?");
    params.push(status);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY a.created_at DESC";

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching appointments:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// POST /api/appointments — doctor creates a new appointment
router.post("/", authMiddleware, (req, res) => {
  const { timing, docid, reservation_id, appspe, appdate, notes, service_type } = req.body;

  // Duration must be 45 per user requirement and DB constraint
  const duration = 45;

  const query = `
    INSERT INTO appointments (timing, docid, reservation_id, appspe, appdate, status, duration, notes, service_type)
    VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)
  `;

  db.query(
    query,
    [timing, docid, reservation_id, appspe, appdate, duration, notes, service_type],
    (err, result) => {
      if (err) {
        console.error("Error creating appointment:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "Appointment created successfully", appid: result.insertId });
    }
  );
});

// PATCH /api/appointments/:id/status — update status (confirm/cancel/decline)
router.patch("/:id/status", authMiddleware, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["confirmed", "cancelled", "declined", "pending"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const query = "UPDATE appointments SET status = ? WHERE appid = ?";

  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error("Error updating status:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json({ message: \`Appointment \${status} successfully\` });
  });
});

module.exports = router;
