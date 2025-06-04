const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres' })

const User = require('./User')(sequelize, DataTypes)
const Album = require('./Album')(sequelize, DataTypes)
const Track = require('./Track')(sequelize, DataTypes)

User.hasMany(Album, { foreignKey: 'user_id' })
Album.belongsTo(User, { foreignKey: 'user_id' })
Album.hasMany(Track, { foreignKey: 'album_id' })
Track.belongsTo(Album, { foreignKey: 'album_id' })

module.exports = { sequelize, User, Album, Track }