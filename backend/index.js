const express = require('express')
const cors = require('cors')
const { Sequelize } = require('sequelize')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()
app.use(cors()) // Разрешить запросы с фронтенда
app.use(express.json())

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
})

sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err))

const User = require('./models/User')

// Эндпоинт для регистрации
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      email,
      password_hash: hashedPassword,
      username,
      preferences: {},
    })
    res.status(201).json({ message: 'User registered', userId: user.user_id })
  } catch (error) {
    res.status(400).json({ message: 'Registration failed', error: error.message })
  }
})

// Эндпоинт для входа
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid password' })
    }
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' })
    res.json({ message: 'Login successful', token })
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message })
  }
})

app.get('/', (req, res) => {
  res.send('Music Streaming API')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))