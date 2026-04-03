const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS Middleware (manual implementation since cors package is not installed)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Database Connection Pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verify connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL Pool:", err);
    return;
  }
  console.log("Connected to MySQL database via Pool");
  connection.release(); // Return the connection to the pool
});

// API Status Route (Changed from / to /api/status to avoid conflict with frontend)
app.get("/api/status", (req, res) => {
  res.json({ message: "Backend Server is Running!" });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Create User Table (Updated to match existing schema if it exists)
const createUserTable = `
CREATE TABLE IF NOT EXISTS user (
  userid INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  userphno BIGINT UNIQUE NOT NULL,
  usermail VARCHAR(255) NOT NULL,
  userpwd VARCHAR(255) NOT NULL
) AUTO_INCREMENT=1;
`;

db.query(createUserTable, (err, results) => {
  if (err) {
    console.error("Error creating user table:", err);
  } else {
    console.log("User table ready");
  }
});

// Signup Route
app.post("/api/signup", (req, res) => {
  const { fullName, phoneNumber, email, password } = req.body;

  // Basic validation (in a real app, use a library like Joi or express-validator)
  if (!fullName || !phoneNumber || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query =
    "INSERT INTO user (userphno, username, usermail, userpwd) VALUES (?, ?, ?, ?)";

  db.query(query, [phoneNumber, fullName, email, password], (err, result) => {
    if (err) {
      console.error("Error signing up:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ error: "Phone number or User ID already exists" });
      }
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "User created successfully" });
  });
});

// Login Route
app.post("/api/login", (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res
      .status(400)
      .json({ error: "Phone number and password are required" });
  }

  const query = "SELECT * FROM user WHERE userphno = ? AND userpwd = ?";

  db.query(query, [phone, password], (err, results) => {
    if (err) {
      console.error("Error logging in:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      res.status(200).json({ message: "Login successful", user: results[0] });
    } else {
      res.status(401).json({ error: "Invalid phone number or password" });
    }
  });
});

// Fetch Rooms Route
app.get("/api/rooms", (req, res) => {
  const query = "SELECT * FROM room";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching rooms:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
});

// Book Room Route (Sets status to Reserved and saves patient name)
app.post("/api/rooms/:id/book", (req, res) => {
  const roomId = req.params.id;
  const { userName, userId } = req.body;

  const query =
    "UPDATE room SET room_status = 'Reserved', user_name = ?, user_id = ? WHERE room_id = ?";

  db.query(
    query,
    [userName || "Guest", userId || null, roomId],
    (err, result) => {
      if (err) {
        console.error("Error booking room:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.status(200).json({ message: "Room reserved successfully" });
    },
  );
});

// Assign Doctor to Room Route
app.put("/api/rooms/:id/doctor", (req, res) => {
  const roomId = req.params.id;
  const { doctorName, doctorId } = req.body;

  const query =
    "UPDATE room SET doctor_name = ?, doctor_id = ? WHERE room_id = ?";

  db.query(query, [doctorName, doctorId || null, roomId], (err, result) => {
    if (err) {
      console.error("Error assigning doctor:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.status(200).json({ message: "Doctor assigned successfully" });
  });
});

// Confirm Room Reservation Route
app.put("/api/rooms/:id/confirm", (req, res) => {
  const roomId = req.params.id;

  // First check if doctor is assigned
  const checkQuery = "SELECT doctor_name FROM room WHERE room_id = ?";
  db.query(checkQuery, [roomId], (err, results) => {
    if (err) {
      console.error("Error checking room:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }
    if (!results[0].doctor_name) {
      return res
        .status(400)
        .json({ error: "Cannot confirm without an assigned doctor" });
    }

    const updateQuery =
      "UPDATE room SET room_status = 'Confirmed' WHERE room_id = ?";
    db.query(updateQuery, [roomId], (err, result) => {
      if (err) {
        console.error("Error confirming room:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(200).json({ message: "Room confirmed successfully" });
    });
  });
});

// Cancel Room Reservation Route
app.put("/api/rooms/:id/cancel", (req, res) => {
  const roomId = req.params.id;

  const query =
    "UPDATE room SET room_status = 'Available', user_name = NULL, doctor_name = NULL, user_id = NULL, doctor_id = NULL WHERE room_id = ?";

  db.query(query, [roomId], (err, result) => {
    if (err) {
      console.error("Error canceling reservation:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.status(200).json({ message: "Reservation canceled successfully" });
  });
});

// Create Doctor Table
const createDoctorTable = `
CREATE TABLE IF NOT EXISTS doctor (
  docid INT AUTO_INCREMENT PRIMARY KEY,
  docname VARCHAR(30),
  docphno BIGINT UNIQUE,
  docemail VARCHAR(30),
  docspe VARCHAR(30),
  docpwd VARCHAR(30)
) AUTO_INCREMENT=10001;
`;

db.query(createDoctorTable, (err, results) => {
  if (err) {
    console.error("Error creating doctor table:", err);
  } else {
    console.log("Doctor table ready");
  }
});

// Doctor Signup Route
app.post("/api/doctor-signup", (req, res) => {
  const { name, phoneNumber, email, specialisation, password } = req.body;

  if (!name || !phoneNumber || !email || !specialisation || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query =
    "INSERT INTO doctor (docname, docphno, docemail, docspe, docpwd) VALUES (?, ?, ?, ?, ?)";

  db.query(
    query,
    [name, phoneNumber, email, specialisation, password],
    (err, result) => {
      if (err) {
        console.error("Error signing up doctor:", err);
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ error: "Phone number already exists" });
        }
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "Doctor registered successfully" });
    },
  );
});

// Doctor Login Route
app.post("/api/doctor-login", (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res
      .status(400)
      .json({ error: "Phone number and password are required" });
  }

  const query = "SELECT * FROM doctor WHERE docphno = ? AND docpwd = ?";

  db.query(query, [phone, password], (err, results) => {
    if (err) {
      console.error("Error logging in doctor:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      const doctor = results[0];
      res.status(200).json({
        message: "Login successful",
        doctor: {
          id: doctor.docid,
          name: doctor.docname,
          phone: doctor.docphno,
          email: doctor.docemail,
          specialisation: doctor.docspe,
        },
      });
    } else {
      res.status(401).json({ error: "Invalid phone number or password" });
    }
  });
});

// Create Room Table (with Foreign Key relationships)
const createRoomTable = `
CREATE TABLE IF NOT EXISTS room (
  room_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  doctor_id INT,
  doctor_name VARCHAR(30),
  user_name VARCHAR(40),
  room_status VARCHAR(30) DEFAULT 'Available',
  room_type VARCHAR(30),
  FOREIGN KEY (user_id) REFERENCES user(userid) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctor(docid) ON DELETE CASCADE ON UPDATE CASCADE
) AUTO_INCREMENT=1;
`;

db.query(createRoomTable, (err, results) => {
  if (err) {
    console.error("Error creating room table:", err);
  } else {
    console.log("Room table ready");

    // Add foreign key constraints to existing table (if table already existed without them)
    const addUserFK = `
      ALTER TABLE room
      ADD CONSTRAINT fk_room_user FOREIGN KEY (user_id) REFERENCES user(userid)
      ON DELETE CASCADE ON UPDATE CASCADE;
    `;
    const addDoctorFK = `
      ALTER TABLE room
      ADD CONSTRAINT fk_room_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(docid)
      ON DELETE CASCADE ON UPDATE CASCADE;
    `;

    db.query(addUserFK, (err) => {
      if (err) {
        if (err.code === "ER_FK_DUP_NAME" || err.code === "ER_DUP_KEYNAME") {
          console.log("Foreign key fk_room_user already exists");
        } else {
          console.error("Error adding user foreign key:", err.message);
        }
      } else {
        console.log("Foreign key fk_room_user added successfully");
      }
    });

    db.query(addDoctorFK, (err) => {
      if (err) {
        if (err.code === "ER_FK_DUP_NAME" || err.code === "ER_DUP_KEYNAME") {
          console.log("Foreign key fk_room_doctor already exists");
        } else {
          console.error("Error adding doctor foreign key:", err.message);
        }
      } else {
        console.log("Foreign key fk_room_doctor added successfully");
      }
    });
  }
});

// Get All Doctors Route
app.get("/api/doctors", (req, res) => {
  const query = "SELECT * FROM doctor";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching doctors:", err);
      return res.status(500).json({ error: "Database error" });
    }
    const doctors = results.map((doctor) => ({
      id: doctor.docid,
      name: doctor.docname,
      phone: doctor.docphno,
      email: doctor.docemail,
      specialisation: doctor.docspe,
    }));
    res.status(200).json(doctors);
  });
});

// Create Room Route
app.post("/api/rooms", (req, res) => {
  const { roomtype } = req.body;

  if (!roomtype) {
    return res.status(400).json({ error: "Room type is required" });
  }

  const query =
    "INSERT INTO room (room_type, room_status) VALUES (?, 'Available')";

  db.query(query, [roomtype], (err, result) => {
    if (err) {
      console.error("Error creating room:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res
      .status(201)
      .json({ message: "Room created successfully", id: result.insertId });
  });
});

// Get Rooms Booked by a Specific User
app.get("/api/user/:id/rooms", (req, res) => {
  const userId = req.params.id;

  const query = "SELECT * FROM room WHERE user_id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user rooms:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
});

// Delete Room Route
app.delete("/api/rooms/:id", (req, res) => {
  const roomId = req.params.id;

  const query = "DELETE FROM room WHERE room_id = ?";

  db.query(query, [roomId], (err, result) => {
    if (err) {
      console.error("Error deleting room:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.status(200).json({ message: "Room deleted successfully" });
  });
});

// Admin Login Route
app.post("/api/admin-login", (req, res) => {
  const { admin, password } = req.body;

  if (!admin || !password) {
    return res
      .status(400)
      .json({ error: "Admin username and password are required" });
  }

  const query = "SELECT * FROM admin WHERE name = ? AND pwd = ?";

  db.query(query, [admin, password], (err, results) => {
    if (err) {
      console.error("Error logging in admin:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      const adminData = results[0];
      res.status(200).json({
        message: "Login successful",
        admin: {
          id: adminData.id,
          name: adminData.name,
        },
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });
});

// Get Rooms Assigned to a Doctor
app.get("/api/doctor/:id/rooms", (req, res) => {
  const doctorId = req.params.id;

  const query = "SELECT * FROM room WHERE doctor_id = ?";

  db.query(query, [doctorId], (err, results) => {
    if (err) {
      console.error("Error fetching doctor rooms:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
});

// Catch-all route to serve the frontend index.html for any non-API routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});
