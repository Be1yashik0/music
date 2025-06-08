const express = require('express')
const cors = require('cors')
const { Sequelize } = require('sequelize')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const YandexStrategy = require('passport-yandex').Strategy
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')
require('dotenv').config()

const app = express()
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(cors())
app.use(express.json())

// Настройка статических директорий
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
      cb(null, 'uploads/covers/')
    } else if (file.fieldname === 'audio') {
      cb(null, 'uploads/audio/')
    } else if (file.fieldname === 'avatar') {
      cb(null, 'uploads/avatars/')
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } })

// Passport настройка
app.use(passport.initialize())

const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres' })

sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err))

const User = require('./models/User')
const Track = require('./models/Track')
const Album = require('./models/Album')
const Favorite = require('./models/Favorites')

sequelize.sync({ alter: true })
  .then(() => console.log('Database and models synchronized'))
  .catch(err => console.error('Database synchronization error:', err))

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

// Middleware для проверки прав администратора
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId)
    if (!user || !user.is_admin) {
      return res.status(403).json({ message: 'Access denied: Admins only' })
    }
    next()
  } catch (error) {
    res.status(500).json({ message: 'Error checking admin status', error: error.message })
  }
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

// Профиль
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
    res.json({ user: { id: user.user_id, username: user.username, email: user.email, avatar: user.avatar, is_admin: user.is_admin } })
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

// Треки и альбомы
app.post('/api/tracks/single', authenticateToken, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, artist, release_date, genre } = req.body
    if (!req.files.audio || !req.files.audio.length) {
      return res.status(400).json({ message: 'Audio file is required' })
    }
    const track = await Track.create({
      title,
      artist,
      release_date,
      audio_url: `/uploads/audio/${req.files.audio[0].filename}`,
      cover_url: req.files.cover && req.files.cover.length ? `/uploads/covers/${req.files.cover[0].filename}` : null,
      genre,
      user_id: req.user.userId,
    })
    res.status(201).json({ message: 'Single uploaded', track })
  } catch (error) {
    console.error('Upload single error:', error.stack)
    res.status(400).json({ message: 'Single upload failed', error: error.message })
  }
})

app.post('/api/albums', authenticateToken, upload.fields([{ name: 'audio', maxCount: 10 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, artist, release_date, genre, tracks } = req.body
    const parsedTracks = JSON.parse(tracks)
    if (!req.files.audio || req.files.audio.length !== parsedTracks.length) {
      return res.status(400).json({ message: 'Number of audio files must match tracks array' })
    }
    const album = await Album.create({
      title,
      artist,
      release_date,
      cover_url: req.files.cover && req.files.cover.length ? `/uploads/covers/${req.files.cover[0].filename}` : null,
      genre,
      user_id: req.user.userId,
    })
    const trackPromises = parsedTracks.map((track, index) => {
      return Track.create({
        title: track.title,
        artist,
        release_date,
        audio_url: `/uploads/audio/${req.files.audio[index].filename}`,
        cover_url: req.files.cover && req.files.cover.length ? `/uploads/covers/${req.files.cover[0].filename}` : null,
        genre,
        album_id: album.album_id,
        user_id: req.user.userId,
      })
    })
    await Promise.all(trackPromises)
    res.status(201).json({ message: 'Album uploaded', album })
  } catch (error) {
    console.error('Upload album error:', error.stack)
    res.status(400).json({ message: 'Album upload failed', error: error.message })
  }
})

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

app.get('/api/albums/:album_id/tracks', async (req, res) => {
  try {
    const tracks = await Track.findAll({ where: { album_id: req.params.album_id } })
    res.json(tracks)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching album tracks', error: error.message })
  }
})

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

// Админские эндпоинты
app.delete('/api/tracks/:track_id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const track = await Track.findByPk(req.params.track_id)
    if (!track) {
      return res.status(404).json({ message: 'Track not found' })
    }
    await track.destroy()
    res.json({ message: 'Track deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting track', error: error.message })
  }
})

app.delete('/api/albums/:album_id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const album = await Album.findByPk(req.params.album_id)
    if (!album) {
      return res.status(404).json({ message: 'Album not found' })
    }
    await album.destroy()
    res.json({ message: 'Album deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting album', error: error.message })
  }
})

app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll()
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message })
  }
})

app.delete('/api/users/:user_id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.user_id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (user.is_admin) {
      return res.status(403).json({ message: 'Cannot delete admin user' })
    }
    await user.destroy()
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message })
  }
})

// Избранное
app.post('/api/favorites/track/:track_id', authenticateToken, async (req, res) => {
  try {
    const { track_id } = req.params
    const user_id = req.user.userId
    const existing = await Favorite.findOne({ where: { user_id, track_id } })
    if (existing) {
      return res.status(400).json({ message: 'Track already in favorites' })
    }
    await Favorite.create({ user_id, track_id })
    res.json({ message: 'Track added to favorites' })
  } catch (error) {
    res.status(500).json({ message: 'Error adding track to favorites', error: error.message })
  }
})

app.post('/api/favorites/album/:album_id', authenticateToken, async (req, res) => {
  try {
    const { album_id } = req.params
    const user_id = req.user.userId
    const existing = await Favorite.findOne({ where: { user_id, album_id } })
    if (existing) {
      return res.status(400).json({ message: 'Album already in favorites' })
    }
    await Favorite.create({ user_id, album_id })
    res.json({ message: 'Album added to favorites' })
  } catch (error) {
    res.status(500).json({ message: 'Error adding album to favorites', error: error.message })
  }
})

app.delete('/api/favorites/track/:track_id', authenticateToken, async (req, res) => {
  try {
    const { track_id } = req.params
    const user_id = req.user.userId
    const favorite = await Favorite.findOne({ where: { user_id, track_id } })
    if (!favorite) {
      return res.status(404).json({ message: 'Track not in favorites' })
    }
    await favorite.destroy()
    res.json({ message: 'Track removed from favorites' })
  } catch (error) {
    res.status(500).json({ message: 'Error removing track from favorites', error: error.message })
  }
})

app.delete('/api/favorites/album/:album_id', authenticateToken, async (req, res) => {
  try {
    const { album_id } = req.params
    const user_id = req.user.userId
    const favorite = await Favorite.findOne({ where: { user_id, album_id } })
    if (!favorite) {
      return res.status(404).json({ message: 'Album not in favorites' })
    }
    await favorite.destroy()
    res.json({ message: 'Album removed from favorites' })
  } catch (error) {
    res.status(500).json({ message: 'Error removing album from favorites', error: error.message })
  }
})

app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId
    const favorites = await Favorite.findAll({
      where: { user_id },
      include: [
        { model: Track, as: 'Track' },
        { model: Album, as: 'Album' },
      ],
    })
    const tracks = favorites.filter(f => f.track_id).map(f => f.Track)
    const albums = favorites.filter(f => f.album_id).map(f => f.Album)
    res.json({ tracks, albums })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites', error: error.message })
  }
})

// Поиск
app.get('/api/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Query must be at least 2 characters' })
    }

    const tracks = await Track.findAll({
      where: {
        [Sequelize.Op.or]: [
          { title: { [Sequelize.Op.iLike]: `%${q}%` } },
          { artist: { [Sequelize.Op.iLike]: `%${q}%` } },
        ],
      },
    })

    const albums = await Album.findAll({
      where: {
        [Sequelize.Op.or]: [
          { title: { [Sequelize.Op.iLike]: `%${q}%` } },
          { artist: { [Sequelize.Op.iLike]: `%${q}%` } },
        ],
      },
    })

    res.json({ tracks, albums })
  } catch (error) {
    res.status(500).json({ message: 'Error searching', error: error.message })
  }
})

app.get('/', (req, res) => {
  res.send('Music Streaming API')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))