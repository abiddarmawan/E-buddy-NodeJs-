const express = require('express');
const app = express();
const {users}=require("./models");
const {beratusers}=require("./models");
const expressLayouts = require('express-ejs-layouts');
const port = 3000;
const { body, validationResult,check } = require('express-validator'); //body menangkap yang sudah di kirimkan form,validation untuk cek 
const methodOverride = require('method-override')
require('dotenv').config() // import dotenv
const  session = require('express-session');
const { redirect } = require('express/lib/response');
const { use } = require('express/lib/application');
const req = require('express/lib/request');
//set_up overide
app.use(methodOverride('_method'))
//gunakan ejs
app.set('view engine','ejs')
app.use(expressLayouts);

app.use(express.static("public")); //buily-in middleware

app.use(express.urlencoded({extended:false})) // parsing

app.use(session({
    secret: process.env.SECRET, //penanda heshing
    resave: false, 
    saveUninitialized: false,   
}))


const cek_login = (req, res, next) => {
    if(!req.session.user){
        return res.redirect("/login")
    }
    return next();
}

app.get("/", async(req, res) => {

    res.render("hellopage",{
        layout :'layouts/main-layout',
        title : 'Hellopage',
    })

});

app.get("/menu",cek_login,(req,res)=>{

    res.render("menu",{
        layout :'layouts/main-layout',
        title : 'Menu',
    })
})

app.get("/video",cek_login,(req,res)=>{
    res.render("video2",{
        layout :'layouts/main-layout',
        title : 'Video',
    })
})

app.get("/login",async(req, res) => {
   
    res.render('login',{
        layout :'layouts/main-layout',
        title :'Login',
    });

});



app.get("/home",cek_login,async(req, res) => {
    
    let name = req.session.user.name;

    res.render("homepage",{
        title : 'home',
        layout: 'layouts/main-layout',
        name
    })

});


app.get("/register",(req,res) => {

    res.render("register",{
        layout:'layouts/main-layout',
        title : 'Register',
    });
    
});


app.post("/register",[
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


app.post("/login",async(req,res) => {

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

app.get("/tampilan",cek_login,async(req,res)=> {
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

app.get("/masatubuh",cek_login,async(req,res)=> {
   
    res.render('masatubuh',{

        layout :'layouts/main-layout',
        title : 'calculator',
    });

});


app.post("/calculator",cek_login,[
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


app.delete('/berat', async(req,res)=>{
    await beratusers.destroy({
        where: {
            id_users: req.body.id 
        }
    })
    res.redirect("/tampilan")
})

app.get("/ibm",(req,res)=>{
    
    res.render("ibm",{
        layout :'layouts/main-layout',
        title : 'pembaruan',
    })
})
app.get("/masatubuh/edit/:id",async(req,res)=>{
    const user = await beratusers.findOne({where:{id_users : req.params.id}})
    if(!user)
        return res.redirect("/tampilan")

    res.render('ibm',{    
        id : user.id_users,
        layout :'layouts/main-layout',
        title : 'pembaruan',
    
    });

});




app.put('/imb',[
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

app.delete("/logout",(req,res)=>{

    req.session.destroy();
    res.redirect("/");

});

app.use((req, res)=>{

    res.send("404 not found")

});
app.listen(port, () => {

    console.log(`PORT JALAN ${port}`);

});

 