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
const { where } = require('sequelize');
const { use } = require('express/lib/application');
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

    // console.log(req.body.user)
    res.send("halo")

});


app.get("/login",async(req, res) => {
   
    res.render('login',{
        layout :'layouts/main-layout',
        title : 'calculator',
    });

});

app.get("/homepage",cek_login,(req,res)=>{
    let name = req.session.user.name;

    res.render("homepage",{
        title : 'home',
        layout: 'layouts/main-layout',
        name

    });
})

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
        title : 'calculator',
    });
    
});
 

app.post("/register",[
    check('email',"Email tidak valid").isEmail(),
    check('password',"Password tidak valid").isLength({min : 8}),

    ],async(req,res) => {
    const errors = validationResult(req);
    console.log(errors);
    if(!errors.isEmpty()) {
        res.render('register',{
            layout:'layouts/main-layout',
            title : 'calculator',
            errors : errors.array(),
        });
    }else{
        await users.create(req.body);  
        res.redirect("/login");
    }
    
  
});


app.post("/login",async(req,res) => {
    console.log(req.body)
    const user = await users.findOne({where: {email: req.body.email}})

    if (!user){
        res.redirect("/login")
    }else{
        if(user.password !== req.body.password){
            res.redirect("/login")
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
    })
    if (!data.beratdetails){
        res.render('tampilan',{
            id,
            berat : data.beratdetails,
            nama : data.fullname,
            layout :'layouts/main-layout',
            title : 'calculator',
        });
    
    }else{
        res.render('tampilan',{
            id,
            nama : data.fullname,
            berat : data.beratdetails.berat,
            layout :'layouts/main-layout',
            title : 'calculator',
        });
    }
})

app.get("/masatubuh",cek_login,async(req,res)=> {
   
    res.render('masatubuh',{
        layout :'layouts/main-layout',
        title : 'calculator',
    });

})


app.post("/calculator",cek_login,async(req,res) => {

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

app.get("/masatubuh/edit/:id",async(req,res)=>{

    const user = await beratusers.findOne({where:{id_users : req.params.id}})
    
    res.render('ibm',{
    
        id : user.id_users,
        layout :'layouts/main-layout',
        title : 'pembaruan',
    
    });

});

app.put('/imb',async(req,res)=> {
    
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


app.listen(port, () => {

    console.log(`PORT JALAN ${port}`);

});

 