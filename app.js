const express = require('express')
const app = express()
const {users}=require("./models")

const port = 3000

//gunakan ejs

app.set('view engine','ejs')

app.use(express.static("public"));

app.get("/", async(req, res) => {
    
    const user = await users.findOne({where:{username:"abid"}});

    if (user.password === "1234"){
        console.log(user);
    }else{
        console.log(false)
    }
    console.log(user.password)
    res.render('login')

});


app.listen(port, () => {
    console.log(`PORT JALAN ${port}`)
})

