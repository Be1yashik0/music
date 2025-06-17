const Minio = require('minio')

const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin123'
})

const BUCKET_NAME = 'tracks'

async function ensureBucket() {
  const bucketExists = await minioClient.bucketExists(BUCKET_NAME)
  if (!bucketExists) {
    await minioClient.makeBucket(BUCKET_NAME, 'us-east-1')
    console.log(`Bucket ${BUCKET_NAME} created`)
  }
}

ensureBucket().catch(err => console.error('Error ensuring bucket:', err))

module.exports = { minioClient, BUCKET_NAME }