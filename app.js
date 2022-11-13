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



app.get("/home",cek_login,async(req, res) => {
    
    const id = req.session.user.id;

    res.render("home",{
        title : 'home',
        layout: 'layouts/main-layout',
        id
    })

});



app.get("/register",(req,res) => {

    res.render("register",{
        layout:'layouts/main-layout',
        title : 'calculator',
     
    })
});


app.post("/register",[
    check('email',"Email tidak valid").isEmail(),
    check('password',"Password tidak valid").isLength({min : 8}),

    ],async(req,res) => {
    const errors = validationResult(req);
    console.log(errors);
    if(!errors.isEmpty()) {
        res.render('register',{
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
            session.user = {email : user.email, id : user.id};
           
            res.redirect("/home")
        }
    }
});




app.get("/tampilan/:id",cek_login,async(req,res)=> {
    let data = await users.findOne({
        attributes:['fullname'],
        include:[{
            model: beratusers,
            as:'beratdetails',
            attributes:['berat'],
            
        }],
        where:{id:req.params.id}
    })
    
    let id = req.params.id;
 
    res.render('tampilan',{
        data,
        id,
        layout :'layouts/main-layout',
        title : 'calculator',
    });

})

app.get("/masatubuh",cek_login,async(req,res)=> {
   
    res.render('masatubuh',{
        layout :'layouts/main-layout',
        title : 'calculator',
    });

})




app.post("/calculator",cek_login,async(req,res) => {

    const id = req.session.user.id;
    
    let berat = req.body.beratbadan;
    let tinggi = req.body.tinggi;
    let tinggibadanjadi = tinggi / 100 ;
    let hasil = berat / (tinggibadanjadi * tinggibadanjadi) ;

    const imb = { 
        id_users : id,
        berat : hasil
    }
    
    await beratusers.create(imb); 
    res.render("masatubuh",{
       hasil,
       layout :'layouts/main-layout',
       title : 'calculator',
      
    });
    
})



app.delete('/berat', async(req,res)=>{
    await beratusers.destroy({
        where: {
            id_users: req.body.id 
        }
    })
    res.redirect("/home")
})
app.listen(port, () => {

    console.log(`PORT JALAN ${port}`);
})

 