const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const MongooseError = require('./helpers')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 20,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  avatar: {
    type: String,
    default: '/assest/avatar_ph.png',
  },
})

userSchema.pre('save', async function () {
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 12)
  }

  if (user.isModified('email')) {
    const duplicate = await User.findOne({ email: this.email })
    if (duplicate) {
      throw new MongooseError.DuplicateEmailError('This Email is already registered.')
    }
  }
})

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })
  if (!user) return null

  const isPasswordMatch = await bcrypt.compare(password, user.password)
  if (!isPasswordMatch) {
    return null
  }
  return user
}

userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.password)
}

const User = mongoose.model('User', userSchema)
module.exports = User
