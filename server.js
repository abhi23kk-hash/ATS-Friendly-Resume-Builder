const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
    secret: 'ats_secret_key_12345',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);

// Helper for Database Access
const { readDB } = require('./database/db');

// Dashboard Stats
app.get('/api/user/stats', (req, res) => {

    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {

        const db = readDB();
        const userResumes = db.resumes.filter(r => r.userId === req.session.userId);

        const totalResumes = userResumes.length;
        const totalDownloads = userResumes.reduce((sum, r) => sum + (r.downloads || 0), 0);
        const totalScore = userResumes.reduce((sum, r) => sum + (r.score || 0), 0);

        const atsScoreAvg = totalResumes > 0
            ? Math.round(totalScore / totalResumes)
            : 0;

        const profileViews =
            userResumes.length * Math.floor((Math.random() * 5) + 3) || 5;

        res.json({
            resumesCreated: totalResumes,
            downloads: totalDownloads,
            profileViews: profileViews,
            atsScoreAvg: atsScoreAvg
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Serve frontend files
app.use(express.static(path.join(__dirname)));

// Safe fallback route


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});