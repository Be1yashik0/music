const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres' })

const User = require('./User')(sequelize, DataTypes)
const Album = require('./Album')(sequelize, DataTypes)
const Track = require('./Track')(sequelize, DataTypes)
const Favorite = require('./Favorites')(sequelize, DataTypes)

User.hasMany(Album, { foreignKey: 'user_id' })
Album.belongsTo(User, { foreignKey: 'user_id' })
Album.hasMany(Track, { foreignKey: 'album_id' , onDelete: 'CASCADE' })
Track.belongsTo(Album, { foreignKey: 'album_id' })
Track.hasMany(Favorite, { foreignKey: 'track_id', onDelete: 'CASCADE' })
User.hasMany(Favorite, { foreignKey: 'user_id', onDelete: 'CASCADE' })
User.hasMany(Track, { foreignKey: 'user_id', onDelete: 'CASCADE' })
Album.hasMany(Favorite, { foreignKey: 'album_id', onDelete: 'CASCADE' })
module.exports = { sequelize, User, Album, Track }