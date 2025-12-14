const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Test email connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email server connection failed:', error.message);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

const contactController = {
    sendContactMessage: async (req, res) => {
        try {
            const { name, email, subject, message } = req.body;

            // Validation
            if (!name || !email || !subject || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required.'
                });
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid email address.'
                });
            }

            // Email to website owner
            const ownerMailOptions = {
                from: `"Portfolio Contact" <${process.env.EMAIL_FROM}>`,
                to: process.env.EMAIL_TO,
                replyTo: email,
                subject: `New Contact: ${subject}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #0a192f; color: #64ffda; padding: 20px; text-align: center;">
                            <h1>New Contact Form Submission</h1>
                        </div>
                        <div style="padding: 30px; background: #f9f9f9;">
                            <p><strong>From:</strong> ${name} (${email})</p>
                            <p><strong>Subject:</strong> ${subject}</p>
                            <p><strong>Message:</strong></p>
                            <div style="background: white; padding: 15px; border-left: 4px solid #64ffda; margin: 15px 0;">
                                ${message.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                            <p>Received: ${new Date().toLocaleString()}</p>
                        </div>
                    </div>
                `,
                text: `
New Contact Form Submission

From: ${name} (${email})
Subject: ${subject}

Message:
${message}

---
Received: ${new Date().toLocaleString()}
                `
            };

            // Send email to owner
            await transporter.sendMail(ownerMailOptions);

            // Confirmation email to user
            const userMailOptions = {
                from: `"Joshua Muorongole" <${process.env.EMAIL_FROM}>`,
                to: email,
                subject: 'Thank you for contacting me!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #0a192f; color: #64ffda; padding: 20px; text-align: center;">
                            <h1>Message Received!</h1>
                        </div>
                        <div style="padding: 30px; background: #f9f9f9;">
                            <p>Hello ${name},</p>
                            <p>Thank you for reaching out through my portfolio website. I have received your message regarding <strong>"${subject}"</strong>.</p>
                            <p>I will review your message and respond as soon as possible, typically within 24-48 hours.</p>
                            <p>Best regards,</p>
                            <p style="color: #0a192f; font-weight: bold;">
                                Joshua Muorongole<br>
                                Cybersecurity Specialist
                            </p>
                        </div>
                        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                            <p>This is an automated confirmation. Please do not reply to this email.</p>
                        </div>
                    </div>
                `
            };

            await transporter.sendMail(userMailOptions);

            res.status(200).json({
                success: true,
                message: 'Message sent successfully! I will get back to you soon.'
            });

        } catch (error) {
            console.error('Error sending contact message:', error);
            
            let errorMessage = 'Failed to send message. Please try again later.';
            
            if (error.code === 'EAUTH') {
                errorMessage = 'Email configuration error. Please contact the site administrator.';
            }

            res.status(500).json({
                success: false,
                message: errorMessage
            });
        }
    },

    testEndpoint: (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Contact API is working!',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    }
};

module.exports = contactController;