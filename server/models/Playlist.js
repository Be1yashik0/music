const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Playlist = sequelize.define('Playlist', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id',
    },
  },
}, {
  tableName: 'playlists',
  timestamps: false,
})

module.exports = (sequelize, DataTypes) => Playlist