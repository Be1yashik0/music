const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const FavoriteTrack = sequelize.define('FavoriteTrack', {
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'user_id',
    },
  },
  track_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'tracks',
      key: 'track_id',
    },
  },
}, {
  tableName: 'favorite_tracks',
  timestamps: false,
})

module.exports = (sequelize, DataTypes) => FavoriteTrack