
const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt'); // imports the hashing library

const userSchema = new mongoose.Schema( 
    {
        
   name:
   {
    type: String, 
    required: [true, 'Name is required'] , 
    trim: true 
   },


   email:
   {
    type: String,
    required: [true, 'Email is required'],
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address'] // validates the email format
    },

    password:
    {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
        validator: function(value) {

         // Skip validation if already hashed (bcrypt hashes start with $2b$)
            if (value.startsWith('$2b$'))
                 return true;
                
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value);
        },
        message: 'Password must have at least one lowercase letter, one uppercase letter, and one number'
    },
    select: false // prevents the password from being returned in queries by default

    },

    phone: 
    {
        type:String, //leh string? 3alashan ymkn ykon feh 0 aw +2 fel awel (w bytshalo lw est5dmna number)
        trim: true, 
        match: [/^\+?[0-9]{7,15}$/, 'Please use a valid phone number']//bnt2kd en howa mashy 3ala format el phone number

    },

    location:
    {
        type: String,
        trim: true

    },

    role:
    {
        type: String,
        enum: ['customer', 'admin','superadmin'], // limits the role to either 'user' or 'admin' (enum howa list of el accepted values)
        default: 'customer' // sets the default role to 'customer'
    },


    buildingInfo:
   {
    roofArea: {
        type: Number,
        min: [0, 'Roof area must be a positive number'] // validates that the roof area is a positive number
    },

    monthlyConsumption: {
         type: Number,
         min: [0, 'Consumption must be a positive number']

    },

    governate:
    {
    type: String,
    trim: true
    }  
   }

},

      { timestamps: true } // adds createdAt and updatedAt fields 

);

//pre save abl ma y3ml save lel user, hash the password using bcrypt
userSchema.pre('save', async function (next) { 
    if (!this.isModified('password')) { // checks if the password field has been modified
        return next(); // if not, move to the next middleware
    }

    //salt = ensures the hashing is different each time even for the same password
     const salt = await bcrypt.genSalt(10); // generates a salt with a cost factor of 10 (higher cost,higher security but slower hashing)
     this.password = await bcrypt.hash(this.password, salt);// hashes the password using the generated salt and updates the password field with the hashed value
    next();
    }
);

//method to compare the entered password with the hashed password in the database
userSchema.methods.comparePassword = async function (enteredPassword) { // takes the entered password as an argument
    return await bcrypt.compare(enteredPassword, this.password); // compares the entered password with the hashed password and returns true if they match, false otherwise
};

module.exports = mongoose.model('User', userSchema); // exports the user model based on the defined schema
