const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const jwt = require('jsonwebtoken')
const { pool } = require('../db')
const { minioClient, BUCKET_NAME } = require('../utils/minio')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /mp3|jpeg|jpg|png/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)
    if (mimetype && extname) return cb(null, true)
    cb(new Error('Error: File type not supported!'))
  }
})

router.post('/', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })

  let userId
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    userId = decoded.userId
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const { title, artist, genre, release_date } = req.body
  const audioFile = req.files.audio?.[0]
  const coverFile = req.files.cover?.[0]

  if (!audioFile) return res.status(400).json({ error: 'Audio file is required' })
  if (!title || !artist || !genre || !release_date) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  try {
    const audioFileName = `${Date.now()}-${audioFile.originalname}`
    const coverFileName = coverFile ? `${Date.now()}-${coverFile.originalname}` : null

    // Сохранение аудио в MinIO
    await minioClient.putObject(BUCKET_NAME, `audio/${audioFileName}`, audioFile.buffer, audioFile.size)
    const audioUrl = `/audio/${audioFileName}`

    // Сохранение обложки в MinIO, если она есть
    let coverUrl = null
    if (coverFile) {
      await minioClient.putObject(BUCKET_NAME, `covers/${coverFileName}`, coverFile.buffer, coverFile.size)
      coverUrl = `/covers/${coverFileName}`
    }

    const query = `
      INSERT INTO tracks (user_id, title, artist, genre, release_date, audio_path, cover_path)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING track_id
    `
    const values = [userId, title, artist, genre, release_date, audioUrl, coverUrl]
    const result = await pool.query(query, values)

    res.status(201).json({ message: 'Track uploaded successfully', track_id: result.rows[0].track_id })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ error: 'Failed to upload track' })
  }
})

module.exports = router