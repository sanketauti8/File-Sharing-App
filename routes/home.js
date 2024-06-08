const router=require('express').Router();
const File=require('../models/files')


router.get('/',async(req,res)=>{

    try {
            res.render('home', { error: null });
        }

     catch (error) {
            return res.render('home',{error:"Something went wrong."});   
    }

});



module.exports=router;