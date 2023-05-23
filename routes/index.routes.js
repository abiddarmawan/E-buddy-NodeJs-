const express = require('express');
const router = express.Router();
const req = require('express/lib/request');
const { body, validationResult,check } = require('express-validator');


const cek_login = (req, res, next) => {
    if(!req.session.user){
        return res.redirect("/login")
    }
    return next();
}

router.get("/", async(req, res) => {

    res.render("hellopage",{
        layout :'layouts/main-layout',
        title : 'Hellopage',
    })

});

router.get("/menu",cek_login,(req,res)=>{

    res.render("menu",{
        layout :'layouts/main-layout',
        title : 'Menu',
    })
})

router.get("/video",cek_login,(req,res)=>{
    res.render("video2",{
        layout :'layouts/main-layout',
        title : 'Video',
    })
})

router.get("/login",async(req, res) => {
   
    res.render('login',{
        layout :'layouts/main-layout',
        title :'Login',
    });

});



router.get("/home",cek_login,async(req, res) => {
    
    let name = req.session.user.name;

    res.render("homepage",{
        title : 'home',
        layout: 'layouts/main-layout',
        name
    })

});


router.get("/register",(req,res) => {

    res.render("register",{
        layout:'layouts/main-layout',
        title : 'Register',
    });
    
});


router.post("/register",[
    check('email',"Email tidak valid").isEmail(),
    check('password',"Password tidak valid ,min 8 character").isLength({min : 8}),
    check('fullname',"Nama Lengkap Tidak Boleh Kosong").notEmpty(),
    ],async(req,res) => {
    const errors = validationResult(req);
   
    if(!errors.isEmpty()) 
        return res.render('register',{
            layout:'layouts/main-layout',
            title : 'calculator',
            errors : errors.array(),
        });
    // if(!res.body.nama)
    //     errors.msg 
    
    await users.create(req.body); 
    res.redirect("/login")   
});


router.post("/login",async(req,res) => {

    const user = await users.findOne({where: {email: req.body.email}});
    
    if (!user){
        res.render("login",
        {
            error : 'Email or Password salah',
            layout :'layouts/main-layout',
            title : 'Login',
        }
        )
    }else{
        if(user.password !== req.body.password){
            res.render("login",{
                error : 'Email or Password salah',
                layout :'layouts/main-layout',
                title : 'Login',
            })
        }else{

            let session = req.session;
            session.user = {email : user.email, id : user.id, name : user.fullname};
        
            res.redirect("/home");
        };
    }
});

router.get("/tampilan",cek_login,async(req,res)=> {
    let id = req.session.user.id;

    let data = await users.findOne({
        attributes:['fullname'],
        include:[{
            model: beratusers,
            as:'beratdetails',
            attributes:['berat'],
            
        }],
        where:{id:id}
    });

    if (!data.beratdetails)
        return res.render('tampilan',{
            id,
            berat : data.beratdetails,
            nama : data.fullname,
            layout :'layouts/main-layout',
            title : 'Tampilan',
        });
    
   
    res.render('tampilan',{
        id,
        nama : data.fullname,
        berat : data.beratdetails.berat,
        layout :'layouts/main-layout',
        title : 'Tampilan',
    });
   
})

router.get("/masatubuh",cek_login,async(req,res)=> {
   
    res.render('masatubuh',{

        layout :'layouts/main-layout',
        title : 'calculator',
    });

});


router.post("/calculator",cek_login,[
    check("beratbadan","Berat Badan Tidak Boleh Kosong").notEmpty(),
    check("tinggi","Tinggi Badan Tidak Boleh kosong").notEmpty(),
    ],async(req,res) => {
    
    const errors = validationResult(req);

    if(!errors.isEmpty()) 
        return res.render('masatubuh',{
            layout:'layouts/main-layout',
            title : 'calculator',
            errors : errors.array(),
        });

    let id = req.session.user.id;
    let berat = req.body.beratbadan;
    let tinggi = req.body.tinggi;
    let tinggibadanjadi = tinggi / 100 ;
    let a = berat / (tinggibadanjadi * tinggibadanjadi) ;
    let b = parseFloat(a)
    let hasil = b.toFixed(2)
    let imb = { 
        id_users : id,
        berat : hasil
    }
    await beratusers.create(imb); 
    res.redirect("/tampilan")
       
    
})


router.delete('/berat', async(req,res)=>{
    await beratusers.destroy({
        where: {
            id_users: req.body.id 
        }
    })
    res.redirect("/tampilan")
})

router.get("/ibm",(req,res)=>{
    
    res.render("ibm",{
        layout :'layouts/main-layout',
        title : 'pembaruan',
    })
})
router.get("/masatubuh/edit/:id",async(req,res)=>{
    const user = await beratusers.findOne({where:{id_users : req.params.id}})
    if(!user)
        return res.redirect("/tampilan")

    res.render('ibm',{    
        id : user.id_users,
        layout :'layouts/main-layout',
        title : 'pembaruan',
    
    });

});




router.put('/imb',[
    check("beratbadan","Berat Badan Tidak Boleh Kosong").notEmpty(),
    check("tinggi","Tinggi Badan Tidak Boleh kosong").notEmpty(),
    ],async(req,res)=> {

    const errors = validationResult(req);
    let id  = req.session.user.id;
    if(!errors.isEmpty()) 
        return res.render('ibm',{
            layout:'layouts/main-layout',
            title : 'calculator',
            errors : errors.array(),
            id
        });

    let berat = req.body.beratbadan;
    let tinggi = req.body.tinggi;
    
    
    let tinggibadanjadi = tinggi / 100 ;
    let a = berat / (tinggibadanjadi * tinggibadanjadi) ;
    let b = parseFloat(a)
    let hasil = b.toFixed(2)
    await beratusers.update({berat : hasil},{
        where: {
            id_users : req.body.id
        }
    })

    res.redirect("/tampilan")

});

router.delete("/logout",(req,res)=>{

    req.session.destroy();
    res.redirect("/");

});

module.exports = router;
