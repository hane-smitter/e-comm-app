const mongoose = require('mongoose');

productSchema = new mongoose.Schema({
    name: {
        type: String,
        lowerCase: true,
        trim: true,
        required: true,
        maxLength: 35
    },
    price: {
        type: Number,
        trim: true,
        required: true,
        validate(value) {
            if(typeof value !== 'number') {
                throw new Error('price should be a number!');
            }
            if(value < 0) {
                throw new Error('price cannot be less than 0');
            }
        }
    },
    description: {
        type: String,
        default: 'No Description'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    image: {
        type: Buffer
    },
    thumbnail: {
        type: Buffer
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);