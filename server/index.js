const express = require('express')
const cors = require('cors')
const { Sequelize } = require('sequelize')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const YandexStrategy = require('passport-yandex').Strategy
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('dotenv').config()

const app = express()
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cors())
app.use(express.json())
app.use('/uploads/covers', express.static(path.join(__dirname, 'uploads/covers')))
app.use('/uploads/audio', express.static(path.join(__dirname, 'uploads/audio')))
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')))
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET')
  next()
})


// Настройка Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'cover') {
      cb(null, 'uploads/cover/')
      cb(null, 'uploads/audio/')
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`)
  },
})
const upload = multer({ storage })
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Passport настройка
app.use(passport.initialize())

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
})

sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err))

const User = require('./models/User')




// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token required' })
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' })
    req.user = user
    next()
  })
}

// Passport стратегии
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ where: { email: profile.emails[0].value } })
    if (!user) {
      user = await User.create({
        email: profile.emails[0].value,
        username: profile.displayName,
        avatar: profile.photos[0].value,
        preferences: {},
      })
    }
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' })
    done(null, { userId: user.user_id, username: user.username, email: user.email, avatar: user.avatar, token })
  } catch (error) {
    done(error)
  }
}))

passport.use(new YandexStrategy({
  clientID: process.env.YANDEX_CLIENT_ID,
  clientSecret: process.env.YANDEX_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/auth/yandex/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ where: { email: profile.emails[0].value } })
    if (!user) {
      user = await User.create({
        email: profile.emails[0].value,
        username: profile.displayName,
        avatar: profile.photos ? profile.photos[0].value : null,
        preferences: {},
      })
    }
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' })
    done(null, { userId: user.user_id, username: user.username, email: user.email, avatar: user.avatar, token })
  } catch (error) {
    done(error)
  }
}))

// OAuth маршруты
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
app.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const { userId, username, email, avatar, token } = req.user
  res.redirect(`http://localhost:5173/login?token=${token}&userId=${userId}&username=${username}&email=${email}&avatar=${avatar}`)
})

app.get('/auth/yandex', passport.authenticate('yandex'))
app.get('/auth/yandex/callback', passport.authenticate('yandex', { session: false }), (req, res) => {
  const { userId, username, email, avatar, token } = req.user
  res.redirect(`http://localhost:5173/login?token=${token}&userId=${userId}&username=${username}&email=${email}&avatar=${avatar}`)
})



app.put('/api/auth/profile', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const { username, email } = req.body
    const user = await User.findByPk(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    user.username = username || user.username
    user.email = email || user.email
    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`
    }
    await user.save()
    res.json({ message: 'Profile updated', username: user.username, email: user.email, avatar: user.avatar })
  } catch (error) {
    res.status(400).json({ message: 'Profile update failed', error: error.message })
  }
})

app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ user: { id: user.user_id, username: user.username, email: user.email, avatar: user.avatar } })
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message })
  }
})

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    console.log('User ID from token:', req.user.userId)
    const user = await User.findByPk(req.user.userId)
    if (!user) {
      console.log('User not found for ID:', req.user.userId)
      return res.status(404).json({ message: 'User not found' })
    }
    console.log('User found:', user.email)
    res.json({ username: user.username, email: user.email, avatar: user.avatar })
  } catch (error) {
    console.error('Get profile error:', error.stack)
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message })
  }
})

// треки

const Track = require('./models/Track')
const Album = require('./models/Album')

// Настройка Multer для аудио и обложек
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      cb(null, 'uploads/audio/')
    } else if (file.fieldname === 'cover') {
      cb(null, 'uploads/covers/')
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})
const audioUpload = multer({ 
  storage: audioStorage,
  limits: { fileSize: 100 * 1024 * 1024 } // Лимит 100 МБ
})

app.use('/uploads/audio', express.static(path.join(__dirname, 'uploads/audio')))
app.use('/uploads/covers', express.static(path.join(__dirname, 'Uploads/covers')))

// Загрузка сингла
app.post('/api/tracks/single', authenticateToken, audioUpload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, artist, release_date, genre } = req.body
    const track = await Track.create({
      title,
      artist,
      release_date,
      audio_url: `/uploads/audio/${req.files.audio[0].filename}`,
      cover_url: req.files.cover ? `/uploads/covers/${req.files.cover[0].filename}` : null,
      genre,
      user_id: req.user.userId,
    })
    res.status(201).json({ message: 'Single uploaded', track })
  } catch (error) {
    res.status(400).json({ message: 'Single upload failed', error: error.message })
  }
})

// Загрузка альбома
app.post('/api/albums', authenticateToken, audioUpload.fields([{ name: 'audio', maxCount: 10 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, artist, release_date, genre, tracks } = req.body
    const parsedTracks = JSON.parse(tracks)
    const album = await Album.create({
      title,
      artist,
      release_date,
      cover_url: req.files.cover ? `/uploads/covers/${req.files.cover[0].filename}` : null,
      genre,
      user_id: req.user.userId,
    })
    const trackPromises = parsedTracks.map((track, index) => {
      return Track.create({
        title: track.title,
        artist,
        release_date,
        audio_url: `/uploads/audio/${req.files.audio[index].filename}`,
        cover_url: req.files.cover ? `/uploads/covers/${req.files.cover[0].filename}` : null,
        genre,
        album_id: album.album_id,
        user_id: req.user.userId,
      })
    })
    await Promise.all(trackPromises)
    res.status(201).json({ message: 'Album uploaded', album })
  } catch (error) {
    res.status(400).json({ message: 'Album upload failed', error: error.message })
  }
})

// Получение всех треков
app.get('/api/tracks', async (req, res) => {
  try {
    const tracks = await Track.findAll()
    console.log('Fetched tracks:', tracks.map(t => ({ id: t.id, title: t.title, audio_url: t.audio_url })))
    res.json(tracks)
  } catch (error) {
    console.error('Error fetching tracks:', error.stack)
    res.status(500).json({ message: 'Failed to fetch tracks', error: error.message })
  }
})

// Получение всех альбомов
app.get('/api/albums', async (req, res) => {
  try {
    const albums = await Album.findAll({
      include: [{
        model: Track,
        as: 'tracks',
        attributes: [],
      }],
      attributes: {
        include: [[Sequelize.fn('COUNT', Sequelize.col('tracks.track_id')), 'track_count']],
      },
      group: ['Album.album_id'],
    })
    res.json(albums)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching albums', error: error.message })
  }
})

// Получение треков альбома
app.get('/api/albums/:album_id/tracks', async (req, res) => {
  try {
    const tracks = await Track.findAll({ where: { album_id: req.params.album_id } })
    res.json(tracks)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching album tracks', error: error.message })
  }
})

// Увеличение счётчика прослушиваний
app.post('/api/tracks/:track_id/listen', async (req, res) => {
  try {
    const track = await Track.findByPk(req.params.track_id)
    if (!track) return res.status(404).json({ message: 'Track not found' })
    track.listens += 1
    await track.save()
    res.json({ message: 'Listen counted' })
  } catch (error) {
    res.status(500).json({ message: 'Error counting listen', error: error.message })
  }
})


app.get('/', (req, res) => {
  res.send('Music Streaming API')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

