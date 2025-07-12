
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
  startDate: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return value === "NA" || /^\d{4}-\d{2}$/.test(value);
      },
      message: "startDate must be 'NA' or in YYYY-MM format",
    },
  },
  endDate: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return value === "NA" || value === "present" || /^\d{4}-\d{2}$/.test(value);
      },
      message: "endDate must be 'NA', 'present', or in YYYY-MM format",
    },
  },
  payAmount: {
    type: String, // Changed to String to allow "NA"
    required: true,
    validate: {
      validator: function (value) {
        return value === "NA" || !isNaN(parseFloat(value));
      },
      message: "payAmount must be 'NA' or a valid number",
    },
  },
  payFrequency: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return (
          value === "NA" ||
          ["hourly", "biweekly", "monthly", "annually"].includes(value)
        );
      },
      message: "payFrequency must be 'NA' or one of: hourly, biweekly, monthly, annually",
    },
  },
});

const doctorSchema = new mongoose.Schema({
  name: { type: String, trim: true, match: [/^[a-zA-Z\s.,]+$/], default: "" },
  testing: { type: String, trim: true, default: "" },
  address: { type: String, trim: true, default: "" },
  zipCode: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return value === "NA" || value === "" || /^\d{5}$/.test(value);
      },
      message: "zipCode must be 'NA', empty, or a 5-digit number",
    },
    default: "",
  },
  city: { type: String, trim: true, default: "" },
  state: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return value === "NA" || value === "" || /^[A-Z]{2}$/.test(value);
      },
      message: "state must be 'NA', empty, or a 2-letter code",
    },
    default: "",
  },
  date: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return value === "NA" || value === "" || /^\d{4}-\d{2}$/.test(value);
      },
      message: "date must be 'NA', empty, or in YYYY-MM format",
    },
    default: "",
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return value === "NA" || value === "" || /^\+?[\d\s-]{7,15}$/.test(value);
      },
      message: "phone must be 'NA', empty, or a valid phone number",
    },
    default: "",
  },
});

const specialistSchema = new mongoose.Schema({
  name: { type: String, trim: true, match: [/^[a-zA-Z\s.,]+$/], default: "" },
  specialty: { type: String, trim: true, default: "" },
  testing: { type: String, trim: true, default: "" },
  address: { type: String, trim: true, default: "" },
  zipCode: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return value === "NA" || value === "" || /^\d{5}$/.test(value);
      },
      message: "zipCode must be 'NA', empty, or a 5-digit number",
    },
    default: "",
  },
  date: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return value === "NA" || value === "" || /^\d{4}-\d{2}$/.test(value);
      },
      message: "date must be 'NA', empty, or in YYYY-MM format",
    },
    default: "",
  },
  city: { type: String, trim: true, default: "" },
  state: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return value === "NA" || value === "" || /^[A-Z]{2}$/.test(value);
      },
      message: "state must be 'NA', empty, or a 2-letter code",
    },
    default: "",
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return value === "NA" || value === "" || /^\+?[\d\s-]{7,15}$/.test(value);
      },
      message: "phone must be 'NA', empty, or a valid phone number",
    },
    default: "",
  },
});

const additionalDoctorSchema = new mongoose.Schema({
  name: { type: String, trim: true, match: [/^[a-zA-Z\s.,]+$/], default: "" },
  city: { type: String, trim: true, default: "" },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return value === "NA" || value === "" || /^\+?[\d\s-]{7,15}$/.test(value);
      },
      message: "phone must be 'NA', empty, or a valid phone number",
    },
    default: "",
  },
  state: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return value === "NA" || value === "" || /^[A-Z]{2}$/.test(value);
      },
      message: "state must be 'NA', empty, or a 2-letter code",
    },
    default: "",
  },
  date: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return value === "NA" || value === "" || /^\d{4}-\d{2}$/.test(value);
      },
      message: "date must be 'NA', empty, or in YYYY-MM format",
    },
    default: "",
  },
  address: { type: String, trim: true, default: "" },
  zipCode: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return value === "NA" || value === "" || /^\d{5}$/.test(value);
      },
      message: "zipCode must be 'NA', empty, or a 5-digit number",
    },
    default: "",
  },
});

const hospitalizationSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: "" },
  address: { type: String, trim: true, default: "" },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return value === "NA" || value === "" || /^\+?[\d\s-]{7,15}$/.test(value);
      },
      message: "phone must be 'NA', empty, or a valid phone number",
    },
    default: "",
  },
  reason: { type: String, trim: true, default: "" },
  date: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return value === "NA" || value === "" || /^\d{4}-\d{2}$/.test(value);
      },
      message: "date must be 'NA', empty, or in YYYY-MM format",
    },
    default: "",
  },
});

const medicalSchema = new mongoose.Schema({
  treatmentEndDate: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        if (value === "NA" || value === "") return true;
        const date = new Date(value);
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        return date <= new Date() && date >= twoYearsAgo && /^\d{4}-\d{2}$/.test(value);
      },
      message: "treatmentEndDate must be 'NA', empty, or a valid date within the last two years",
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
// const validateFormData = [
//   body("name").trim().isLength({ min: 2 }),
//   body("phone")
//     .trim()
//     .matches(/^\+?[\d\s-]{7,15}$/),
//   body("email").trim().isEmail(),
//   body("ssn")
//     .trim()
//     .matches(/^\d{4}$/),
//   body("marriedOverTenOrDeceased").isBoolean(),
//   body("spouseName")
//     .if(body("marriedOverTenOrDeceased").equals("true"))
//     .trim()
//     .isLength({ min: 2 }),
//   body("spouseDOB")
//     .if(body("marriedOverTenOrDeceased").equals("true"))
//     .trim()
//     .matches(/^\d{4}-\d{2}-\d{2}$/),
//   body("spouseSSN")
//     .if(body("marriedOverTenOrDeceased").equals("true"))
//     .trim()
//     .matches(/^\d{4}$/),
//   body("jobs").isArray({ min: 1, max: 5 }),
//   body("jobs.*.business").trim().isLength({ min: 2 }),
//   body("jobs.*.title").trim().isLength({ min: 2 }),
//   body("jobs.*.startDate")
//     .trim()
//     .matches(/^\d{4}-\d{2}$/),
//   body("jobs.*.endDate")
//     .trim()
//     .custom((value) => value === "present" || /^\d{4}-\d{2}$/.test(value)),
//   body("jobs.*.payAmount").isFloat({ min: 0 }),
//   body("jobs.*.payFrequency").isIn([
//     "hourly",
//     "biweekly",
//     "monthly",
//     "annually",
//   ]),
//   body("medical.treatmentEndDate")
//     .optional()
//     .trim()
//     .matches(/^\d{4}-\d{2}$|^$/),
//   body("medical.primaryCare.name")
//     .optional()
//     .trim()
//     .matches(/^[a-zA-Z\s.,]+$/),
//   body("medical.primaryCare.zipCode")
//     .optional()
//     .trim()
//     .matches(/^\d{5}$|^$/),
//   body("medical.primaryCare.city").optional().trim(),
//   body("medical.primaryCare.state")
//     .optional()
//     .trim()
//     .matches(/^[A-Z]{2}$|^$/),
//   body("medical.primaryCare.phone")
//     .optional()
//     .trim()
//     .matches(/^\+?[\d\s-]{7,15}$|^$/),
//   body('medical.primaryCare.date').optional().trim().matches(/^\d{4}-\d{2}$|^$/),
  
//   body("medical.specialist.name")
//     .optional()
//     .trim()
//     .matches(/^[a-zA-Z\s.,]+$/),
//   body("medical.specialist.zipCode")
//     .optional()
//     .trim()
//     .matches(/^\d{5}$|^$/),
//   body("medical.specialist.city").optional().trim(),
//   body("medical.specialist.state")
//     .optional()
//     .trim()
//     .matches(/^[A-Z]{2}$|^$/),
//   body("medical.specialist.phone")
//     .optional()
//     .trim()
//     .matches(/^\+?[\d\s-]{7,15}$|^$/),
//   body('medical.specialist.date').optional().trim().matches(/^\d{4}-\d{2}$|^$/),

//   body("medical.additionalDoctors").isArray(),
//   body("medical.additionalDoctors.*.name")
//     .optional()
//     .trim()
//     .matches(/^[a-zA-Z\s.,]+$/),
//   body("medical.additionalDoctors.*.phone")
//     .optional()
//     .trim()
//     .matches(/^\+?[\d\s-]{7,15}$|^$/),
//   body("medical.additionalDoctors.*.state")
//     .optional()
//     .trim()
//     .matches(/^[A-Z]{2}$|^$/),
//   body("medical.additionalDoctors.*.address").optional().trim(),
//   body("medical.additionalDoctors.*.zipCode")
//     .optional()
//     .trim()
//     .matches(/^\d{5}$|^$/),
//   body("medical.hospitalizations").isArray(),
//   body('medical.additionalDoctors.*.date').optional().trim().matches(/^\d{4}-\d{2}$|^$/),

//   body("medical.hospitalizations.*.phone")
//     .optional()
//     .trim()
//     .matches(/^\+?[\d\s-]{7,15}$|^$/),
//   body("medical.hospitalizations.*.date")
//     .optional()
//     .trim()
//     .matches(/^\d{4}-\d{2}$|^$/),
//   body("chatHistory").isArray(),
//   body("chatHistory.*.message").trim().notEmpty(),
//   body("chatHistory.*.type").isIn(["user", "avatar"]),
//   body("chatHistory.*.mode").isIn(["text_mode", "voice_mode"]),
//   body("chatHistory.*.timestamp").isISO8601(),
// ];


// Helper: allow "NA" or match a regex
const allowNA = (regex) => (value) => value === 'NA' || regex.test(value);

// Helper: allow "NA" or any float
const allowFloatNA = (value) => value === 'NA' || !isNaN(parseFloat(value));

// Helper: allow "NA" or specific values
const allowInNA = (allowed) => (value) => value === 'NA' || allowed.includes(value);

// Helper: allow boolean or string "true"/"false"
const allowBooleanOrString = (value) =>
  value === true || value === false || value === 'true' || value === 'false';

const validateFormData = [
  // Step 1 - Required fields
  body('name').trim().isLength({ min: 2 }),
  body('phone').trim().matches(/^\+?[\d\s-]{7,15}$/),
  body('email').trim().isEmail(),
  body('ssn').trim().matches(/^\d{4}$/),

  // Step 2
  body('marriedOverTenOrDeceased')
    .custom(allowBooleanOrString),
  body('spouseName')
    .if(body('marriedOverTenOrDeceased').equals('true'))
    .trim()
    .isLength({ min: 2 }),
  body('spouseDOB')
    .if(body('marriedOverTenOrDeceased').equals('true'))
    .trim()
    .custom(allowNA(/^\d{4}-\d{2}-\d{2}$/)),
  body('spouseSSN')
    .if(body('marriedOverTenOrDeceased').equals('true'))
    .trim()
    .custom(allowNA(/^\d{4}$/)),

  // Step 3 - Jobs
  body('jobs').isArray({ min: 1, max: 5 }),
  body('jobs.*.business').trim().custom(allowNA(/.{2,}/)),
  body('jobs.*.title').trim().custom(allowNA(/.{2,}/)),
  body('jobs.*.startDate').trim().custom(allowNA(/^\d{4}-\d{2}$/)),
  body('jobs.*.endDate').trim().custom((value) => value === 'NA' || value === 'present' || /^\d{4}-\d{2}$/.test(value)),
  body('jobs.*.payAmount').custom(allowFloatNA),
  body('jobs.*.payFrequency').custom(allowInNA(['hourly', 'biweekly', 'monthly', 'annually'])),

  // Step 4 - Medical
  body('medical.treatmentEndDate')
    .optional()
    .trim()
    .custom(allowNA(/^\d{4}-\d{2}$/)),

  body('medical.primaryCare.name')
    .optional()
    .trim()
    .custom(allowNA(/^[a-zA-Z\s.,]+$/)),
  body('medical.primaryCare.zipCode')
    .optional()
    .trim()
    .custom(allowNA(/^\d{5}$/)),
  body('medical.primaryCare.city')
    .optional()
    .trim(),
  body('medical.primaryCare.state')
    .optional()
    .trim()
    .custom(allowNA(/^[A-Z]{2}$/)),
  body('medical.primaryCare.phone')
    .optional()
    .trim()
    .custom(allowNA(/^\+?[\d\s-]{7,15}$/)),
  body('medical.primaryCare.date')
    .optional()
    .trim()
    .custom(allowNA(/^\d{4}-\d{2}$/)),

  body('medical.specialist.name')
    .optional()
    .trim()
    .custom(allowNA(/^[a-zA-Z\s.,]+$/)),
  body('medical.specialist.zipCode')
    .optional()
    .trim()
    .custom(allowNA(/^\d{5}$/)),
  body('medical.specialist.city')
    .optional()
    .trim(),
  body('medical.specialist.state')
    .optional()
    .trim()
    .custom(allowNA(/^[A-Z]{2}$/)),
  body('medical.specialist.phone')
    .optional()
    .trim()
    .custom(allowNA(/^\+?[\d\s-]{7,15}$/)),
  body('medical.specialist.date')
    .optional()
    .trim()
    .custom(allowNA(/^\d{4}-\d{2}$/)),

  body('medical.additionalDoctors').isArray(),
  body('medical.additionalDoctors.*.name')
    .optional()
    .trim()
    .custom(allowNA(/^[a-zA-Z\s.,]+$/)),
  body('medical.additionalDoctors.*.phone')
    .optional()
    .trim()
    .custom(allowNA(/^\+?[\d\s-]{7,15}$/)),
  body('medical.additionalDoctors.*.state')
    .optional()
    .trim()
    .custom(allowNA(/^[A-Z]{2}$/)),
  body('medical.additionalDoctors.*.address')
    .optional()
    .trim(),
  body('medical.additionalDoctors.*.zipCode')
    .optional()
    .trim()
    .custom(allowNA(/^\d{5}$/)),
  body('medical.additionalDoctors.*.date')
    .optional()
    .trim()
    .custom(allowNA(/^\d{4}-\d{2}$/)),

  body('medical.hospitalizations').isArray(),
  body('medical.hospitalizations.*.phone')
    .optional()
    .trim()
    .custom(allowNA(/^\+?[\d\s-]{7,15}$/)),
  body('medical.hospitalizations.*.date')
    .optional()
    .trim()
    .custom(allowNA(/^\d{4}-\d{2}$/)),

  // Chat history
  body('chatHistory').isArray(),
  body('chatHistory.*.message').trim().notEmpty(),
  body('chatHistory.*.type').isIn(['user', 'avatar']),
  body('chatHistory.*.mode').isIn(['text_mode', 'voice_mode']),
  body('chatHistory.*.timestamp').isISO8601(),
];



// async function generatePDF(formData) {
//   try {
//     // 1. Convert Mongoose document to plain JavaScript object
//     const data = formData.toObject ? formData.toObject() : formData;
    
//     // 2. Load template
//     const templatePath = path.join(__dirname, 'template.html');
//     const htmlTemplate = await fs.readFile(templatePath, 'utf8');

//     // 3. Prepare template data with proper structure
//     const templateData = {
//       name: data.name,
//       ssn: data.ssn,
//       marriedOverTenOrDeceased: data.marriedOverTenOrDeceased,
//       spouseName: data.spouseName,
//       spouseDOB: data.spouseDOB,
//       spouseSSN: data.spouseSSN,
//       jobs: (data.jobs || []).map(job => ({
//         business: job.business,
//         title: job.title,
//         startDate: job.startDate,
//         endDate: job.endDate === 'present' ? 'Present' : job.endDate,
//         payAmount: job.payAmount,
//         payFrequency: job.payFrequency
//       })),
//       medical: {
//         primaryCare: data.medical?.primaryCare || {},
//         specialist: data.medical?.specialist || {},
//         additionalDoctors: data.medical?.additionalDoctors || [],
//         hospitalizations: data.medical?.hospitalizations || []
//       }
//     };


//       handlebars.registerHelper('inc', function (value) {
//       return parseInt(value) + 1;
//     });

//     // 4. Compile template with safe access
//     const template = handlebars.compile(htmlTemplate, {
//       noEscape: true,
//       allowProtoPropertiesByDefault: true,
//       allowProtoMethodsByDefault: true
//     });
    
//     const html = template(templateData);

//     // 5. Debug: Save HTML for inspection
//     await fs.writeFile('debug_output.html', html);
//     console.log('Template data:', JSON.stringify(templateData, null, 2));

//     // 6. Generate PDF
//     // const browser = await puppeteer.launch({
//     //   headless: true,
//     //   args: ['--no-sandbox', '--disable-setuid-sandbox']
//     // });

//     const browser = await puppeteer.launch({
//       headless: 'new',
//       args: [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--disable-dev-shm-usage',
//         '--disable-accelerated-2d-canvas',
//         '--no-first-run',
//         '--no-zygote',
//         '--single-process',
//         '--disable-gpu'
//       ],
//       executablePath: process.env.CHROMIUM_PATH || undefined
//     });
    
//     const page = await browser.newPage();
    
//     await page.setContent(html, {
//       waitUntil: 'networkidle0',
//       timeout: 30000
//     });

//     const pdfFileName = `SS_App_${Date.now()}.pdf`;
//     await page.pdf({
//       path: pdfFileName,
//       format: 'A4',
     
//       printBackground: true
//     });

//     await browser.close();
//     return pdfFileName;
//   } catch (error) {
//     console.error('PDF generation failed:', error);
//     throw error;
//   }
// }












// Email transporter setup

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

    // Register Handlebars helper
    handlebars.registerHelper('inc', function(value) {
      return parseInt(value) + 1;
    });

    // 4. Compile template
    const template = handlebars.compile(htmlTemplate, {
      noEscape: true,
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    });
    
    const html = template(templateData);

    // 5. Debug: Save HTML for inspection
    await fs.writeFile('debug_output.html', html);
    console.log('Template data:', JSON.stringify(templateData, null, 2));

    // 6. Generate PDF using Puppeteer as shown in the example
    // const browser = await puppeteer.launch({
    //   headless: 'new',
    //   args: [
    //     '--no-sandbox',
    //     '--disable-setuid-sandbox',
    //     '--disable-dev-shm-usage',
    //     '--disable-accelerated-2d-canvas',
    //     '--no-first-run',
    //     '--no-zygote',
    //     '--single-process',
    //     '--disable-gpu'
    //   ],
    //   executablePath: process.env.CHROMIUM_PATH || undefined
    // });
    const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--single-process'
  ],
  executablePath: '/usr/bin/chromium-browser'
});
    try {
      const page = await browser.newPage();
      
      // Set the HTML content
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Set viewport size (optional but recommended)
      await page.setViewport({ width: 1080, height: 1024 });

      // Generate PDF file name
      const pdfFileName = `SS_App_${Date.now()}.pdf`;

      // Generate PDF with options
      await page.pdf({
        path: pdfFileName,
        format: 'A4',
        printBackground: true,
       
      });

      return pdfFileName;
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
}

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
      .json({ errors: errors.array() });
  }

  try {
    // Custom validation for treatment end date
    if (req.body.medical.treatmentEndDate && req.body.medical.treatmentEndDate !== "NA") {
      const treatmentDate = new Date(req.body.medical.treatmentEndDate);
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      if (treatmentDate > new Date() || treatmentDate < twoYearsAgo) {
        return res.status(400).json({
          error: "Treatment end date must be within the last two years",
        });
      }
    }

    // Clean up data and convert payAmount if necessary
    const formData = {
      ...req.body,
      jobs: req.body.jobs.map((job) => ({
        ...job,
        payAmount: job.payAmount === "NA" ? "NA" : parseFloat(job.payAmount), // Convert to number if not "NA"
      })),
      medical: {
        ...req.body.medical,
        additionalDoctors: req.body.medical.additionalDoctors.filter(
          (doc) => doc.name || doc.city || doc.phone || doc.state || doc.date || doc.zipCode
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
        to: ["ammar@meetgabbi.com", "ayaz.ext@gmail.com" ,"erik@meetgabbi.com" ],
        subject: `SS application Form ${savedData.name}`,
        text: `Dear Team,\n\nA new form submission has been received from ${savedData.name}. Please find attached the PDF containing the submitted information.\n\nBest regards,\nSystem`,
        attachments: [{ filename: `form_submission_${savedData._id}.pdf`, path: pdfFileName }],
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
