const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres' })
const User = require('./User')
const Track = require('./Track')
const Album = require('./Album')

const Favorite = sequelize.define('Favorite', {
  favorite_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, references: { model: User, key: 'user_id' }, allowNull: false },
  track_id: { type: DataTypes.INTEGER, references: { model: Track, key: 'track_id' } },
  album_id: { type: DataTypes.INTEGER, references: { model: Album, key: 'album_id' } },
}, { tableName: 'favorites' })

Favorite.belongsTo(User, { foreignKey: 'user_id' })
Favorite.belongsTo(Track, { foreignKey: 'track_id' })
Favorite.belongsTo(Album, { foreignKey: 'album_id' })


sequelize.sync({ alter: true })
  .then(() => console.log('User table updated'))
  .catch(err => console.error('Error updating User table:', err))

module.exports = Favorite