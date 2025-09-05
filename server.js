const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔹 Database configuration using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// ✅ Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.stack);
    return;
  }
  console.log("✅ Connected to MySQL database");
});
// app.post("/check-mobile", (req, res) => {
//   const mobilenumber = req.body.mobilenumber;
//   if (!mobilenumber) {
//     return res.json({ success: false, message: "Mobile number is required" });
//   }

//   const sql = "SELECT * FROM propertyowner_master WHERE mobilenumber = ?";
//   db.query(sql, [mobilenumber], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.json({ success: false, message: "Database error" });
//     }
//     if (result.length > 0) {
//       res.json({ success: true });
//     } else {
//       res.json({ success: false, message: "Mobile number not registered" });
//     }
//   });
// });

app.get("/get-owner-name", (req, res) => {
  const propertyOwnerId = req.query.propertyOwnerId;
  const sql = "SELECT ownername FROM propertyowner_master WHERE propertyownerid = ?";
  db.query(sql, [propertyOwnerId], (err, results) => {
    if (err || !results.length) {
      return res.json({ name: "" });
    }
    res.json({ name: results[0].ownername });
  });
});




app.post("/check-mobile", (req, res) => {
  const { mobilenumber, password } = req.body;
  if (!mobilenumber || !password) {
    return res.json({ success: false, message: "Mobile number and password are required" });
  }

  const sql = "SELECT propertyownerid FROM propertyowner_master WHERE mobilenumber = ? AND Password = ?";
  db.query(sql, [mobilenumber, password], (err, result) => {
    if (err) {
      console.error(err);
      return res.json({ success: false, message: "Database error" });
    }
    if (result.length > 0) {
      res.json({
        success: true,
        propertyownerid: result[0].propertyownerid
      });
    } else {
      res.json({ success: false, message: "Invalid mobile number or password" });
    }
  });
});
app.post("/addOwner", (req, res) => {
  const { name, mobile, aadhaar, address, password } = req.body;

  // 🔍 Step 1: Check if mobile already exists
  const checkSql = "SELECT * FROM propertyowner_master WHERE mobilenumber = ?";
  db.query(checkSql, [mobile], (err, results) => {
    if (err) {
      console.error("❌ Select error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    if (results.length > 0) {
      // 🚨 Mobile number already exists
      return res.status(400).json({ error: "Mobile number already exists" });
    }

    // ✅ Step 2: Insert new record
    const insertSql = `INSERT INTO propertyowner_master 
                      (ownername, mobilenumber, aadharnumber, address, Password) 
                      VALUES (?, ?, ?, ?, ?)`;

    db.query(insertSql, [name, mobile, aadhaar, address, password], (err, result) => {
      if (err) {
        console.error("❌ Insert error:", err);
        return res.status(500).json({ error: "Database insert failed" });
      }
      res.json({ message: "✅ Owner saved successfully", id: result.insertId });
    });
  });
});


// ✅ API route to insert Owner
// ✅ API route to insert Room details
app.post("/addRoom", (req, res) => {
  const { roomNo, capacity, status, address, propertyOwnerId } = req.body;
  const sql = `INSERT INTO tbl_Rooms (RoomNo, Capacity, Status, Address, PropertyOwnerId) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [roomNo, capacity, status, address, propertyOwnerId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database insert failed" });
    }
    res.json({ message: "Room saved successfully", id: result.insertId });
  });
});


// Add Tenant with PropertyOwnerId
// app.post("/addTenant", (req, res) => {
//   const {
//     name, mobileNo, aadhaar, roomId, rentAmount, depositAmount,
//     notes, isRentAgreement, startDate, endDate, propertyOwnerId
//   } = req.body;
//   const sql = `INSERT INTO tbl_Tenants
//     (Name, MobileNo, AadhaarCardNumber, RoomId, RentAmount, DepositAmount, Notes, IsRentAgreement, StartDate, EndDate, PropertyOwnerId)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
//   db.query(
//     sql,
//     [name, mobileNo, aadhaar, roomId, rentAmount, depositAmount, notes, isRentAgreement, startDate, endDate, propertyOwnerId],
//     (err, result) => {
//       if (err) {
//         return res.status(500).json({ error: "Database insert failed" });
//       }
//       res.json({ message: "Tenant saved successfully", id: result.insertId });
//     }
//   );
// });
// mihir
// Add Tenant with PropertyOwnerId
app.post("/addTenant", (req, res) => {
  const {
    name, mobileNo, aadhaar, roomId, rentAmount, depositAmount,
    notes, isRentAgreement, startDate, endDate, propertyOwnerId
  } = req.body;
  const sql = `INSERT INTO tbl_Tenants
    (Name, MobileNo, AadhaarCardNumber, RoomId, RentAmount, DepositAmount, Notes, IsRentAgreement, StartDate, EndDate, PropertyOwnerId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    sql,
    [name, mobileNo, aadhaar, roomId, rentAmount, depositAmount, notes, isRentAgreement, startDate, endDate, propertyOwnerId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database insert failed" });
      }
      res.json({ message: "Tenant saved successfully", id: result.insertId });
    }
  );
});

// app.post("/addRent", (req, res) => {
//   const {
//     roomId, tenantId, monthYear, rentAmount, paidAmount,
//     paymentDate, paymentMethod, propertyOwnerId
//   } = req.body;
//   const sql = `INSERT INTO tbl_Rent
//     (RoomId, TenantId, MonthYear, RentAmount, PaidAmount, PaymentDate, PaymentMethod, PropertyOwnerId)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
//   db.query(
//     sql,
//     [roomId, tenantId, monthYear, rentAmount, paidAmount, paymentDate, paymentMethod, propertyOwnerId],
//     (err, result) => {
//       if (err) {
//         return res.status(500).json({ error: "Database insert failed" });
//       }
//       res.json({ message: "Rent receipt saved successfully", id: result.insertId });
//     }
//   );
// });

// app.get("/fetch-empty-rooms", (req, res) => {
//   const sql = `SELECT * FROM tbl_Rooms WHERE Status = 'empty' and PropertyOwnerId = ?`;
//   db.query(sql, [req.body.propertyOwnerId], (err, results) => {
//     if (err) {
//       console.error("❌ Fetch error:", err);
//       return res.status(500).json({ error: "Database fetch failed" });
//     }
//     res.json({ message: "✅ Empty rooms fetched successfully", data: results });
//   });
// });
app.post("/addRent", (req, res) => {
  const {
    roomId, tenantId, monthYear, rentAmount, paidAmount,
    paymentDate, paymentMethod, propertyOwnerId
  } = req.body;
  const sql = `INSERT INTO tbl_Rent
    (RoomId, TenantId, MonthYear, RentAmount, PaidAmount, PaymentDate, PaymentMethod, PropertyOwnerId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    sql,
    [roomId, tenantId, monthYear, rentAmount, paidAmount, paymentDate, paymentMethod, propertyOwnerId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database insert failed" });
      }
      res.json({ message: "Rent receipt saved successfully", id: result.insertId });
    }
  );
});

app.get("/tenant-rent", (req, res) => {
  const tenantId = req.query.tenantId;
  const sql = "SELECT RentAmount FROM tbl_Tenants WHERE TenantId = ?";
  db.query(sql, [tenantId], (err, data) => {
    if (err) {
      console.error("❌ Fetch tenant rent error:", err);
      return res.status(500).json({ error: "Database fetch failed" });
    }
    if (data.length > 0) {
      res.json({ success: true, data: { rent: data[0].RentAmount } });
    } else {
      res.json({ success: false, message: "Tenant not found" });
    }
  });
});

app.get("/fetch-empty-rooms", (req, res) => {
  const propertyOwnerId = req.query.propertyOwnerId;
  const sql = `SELECT * FROM tbl_Rooms WHERE Status = 'empty' and PropertyOwnerId = ? AND isDelete = 0`;
  db.query(sql, [propertyOwnerId], (err, results) => {
    if (err) {
      console.error("❌ Fetch error:", err);
      return res.status(500).json({ error: "Database fetch failed" });
    }
    res.json({ message: "✅ Empty rooms fetched successfully", data: results });
  });
})

// app.get("/fetch-rooms", (req, res) => {
//   const sql = "SELECT DISTINCT RoomId, RoomNo FROM tbl_Rooms WHERE PropertyOwnerId = ?";
//   db.query(sql, [req.query.propertyOwnerId], (err, data) => {
//     if (err) {
//       console.error("❌ Fetch rooms error:", err);
//       return res.status(500).json({ error: "Database fetch failed" });
//     }
//     res.json({ data });
//   });
// });

app.get("/fetch-rooms", (req, res) => {
  const propertyOwnerId = req.query.propertyOwnerId;
  const sql = "SELECT DISTINCT RoomId, RoomNo FROM tbl_Rooms WHERE PropertyOwnerId = ? AND isDelete = 0";
  db.query(sql, [propertyOwnerId], (err, data) => {
    if (err) {
      console.error("❌ Fetch rooms error:", err);
      return res.status(500).json({ error: "Database fetch failed" });
    }
    res.json({ data });
  });
});


app.get("/fetch-rooms-with-tenant", (req, res) => {
  const propertyOwnerId = req.query.propertyOwnerId;
  const sql = `
    SELECT 
      r.RoomId,
      r.RoomNo,
      r.Capacity,
      t.Name AS TenantName
    FROM tbl_Rooms r
    LEFT JOIN tbl_Tenants t 
      ON r.RoomId = t.RoomId
    WHERE r.PropertyOwnerId = ? AND r.isDelete = 0
  `;
  db.query(sql, [propertyOwnerId], (err, results) => {
    if (err) {
      console.error("❌ Fetch rooms error:", err);
      return res.status(500).json({ error: "Database fetch failed" });
    }
    res.json({ data: results });
  });
});




// app.get("/tenant-name", (req, res) => {
//   const propertyOwnerId = req.query.propertyOwnerId;
//   const sql = "SELECT DISTINCT TenantId, Name FROM tbl_Tenants WHERE PropertyOwnerId = ?";
//   db.query(sql, [propertyOwnerId], (err, data) => {
//     if (err) {
//       console.error("❌ Fetch tenants error:", err);
//       return res.status(500).json({ error: "Database fetch failed" });
//     }
//     res.json({ data });
//   });
// });


// app.get("/fetch-tenant-register-master", (req, res) => {
//   const propertyOwnerId = req.query.propertyOwnerId;
//   const sql = `
//     SELECT 
//       t.Name,
//       t.MobileNo,
//       r.RoomNo,
//       t.RentAmount,
//       t.DepositAmount,
//       t.IsRentAgreement,
//       t.StartDate
//     FROM tbl_Tenants t
//     JOIN tbl_Rooms r
//       ON t.RoomId = r.RoomId
//     WHERE t.PropertyOwnerId = ?
//   `;
//   db.query(sql, [propertyOwnerId], (err, results) => {
//     if (err) {
//       console.error("❌ Fetch tenants error:", err);
//       return res.status(500).json({ error: "Database fetch failed" });
//     }
//     res.json({ data: results });
//   });
// });

app.get("/fetch-tenant-register-master", (req, res) => {
  const propertyOwnerId = req.query.propertyOwnerId;

  const sql = `
    SELECT 
      t.TenantId,
      t.Name,
      t.MobileNo,
      r.RoomNo,
      t.RentAmount,
      t.DepositAmount,
      t.IsRentAgreement,
      DATE_FORMAT(t.StartDate, '%Y-%m-%d') AS StartDate
    FROM tbl_Tenants t
    JOIN tbl_Rooms r
      ON t.RoomId = r.RoomId
    WHERE t.PropertyOwnerId = ? And t.isDelete = 0
  `;

  db.query(sql, [propertyOwnerId], (err, results) => {
    if (err) {
      console.error("❌ Fetch tenants error:", err);
      return res.status(500).json({ error: "Database fetch failed" });
    }
    res.json({ data: results });
  });
});




app.get("/balance", (req, res) => {
  const propertyOwnerId = req.query.propertyOwnerId;
  const sql = `
    SELECT 
      r.Roomid,
      rooms.RoomNo,
      r.Tenantid,
      tenants.Name AS TenantName,
      r.RentAmount,
      r.Paidamount,
      r.Balance,
      r.PaymentDate
    FROM tbl_Rent r
    JOIN tbl_Rooms rooms ON r.Roomid = rooms.Roomid
    JOIN tbl_Tenants tenants ON r.Tenantid = tenants.Tenantid
    WHERE r.propertyownerid = ?
  `;
  db.query(sql, [propertyOwnerId], (err, results) => {
    if (err) {
      console.error("❌ Fetch balance error:", err);
      return res.status(500).json({ error: "Database fetch failed" });
    }
    res.json({ data: results });
  });
});






app.get("/due-notice-balance", (req, res) => {
  const propertyOwnerId = req.query.propertyOwnerId;
  const sql = `
    SELECT 
      r.Roomid,
      rooms.RoomNo,
      r.Tenantid,
      tenants.Name AS TenantName,
      r.RentAmount,
      r.Paidamount,
      r.Balance,
      r.PaymentDate
    FROM tbl_Rent r
    JOIN tbl_Rooms rooms ON r.Roomid = rooms.Roomid
    JOIN tbl_Tenants tenants ON r.Tenantid = tenants.Tenantid
    WHERE r.propertyownerid = ?
      AND r.PaymentDate = CURDATE()
      AND r.Balance > 0
  `;
  db.query(sql, [propertyOwnerId], (err, results) => {
    if (err) {
      console.error("❌ Fetch balance error:", err);
      return res.status(500).json({ error: "Database fetch failed" });
    }
    res.json({ data: results });
  });
});





// app.get("/tenant-name", (req, res) => {
//   const propertyOwnerId = req.query.propertyOwnerId;
//   const sql = "SELECT DISTINCT TenantId, Name, RoomId FROM tbl_Tenants WHERE PropertyOwnerId = ?";
//   db.query(sql, [propertyOwnerId], (err, data) => {
//     if (err) {
//       console.error("❌ Fetch tenants error:", err);
//       return res.status(500).json({ error: "Database fetch failed" });
//     }
//     res.json({ data });
//   });
// });

app.get("/tenant-name", (req, res) => {
  const propertyOwnerId = req.query.propertyOwnerId;
  const sql = "SELECT DISTINCT TenantId, Name, RoomId FROM tbl_Tenants WHERE PropertyOwnerId = ? AND isDelete = 0";
  db.query(sql, [propertyOwnerId], (err, data) => {
    if (err) {
      console.error("❌ Fetch tenants error:", err);
      return res.status(500).json({ error: "Database fetch failed" });
    }
    res.json({ data });
  });
});











// ✅ Fixed Due Notices API based on your database structure
app.get("/get-due-notices", (req, res) => {
  const { propertyOwnerId, day } = req.query;

  if (!propertyOwnerId) {
    return res.status(400).json({
      success: false,
      message: "Property Owner ID is required",
    });
  }

  // Query based on start date matching with current day
  const sql = `
    SELECT DISTINCT
        t.TenantId,
        t.Name AS TenantName,
        r.RoomNo,
        t.RentAmount,
        COALESCE(
          (SELECT SUM(rent.PaidAmount) 
           FROM tbl_Rent rent 
           WHERE rent.TenantId = t.TenantId 
           AND MONTH(rent.PaymentDate) = MONTH(CURDATE())
           AND YEAR(rent.PaymentDate) = YEAR(CURDATE())), 
          0
        ) AS PaidAmount,
        (t.RentAmount - COALESCE(
          (SELECT SUM(rent.PaidAmount) 
           FROM tbl_Rent rent 
           WHERE rent.TenantId = t.TenantId 
           AND MONTH(rent.PaymentDate) = MONTH(CURDATE())
           AND YEAR(rent.PaymentDate) = YEAR(CURDATE())), 
          0
        )) AS DueAmount,
        (SELECT MAX(rent.PaymentDate) 
         FROM tbl_Rent rent 
         WHERE rent.TenantId = t.TenantId) AS LastPaymentDate,
        t.StartDate
    FROM tbl_Tenants t
    JOIN tbl_Rooms r ON t.RoomId = r.RoomId
    WHERE r.PropertyOwnerId = ?
    AND DAY(t.StartDate) = DAY(CURDATE())
    HAVING DueAmount > 0
    ORDER BY r.RoomNo ASC
  `;

  db.query(sql, [propertyOwnerId], (err, result) => {
    if (err) {
      console.error("Error fetching due notices:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err.message,
      });
    }

    res.json({
      success: true,
      data: result,
      message: result.length > 0
        ? `Found ${result.length} tenant(s) with due payments for today`
        : "No due payments for today",
    });
  });
});






// app.get("/get-room-details", (req, res) => {
//   const roomId = req.query.roomId;
//   const sql = "SELECT RoomId, RoomNo, Capacity, Status FROM tbl_Rooms WHERE RoomId = ?";
//   db.query(sql, [roomId], (err, results) => {
//     if (err) {
//       console.error("❌ Get room details error:", err);
//       return res.status(500).json({ error: "Database fetch failed" });
//     }
//     if (results.length === 0) {
//       return res.status(404).json({ error: "Room not found" });
//     }
//     res.json(results[0]);
//   });
// });

app.get("/get-tenants-by-room", (req, res) => {
  const roomId = req.query.roomId;
  const sql = "SELECT TenantId, Name, MobileNo, AadhaarCardNumber FROM tbl_Tenants WHERE RoomId = ?";
  db.query(sql, [roomId], (err, results) => {
    if (err) {
      console.error("❌ Get tenants by room error:", err);
      return res.status(500).json({ error: "Database fetch failed" });
    }
    res.json({ tenants: results });
  });
});

// app.post("/update-room-status", (req, res) => {
//   const { roomId, status } = req.body;
//   const sql = "UPDATE tbl_Rooms SET Status = ? WHERE RoomId = ?";
//   db.query(sql, [status, roomId], (err, results) => {
//     if (err) {
//       console.error("❌ Update room status error:", err);
//       return res.status(500).json({ error: "Database update failed" });
//     }
//     res.json({ message: "Room status updated successfully" });
//   });
// });



// REgister
app.get("/get-room-details", (req, res) => {
  const roomId = req.query.roomId;

  const sql = `
    SELECT RoomId, RoomNo, Capacity, Status,Address
    FROM tbl_Rooms
    WHERE RoomId = ?
  `;

  db.query(sql, [roomId], (err, results) => {
    if (err) {
      console.error("❌ Fetch room error:", err);
      return res.status(500).json({ error: "Database fetch failed" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    const room = results[0];
    res.json(room);
  });
});



app.post("/update-room-details", (req, res) => {
  const { roomId, roomNo, capacity, status, address } = req.body;
  const sql = "UPDATE tbl_Rooms SET RoomNo = ?, Capacity = ?, Status = ?, Address = ? WHERE RoomId = ?";
  db.query(sql, [roomNo, capacity, status, address, roomId], (err, result) => {
    if (err) {
      console.error("❌ Update room error:", err);
      return res.status(500).json({ error: "Database update failed" });
    }
    res.json({ message: "Room details updated successfully" });
  });
});



// POST instead of PUT (frontend-friendly for form submissions)
app.post("/update-tenant-details", async (req, res) => {
  const {
    TenantId,
    Name,
    MobileNo,
    RoomId,
    RentAmount,
    DepositAmount,
    Notes,
    IsRentAgreement,
    StartDate,
    EndDate,
    AadhaarCardNumber,
  } = req.body;

  if (!TenantId) {
    return res.status(400).json({ message: "TenantId is required" });
  }

  const sql = `
    UPDATE tbl_Tenants SET 
      Name = ?, 
      MobileNo = ?, 
      RoomId = ?, 
      RentAmount = ?, 
      DepositAmount = ?, 
      Notes = ?, 
      IsRentAgreement = ?, 
      StartDate = ?, 
      EndDate = ?, 
      AadhaarCardNumber = ?
    WHERE TenantId = ?;
  `;

  const params = [
    Name ?? null,
    MobileNo ?? null,
    RoomId ?? null,
    RentAmount ?? null,
    DepositAmount ?? null,
    Notes ?? null,
    IsRentAgreement ?? null,
    StartDate ?? null,
    EndDate ?? null,
    AadhaarCardNumber ?? null,
    TenantId,
  ];

  try {
    // Use db.query instead of pool.execute since you're using mysql2 connection
    db.query(sql, params, (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(409)
            .json({ message: "Duplicate value (MobileNo or AadhaarCardNumber)" });
        }
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      return res.json({ message: "Tenant updated successfully" });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Database error" });
  }
});






app.get("/get-tenant-details", (req, res) => {
  const tenantId = req.query.tenantId;
  const sql = `
    SELECT 
      t.TenantId,
      t.Name,
      t.MobileNo,
      t.AadhaarCardNumber,
      t.RoomId,
      t.RentAmount,
      t.DepositAmount,
      t.Notes,
      t.IsRentAgreement,
      DATE_FORMAT(t.StartDate, '%Y-%m-%d') AS StartDate,
      DATE_FORMAT(t.EndDate, '%Y-%m-%d') AS EndDate
    FROM tbl_Tenants t
    WHERE t.TenantId = ?
  `;
  db.query(sql, [tenantId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database fetch failed" });
    }
    res.json({ data: results[0] });
  });
});



app.post("/add-rent-slip", (req, res) => {
  const { roomId, tenantId, monthYear, rentAmount } = req.body;
  const sql = `
    INSERT INTO tbl_rent_slip_master (RoomId, TenantId, MonthYear, RentAmount)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [roomId, tenantId, monthYear, rentAmount], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database insert failed" });
    }
    res.json({ message: "Rent slip saved successfully", rentSlipId: result.insertId });
  });
});


// app.get("/balance-report/:propertyOwnerId", (req, res) => {
//   const propertyOwnerId = req.params.propertyOwnerId;
//   const { roomId, tenantId, fromDate, toDate } = req.query;

//   console.log('Balance report request:', { propertyOwnerId, roomId, tenantId, fromDate, toDate });

//   // Build dynamic WHERE conditions
//   let whereConditions = ["r.PropertyOwnerId = ?"];
//   let queryParams = [propertyOwnerId];

//   if (roomId && roomId !== 'all') {
//     whereConditions.push("t.RoomId = ?");
//     queryParams.push(roomId);
//   }

//   if (tenantId && tenantId !== 'all') {
//     whereConditions.push("t.TenantId = ?");
//     queryParams.push(tenantId);
//   }

//   const whereClause = whereConditions.join(" AND ");

//   // Simple query without complex date filtering for now
//   const sql = `
//     SELECT 
//         t.TenantId,
//         t.Name AS TenantName,
//         r.RoomNo,
//         t.RentAmount,
//         t.DepositAmount,
//         COALESCE(
//             (SELECT SUM(rent.PaidAmount) 
//              FROM tbl_Rent rent 
//              WHERE rent.TenantId = t.TenantId
//             ), 0
//         ) AS PaidAmount,
//         (t.RentAmount - COALESCE(
//             (SELECT SUM(rent.PaidAmount) 
//              FROM tbl_Rent rent 
//              WHERE rent.TenantId = t.TenantId
//             ), 0
//         )) AS BalanceAmount,
//         t.StartDate,
//         (SELECT MAX(rent.PaymentDate) 
//          FROM tbl_Rent rent 
//          WHERE rent.TenantId = t.TenantId) AS LastPaymentDate
//     FROM tbl_Tenants t
//     JOIN tbl_Rooms r ON t.RoomId = r.RoomId
//     WHERE ${whereClause}
//     ORDER BY r.RoomNo ASC, t.Name ASC
//   `;

//   console.log('SQL Query:', sql);
//   console.log('Query Params:', queryParams);

//   db.query(sql, queryParams, (err, result) => {
//     if (err) {
//       console.error("Error fetching balance report:", err);
//       return res.status(500).json({
//         success: false,
//         message: "Database error",
//         error: err.message,
//       });
//     }

//     console.log('Balance report result:', result);

//     // Calculate summary statistics
//     const totalRent = result.reduce((sum, record) => sum + (record.RentAmount || 0), 0);
//     const totalPaid = result.reduce((sum, record) => sum + (record.PaidAmount || 0), 0);
//     const totalBalance = result.reduce((sum, record) => sum + (record.BalanceAmount || 0), 0);
//     const totalDeposit = result.reduce((sum, record) => sum + (record.DepositAmount || 0), 0);

//     res.json({
//       success: true,
//       data: result,
//       summary: {
//         totalRecords: result.length,
//         totalRent: totalRent,
//         totalPaid: totalPaid,
//         totalBalance: totalBalance,
//         totalDeposit: totalDeposit
//       },
//       message: result.length > 0
//         ? `Found ${result.length} balance record(s)`
//         : "No balance records found",
//     });
//   });
// });




// In your backend (Node.js/Express example)

// app.get("/balance-report/:propertyOwnerId", (req, res) => {
//   const propertyOwnerId = req.params.propertyOwnerId;
//   const { roomId, tenantId, fromDate, toDate } = req.query;

//   console.log("Balance report request:", { propertyOwnerId, roomId, tenantId, fromDate, toDate });

//   // Dynamic WHERE conditions
//   let whereConditions = ["t.PropertyOwnerId = ?"];
//   let queryParams = [propertyOwnerId];

//   if (roomId && roomId !== "all") {
//     whereConditions.push("r.RoomId = ?");
//     queryParams.push(roomId);
//   }

//   if (tenantId && tenantId !== "all") {
//     whereConditions.push("r.TenantId = ?");
//     queryParams.push(tenantId);
//   }

//   if (fromDate && toDate) {
//     whereConditions.push("r.PaymentDate BETWEEN ? AND ?");
//     queryParams.push(fromDate, toDate);
//   } else if (fromDate) {
//     whereConditions.push("r.PaymentDate >= ?");
//     queryParams.push(fromDate);
//   } else if (toDate) {
//     whereConditions.push("r.PaymentDate <= ?");
//     queryParams.push(toDate);
//   }

//   const whereClause = whereConditions.join(" AND ");

//   const sql = `
//     SELECT 
//         t.TenantId,
//         t.Name AS TenantName,
//         r.RoomId,
//         t.DepositAmount,
//         r.RentAmount,
//         r.PaidAmount,
//         r.Balance,
//         r.PaymentDate,
//         r.PaymentMethod
//     FROM tbl_Tenants t
//     JOIN tbl_Rent r ON t.TenantId = r.TenantId
//     WHERE ${whereClause}
//     ORDER BY r.PaymentDate DESC
//   `;

//   console.log("SQL Query:", sql);
//   console.log("Query Params:", queryParams);

//   db.query(sql, queryParams, (err, result) => {
//     if (err) {
//       console.error("❌ Error fetching balance report:", err);
//       return res.status(500).json({
//         success: false,
//         message: "Database error",
//         error: err.message,
//       });
//     }

//     // Summary calculation
//     const totalRent = result.reduce((sum, r) => sum + (r.RentAmount || 0), 0);
//     const totalPaid = result.reduce((sum, r) => sum + (r.PaidAmount || 0), 0);
//     const totalBalance = result.reduce((sum, r) => sum + (r.Balance || 0), 0);
//     const totalDeposit = result.reduce((sum, r) => sum + (r.DepositAmount || 0), 0);

//     res.json({
//       success: true,
//       data: result,
//       summary: {
//         totalRecords: result.length,
//         totalRent,
//         totalPaid,
//         totalBalance,
//         totalDeposit,
//       },
//     });
//   });
// });
app.get("/balance-report/:propertyOwnerId", (req, res) => {
  const propertyOwnerId = req.params.propertyOwnerId;
  const { roomId, tenantId, fromDate, toDate } = req.query;

  console.log("Balance report request:", {
    propertyOwnerId,
    roomId,
    tenantId,
    fromDate,
    toDate,
  });

  // Build dynamic WHERE conditions
  let whereConditions = ["t.PropertyOwnerId = ?"];
  let queryParams = [propertyOwnerId];

  if (roomId && roomId !== "all") {
    whereConditions.push("r.RoomId = ?");
    queryParams.push(roomId);
  }

  if (tenantId && tenantId !== "all") {
    whereConditions.push("r.TenantId = ?");
    queryParams.push(tenantId);
  }

  if (fromDate && toDate) {
    whereConditions.push("DATE(r.PaymentDate) BETWEEN ? AND ?");
    queryParams.push(fromDate, toDate);
  }

  const whereClause = whereConditions.join(" AND ");

  const sql = `
    SELECT 
        t.TenantId,
        t.Name AS TenantName,
        r.RoomId,
        t.DepositAmount,
        r.RentAmount,
        r.PaidAmount,
        r.Balance,
        DATE_FORMAT(r.PaymentDate, '%Y-%m-%d') AS PaymentDate, -- 👈 Fix applied here
        r.PaymentMethod
    FROM tbl_Tenants t
    JOIN tbl_Rent r ON t.TenantId = r.TenantId
    WHERE ${whereClause}
    ORDER BY r.PaymentDate DESC
  `;

  console.log("SQL Query:", sql);
  console.log("Query Params:", queryParams);

  db.query(sql, queryParams, (err, result) => {
    if (err) {
      console.error("Error fetching balance report:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err.message,
      });
    }

    console.log("Balance report result:", result);

    // Calculate summary statistics
    const totalRent = result.reduce(
      (sum, record) => sum + (parseFloat(record.RentAmount) || 0),
      0
    );
    const totalPaid = result.reduce(
      (sum, record) => sum + (parseFloat(record.PaidAmount) || 0),
      0
    );
    const totalBalance = result.reduce(
      (sum, record) => sum + (parseFloat(record.Balance) || 0),
      0
    );
    const totalDeposit = result.reduce(
      (sum, record) => sum + (parseFloat(record.DepositAmount) || 0),
      0
    );

    res.json({
      success: true,
      data: result,
      summary: {
        totalRecords: result.length,
        totalRent,
        totalPaid,
        totalBalance,
        totalDeposit,
      },
      message:
        result.length > 0
          ? `Found ${result.length} balance record(s)`
          : "No balance records found",
    });
  });
});





app.get("/fetch-month-year", (req, res) => {
  const { roomId, tenantId } = req.query;

  const sql = "SELECT MonthYear FROM tbl_rent_slip_master WHERE roomid = ? AND tenantid = ?";

  db.query(sql, [roomId, tenantId], (err, results) => {
    if (err) {
      console.error("❌ Fetch month-year error:", err);
      return res.status(500).json({ error: "Database fetch failed" });
    }
    res.json({ success: true, data: results });
  });
});

app.post('/delete-room', (req, res) => {
  const { roomId } = req.body; // POST → read from body instead of query
  if (!roomId) {
    return res.status(400).json({ error: 'Missing roomId' });
  }

  const sql = 'UPDATE tbl_Rooms SET IsDelete = 1 WHERE RoomId = ?';

  db.query(sql, [roomId], (err, result) => {
    if (err) {
      console.error("❌ Delete room error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: 'Room deleted successfully' });
  });
});


app.post('/delete-tenant', (req, res) => {
  const { tenantId } = req.body; // POST → read from body
  if (!tenantId) {
    return res.status(400).json({ error: 'Missing tenantId' });
  }

  const sql = 'UPDATE tbl_Tenants SET IsDelete = 1 WHERE TenantId = ?';

  db.query(sql, [tenantId], (err, result) => {
    if (err) {
      console.error("❌ Delete tenant error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: 'Tenant deleted successfully' });
  });
});


// ✅ Test API route
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});


// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


