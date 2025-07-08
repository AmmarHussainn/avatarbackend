// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const axios = require('axios');

// const { body, validationResult } = require('express-validator');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 3001;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// // Mongoose Schema for Chat Message
// const chatMessageSchema = new mongoose.Schema({
//   message: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   type: {
//     type: String,
//     required: true,
//     enum: ['user', 'avatar'],
//   },
//   mode: {
//     type: String,
//     required: true,
//     enum: ['text_mode', 'voice_mode'],
//   },
//   timestamp: {
//     type: Date,
//     required: true,
//   },
// });

// // Mongoose Schema for Job
// const jobSchema = new mongoose.Schema({
//   business: {
//     type: String,
//     required: true,
//     trim: true,
//     minlength: [2, 'Business name must be at least 2 characters long'],
//   },
//   title: {
//     type: String,
//     required: true,
//     trim: true,
//     minlength: [2, 'Job title must be at least 2 characters long'],
//   },
//   startDate: {
//     type: String,
//     required: true,
//     match: [/^\d{4}-\d{2}$/, 'Start date must be in YYYY-MM format'],
//   },
//   endDate: {
//     type: String,
//     required: true,
//     validate: {
//       validator: function (value) {
//         return value === 'present' || /^\d{4}-\d{2}$/.test(value);
//       },
//       message: 'End date must be in YYYY-MM format or "present"',
//     },
//   },
//   payAmount: {
//     type: Number,
//     required: true,
//     min: [0, 'Pay amount must be a positive number'],
//   },
//   payFrequency: {
//     type: String,
//     required: true,
//     enum: ['hourly', 'biweekly', 'monthly', 'annually'],
//   },
// });

// // Mongoose Schema for Primary Care and Specialist
// const doctorSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     trim: true,
//     match: [/^[a-zA-Z\s.,]+$/, 'Doctor name must contain only letters and spaces'],
//     default: '',
//   },
//   testing: {
//     type: String,
//     trim: true,
//     default: '',
//   },
//   address: {
//     type: String,
//     trim: true,
//     default: '',
//   },
//   zipCode: {
//     type: String,
//     trim: true,
//     match: [/^\d{5}$|^$/, 'Zip code must be 5 digits or empty'],
//     default: '',
//   },
// });

// // Mongoose Schema for Specialist (extends doctorSchema with specialty)
// const specialistSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     trim: true,
//     match: [/^[a-zA-Z\s.,]+$/, 'Specialist name must contain only letters and spaces'],
//     default: '',
//   },
//   specialty: {
//     type: String,
//     trim: true,
//     default: '',
//   },
//   testing: {
//     type: String,
//     trim: true,
//     default: '',
//   },
//   address: {
//     type: String,
//     trim: true,
//     default: '',
//   },
//   zipCode: {
//     type: String,
//     trim: true,
//     match: [/^\d{5}$|^$/, 'Zip code must be 5 digits or empty'],
//     default: '',
//   },
// });

// // Mongoose Schema for Additional Doctor
// const additionalDoctorSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     trim: true,
//     match: [/^[a-zA-Z\s.,]+$/, 'Doctor name must contain only letters and spaces'],
//     default: '',
//   },
//   city: {
//     type: String,
//     trim: true,
//     default: '',
//   },
//   phone: {
//     type: String,
//     trim: true,
//     match: [/^\+?[\d\s-]{7,15}$|^$/, 'Phone must be a valid format or empty'],
//     default: '',
//   },
//   state: {
//     type: String,
//     trim: true,
//     match: [/^[A-Z]{2}$|^$/, 'State must be a 2-letter code or empty'],
//     default: '',
//   },
// });

// // Mongoose Schema for Hospitalization
// const hospitalizationSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     trim: true,
//     default: '',
//   },
//   address: {
//     type: String,
//     trim: true,
//     default: '',
//   },
//   phone: {
//     type: String,
//     trim: true,
//     match: [/^\+?[\d\s-]{7,15}$|^$/, 'Phone must be a valid format or empty'],
//     default: '',
//   },
//   reason: {
//     type: String,
//     trim: true,
//     default: '',
//   },
//   date: {
//     type: String,
//     trim: true,
//     match: [/^\d{4}-\d{2}$|^$/, 'Date must be in YYYY-MM format or empty'],
//     default: '',
//   },
// });

// // Mongoose Schema for Medical Information
// const medicalSchema = new mongoose.Schema({
//   // treatmentEndDate: {
//   //   type: String,
//   //   trim: true,
//   //   match: [/^\d{4}-\d{2}$|^$/, 'Treatment end date must be in YYYY-MM format or empty'],
//   //   default: '',
//   // },

//   // For treatmentEndDate, add custom validation to check it's within last 2 years
// treatmentEndDate: {
//   type: String,
//   trim: true,
//   match: [/^\d{4}-\d{2}$|^$/, 'Treatment end date must be in YYYY-MM format or empty'],
//   validate: {
//     validator: function(value) {
//       if (!value) return true;
//       const date = new Date(value);
//       const twoYearsAgo = new Date();
//       twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
//       return date <= new Date() && date >= twoYearsAgo;
//     },
//     message: 'Treatment end date must be within the last two years'
//   },
//   default: ''
// },
//   primaryCare: {
//     type: doctorSchema,
//     default: () => ({}),
//   },
//   specialist: {
//     type: specialistSchema,
//     default: () => ({}),
//   },
//   additionalDoctors: {
//     type: [additionalDoctorSchema],
//     default: [],
//   },
//   hospitalizations: {
//     type: [hospitalizationSchema],
//     default: [],
//   },
// });

// // Mongoose Schema for Form Data
// const formDataSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//     minlength: [2, 'Name must be at least 2 characters long'],
//   },
//   phone: {
//     type: String,
//     required: true,
//     trim: true,
//     match: [/^\+?[\d\s-]{7,15}$/, 'Phone must be a valid phone number'],
//   },
//   email: {
//     type: String,
//     required: true,
//     trim: true,
//     match: [/^\S+@\S+\.\S+$/, 'Email must be a valid email address'],
//   },
//   ssn: {
//     type: String,
//     required: true,
//     trim: true,
//     match: [/^\d{4}$/, 'SSN must be exactly 4 digits'],
//   },
//   marriedOverTenOrDeceased: {
//     type: Boolean,
//     required: true,
//   },
//   spouseName: {
//     type: String,
//     trim: true,
//     required: function () {
//       return this.marriedOverTenOrDeceased;
//     },
//     minlength: [2, 'Spouse name must be at least 2 characters long'],
//   },
//   spouseDOB: {
//     type: String,
//     trim: true,
//     required: function () {
//       return this.marriedOverTenOrDeceased;
//     },
//     match: [/^\d{4}-\d{2}-\d{2}$/, 'Spouse DOB must be in YYYY-MM-DD format'],
//   },
//   spouseSSN: {
//     type: String,
//     trim: true,
//     required: function () {
//       return this.marriedOverTenOrDeceased;
//     },
//     match: [/^\d{4}$/, 'Spouse SSN must be exactly 4 digits'],
//   },
//   jobs: {
//     type: [jobSchema],
//     required: true,
//     validate: {
//       validator: (jobs) => jobs.length > 0 && jobs.length <= 5,
//       message: 'At least one job is required, and maximum 5 jobs are allowed',
//     },
//   },
//   medical: {
//     type: medicalSchema,
//     default: () => ({}),
//   },
//   chatHistory: {
//     type: [chatMessageSchema],
//     default: [],
//   },
//   timestamp: {
//     type: Date,
//     required: true,
//     default: Date.now,
//   },
// });

// // Mongoose Model
// const FormData = mongoose.model('FormData', formDataSchema);

// // Validation Middleware for Form Submission
// const validateFormData = [
//   body('name')
//     .trim()
//     .isLength({ min: 2 })
//     .withMessage('Name must be at least 2 characters long'),
//   body('phone')
//     .trim()
//     .matches(/^\+?[\d\s-]{7,15}$/)
//     .withMessage('Phone must be a valid phone number'),
//   body('email')
//     .trim()
//     .isEmail()
//     .withMessage('Email must be a valid email address'),
//   body('ssn')
//     .trim()
//     .matches(/^\d{4}$/)
//     .withMessage('SSN must be exactly 4 digits'),
//   body('marriedOverTenOrDeceased')
//     .isBoolean()
//     .withMessage('Married over ten or deceased must be a boolean'),
//   body('spouseName')
//     .if(body('marriedOverTenOrDeceased').equals('true'))
//     .trim()
//     .isLength({ min: 2 })
//     .withMessage('Spouse name must be at least 2 characters long'),
//   body('spouseDOB')
//     .if(body('marriedOverTenOrDeceased').equals('true'))
//     .trim()
//     .matches(/^\d{4}-\d{2}-\d{2}$/)
//     .withMessage('Spouse DOB must be in YYYY-MM-DD format'),
//   body('spouseSSN')
//     .if(body('marriedOverTenOrDeceased').equals('true'))
//     .trim()
//     .matches(/^\d{4}$/)
//     .withMessage('Spouse SSN must be exactly 4 digits'),
//   body('jobs')
//     .isArray({ min: 1, max: 5 })
//     .withMessage('At least one job is required, and maximum 5 jobs are allowed'),
//   body('jobs.*.business')
//     .trim()
//     .isLength({ min: 2 })
//     .withMessage('Business name must be at least 2 characters long'),
//   body('jobs.*.title')
//     .trim()
//     .isLength({ min: 2 })
//     .withMessage('Job title must be at least 2 characters long'),
//   body('jobs.*.startDate')
//     .trim()
//     .matches(/^\d{4}-\d{2}$/)
//     .withMessage('Start date must be in YYYY-MM format'),
//   body('jobs.*.endDate')
//     .trim()
//     .custom((value) => value === 'present' || /^\d{4}-\d{2}$/.test(value))
//     .withMessage('End date must be in YYYY-MM format or "present"'),
//   body('jobs.*.payAmount')
//     .isFloat({ min: 0 })
//     .withMessage('Pay amount must be a positive number'),
//   body('jobs.*.payFrequency')
//     .isIn(['hourly', 'biweekly', 'monthly', 'annually'])
//     .withMessage('Pay frequency must be one of: hourly, biweekly, monthly, annually'),
//   body('medical.treatmentEndDate')
//     .optional()
//     .trim()
//     .matches(/^\d{4}-\d{2}$|^$/)
//     .withMessage('Treatment end date must be in YYYY-MM format or empty'),
//   body('medical.primaryCare.name')
//     .optional()
//     .trim()
//     .matches(/^[a-zA-Z\s.,]+$/)
//     .withMessage('Primary care doctor name must contain only letters and spaces'),
//   body('medical.primaryCare.zipCode')
//     .optional()
//     .trim()
//     .matches(/^\d{5}$|^$/)
//     .withMessage('Primary care zip code must be 5 digits or empty'),
//   body('medical.specialist.name')
//     .optional()
//     .trim()
//     .matches(/^[a-zA-Z\s.,]+$/)
//     .withMessage('Specialist name must contain only letters and spaces'),
//   body('medical.specialist.zipCode')
//     .optional()
//     .trim()
//     .matches(/^\d{5}$|^$/)
//     .withMessage('Specialist zip code must be 5 digits or empty'),
//   body('medical.additionalDoctors')
//     .isArray()
//     .withMessage('Additional doctors must be an array'),
//   body('medical.additionalDoctors.*.name')
//     .optional()
//     .trim()
//     .matches(/^[a-zA-Z\s.,]+$/)
//     .withMessage('Additional doctor name must contain only letters and spaces'),
//   body('medical.additionalDoctors.*.phone')
//     .optional()
//     .trim()
//     .matches(/^\+?[\d\s-]{7,15}$|^$/)
//     .withMessage('Additional doctor phone must be a valid format or empty'),
//   body('medical.additionalDoctors.*.state')
//     .optional()
//     .trim()
//     .matches(/^[A-Z]{2}$|^$/)
//     .withMessage('Additional doctor state must be a 2-letter code or empty'),
//   body('medical.hospitalizations')
//     .isArray()
//     .withMessage('Hospitalizations must be an array'),
//   body('medical.hospitalizations.*.phone')
//     .optional()
//     .trim()
//     .matches(/^\+?[\d\s-]{7,15}$|^$/)
//     .withMessage('Hospitalization phone must be a valid format or empty'),
//   body('medical.hospitalizations.*.date')
//     .optional()
//     .trim()
//     .matches(/^\d{4}-\d{2}$|^$/)
//     .withMessage('Hospitalization date must be in YYYY-MM format or empty'),
//   body('chatHistory')
//     .isArray()
//     .withMessage('Chat history must be an array'),
//   body('chatHistory.*.message')
//     .trim()
//     .notEmpty()
//     .withMessage('Chat message cannot be empty'),
//   body('chatHistory.*.type')
//     .isIn(['user', 'avatar'])
//     .withMessage('Chat type must be "user" or "avatar"'),
//   body('chatHistory.*.mode')
//     .isIn(['text_mode', 'voice_mode'])
//     .withMessage('Chat mode must be "text_mode" or "voice_mode"'),
//   body('chatHistory.*.timestamp')
//     .isISO8601()
//     .withMessage('Chat timestamp must be a valid ISO 8601 date'),
// ];

// // API Endpoint to Handle Form Submission

// // In your backend route handler
// app.post('/api/form-data', validateFormData, async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       errors: errors.array(),
//       message: 'Validation failed'
//     });
//   }

//   try {
//     // Additional custom validation
//     if (req.body.medical.treatmentEndDate) {
//       const treatmentDate = new Date(req.body.medical.treatmentEndDate);
//       const twoYearsAgo = new Date();
//       twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

//       if (treatmentDate > new Date() || treatmentDate < twoYearsAgo) {
//         return res.status(400).json({
//           error: 'Treatment end date must be within the last two years'
//         });
//       }
//     }

//     // Clean up data
//     const formData = {
//       ...req.body,
//       medical: {
//         ...req.body.medical,
//         additionalDoctors: req.body.medical.additionalDoctors.filter(doc =>
//           doc.name || doc.city || doc.phone || doc.state
//         ),
//         hospitalizations: req.body.medical.hospitalizations.filter(hosp =>
//           hosp.name || hosp.address || hosp.phone || hosp.reason || hosp.date
//         )
//       }
//     };

//     // Save to MongoDB
//     const savedData = await FormData.create(formData);

//       // Prepare data for GoHighLevel webhook
//     const webhookData = {
//       name: savedData.name,
//       phone: savedData.phone,
//       email: savedData.email,
//       ssn: savedData.ssn,
//       marriedOverTenOrDeceased: savedData.marriedOverTenOrDeceased,
//       spouseName: savedData.spouseName,
//       spouseDOB: savedData.spouseDOB,
//       spouseSSN: savedData.spouseSSN,
//       jobs: savedData.jobs,
//       medical: savedData.medical,
//       timestamp: savedData.timestamp
//     };

//     // Send data to GoHighLevel webhook
//     try {
//       const webhookUrl = 'https://services.leadconnectorhq.com/hooks/CECLKLJ2HKEDjXUL5Ibj/webhook-trigger/280d88e9-2564-423c-9ac6-9976ec6b7c60';
//       await axios.post(webhookUrl, webhookData);
//       console.log('Data successfully sent to GoHighLevel webhook');
//     } catch (webhookError) {
//       console.error('Error sending data to GoHighLevel webhook:', webhookError);
//       // You might want to handle this error differently, maybe queue it for retry
//     }

//     res.status(201).json({
//       message: 'Form data submitted successfully',
//       data: savedData
//     });
//   } catch (error) {
//     console.error('Error saving form data:', error);
//     res.status(500).json({
//       error: error.message || 'Internal server error',
//       details: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// });

// // Start Server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const nodemailer = require("nodemailer");
// const PDFDocument = require("pdfkit");
// const fs = require("fs");
const fsPromises = require("fs").promises;
const { body, validationResult } = require("express-validator");
const pdf = require('pdf-creator-node');
const { PDFDocument, rgb } = require('pdf-lib');
const puppeteer = require('puppeteer');
const path = require('path')
const fs = require('fs').promises;
const handlebars = require('handlebars');

require("dotenv").config();

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
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Mongoose Schemas
const chatMessageSchema = new mongoose.Schema({
  message: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ["user", "avatar"] },
  mode: { type: String, required: true, enum: ["text_mode", "voice_mode"] },
  timestamp: { type: Date, required: true },
});

const jobSchema = new mongoose.Schema({
  business: { type: String, required: true, trim: true, minlength: 2 },
  title: { type: String, required: true, trim: true, minlength: 2 },
  startDate: { type: String, required: true, match: [/^\d{4}-\d{2}$/] },
  endDate: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return value === "present" || /^\d{4}-\d{2}$/.test(value);
      },
    },
  },
  payAmount: { type: Number, required: true, min: 0 },
  payFrequency: {
    type: String,
    required: true,
    enum: ["hourly", "biweekly", "monthly", "annually"],
  },
});

const doctorSchema = new mongoose.Schema({
  name: { type: String, trim: true, match: [/^[a-zA-Z\s.,]+$/], default: "" },
  testing: { type: String, trim: true, default: "" },
  address: { type: String, trim: true, default: "" },
  zipCode: { type: String, trim: true, match: [/^\d{5}$|^$/], default: "" },
  city: { type: String, trim: true, default: "" },
  state: { type: String, trim: true, match: [/^[A-Z]{2}$|^$/], default: "" },
   date: { type: String, trim: true, match: [/^\d{4}-\d{2}$|^$/], default: '' },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-]{7,15}$|^$/],
    default: "",
  },
});

const specialistSchema = new mongoose.Schema({
  name: { type: String, trim: true, match: [/^[a-zA-Z\s.,]+$/], default: "" },
  specialty: { type: String, trim: true, default: "" },
  testing: { type: String, trim: true, default: "" },
  address: { type: String, trim: true, default: "" },
  zipCode: { type: String, trim: true, match: [/^\d{5}$|^$/], default: "" },
   date: { type: String, trim: true, match: [/^\d{4}-\d{2}$|^$/], default: '' },
  city: { type: String, trim: true, default: "" },
  state: { type: String, trim: true, match: [/^[A-Z]{2}$|^$/], default: "" },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-]{7,15}$|^$/],
    default: "",
  },
});

const additionalDoctorSchema = new mongoose.Schema({
  name: { type: String, trim: true, match: [/^[a-zA-Z\s.,]+$/], default: "" },
  city: { type: String, trim: true, default: "" },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-]{7,15}$|^$/],
    default: "",
  },
  state: { type: String, trim: true, match: [/^[A-Z]{2}$|^$/], default: "" },
   date: { type: String, trim: true, match: [/^\d{4}-\d{2}$|^$/], default: '' },
  address: { type: String, trim: true, default: "" },
  zipCode: { type: String, trim: true, match: [/^\d{5}$|^$/], default: "" },
});

const hospitalizationSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: "" },
  address: { type: String, trim: true, default: "" },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-]{7,15}$|^$/],
    default: "",
  },
  reason: { type: String, trim: true, default: "" },
  date: { type: String, trim: true, match: [/^\d{4}-\d{2}$|^$/], default: "" },
});

const medicalSchema = new mongoose.Schema({
  treatmentEndDate: {
    type: String,
    trim: true,
    match: [/^\d{4}-\d{2}$|^$/],
    validate: {
      validator: function (value) {
        if (!value) return true;
        const date = new Date(value);
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        return date <= new Date() && date >= twoYearsAgo;
      },
      message: "Treatment end date must be within the last two years",
    },
    default: "",
  },
  primaryCare: { type: doctorSchema, default: () => ({}) },
  specialist: { type: specialistSchema, default: () => ({}) },
  additionalDoctors: { type: [additionalDoctorSchema], default: [] },
  hospitalizations: { type: [hospitalizationSchema], default: [] },
});

const formDataSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2 },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?[\d\s-]{7,15}$/],
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/],
  },
  ssn: { type: String, required: true, trim: true, match: [/^\d{4}$/] },
  marriedOverTenOrDeceased: { type: Boolean, required: true },
  spouseName: {
    type: String,
    trim: true,
    required: function () {
      return this.marriedOverTenOrDeceased;
    },
    minlength: 2,
  },
  spouseDOB: {
    type: String,
    trim: true,
    required: function () {
      return this.marriedOverTenOrDeceased;
    },
    match: [/^\d{4}-\d{2}-\d{2}$/],
  },
  spouseSSN: {
    type: String,
    trim: true,
    required: function () {
      return this.marriedOverTenOrDeceased;
    },
    match: [/^\d{4}$/],
  },
  jobs: {
    type: [jobSchema],
    required: true,
    validate: { validator: (jobs) => jobs.length > 0 && jobs.length <= 5 },
  },
  medical: { type: medicalSchema, default: () => ({}) },
  chatHistory: { type: [chatMessageSchema], default: [] },
  timestamp: { type: Date, required: true, default: Date.now },
});

const FormData = mongoose.model("FormData", formDataSchema);

// Validation Middleware
const validateFormData = [
  body("name").trim().isLength({ min: 2 }),
  body("phone")
    .trim()
    .matches(/^\+?[\d\s-]{7,15}$/),
  body("email").trim().isEmail(),
  body("ssn")
    .trim()
    .matches(/^\d{4}$/),
  body("marriedOverTenOrDeceased").isBoolean(),
  body("spouseName")
    .if(body("marriedOverTenOrDeceased").equals("true"))
    .trim()
    .isLength({ min: 2 }),
  body("spouseDOB")
    .if(body("marriedOverTenOrDeceased").equals("true"))
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/),
  body("spouseSSN")
    .if(body("marriedOverTenOrDeceased").equals("true"))
    .trim()
    .matches(/^\d{4}$/),
  body("jobs").isArray({ min: 1, max: 5 }),
  body("jobs.*.business").trim().isLength({ min: 2 }),
  body("jobs.*.title").trim().isLength({ min: 2 }),
  body("jobs.*.startDate")
    .trim()
    .matches(/^\d{4}-\d{2}$/),
  body("jobs.*.endDate")
    .trim()
    .custom((value) => value === "present" || /^\d{4}-\d{2}$/.test(value)),
  body("jobs.*.payAmount").isFloat({ min: 0 }),
  body("jobs.*.payFrequency").isIn([
    "hourly",
    "biweekly",
    "monthly",
    "annually",
  ]),
  body("medical.treatmentEndDate")
    .optional()
    .trim()
    .matches(/^\d{4}-\d{2}$|^$/),
  body("medical.primaryCare.name")
    .optional()
    .trim()
    .matches(/^[a-zA-Z\s.,]+$/),
  body("medical.primaryCare.zipCode")
    .optional()
    .trim()
    .matches(/^\d{5}$|^$/),
  body("medical.primaryCare.city").optional().trim(),
  body("medical.primaryCare.state")
    .optional()
    .trim()
    .matches(/^[A-Z]{2}$|^$/),
  body("medical.primaryCare.phone")
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]{7,15}$|^$/),
  body('medical.primaryCare.date').optional().trim().matches(/^\d{4}-\d{2}$|^$/),
  
  body("medical.specialist.name")
    .optional()
    .trim()
    .matches(/^[a-zA-Z\s.,]+$/),
  body("medical.specialist.zipCode")
    .optional()
    .trim()
    .matches(/^\d{5}$|^$/),
  body("medical.specialist.city").optional().trim(),
  body("medical.specialist.state")
    .optional()
    .trim()
    .matches(/^[A-Z]{2}$|^$/),
  body("medical.specialist.phone")
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]{7,15}$|^$/),
  body('medical.specialist.date').optional().trim().matches(/^\d{4}-\d{2}$|^$/),

  body("medical.additionalDoctors").isArray(),
  body("medical.additionalDoctors.*.name")
    .optional()
    .trim()
    .matches(/^[a-zA-Z\s.,]+$/),
  body("medical.additionalDoctors.*.phone")
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]{7,15}$|^$/),
  body("medical.additionalDoctors.*.state")
    .optional()
    .trim()
    .matches(/^[A-Z]{2}$|^$/),
  body("medical.additionalDoctors.*.address").optional().trim(),
  body("medical.additionalDoctors.*.zipCode")
    .optional()
    .trim()
    .matches(/^\d{5}$|^$/),
  body("medical.hospitalizations").isArray(),
  body('medical.additionalDoctors.*.date').optional().trim().matches(/^\d{4}-\d{2}$|^$/),

  body("medical.hospitalizations.*.phone")
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]{7,15}$|^$/),
  body("medical.hospitalizations.*.date")
    .optional()
    .trim()
    .matches(/^\d{4}-\d{2}$|^$/),
  body("chatHistory").isArray(),
  body("chatHistory.*.message").trim().notEmpty(),
  body("chatHistory.*.type").isIn(["user", "avatar"]),
  body("chatHistory.*.mode").isIn(["text_mode", "voice_mode"]),
  body("chatHistory.*.timestamp").isISO8601(),
];

// Helper function to generate PDF with pdfkit
// async function generatePDF(formData) {
//   return new Promise((resolve, reject) => {
//     const pdfFileName = `form_submission_${formData._id}.pdf`;
//     const pdfDoc = new PDFDocument({ margin: 50 }); // Renamed to avoid conflict
//     const stream = fs.createWriteStream(pdfFileName);

//     pdfDoc.pipe(stream);

//     // Add professional letterhead
//     pdfDoc
//       .font("Helvetica-Bold")
//       .fontSize(18)
//       .fillColor("#1A3C5A")
//       .text("Liner Legal", 20, 20)
//       .fontSize(10)
//       .fillColor("#333333")
//       .text("4269 Pearl Road, Suite 104 Cleveland, OH", 20, 40)
//       .text("Phone:  (216) 282-1773 | Email: forms@linerlegal.com", 20, 50)
//       .moveDown();

//     // Add horizontal line
//     pdfDoc.moveTo(20, 70).lineTo(575, 70).strokeColor("#1A3C5A").stroke();

//     // Title and date
//     pdfDoc
//       .font("Helvetica-Bold")
//       .fontSize(16)
//       .fillColor("#1A3C5A")
//       .text("Client Intake Form Submission", { align: "center" })
//       .moveDown(0.5);
//     pdfDoc
//       .font("Helvetica")
//       .fontSize(10)
//       .fillColor("#333333")
//       .text(`Submission Date: ${new Date().toLocaleDateString()}`, {
//         align: "center",
//       })
//       .moveDown(2);

//     // Personal Information
//     pdfDoc
//       .font("Helvetica-Bold")
//       .fontSize(12)
//       .fillColor("#1A3C5A")
//       .text("Personal Information")
//       .moveDown(0.5);
//     pdfDoc
//       .font("Helvetica")
//       .fontSize(10)
//       .fillColor("#333333")
//       .text(`Name: ${formData.name}`)
//       .text(`Phone: ${formData.phone}`)
//       .text(`Email: ${formData.email}`)
//       .text(`SSN (Last 4 Digits): ${formData.ssn}`)
//       .text(
//         `Married >10 Years or Deceased: ${
//           formData.marriedOverTenOrDeceased ? "Yes" : "No"
//         }`
//       );
//     if (formData.marriedOverTenOrDeceased) {
//       pdfDoc
//         .text(`Spouse Name: ${formData.spouseName || "N/A"}`)
//         .text(`Spouse DOB: ${formData.spouseDOB || "N/A"}`)
//         .text(`Spouse SSN (Last 4 Digits): ${formData.spouseSSN || "N/A"}`);
//     }
//     pdfDoc.moveDown(1.5);

//     // Employment History
//     pdfDoc
//       .font("Helvetica-Bold")
//       .fontSize(12)
//       .fillColor("#1A3C5A")
//       .text("Employment History")
//       .moveDown(0.5);
//     formData.jobs.forEach((job, index) => {
//       pdfDoc
//         .font("Helvetica-Bold")
//         .fontSize(10)
//         .fillColor("#333333")
//         .text(`Job ${index + 1}`)
//         .moveDown(0.2);
//       pdfDoc
//         .font("Helvetica")
//         .fontSize(10)
//         .text(`Business: ${job.business}`)
//         .text(`Title: ${job.title}`)
//         .text(`Start Date: ${job.startDate}`)
//         .text(`End Date: ${job.endDate}`)
//         .text(`Pay: $${job.payAmount.toFixed(2)} ${job.payFrequency}`)
//         .moveDown(1);
//     });

//     // Medical Information
//     pdfDoc
//       .font("Helvetica-Bold")
//       .fontSize(12)
//       .fillColor("#1A3C5A")
//       .text("Medical Information")
//       .moveDown(0.5);
//     pdfDoc
//       .font("Helvetica")
//       .fontSize(10)
//       .fillColor("#333333")
//       .text(`Treatment End Date: ${formData.medical.treatmentEndDate || "N/A"}`)
//       .moveDown(1);

//     pdfDoc
//       .font("Helvetica-Bold")
//       .fontSize(10)
//       .text("Primary Care")
//       .moveDown(0.2);
//     pdfDoc
//       .font("Helvetica")
//       .fontSize(10)
//       //  .text(`Name: ${formData.medical.primaryCare.name || 'N/A'}`)
//       //  .text(`Testing: ${formData.medical.primaryCare.testing || 'N/A'}`)
//       //  .text(`Address: ${formData.medical.primaryCare.address || 'N/A'}`)
//       //  .text(`Zip Code: ${formData.medical.primaryCare.zipCode || 'N/A'}`)
//       .text(`Name: ${formData.medical.primaryCare.name || "N/A"}`)
//       .text(`Testing: ${formData.medical.primaryCare.testing || "N/A"}`)
//       .text(`Address: ${formData.medical.primaryCare.address || "N/A"}`)
//       .text(`City: ${formData.medical.primaryCare.city || "N/A"}`)
//       .text(`State: ${formData.medical.primaryCare.state || "N/A"}`)
//       .text(`Zip Code: ${formData.medical.primaryCare.zipCode || "N/A"}`)
//       .text(`Phone: ${formData.medical.primaryCare.phone || "N/A"}`)
//       .text(`Approximate Date: ${formData.medical.primaryCare.date || 'N/A'}`)
//       .moveDown(1);

//     pdfDoc.font("Helvetica-Bold").fontSize(10).text("Specialist").moveDown(0.2);
//     pdfDoc
//       .font("Helvetica")
//       .fontSize(10)
//       .text(`Name: ${formData.medical.specialist.name || "N/A"}`)
//       .text(`Specialty: ${formData.medical.specialist.specialty || "N/A"}`)
//       .text(`Testing: ${formData.medical.specialist.testing || "N/A"}`)
//       .text(`Address: ${formData.medical.specialist.address || "N/A"}`)
//       .text(`City: ${formData.medical.specialist.city || "N/A"}`)
//       .text(`State: ${formData.medical.specialist.state || "N/A"}`)
//       .text(`Zip Code: ${formData.medical.specialist.zipCode || "N/A"}`)
//       .text(`Phone: ${formData.medical.specialist.phone || "N/A"}`)
//       .text(`Approximate Date: ${formData.medical.specialist.date || 'N/A'}`)
//       .moveDown(1);

//     if (formData.medical.additionalDoctors.length > 0) {
//       pdfDoc
//         .font("Helvetica-Bold")
//         .fontSize(10)
//         .text("Additional Doctors")
//         .moveDown(0.2);
//       formData.medical.additionalDoctors.forEach((doctor, index) => {
//         // Renamed to avoid conflict
//         pdfDoc
//           .font("Helvetica")
//           .fontSize(10)
//           .text(`Doctor ${index + 1}`)
//           .text(`Name: ${doctor.name || "N/A"}`)
//           .text(`City: ${doctor.city || "N/A"}`)
//           .text(`Phone: ${doctor.phone || "N/A"}`)
//           .text(`State: ${doctor.state || "N/A"}`)
//           .text(`Address: ${doctor.address || "N/A"}`)
//           .text(`Zip Code: ${doctor.zipCode || "N/A"}`)
//           .text(`Approximate Date: ${doctor.date || 'N/A'}`)
//           .moveDown(0.5);
//       });
//     }

//     if (formData.medical.hospitalizations.length > 0) {
//       pdfDoc
//         .font("Helvetica-Bold")
//         .fontSize(10)
//         .text("Hospitalizations")
//         .moveDown(0.2);
//       formData.medical.hospitalizations.forEach((hosp, index) => {
//         pdfDoc
//           .font("Helvetica")
//           .fontSize(10)
//           .text(`Hospitalization ${index + 1}`)
//           .text(`Name: ${hosp.name || "N/A"}`)
//           .text(`Address: ${hosp.address || "N/A"}`)
//           .text(`Phone: ${hosp.phone || "N/A"}`)
//           .text(`Reason: ${hosp.reason || "N/A"}`)
//           .text(`Date: ${hosp.date || "N/A"}`)
//           .moveDown(0.5);
//       });
//     }

//     // Add footer
//     pdfDoc
//       .font("Helvetica-Oblique")
//       .fontSize(8)
//       .fillColor("#666666")
//       .text(
//         "Confidential - For Internal Use Only",
//         20,
//         pdfDoc.page.height - 50,
//         { align: "center" }
//       );

//     pdfDoc.end();

//     stream.on("finish", () => resolve(pdfFileName));
//     stream.on("error", (err) => reject(err));
//   });
// }



// async function generatePDF(formData) {
//   return new Promise((resolve, reject) => {
//     const pdfFileName = `SS_App_Prep_${Date.now()}.pdf`;
//     const pdfDoc = new PDFDocument({ margin: 50 });
//     const stream = fs.createWriteStream(pdfFileName);

//     pdfDoc.pipe(stream);

//     // Page 1 - SS App Prep
//     pdfDoc.font('Helvetica').fontSize(12);
    
//     // Title
//     pdfDoc.text('SS App Prep', { align: 'center' }).moveDown(2);
    
//     // Personal Information
//     pdfDoc.text('Name: ' + (formData.name || ''));
//     pdfDoc.text('Last 4 SSN: ' + (formData.last4SSN || '')).moveDown(2);
    
//     // Marriage Information
//     pdfDoc.text('Marriage Information');
//     pdfDoc.text('Were you married over 10 years or did your spouse pass away during your marriage?');
//     pdfDoc.text(`☐ Yes ${formData.marriedOver10OrDeceased ? '☒' : '☐'} No ${!formData.marriedOver10OrDeceased ? '☒' : '☐'}`);
//     pdfDoc.text('Name of spouse/prior spouse: ' + (formData.spouseName || ''));
//     pdfDoc.text('Spouse date of birth: ' + (formData.spouseDOB || ''));
//     pdfDoc.text('Spouse SSN: ' + (formData.spouseSSN || '')).moveDown(2);
    
//     // Employment Information
//     pdfDoc.text('Employment Information').moveDown(1);
    
//     // Jobs (up to 5)
//     const jobs = formData.jobs || [];
//     for (let i = 0; i < 5; i++) {
//       const job = jobs[i] || {};
//       pdfDoc.text(`Job ${i + 1}`);
//       pdfDoc.text('Kind of business of employer: ' + (job.business || ''));
//       pdfDoc.text('Job Title: ' + (job.title || ''));
//       pdfDoc.text('Start date (approximate month and year): ' + (job.startDate || ''));
//       pdfDoc.text('End date: ' + (job.endDate || ''));
//       pdfDoc.text('Pay (indicate if hourly, biweekly, monthly or annually): ' + (job.pay || ''));
//       pdfDoc.moveDown(1);
//     }
    
//     // Add note about 5 most recent employers
//     pdfDoc.text('(5 most recent employers in the last 5 years)');
    
//     // Page 2 - Job 5 and Medical Information
//     pdfDoc.addPage();
//     pdfDoc.font('Helvetica').fontSize(12);
    
//     // Job 5 (if exists)
//     if (jobs[4]) {
//       const job = jobs[4];
//       pdfDoc.text('Job 5');
//       pdfDoc.text('Kind of business of employer: ' + (job.business || ''));
//       pdfDoc.text('Job Title: ' + (job.title || ''));
//       pdfDoc.text('Start date (approximate month and year): ' + (job.startDate || ''));
//       pdfDoc.text('End date: ' + (job.endDate || ''));
//       pdfDoc.text('Pay (indicate if hourly, biweekly, monthly or annually): ' + (job.pay || ''));
//       pdfDoc.moveDown(1);
//     }
    
//     // Medical Information
//     pdfDoc.text('Medical Information').moveDown(1);
//     pdfDoc.text('Please provide information for treatment in the last two years:').moveDown(1);
    
//     // Primary Care
//     pdfDoc.text('Primary Care/Family Doctor Name: ' + (formData.medical?.primaryCare?.name || ''));
//     pdfDoc.text('Special testing/imaging ordered: ' + (formData.medical?.primaryCare?.testing || ''));
//     pdfDoc.text('Address: ' + (formData.medical?.primaryCare?.address || ''));
//     pdfDoc.text('City: ' + (formData.medical?.primaryCare?.city || '') + 
//                 ' State: ' + (formData.medical?.primaryCare?.state || ''));
//     pdfDoc.text('Zip Code: ' + (formData.medical?.primaryCare?.zipCode || '') + 
//                 ' Phone: ' + (formData.medical?.primaryCare?.phone || '')).moveDown(1);
    
//     // Specialist
//     pdfDoc.text('Specialist Doctor Name: ' + (formData.medical?.specialist?.name || ''));
//     pdfDoc.text('Area of Specialty: ' + (formData.medical?.specialist?.specialty || ''));
//     pdfDoc.text('Special testing/imaging ordered: ' + (formData.medical?.specialist?.testing || ''));
//     pdfDoc.text('Address: ' + (formData.medical?.specialist?.address || ''));
//     pdfDoc.text('City: ' + (formData.medical?.specialist?.city || '') + 
//                 ' State: ' + (formData.medical?.specialist?.state || ''));
//     pdfDoc.text('Zip Code: ' + (formData.medical?.specialist?.zipCode || '') + 
//                 ' Phone: ' + (formData.medical?.specialist?.phone || '')).moveDown(1);
    
//     // Additional doctors
//     pdfDoc.text('Additional doctors:').moveDown(1);
    
//     // Page 3 - Hospitalizations
//     pdfDoc.addPage();
//     pdfDoc.font('Helvetica').fontSize(12);
    
//     pdfDoc.text('Any hospitalizations, surgeries, ER visits, important medical testing/imaging, ' + 
//                'provide name/address/phone and reason for treatment and approximately when treatment occurred:').moveDown(1);
    
//     // Primary Care (again)
//     pdfDoc.text('Primary Care/Family Doctor Name: ' + (formData.medical?.primaryCare?.name || ''));
//     pdfDoc.text('Special testing/imaging ordered: ' + (formData.medical?.primaryCare?.testing || ''));
//     pdfDoc.text('Address: ' + (formData.medical?.primaryCare?.address || ''));
//     pdfDoc.text('City: ' + (formData.medical?.primaryCare?.city || '') + 
//                 ' State: ' + (formData.medical?.primaryCare?.state || ''));
//     pdfDoc.text('Zip Code: ' + (formData.medical?.primaryCare?.zipCode || '') + 
//                 ' Phone: ' + (formData.medical?.primaryCare?.phone || ''));
    
//     pdfDoc.end();

//     stream.on('finish', () => resolve(pdfFileName));
//     stream.on('error', (err) => reject(err));
//   });
// }

async function generatePDF(formData) {
  try {
    // 1. Convert Mongoose document to plain JavaScript object
    const data = formData.toObject ? formData.toObject() : formData;
    
    // 2. Load template
    const templatePath = path.join(__dirname, 'template.html');
    const htmlTemplate = await fs.readFile(templatePath, 'utf8');

    // 3. Prepare template data with proper structure
    const templateData = {
      name: data.name,
      ssn: data.ssn,
      marriedOverTenOrDeceased: data.marriedOverTenOrDeceased,
      spouseName: data.spouseName,
      spouseDOB: data.spouseDOB,
      spouseSSN: data.spouseSSN,
      jobs: (data.jobs || []).map(job => ({
        business: job.business,
        title: job.title,
        startDate: job.startDate,
        endDate: job.endDate === 'present' ? 'Present' : job.endDate,
        payAmount: job.payAmount,
        payFrequency: job.payFrequency
      })),
      medical: {
        primaryCare: data.medical?.primaryCare || {},
        specialist: data.medical?.specialist || {},
        additionalDoctors: data.medical?.additionalDoctors || [],
        hospitalizations: data.medical?.hospitalizations || []
      }
    };

    // 4. Compile template with safe access
    const template = handlebars.compile(htmlTemplate, {
      noEscape: true,
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    });
    
    const html = template(templateData);

    // 5. Debug: Save HTML for inspection
    await fs.writeFile('debug_output.html', html);
    console.log('Template data:', JSON.stringify(templateData, null, 2));

    // 6. Generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    const pdfFileName = `SS_App_${Date.now()}.pdf`;
    await page.pdf({
      path: pdfFileName,
      format: 'A4',
     
      printBackground: true
    });

    await browser.close();
    return pdfFileName;
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
}












// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// API Endpoint to Handle Form Submission
app.post("/api/form-data", validateFormData, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ errors: errors.array(), message: "Validation failed" });
  }

  try {
    // Custom validation for treatment end date
    if (req.body.medical.treatmentEndDate) {
      const treatmentDate = new Date(req.body.medical.treatmentEndDate);
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      if (treatmentDate > new Date() || treatmentDate < twoYearsAgo) {
        return res.status(400).json({
          error: "Treatment end date must be within the last two years",
        });
      }
    }

    // Clean up data
    const formData = {
      ...req.body,
      medical: {
        ...req.body.medical,
        additionalDoctors: req.body.medical.additionalDoctors.filter(
          (doc) => doc.name || doc.city || doc.phone || doc.state
        ),
        hospitalizations: req.body.medical.hospitalizations.filter(
          (hosp) =>
            hosp.name || hosp.address || hosp.phone || hosp.reason || hosp.date
        ),
      },
    };

    // Save to MongoDB
    const savedData = await FormData.create(formData);

    // Generate PDF
    let pdfFileName;
    try {
      pdfFileName = await generatePDF(savedData);

      // Send email with PDF attachment
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: ["ammar@meetgabbi.com", "ayaz.ext@gmail.com"],
        subject: `SS application Form ${savedData.name}`,
        text: `Dear Team,\n\nA new form submission has been received from ${savedData.name}. Please find attached the PDF containing the submitted information.\n\nBest regards,\nSystem`,
        attachments: [{ filename: `form_submission_${savedData._id}.pdf`,
          path: pdfFileName}],
      };

      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");

      // Clean up PDF file
      await fsPromises.unlink(pdfFileName);
    } catch (pdfError) {
      console.error("Error generating PDF or sending email:", pdfError);
    }

    // Send data to GoHighLevel webhook
    try {
      const webhookUrl =
        "https://services.leadconnectorhq.com/hooks/CECLKLJ2HKEDjXUL5Ibj/webhook-trigger/280d88e9-2564-423c-9ac6-9976ec6b7c60";
      await axios.post(webhookUrl, {
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
        timestamp: savedData.timestamp,
      });
      console.log("Data successfully sent to GoHighLevel webhook");
    } catch (webhookError) {
      console.error("Error sending data to GoHighLevel webhook:", webhookError);
    }

    res
      .status(201)
      .json({ message: "Form data submitted successfully", data: savedData });
  } catch (error) {
    console.error("Error saving form data:", error);
    res.status(500).json({
      error: error.message || "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working correctly 🚀" });
});
// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
