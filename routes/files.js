const router=require('express').Router();
const multer=require('multer');
const File=require('../models/files');
const {v4:uuidv4}=require('uuid');
const path = require('path');

//reference - https://www.npmjs.com/package/multer




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extension); 
    }
  });

  const upload = multer({ 
    storage: storage,
    limit:{fileSize:1000000 * 100}, //100mb size limit
   }).single('myfile');


router.post('/',(req,res)=>{
    //first validate request
    
    //store file
    upload(req,res,async(err)=>{
        if(!req.file){
            return res.json({error:"All fields are required."});
        }
        if (err){
            return res.status(500).send({error:err.message})
        }

          //store in database
          const file=new File({
            filename:req.file.filename,
            uuid:uuidv4(),
            path:req.file.path,
            size:req.file.size
          });
          const response=await file.save();
          //return res.json({file:`${process.env.APP_BASE_URL}/files/${response.uuid}`})
          return res.render('email',{
            uuid:`${response.uuid}`,
            download:`${process.env.APP_BASE_URL}/files/${response.uuid}`
        });
          

    })
});



router.post('/send',async(req,res)=>{
  //validate request
  //console.log(req.body);
  const {uuid,emailTo,emailFrom}=req.body;

  if(!uuid || !emailTo || !emailFrom){
    return res.status(422).send({error:'All fields are required.'});
  }

  //get data from database;
  const file= await File.findOne({uuid:uuid});
  if(file.sender){
    return res.status(422).send({error:'Email already sent!'});
  }

  file.sender=emailFrom;
  file.receiver=emailTo;

  const response=await file.save();

  //send email
  const sendMail=require('../services/emailService');
  sendMail({
from:emailFrom,
to:emailTo,
subject:'InShare FileSharing',
text:`${emailFrom} shared a file with you.}`,
html: require('../services/emailTemplate')({
  emailFrom:emailFrom,
  downloadLink:`${process.env.APP_BASE_URL}/files/${file.uuid}`,
  size: parseInt(file.size/1000)+'KB',
  expires:'24 hours'
})
  });
  //return res.send({success:true});
  return res.send({success:"email send duccessfully.."});


});


module.exports=router;