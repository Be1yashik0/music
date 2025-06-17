const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres' })

const Track = sequelize.define('Track', {
  track_id: {
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
  audio_url: {
    type: DataTypes.STRING,
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
  listens: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  album_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'tracks',
})

sequelize.sync({ alter: true })
  .then(() => console.log('Track table updated'))
  .catch(err => console.error('Error updating Track table:', err))

module.exports = Track