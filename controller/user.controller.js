const { validationResult } = require("express-validator");
const userModel = require("../model/user.model");

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
  const { email, password } = req.body;

  try {
    const userExist = await userModel.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "User is already exist." });
    }
    const hashPassword = await userModel.hashPassword(password);
    const user = await userModel.create({
      email,
      password: hashPassword,
    });
    user.save() ;
    console.log(user);
    const token = await user.generateAuthToken();
    if (!token) {
      return res.status(500).json({ message: "Internal server error." });
    }

    return res.status(201).json({message:"User register successfully.",token});
  } catch (err) {
    return res.status(500).json({message:err.message}) ;
  }
};

const login = async (req, res) => {
    const errors = validationResult(req) ;
    if(!errors.isEmpty()){
        return res.status(400).json({message:errors.array()});
    }

    const {email,password} = req.body ;

    try {
        const user = await userModel.findOne({email}) ;
        if(!user){
            return res.status(400).json({message:"User is not exists."});
        }
        
        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid passowrd."});
        }

        const token = await user.generateAuthToken() ;
        if(!token){
            return res.status(500).json({message:"Internal server error."})
        }

        return res.status(200).json({message:"Login successfully.",token})

    } catch (error) {
        return res.status(500).json({message:error.message}) ;
    }
};

module.exports = { register, login };
