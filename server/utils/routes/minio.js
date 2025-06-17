const express = require('express')
const router = express.Router()
const { minioClient, BUCKET_NAME } = require('../utils/minio')

router.get('/*', async (req, res) => {
  const filePath = req.path.substring(1) // Убираем начальный слэш

  try {
    const stat = await minioClient.statObject(BUCKET_NAME, filePath)
    const stream = await minioClient.getObject(BUCKET_NAME, filePath)

    res.setHeader('Content-Type', stat.metaData['content-type'] || 'application/octet-stream')
    res.setHeader('Content-Length', stat.size)
    stream.pipe(res)
  } catch (err) {
    console.error('Error fetching file from MinIO:', err)
    res.status(404).json({ error: 'File not found' })
  }
})

module.exports = router