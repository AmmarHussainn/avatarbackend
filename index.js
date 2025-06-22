const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Mongoose Schema for Chat Message
const chatMessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['user', 'avatar'],
  },
  mode: {
    type: String,
    required: true,
    enum: ['text_mode', 'voice_mode'],
  },
  timestamp: {
    type: Date,
    required: true,
  },
});

// Mongoose Schema for Job
const jobSchema = new mongoose.Schema({
  business: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Business name must be at least 2 characters long'],
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Job title must be at least 2 characters long'],
  },
  startDate: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{2}$/, 'Start date must be in YYYY-MM format'],
  },
  endDate: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return value === 'present' || /^\d{4}-\d{2}$/.test(value);
      },
      message: 'End date must be in YYYY-MM format or "present"',
    },
  },
  payAmount: {
    type: Number,
    required: true,
    min: [0, 'Pay amount must be a positive number'],
  },
  payFrequency: {
    type: String,
    required: true,
    enum: ['hourly', 'biweekly', 'monthly', 'annually'],
  },
});

// Mongoose Schema for Primary Care and Specialist
const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    match: [/^[a-zA-Z\s]*$/, 'Doctor name must contain only letters and spaces'],
    default: '',
  },
  testing: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    trim: true,
    default: '',
  },
  zipCode: {
    type: String,
    trim: true,
    match: [/^\d{5}$|^$/, 'Zip code must be 5 digits or empty'],
    default: '',
  },
});

// Mongoose Schema for Specialist (extends doctorSchema with specialty)
const specialistSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    match: [/^[a-zA-Z\s]*$/, 'Specialist name must contain only letters and spaces'],
    default: '',
  },
  specialty: {
    type: String,
    trim: true,
    default: '',
  },
  testing: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    trim: true,
    default: '',
  },
  zipCode: {
    type: String,
    trim: true,
    match: [/^\d{5}$|^$/, 'Zip code must be 5 digits or empty'],
    default: '',
  },
});

// Mongoose Schema for Additional Doctor
const additionalDoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    match: [/^[a-zA-Z\s]*$/, 'Doctor name must contain only letters and spaces'],
    default: '',
  },
  city: {
    type: String,
    trim: true,
    default: '',
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-]{7,15}$|^$/, 'Phone must be a valid format or empty'],
    default: '',
  },
  state: {
    type: String,
    trim: true,
    match: [/^[A-Z]{2}$|^$/, 'State must be a 2-letter code or empty'],
    default: '',
  },
});

// Mongoose Schema for Hospitalization
const hospitalizationSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    trim: true,
    default: '',
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-]{7,15}$|^$/, 'Phone must be a valid format or empty'],
    default: '',
  },
  reason: {
    type: String,
    trim: true,
    default: '',
  },
  date: {
    type: String,
    trim: true,
    match: [/^\d{4}-\d{2}$|^$/, 'Date must be in YYYY-MM format or empty'],
    default: '',
  },
});

// Mongoose Schema for Medical Information
const medicalSchema = new mongoose.Schema({
  // treatmentEndDate: {
  //   type: String,
  //   trim: true,
  //   match: [/^\d{4}-\d{2}$|^$/, 'Treatment end date must be in YYYY-MM format or empty'],
  //   default: '',
  // },

  // For treatmentEndDate, add custom validation to check it's within last 2 years
treatmentEndDate: {
  type: String,
  trim: true,
  match: [/^\d{4}-\d{2}$|^$/, 'Treatment end date must be in YYYY-MM format or empty'],
  validate: {
    validator: function(value) {
      if (!value) return true;
      const date = new Date(value);
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      return date <= new Date() && date >= twoYearsAgo;
    },
    message: 'Treatment end date must be within the last two years'
  },
  default: ''
},
  primaryCare: {
    type: doctorSchema,
    default: () => ({}),
  },
  specialist: {
    type: specialistSchema,
    default: () => ({}),
  },
  additionalDoctors: {
    type: [additionalDoctorSchema],
    default: [],
  },
  hospitalizations: {
    type: [hospitalizationSchema],
    default: [],
  },
});

// Mongoose Schema for Form Data
const formDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?[\d\s-]{7,15}$/, 'Phone must be a valid phone number'],
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email must be a valid email address'],
  },
  ssn: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{4}$/, 'SSN must be exactly 4 digits'],
  },
  marriedOverTenOrDeceased: {
    type: Boolean,
    required: true,
  },
  spouseName: {
    type: String,
    trim: true,
    required: function () {
      return this.marriedOverTenOrDeceased;
    },
    minlength: [2, 'Spouse name must be at least 2 characters long'],
  },
  spouseDOB: {
    type: String,
    trim: true,
    required: function () {
      return this.marriedOverTenOrDeceased;
    },
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Spouse DOB must be in YYYY-MM-DD format'],
  },
  spouseSSN: {
    type: String,
    trim: true,
    required: function () {
      return this.marriedOverTenOrDeceased;
    },
    match: [/^\d{4}$/, 'Spouse SSN must be exactly 4 digits'],
  },
  jobs: {
    type: [jobSchema],
    required: true,
    validate: {
      validator: (jobs) => jobs.length > 0 && jobs.length <= 5,
      message: 'At least one job is required, and maximum 5 jobs are allowed',
    },
  },
  medical: {
    type: medicalSchema,
    default: () => ({}),
  },
  chatHistory: {
    type: [chatMessageSchema],
    default: [],
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// Mongoose Model
const FormData = mongoose.model('FormData', formDataSchema);

// Validation Middleware for Form Submission
const validateFormData = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('phone')
    .trim()
    .matches(/^\+?[\d\s-]{7,15}$/)
    .withMessage('Phone must be a valid phone number'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email must be a valid email address'),
  body('ssn')
    .trim()
    .matches(/^\d{4}$/)
    .withMessage('SSN must be exactly 4 digits'),
  body('marriedOverTenOrDeceased')
    .isBoolean()
    .withMessage('Married over ten or deceased must be a boolean'),
  body('spouseName')
    .if(body('marriedOverTenOrDeceased').equals('true'))
    .trim()
    .isLength({ min: 2 })
    .withMessage('Spouse name must be at least 2 characters long'),
  body('spouseDOB')
    .if(body('marriedOverTenOrDeceased').equals('true'))
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Spouse DOB must be in YYYY-MM-DD format'),
  body('spouseSSN')
    .if(body('marriedOverTenOrDeceased').equals('true'))
    .trim()
    .matches(/^\d{4}$/)
    .withMessage('Spouse SSN must be exactly 4 digits'),
  body('jobs')
    .isArray({ min: 1, max: 5 })
    .withMessage('At least one job is required, and maximum 5 jobs are allowed'),
  body('jobs.*.business')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Business name must be at least 2 characters long'),
  body('jobs.*.title')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Job title must be at least 2 characters long'),
  body('jobs.*.startDate')
    .trim()
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Start date must be in YYYY-MM format'),
  body('jobs.*.endDate')
    .trim()
    .custom((value) => value === 'present' || /^\d{4}-\d{2}$/.test(value))
    .withMessage('End date must be in YYYY-MM format or "present"'),
  body('jobs.*.payAmount')
    .isFloat({ min: 0 })
    .withMessage('Pay amount must be a positive number'),
  body('jobs.*.payFrequency')
    .isIn(['hourly', 'biweekly', 'monthly', 'annually'])
    .withMessage('Pay frequency must be one of: hourly, biweekly, monthly, annually'),
  body('medical.treatmentEndDate')
    .optional()
    .trim()
    .matches(/^\d{4}-\d{2}$|^$/)
    .withMessage('Treatment end date must be in YYYY-MM format or empty'),
  body('medical.primaryCare.name')
    .optional()
    .trim()
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('Primary care doctor name must contain only letters and spaces'),
  body('medical.primaryCare.zipCode')
    .optional()
    .trim()
    .matches(/^\d{5}$|^$/)
    .withMessage('Primary care zip code must be 5 digits or empty'),
  body('medical.specialist.name')
    .optional()
    .trim()
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('Specialist name must contain only letters and spaces'),
  body('medical.specialist.zipCode')
    .optional()
    .trim()
    .matches(/^\d{5}$|^$/)
    .withMessage('Specialist zip code must be 5 digits or empty'),
  body('medical.additionalDoctors')
    .isArray()
    .withMessage('Additional doctors must be an array'),
  body('medical.additionalDoctors.*.name')
    .optional()
    .trim()
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('Additional doctor name must contain only letters and spaces'),
  body('medical.additionalDoctors.*.phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]{7,15}$|^$/)
    .withMessage('Additional doctor phone must be a valid format or empty'),
  body('medical.additionalDoctors.*.state')
    .optional()
    .trim()
    .matches(/^[A-Z]{2}$|^$/)
    .withMessage('Additional doctor state must be a 2-letter code or empty'),
  body('medical.hospitalizations')
    .isArray()
    .withMessage('Hospitalizations must be an array'),
  body('medical.hospitalizations.*.phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]{7,15}$|^$/)
    .withMessage('Hospitalization phone must be a valid format or empty'),
  body('medical.hospitalizations.*.date')
    .optional()
    .trim()
    .matches(/^\d{4}-\d{2}$|^$/)
    .withMessage('Hospitalization date must be in YYYY-MM format or empty'),
  body('chatHistory')
    .isArray()
    .withMessage('Chat history must be an array'),
  body('chatHistory.*.message')
    .trim()
    .notEmpty()
    .withMessage('Chat message cannot be empty'),
  body('chatHistory.*.type')
    .isIn(['user', 'avatar'])
    .withMessage('Chat type must be "user" or "avatar"'),
  body('chatHistory.*.mode')
    .isIn(['text_mode', 'voice_mode'])
    .withMessage('Chat mode must be "text_mode" or "voice_mode"'),
  body('chatHistory.*.timestamp')
    .isISO8601()
    .withMessage('Chat timestamp must be a valid ISO 8601 date'),
];

// API Endpoint to Handle Form Submission


// In your backend route handler
app.post('/api/form-data', validateFormData, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array(),
      message: 'Validation failed'
    });
  }

  try {
    // Additional custom validation
    if (req.body.medical.treatmentEndDate) {
      const treatmentDate = new Date(req.body.medical.treatmentEndDate);
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      
      if (treatmentDate > new Date() || treatmentDate < twoYearsAgo) {
        return res.status(400).json({
          error: 'Treatment end date must be within the last two years'
        });
      }
    }

    // Clean up data
    const formData = {
      ...req.body,
      medical: {
        ...req.body.medical,
        additionalDoctors: req.body.medical.additionalDoctors.filter(doc => 
          doc.name || doc.city || doc.phone || doc.state
        ),
        hospitalizations: req.body.medical.hospitalizations.filter(hosp => 
          hosp.name || hosp.address || hosp.phone || hosp.reason || hosp.date
        )
      }
    };

    // Save to MongoDB
    const savedData = await FormData.create(formData);

      // Prepare data for GoHighLevel webhook
    const webhookData = {
      name: savedData.name,
      phone: savedData.phone,
      email: savedData.email,
      ssn: savedData.ssn,
      marriedOverTenOrDeceased: savedData.marriedOverTenOrDeceased,
      spouseName: savedData.spouseName,
      spouseDOB: savedData.spouseDOB,
      spouseSSN: savedData.spouseSSN,
      jobs: savedData.jobs,
      medical: savedData.medical,
      timestamp: savedData.timestamp
    };

    // Send data to GoHighLevel webhook
    try {
      const webhookUrl = 'https://services.leadconnectorhq.com/hooks/CECLKLJ2HKEDjXUL5Ibj/webhook-trigger/280d88e9-2564-423c-9ac6-9976ec6b7c60';
      await axios.post(webhookUrl, webhookData);
      console.log('Data successfully sent to GoHighLevel webhook');
    } catch (webhookError) {
      console.error('Error sending data to GoHighLevel webhook:', webhookError);
      // You might want to handle this error differently, maybe queue it for retry
    }
  

    
    res.status(201).json({ 
      message: 'Form data submitted successfully',
      data: savedData
    });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});