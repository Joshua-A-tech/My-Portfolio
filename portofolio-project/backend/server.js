const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const contactRoutes = require('./routes/contact');

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5500',
      'http://localhost:3000',
      'https://portfolio-frontend.onrender.com'  // Your Render frontend URL
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/contact', contactRoutes);

// Serve resume file
app.get('/api/download/resume', (req, res) => {
  // In production, you might want to serve from cloud storage
  if (process.env.NODE_ENV === 'production') {
    // Option 1: Redirect to cloud storage URL
    // return res.redirect(process.env.RESUME_URL);
    
    // Option 2: Serve locally (file must be in backend directory)
    const resumePath = path.join(__dirname, 'public/resume.pdf');
    res.download(resumePath, 'Joshua_Muorongole_Resume.pdf');
  } else {
    // Development: Serve from frontend folder
    const resumePath = path.join(__dirname, '../frontend/assets/downloads/My_resume.pdf');
    res.download(resumePath, 'Joshua_Muorongole_Resume.pdf');
  }
});

// Serve video file (Note: 106MB video - consider cloud storage)
app.get('/api/video/:filename', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    // In production, serve from cloud storage (recommended)
    // return res.redirect(`${process.env.VIDEO_CDN_URL}/${req.params.filename}`);
    
    // Or serve locally (not recommended for large files on Render free tier)
    const videoPath = path.join(__dirname, 'public/videos', req.params.filename);
    res.sendFile(videoPath);
  } else {
    // Development
    const videoPath = path.join(__dirname, `../frontend/assets/videos/${req.params.filename}`);
    res.sendFile(videoPath);
  }
});

// Health check endpoint (required by Render)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Portfolio Backend API', 
    status: 'running',
    endpoints: {
      contact: '/api/contact',
      resume: '/api/download/resume',
      health: '/api/health',
      video: '/api/video/:filename'
    }
  });
});

// Only serve frontend in development
if (process.env.NODE_ENV === 'development') {
  app.use(express.static(path.join(__dirname, '../frontend')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});