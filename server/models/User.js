const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres' })

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'users',
})

sequelize.sync({ alter: true })
  .then(() => console.log('User table updated'))
  .catch(err => console.error('Error updating User table:', err))

module.exports = User