import {Schema, model} from 'mongoose';
import bcrypt from 'bcryptjs';

/* ---------------- user model ---------------- */
const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email:{
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email already exist"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    role: {
        type: String,
        enum: ["owner", "admin", "user"],
        default: "user"
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isPassChanged: {
        type: Date,
    }
}, {timestamps: true});


/* hashing password */
userSchema.pre("save", async function(next){
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next()
});

/* compare password with hash value */
userSchema.methods.comparePassword = function(givenPassword){
    return bcrypt.compare(givenPassword, this.password)
}

/* remove un-necessary data from user */
userSchema.methods.clean = function(){
    const user = this.toObject() // convert to plain JS object
    delete user.password;
    delete user.__v;
    return user;
}

/* return public user data */
userSchema.methods.getUserPayload = function(){
    return {
        userId: this.userId,
        name: this.name,
        email: this.email
    }
}

/* ------------ verify token model ------------ */
const tokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: [true, "userId is required"]
    },
    token: {
        type: String,
        required: [true, "token is required"]
    }
}, {timestamps: true});



export const User = model("User", userSchema);
export const VToken = model("VToken", tokenSchema);
