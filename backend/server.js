require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error("❌ MySQL Connection Failed!");
        console.error(err.message);
        return;
    }
    console.log("✅ MySQL Connected Successfully!");
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error) => {
    if (error) {
        console.error("❌ Email Server Error!");
        console.error(error.message);
    } else {
        console.log("✅ Email Server Ready!");
    }
});

app.get("/", (req, res) => {
    res.status(200).send("Job Portal Backend is Running!");
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Backend server is connected!",
        port: PORT
    });
});

app.post("/api/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({
            success: false,
            message: "All fields are required!"
        });
    }

    if (role !== "jobseeker" && role !== "employer") {
        return res.status(400).json({
            success: false,
            message: "Invalid role!"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const sql = `
            INSERT INTO users
            (name, email, password, role, is_verified, verification_token)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                name,
                email,
                hashedPassword,
                role,
                0,
                verificationToken
            ],
            async (err) => {
                if (err) {
                    console.error("REGISTER DB ERROR:", err);

                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({
                            success: false,
                            message: "Email already registered!"
                        });
                    }

                    return res.status(500).json({
                        success: false,
                        message: "Registration failed!"
                    });
                }

                const verificationLink =
                    `http://localhost:${PORT}/api/verify-email?token=${verificationToken}`;

                try {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: "Welcome to JobPortal - Verify Your Email",
                        html: `
                            <h2>Welcome to JobPortal!</h2>
                            <p>Hello ${name},</p>
                            <p>Please verify your email by clicking below:</p>
                            <a href="${verificationLink}">Verify Email</a>
                        `
                    });

                    return res.json({
                        success: true,
                        message:
                            "Registration successful! Please verify your email."
                    });
                } catch (emailError) {
                    console.error(
                        "Email sending failed:",
                        emailError.message
                    );

                    return res.json({
                        success: true,
                        message: "Registration successful!"
                    });
                }
            }
        );
    } catch (error) {
        console.error("REGISTER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Registration failed!"
        });
    }
});

app.get("/api/verify-email", (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send(
            "Invalid verification link"
        );
    }

    const sql = `
        UPDATE users
        SET
            is_verified = 1,
            verification_token = NULL
        WHERE verification_token = ?
    `;

    db.query(sql, [token], (err, result) => {
        if (err) {
            console.error(
                "EMAIL VERIFICATION ERROR:",
                err
            );

            return res.status(500).send(
                "Verification failed"
            );
        }

        if (result.affectedRows === 0) {
            return res.send(
                "Invalid or expired verification link"
            );
        }

        res.send(`
            <h1>Email Verified Successfully! ✅</h1>
            <p>You can now login to JobPortal.</p>
        `);
    });
});

/*
=====================================================
LOGIN
=====================================================
*/

app.post("/api/login", (req, res) => {
    const {
        email,
        password,
        role
    } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({
            success: false,
            message:
                "Email, password and role are required!"
        });
    }

    const sql = `
        SELECT
            id,
            name,
            email,
            password,
            role,
            is_verified
        FROM users
        WHERE email = ?
        AND role = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [email, role],
        async (err, results) => {

            if (err) {
                console.error(
                    "LOGIN DB ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Login failed!"
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid email, password or role!"
                });
            }

            const user = results[0];

            if (!user.is_verified) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Please verify your email first!"
                });
            }

            try {
                const passwordMatch =
                    await bcrypt.compare(
                        password,
                        user.password
                    );

                if (!passwordMatch) {
                    return res.status(401).json({
                        success: false,
                        message:
                            "Invalid email or password!"
                    });
                }

                /*
                =================================================
                GENERATE OTP
                =================================================
                */

                const otp =
                    Math.floor(
                        100000 +
                        Math.random() * 900000
                    ).toString();

                const otpHash =
                    crypto
                        .createHash("sha256")
                        .update(otp)
                        .digest("hex");

                const expiresAt =
                    new Date(
                        Date.now() +
                        3 * 60 * 1000
                    );

                const otpSql = `
                    INSERT INTO otp_verifications
                    (
                        user_id,
                        otp_hash,
                        expires_at,
                        attempts,
                        verified
                    )
                    VALUES (?, ?, ?, 0, 0)
                `;

                db.query(
                    otpSql,
                    [
                        user.id,
                        otpHash,
                        expiresAt
                    ],
                    async (otpError) => {

                        if (otpError) {
                            console.error(
                                "OTP DB ERROR:",
                                otpError
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "OTP generation failed!"
                            });
                        }

                        try {
                            await transporter.sendMail({
                                from:
                                    process.env.EMAIL_USER,

                                to:
                                    user.email,

                                subject:
                                    "JobPortal Login OTP",

                                html: `
                                    <div style="
                                        font-family: Arial;
                                        padding: 20px;
                                    ">
                                        <h2>
                                            JobPortal Login Verification
                                        </h2>

                                        <p>
                                            Hello ${user.name},
                                        </p>

                                        <p>
                                            Your OTP for login is:
                                        </p>

                                        <h1 style="
                                            letter-spacing: 8px;
                                        ">
                                            ${otp}
                                        </h1>

                                        <p>
                                            This OTP is valid
                                            for <b>3 minutes</b>.
                                        </p>

                                        <p>
                                            Do not share this OTP
                                            with anyone.
                                        </p>
                                    </div>
                                `
                            });

                            console.log(
                                "OTP sent to:",
                                user.email
                            );

                            /*
                            IMPORTANT:
                            Do NOT return data.user here.
                            The user must verify OTP first.
                            */

                            return res.json({

    success: true,

    requiresOtp: true,

    userId: user.id,

    email: user.email,

    role: user.role,

    expiresAt: expiresAt.getTime(),

    message:
        "OTP sent to your registered email!"

});

                        } catch (emailError) {
                            console.error(
                                "OTP EMAIL ERROR:",
                                emailError
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Unable to send OTP email!"
                            });
                        }
                    }
                );

            } catch (passwordError) {
                console.error(
                    "PASSWORD CHECK ERROR:",
                    passwordError
                );

                return res.status(500).json({
                    success: false,
                    message: "Login failed!"
                });
            }
        }
    );
});

/*
=====================================================
VERIFY OTP
=====================================================
*/

app.post("/api/verify-otp", (req, res) => {

    const {
        userId,
        otp
    } = req.body;

    if (!userId || !otp) {
        return res.status(400).json({
            success: false,
            message:
                "User ID and OTP are required!"
        });
    }

    const otpHash =
        crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

    const sql = `
        SELECT *
        FROM otp_verifications
        WHERE user_id = ?
        AND otp_hash = ?
        AND expires_at > NOW()
        AND verified = 0
        ORDER BY id DESC
        LIMIT 1
    `;

    db.query(
        sql,
        [userId, otpHash],
        (err, results) => {

            if (err) {
                console.error(
                    "OTP VERIFICATION ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "OTP verification failed!"
                });
            }

            if (results.length === 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid or expired OTP!"
                });
            }

            const otpRecord = results[0];

            const updateSql = `
                UPDATE otp_verifications
                SET verified = 1
                WHERE id = ?
            `;

            db.query(
                updateSql,
                [otpRecord.id],
                (updateError) => {

                    if (updateError) {
                        console.error(
                            "OTP UPDATE ERROR:",
                            updateError
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "OTP update failed!"
                        });
                    }

                    const userSql = `
                        SELECT
                            id,
                            name,
                            email,
                            role
                        FROM users
                        WHERE id = ?
                        LIMIT 1
                    `;

                    db.query(
                        userSql,
                        [userId],
                        (
                            userError,
                            userResults
                        ) => {

                            if (
                                userError ||
                                userResults.length === 0
                            ) {
                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "User not found!"
                                });
                            }

                            const user =
                                userResults[0];

                            return res.json({
                                success: true,
                                message:
                                    "OTP verified successfully!",
                                user: {
                                    id: user.id,
                                    name: user.name,
                                    email: user.email,
                                    role: user.role
                                }
                            });
                        }
                    );
                }
            );
        }
    );
});

      
    app.post("/api/jobs", (req, res) => {

    console.log("🔥 POST /api/jobs HIT");

    const {
        employer_id,
        title,
        company,
        location,
        salary,
        type,
        description
    } = req.body;

    console.log("📦 JOB DATA:", req.body);

    if (
        !employer_id ||
        !title ||
        !company ||
        !location ||
        !salary ||
        !type ||
        !description
    ) {
        return res.status(400).json({
            success: false,
            message: "All job fields are required!"
        });
    }

    const sql = `
        INSERT INTO jobs
        (
            employer_id,
            title,
            company,
            location,
            salary,
            type,
            description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            employer_id,
            title,
            company,
            location,
            salary,
            type,
            description
        ],
        (err, result) => {

            if (err) {
                console.error("❌ JOB INSERT ERROR:", err);

                return res.status(500).json({
                    success: false,
                    message: err.sqlMessage || err.message
                });
            }

            console.log("✅ JOB INSERTED:", result.insertId);

            return res.status(201).json({
                success: true,
                message: "Job posted successfully!",
                jobId: result.insertId
            });
        }
    );
});
    // ==========================================
// UPDATE JOB
// ==========================================
app.put("/api/jobs/:id", (req, res) => {

    console.log("🔥 PUT /api/jobs/:id HIT");
    console.log("JOB ID:", req.params.id);
    console.log("UPDATE DATA:", req.body);

    const { id } = req.params;

    const {
        title,
        company,
        location,
        salary,
        type,
        description
    } = req.body;

    if (
        !title ||
        !company ||
        !location ||
        !salary ||
        !type ||
        !description
    ) {
        return res.status(400).json({
            success: false,
            message: "All job fields are required!"
        });
    }

    const sql = `
        UPDATE jobs
        SET
            title = ?,
            company = ?,
            location = ?,
            salary = ?,
            type = ?,
            description = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            title,
            company,
            location,
            salary,
            type,
            description,
            id
        ],
        (err, result) => {

            if (err) {
                console.error("❌ UPDATE JOB ERROR:", err);

                return res.status(500).json({
                    success: false,
                    message: err.sqlMessage || err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Job not found!"
                });
            }

            console.log("✅ JOB UPDATED:", id);

            return res.status(200).json({
                success: true,
                message: "Job updated successfully!"
            });
        }
    );
});
    
    
 // ==========================================
// DELETE JOB
// ==========================================
app.delete("/api/jobs/:id", (req, res) => {

    console.log("🔥 DELETE /api/jobs/:id HIT");

    const { id } = req.params;

    const sql = `
        DELETE FROM jobs
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error("❌ DELETE JOB ERROR:", err);

            return res.status(500).json({
                success: false,
                message: err.sqlMessage || err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Job not found!"
            });
        }

        console.log("✅ JOB DELETED:", id);

        return res.status(200).json({
            success: true,
            message: "Job deleted successfully!"
        });
    });
});   


// ==========================================
// GET ALL APPLICATIONS
// ==========================================
app.get("/api/applications", (req, res) => {

    const sql = `
        SELECT
            a.id,
            a.user_id,
            a.job_id,
            a.status,
            a.applied_at,

            j.employer_id AS employer_id,
            j.title AS job_title,
            j.company,
            j.location,
            j.salary,
            j.type,

            u.name,
            u.email

        FROM applications a

        LEFT JOIN jobs j
            ON a.job_id = j.id

        LEFT JOIN users u
            ON a.user_id = u.id

        ORDER BY a.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("GET APPLICATIONS ERROR:", err);

            return res.status(500).json({
                success: false,
                message: err.sqlMessage || err.message
            });
        }

        console.log("APPLICATIONS FROM DATABASE:");
        console.log(results);

        res.json({
            success: true,
            applications: results
        });
    });
});
           
/*
=====================================================
GET ALL JOBS
=====================================================
*/

app.get("/api/jobs", (req, res) => {

    const sql = `
        SELECT
            id,
            employer_id,
            title,
            company,
            location,
            salary,
            type,
            description
        FROM jobs
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error("GET JOBS ERROR:", err);

            return res.status(500).json({
                success: false,
                message: err.sqlMessage || err.message
            });
        }

        res.json({
            success: true,
            jobs: results
        });

    });

});
           
/*
=====================================================
GET ALL JOBS
=====================================================
*/

app.get("/api/jobs", (req, res) => {

    const sql = `
        SELECT
            id,
            employer_id,
            title,
            company,
            location,
            salary,
            type,
            description
        FROM jobs
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error("GET JOBS ERROR:", err);

            return res.status(500).json({
                success: false,
                message: err.sqlMessage || err.message
            });
        }

        res.json({
            success: true,
            jobs: results
        });

    });

});
           


                

/*
=====================================================
APPLY FOR JOB
=====================================================
*/

app.post("/api/applications", (req, res) => {

    const {
        job_id,
        user_id
    } = req.body;

    if (!job_id || !user_id) {
        return res.status(400).json({
            success: false,
            message:
                "Job ID and User ID are required!"
        });
    }

    const checkSql = `
        SELECT id
        FROM applications
        WHERE job_id = ?
        AND user_id = ?
        LIMIT 1
    `;

    db.query(
        checkSql,
        [job_id, user_id],
        (err, results) => {

            if (err) {
                console.error(
                    "APPLICATION CHECK ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Database error!"
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "You have already applied for this job!"
                });
            }

            const insertSql = `
                INSERT INTO applications
                (
                    job_id,
                    user_id,
                    status
                )
                VALUES (?, ?, ?)
            `;

            db.query(
                insertSql,
                [
                    job_id,
                    user_id,
                    "Pending"
                ],
                (
                    insertError,
                    result
                ) => {

                    if (insertError) {
                        console.error(
                            "APPLICATION INSERT ERROR:",
                            insertError
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to apply for job!"
                        });
                    }

                    res.json({
                        success: true,
                        message:
                            "Application submitted successfully!",
                        applicationId:
                            result.insertId
                    });
                }
            );
        }
    );
});

/*
=====================================================
GET EMPLOYER APPLICATIONS
=====================================================
*/

app.get(
    "/api/applications/employer/:employerId",
    (req, res) => {

        const employerId =
            req.params.employerId;

        const sql = `
            SELECT
                a.id AS id,
                a.job_id AS job_id,
                a.user_id AS user_id,
                a.status AS status,
                a.applied_at AS applied_at,

                u.name AS name,
                u.email AS email,
                u.about AS about,
                u.phone AS phone,

                j.title AS title,
                j.company AS company,
                j.location AS location,
                j.salary AS salary,
                j.type AS type

            FROM applications AS a

            LEFT JOIN users AS u
                ON a.user_id = u.id

            LEFT JOIN jobs AS j
                ON a.job_id = j.id

            WHERE j.employer_id = ?

            ORDER BY a.applied_at DESC
        `;

        db.query(
            sql,
            [employerId],
            (err, results) => {

                if (err) {
                    console.error(
                        "EMPLOYER APPLICATIONS ERROR:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to fetch applications!",
                        error:
                            err.message
                    });
                }

                res.json({
                    success: true,
                    applications:
                        results
                });
            }
        );
    }
);

/*
=====================================================
GET APPLICATION DETAILS
=====================================================
*/

app.get(
    "/api/applications/:id",
    (req, res) => {

        const applicationId =
            req.params.id;

        const sql = `
            SELECT
                a.id AS id,
                a.job_id AS job_id,
                a.user_id AS user_id,
                a.status AS status,
                a.applied_at AS applied_at,

                u.name AS name,
                u.email AS email,
                u.about AS about,
                u.phone AS phone,

                j.title AS title,
                j.company AS company,
                j.location AS location,
                j.salary AS salary,
                j.type AS type

            FROM applications AS a

            LEFT JOIN users AS u
                ON a.user_id = u.id

            LEFT JOIN jobs AS j
                ON a.job_id = j.id

            WHERE a.id = ?

            LIMIT 1
        `;

        db.query(
            sql,
            [applicationId],
            (err, results) => {

                if (err) {
                    console.error(
                        "APPLICATION DETAILS ERROR:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to fetch application!",
                        error:
                            err.message
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Application not found!"
                    });
                }

                res.json(results[0]);
            }
        );
    }
);

/*
=====================================================
MY APPLICATIONS
=====================================================
*/

app.get(
    "/api/applications/user/:userId",
    (req, res) => {

        const userId =
            req.params.userId;

        const sql = `
            SELECT
                a.id AS id,
                a.job_id AS job_id,
                a.user_id AS user_id,
                a.status AS status,
                a.applied_at AS applied_at,

                j.title AS title,
                j.company AS company,
                j.location AS location,
                j.salary AS salary,
                j.type AS type

            FROM applications AS a

            LEFT JOIN jobs AS j
                ON a.job_id = j.id

            WHERE a.user_id = ?

            ORDER BY a.applied_at DESC
        `;

        db.query(
            sql,
            [userId],
            (err, results) => {

                if (err) {
                    console.error(
                        "MY APPLICATIONS ERROR:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to fetch your applications!"
                    });
                }

                res.json(results);
            }
        );
    }
);

/*
=====================================================
UPDATE APPLICATION STATUS
=====================================================
*/

app.put(
    "/api/applications/:id/status",
    (req, res) => {

        const applicationId =
            req.params.id;

        const {
            status
        } = req.body;

        const allowedStatuses = [
    "Pending",
    "Shortlisted",
    "Rejected",
    "Hired"
];

        if (
            !allowedStatuses.includes(
                status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid application status!"
            });
        }

        const sql = `
            UPDATE applications
            SET status = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                status,
                applicationId
            ],
            (err, result) => {

                if (err) {
                    console.error(
                        "STATUS UPDATE ERROR:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Status update failed!"
                    });
                }

                if (
                    result.affectedRows === 0
                ) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Application not found!"
                    });
                }

                res.json({
                    success: true,
                    message:
                        "Application status updated successfully!",
                    status:
                        status
                });
            }
        );
    }
);

/*
=====================================================
SEND MESSAGE
=====================================================
*/

app.post(
    "/api/messages",
    (req, res) => {

        const {
            sender_id,
            receiver_id,
            message
        } = req.body;

        if (
            !sender_id ||
            !receiver_id ||
            !message ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "All message fields are required!"
            });
        }

        if (
            Number(sender_id) ===
            Number(receiver_id)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot message yourself!"
            });
        }

        const sql = `
            INSERT INTO messages
            (
                sender_id,
                receiver_id,
                message
            )
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [
                sender_id,
                receiver_id,
                message.trim()
            ],
            (err, result) => {

                if (err) {
                    console.error(
                        "MESSAGE SEND ERROR:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to send message!"
                    });
                }

                res.json({
                    success: true,
                    message:
                        "Message sent successfully!",
                    messageId:
                        result.insertId
                });
            }
        );
    }
);

/*
=====================================================
GET CONVERSATION
=====================================================
*/

app.get(
    "/api/messages/:userId/:otherUserId",
    (req, res) => {

        const {
            userId,
            otherUserId
        } = req.params;

        const sql = `
            SELECT
                m.id,
                m.sender_id,
                m.receiver_id,
                m.message,
                m.sent_at,

                sender.name AS sender_name,
                receiver.name AS receiver_name

            FROM messages AS m

            LEFT JOIN users AS sender
                ON m.sender_id = sender.id

            LEFT JOIN users AS receiver
                ON m.receiver_id = receiver.id

            WHERE
                (
                    m.sender_id = ?
                    AND
                    m.receiver_id = ?
                )

                OR

                (
                    m.sender_id = ?
                    AND
                    m.receiver_id = ?
                )

            ORDER BY m.sent_at ASC
        `;

        db.query(
            sql,
            [
                userId,
                otherUserId,
                otherUserId,
                userId
            ],
            (err, results) => {

                if (err) {
                    console.error(
                        "MESSAGE FETCH ERROR:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to fetch messages!"
                    });
                }

                res.json({
                    success: true,
                    messages:
                        results
                });
            }
        );
    }
);


const PORT = 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("================================");
    console.log("JOB PORTAL BACKEND STARTED");
    console.log(`Local: http://localhost:${PORT}`);
    console.log("================================");
});

app.on("error", (error) => {
    console.error(
        "❌ SERVER START ERROR:",
        error
    );
});

process.on(
    "uncaughtException",
    (error) => {
        console.error(
            "❌ UNCAUGHT EXCEPTION:",
            error
        );
    }
);

process.on(
    "unhandledRejection",
    (error) => {
        console.error(
            "❌ UNHANDLED REJECTION:",
            error
        );
    }
);