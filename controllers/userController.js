const User = require('../models/User');

// GET user profile (b3mlo fetch again 3shan ya5od kol el up to date data)
const getProfile = async (req, res) => {
    try{
        const user = await User.findById(req.user._id).select('-password'); //double defense 

        if(!user){
            return res.status(404).json({
                 message: 'User not found',
                 success: false 
                });
            }

          res.status(200).json({
            success:true,
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                location: user.location,
                buildingInfo: user.buildingInfo
            }
        });

    }catch(err){
        console.error('Error fetching user profile:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile'
            
          });


                
    }
}

const updateProfile = async (req, res) => {
    try{

        const {name,phone,location,buildingInfo}=req.body;

        const updatedFields={}; //updates only the fields that are sent so it doesn't overwrite
        if(name)       
        updatedFields.name=name;

        if(phone)             
        updatedFields.phone=phone;

        if(location)           
        updatedFields.location=location;

        if(buildingInfo)     
        updatedFields.buildingInfo=buildingInfo;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updatedFields,
      { 
        new: true, //returns updated doc
        runValidators: true //runs validators in user.js
      }
    ).select('-password');

        if(!user){
        return res.status(404).json({
        success: false,
        message: 'User not found'
      });
     }

        res.status(200).json({
        success:true,
          user:{
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              phone: user.phone,
              location: user.location,
              buildingInfo: user.buildingInfo
            }

        });

    }catch(err){
        console.error('Error updating user profile:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
            
          });


                
    }
}


const deleteProfile = async (req, res) => {
  try {

    const user = await User.findByIdAndDelete(req.user._id); //finds user and deletes

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (err) {
    console.error('Error deleting user profile:',err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user profile'
    });
  }
};


const updatePassword=async(req,res) => {
     try {

 
    const { currentPassword, newPassword } = req.body; //pulls both new and old pw

    //makes sure user inputs them
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password'
      });
    }


    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

     const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    // step 5 - set new password and save
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while updating password'
    });
  }

};


module.exports = { getProfile, updateProfile, updatePassword, deleteProfile };