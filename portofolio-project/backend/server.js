const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const contactRoutes = require('./routes/contact');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5500',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/contact', contactRoutes);

// Serve resume file
app.get('/download/resume', (req, res) => {
    const resumePath = path.join(__dirname, '../frontend/downloads/My_resume.pdf');
    res.download(resumePath, 'Joshua_Muorongole_Resume.pdf');
});

// Serve video file
app.get('/video/:filename', (req, res) => {
    const videoPath = path.join(__dirname, `../frontend/assets/videos/${req.params.filename}`);
    res.sendFile(videoPath);
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`📧 Contact endpoint: http://localhost:${PORT}/api/contact/send`);
});