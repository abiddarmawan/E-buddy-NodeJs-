
const express = require('express')
const app = express()
const {users}=require("./models")
const port = 3000

//gunakan ejs
app.set('view engine','ejs')

app.use(express.static("public"));
app.use(express.urlencoded({extended:false}))

app.get("/", async(req, res) => {
    
    res.render('login');

});

app.get("/home", async(req, res) => {
    
    res.send("Halo");

});

app.post("/login",(req,res) => {
    console.log(req.body);
    console.log(req.email);
    res.redirect("/home");


});

app.listen(port, () => {
    console.log(`PORT JALAN ${port}`);
})

 