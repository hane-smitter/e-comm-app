const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const Product = require('./Product');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    email : {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('invalid Email');
            }
        }
    },
    password: {
        type: String
    },
    googleid: {
        type: String
    },
    facebookid: {
        type: String
    }
}, {
    timestamps: true
});

/* hashing password before save */
userSchema.pre('save', async function (next) {
    this.isModified('password') ? this.password = await bcrypt.hash(this.password, 8):

    next();
});
/* deleting user's associated product(s) ) */
userSchema.pre('remove', async function(next) {
    await Product.deleteMany({
        owner: this._id
    });
    next();
});

userSchema.statics.findByCredentials = async function(email, password) {
    const userModel = this;
    try {
        const user = await userModel.findOne({email});
        if(!user) {
            throw new Error('invalid credentials');
        }
        const passMatch = await bcrypt.compare(password, user.password);
        if(!passMatch) {
            throw new Error('invalid credentials');
        }
        return user;
        
    } catch (err) {
        throw new Error(err)
    }
}

userSchema.statics.findExisting = async function(email) {
    const userModel = this;
    try {
        const user = await userModel.findOne({email});
        if(!user) {
            return false;
        }
        return true;
    } catch (err) {
        throw new Error(err);
    }
    
    
}

//google log in
userSchema.statics.findOrCreate = async function(profile) {
    const userModel = this;

    var user = await userModel.findOne({googleid: profile.id});
    if(user) {
        return user;
    }

    const newUser = {
        googleid: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value
    }
    user = await new userModel(newUser).save();
    return user;
        
}

module.exports = mongoose.model('User', userSchema);