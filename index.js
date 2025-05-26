

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log('Incoming request body:', JSON.stringify(req.body, null, 2));
  next();
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/avatar_users', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

connectDB();

// Schemas
const conversationHistorySchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, required: true, enum: ['user', 'avatar'] },
  mode: { type: String, enum: ['text', 'voice'], default: 'text' },
  timestamp: { type: Date, required: true }
});

const employmentHistorySchema = new mongoose.Schema({
  employer: { type: String, required: true },
  position: { type: String, required: true },
  businessType: { type: String, default: 'Unknown' },
  pay: { type: String, default: 'Unknown' },
  years: { type: String, default: 'Unknown' }
});

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /\d{10,15}/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  socialSecurityNumber: {
    type: String,
    select: false
  },
  maritalStatus: String,
  employmentHistory: [employmentHistorySchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  conversationHistory: [conversationHistorySchema]
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

// API Routes

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date()
  });
});

app.post('/api/users', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, employmentHistory, conversationHistory } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Parse conversationHistory
    let parsedConversationHistory = [];
    if (conversationHistory) {
      let input = conversationHistory;
      while (typeof input === 'string') {
        try {
          input = JSON.parse(input);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Invalid conversationHistory format',
            error: error.message
          });
        }
      }
      parsedConversationHistory = Array.isArray(input) ? input : [input];

      console.log('Parsed conversationHistory (pre-transform):', JSON.stringify(parsedConversationHistory, null, 2));

      parsedConversationHistory = parsedConversationHistory.map((entry, index) => {
        if (!entry || !entry.message || !entry.type || !entry.timestamp) {
          throw new Error(`Invalid entry at index ${index}: missing required fields`);
        }
        const timestamp = moment(entry.timestamp, ['h:mm:ss A', 'YYYY-MM-DDTHH:mm:ss']).toDate();
        if (isNaN(timestamp.getTime())) {
          throw new Error(`Invalid timestamp format at index ${index}: ${entry.timestamp}`);
        }
        return {
          message: String(entry.message),
          type: String(entry.type),
          mode: entry.mode ? String(entry.mode) : 'text',
          timestamp
        };
      });

      console.log('Final parsedConversationHistory:', JSON.stringify(parsedConversationHistory, null, 2));
    }

    // Parse employmentHistory
    let parsedEmploymentHistory = [];
    if (employmentHistory) {
      let input = employmentHistory;
      while (typeof input === 'string') {
        try {
          input = JSON.parse(input);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Invalid employmentHistory format',
            error: error.message
          });
        }
      }
      parsedEmploymentHistory = Array.isArray(input) ? input : [input];

      parsedEmploymentHistory = parsedEmploymentHistory.map((entry, index) => {
        if (!entry || !entry.employer || !entry.position) {
          throw new Error(`Invalid employment entry at index ${index}: missing required fields`);
        }
        return {
          employer: String(entry.employer),
          position: String(entry.position),
          businessType: String(entry.businessType || 'Unknown'),
          pay: String(entry.pay || 'Unknown'),
          years: String(entry.years || 'Unknown')
        };
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (parsedConversationHistory.length > 0) {
        existingUser.conversationHistory.push(...parsedConversationHistory);
      }
      if (parsedEmploymentHistory.length > 0) {
        existingUser.employmentHistory.push(...parsedEmploymentHistory);
      }
      existingUser.firstName = firstName || existingUser.firstName;
      existingUser.lastName = lastName || existingUser.lastName;
      existingUser.phone = phone || existingUser.phone;

      console.log('existingUser before save:', JSON.stringify(existingUser, null, 2));
      await existingUser.save();

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user: existingUser.toObject({ virtuals: true })
      });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      employmentHistory: parsedEmploymentHistory,
      conversationHistory: parsedConversationHistory
    });

    console.log('newUser before save:', JSON.stringify(newUser, null, 2));
    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: newUser.toObject({ virtuals: true })
    });
  } catch (error) {
    console.error('Error in /api/users POST:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    if (error.message.includes('Invalid timestamp format') || 
        error.message.includes('Invalid entry') || 
        error.message.includes('Invalid employment entry')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data provided',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page or limit parameters'
      });
    }
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-conversationHistory -__v')
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      users
    });
  } catch (error) {
    console.error('Error in /api/users GET:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-__v')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error in /api/users/:id GET:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
