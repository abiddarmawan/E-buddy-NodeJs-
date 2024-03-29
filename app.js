const express = require('express');
const app = express();
const {users}=require("./models");
const {beratusers}=require("./models");


const expressLayouts = require('express-ejs-layouts');
const { body, validationResult,check } = require('express-validator');
const port = 3000;
const indexRouter = require('./routes/index.routes');
// const { body, validationResult,check } = require('express-validator'); //body menangkap yang sudah di kirimkan form,validation untuk cek 
const methodOverride = require('method-override')
require('dotenv').config() // import dotenv

const flash = require('connect-flash');
const  session = require('express-session');

const req = require('express/lib/request');
//set_up overide
app.use(methodOverride('_method'))
//gunakan ejs
app.set('view engine','ejs')

// app.use('/',indexRouter);

app.use(expressLayouts);

app.use(express.static("public")); //buily-in middleware

app.use(express.urlencoded({extended:false})) // parsing
app.use(flash());

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
        success_msg : req.flash('success_msg')[0] || ''
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


app.post("/register", [
    check('email', "Email tidak valid").isEmail(),
    check('email','Panjang Character Email minimal 20').isLength({min : 20}),
    check('email','Panjang Character Email maksimal 30').isLength({max : 30}),
    check('password', "Password tidak valid, minimal 8 character").isLength({ min: 8}),
    check('password', "Password tidak valid, maksimal 15 character").isLength({ max: 15}),
    check('fullname', "Nama Lengkap minimal 10 character").isLength({ min: 10 }),
    check('fullname', "Nama Lengkap maksimal 15 character").isLength({ max: 15 }),
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
        return res.render('register', {
            layout: 'layouts/main-layout',
            title: 'calculator',
            errors: errors.array(),
        });

    await users.create(req.body);
    req.flash('success_msg', 'Akun berhasil dibuat!');
    res.redirect("/login");
});


app.post("/login",[
    check('email',"Email tidak valid").isEmail(),
    check('password',"Password tidak valid ,min 8 character").isLength({min : 8}),
    ],async(req,res) => {

    const user = await users.findOne({where: {email: req.body.email}});
    
    const errors = validationResult(req);

    if(!errors.isEmpty()) 
        return res.render('login',{
            layout:'layouts/main-layout',
            title : 'calculator',
            errors : errors.array(),
        });

    if (!user){
        res.render("login",
        {
            error : 'Email or Password salah',
            layout :'layouts/main-layout',
            title : 'Login',
            success_msg : ''
        }
        )
    }else{
        if(user.password !== req.body.password){
            res.render("login",{
                error : 'Email or Password salah',
                layout :'layouts/main-layout',
                title : 'Login',
                success_msg : ''
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
            success_msg : req.flash('success_msg')[0] || ''
        });
    
   
    res.render('tampilan',{
        id,
        nama : data.fullname,
        berat : data.beratdetails.berat,
        layout :'layouts/main-layout',
        title : 'Tampilan',
        success_msg : req.flash('success_msg')[0] || ''
    });
   
})

app.get("/masatubuh",cek_login,async(req,res)=> {
  
    res.render('masatubuh',{

        layout :'layouts/main-layout',
        title : 'calculator',
        gagal : req.flash('gagal')[0] || ''
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
            gagal  : ''
        });

    let id = req.session.user.id;
    let berat = req.body.beratbadan;
    let tinggi = req.body.tinggi;
    if(berat <= 20 || berat >= 250) {
        if(tinggi <= 100 || tinggi >= 300) { 
            req.flash('gagal', 'Berat badan dan Tinggi badan tidak valid');
            return res.redirect("/masatubuh");
        };
        req.flash('gagal', 'berat badan tidak valid');
        return res.redirect("/masatubuh");
    }
    
    if(tinggi <= 100 || tinggi >= 300) { 
        req.flash('gagal', 'Tinggi badan tidak valid');
        return res.redirect("/masatubuh");
    }
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
    req.flash('success_msg', 'Delete Berhasil!');
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
    req.flash('success_msg', 'Berhasil Memperbarui indeks masa tubuh!');
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

 