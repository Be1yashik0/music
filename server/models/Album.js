const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres' })

const Album = sequelize.define('Album', {
  album_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  artist: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  release_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  cover_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'albums',
})

sequelize.sync({ alter: true })
  .then(() => console.log('Album table updated'))
  .catch(err => console.error('Error updating Album table:', err))
  

module.exports = Album

const Track = require('./Track')

Album.hasMany(Track, { foreignKey: 'album_id', as: 'tracks' })
Track.belongsTo(Album, { foreignKey: 'album_id' })