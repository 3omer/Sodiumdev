const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

//TODO: validation

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: "/assest/avatar_ph.png"
    }
})


userSchema.pre("save", async function() {
    const user = this
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 12)
    }
})

userSchema.statics.findByCredential = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error("Invalid login credentials")
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error("Invalid login credentials")
    }
    return user
}

userSchema.methods.verifyPassword = async function(password) {
    return await bcrypt.compare(password, this.password)
}

const User = mongoose.model("User", userSchema)

module.exports = { userSchema, User }
