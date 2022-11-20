const express = require("express");
const exphbs = require('express-handlebars');
const bodyParser = require("body-parser");
const port = 8007;
const app = express();
const Bcrypt = require("bcryptjs");
const modules = require('./my-modules/modules');

//fname last!
/// mongoose
const mongoose = require('mongoose');
const myPass = encodeURIComponent("Nirazdon45$");
const db = mongoose.createConnection(`mongodb+srv://kneerose:${myPass}@senecaweb.bi5o8b1.mongodb.net/web322_week8?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });

const blogPage = mongoose.createConnection(`mongodb+srv://kneerose:${myPass}@senecaweb.bi5o8b1.mongodb.net/blogPage?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
const articlePage = mongoose.createConnection(`mongodb+srv://kneerose:${myPass}@senecaweb.bi5o8b1.mongodb.net/articlePage?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });


//BLOG COLLECTIONS DEFINE
const globalwhatsnew = blogPage.model('blogPage', new mongoose.Schema({}), 'globalwhatsnew');
const blog = blogPage.model('blogPage', new mongoose.Schema({}), 'blog');
const features = blogPage.model('blogPage', new mongoose.Schema({}), 'features');
const miniBlog = blogPage.model('blogPage', new mongoose.Schema({}), 'miniBlog');
const orders = blogPage.model('blogPage', new mongoose.Schema({}), 'orders');

// ARTICLE COLLECTIONS DEFINE
const article = articlePage.model('articlePage', new mongoose.Schema({}), 'article');
const comments = articlePage.model('articlePage', new mongoose.Schema({}), 'comments');


const regSchema = new mongoose.Schema({
    "fname": String,
    "lname":String,
    "username": {
        "type": String,
        "unique": true
    },
    "email": {
        "type": String,
        "unique": true
    },
    "phone": Number,
    "password":  String,
    "admin": {
        "type": Boolean,
        "default": false
    }
});

const registerDb = db.model("registerData", regSchema);


app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'hbs');

app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    layoutsDir: __dirname + "/views/layouts",
    defaultLayout: 'index'
}))



app.get("/:var(blog|home)?", async (req, res) => {
    //GLOBALWHATSNEW FETCH
    var globalwhatsnewFetch = await modules.fetchOne(globalwhatsnew);

    //BLOG COLLECTIONS FETCH
    var blogFetch = await modules.fetchOne(blog);
    var miniBlogFetch = await modules.fetchOne(miniBlog);
    var ordersFetch = await modules.fetchOne(orders);
    var featuresFetch = await modules.fetchMany(features);

    res.render('blog', {
        blogNav: true, globalwhatsnew: globalwhatsnewFetch, blog: blogFetch, miniBlog: miniBlogFetch, orders: ordersFetch, features:featuresFetch
    })
});

app.get("/login", async (req, res) => {
    //GLOBALWHATSNEW FETCH
    var globalwhatsnewFetch = await modules.fetchOne(globalwhatsnew);

    res.render('login', {
        loginNav: true, globalwhatsnew: globalwhatsnewFetch
    })
});

app.post("/login", async (req, res) => {
    //GLOBALWHATSNEW FETCH
    var globalwhatsnewFetch = await modules.fetchOne(globalwhatsnew);

    var username = req.body.uname1;
    var password = req.body.pwd1;

    if (username && password) {

        if(modules.spCheck(username)){
            var userErrorMsg = "Your UserName can't have special characters or spaces!";
            res.render('login', { loginNav: true, globalwhatsnew: globalwhatsnewFetch, UserErrorMsg: userErrorMsg, UserName: username, Password: password });
            }
         else {

            
            const logdata = await registerDb.findOne({"username": username});
            if(logdata){
                if(Bcrypt.compareSync(password, logdata.password)){
                    if(logdata.admin === true){
                        res.render('admin', {globalwhatsnew: globalwhatsnewFetch, UserName: username, Name: (logdata.fname + " " + logdata.lname), Email: logdata.email})
                    }else{
                        res.render('dashboard', {globalwhatsnew: globalwhatsnewFetch, UserName: username, Name: (logdata.fname + " " + logdata.lname), Email: logdata.email});
                    }
                }
            }
            else{
                var ErrorMsg = "Incorrect username or password!";
                res.render('login', { loginNav: true, globalwhatsnew: globalwhatsnewFetch, ErrorMsg: ErrorMsg, UserName: username, Password: password });
            }
                            

        }
    } 
    else if (!username && !password){
        var ErrorMsg = "Please enter your username and password!";
        res.render('login', { loginNav: true, globalwhatsnew: globalwhatsnewFetch, ErrorMsg: ErrorMsg});
    }
    
    else {
        if(!username){
            var userErrorMsg = "Please enter your username!";
            res.render('login', { loginNav: true, globalwhatsnew: globalwhatsnewFetch, UserErrorMsg: userErrorMsg, Password: password });
        }

        if(!password){
            var pwdErrorMsg = "Please enter your password!";
            res.render('login', { loginNav: true, globalwhatsnew: globalwhatsnewFetch, PwdErrorMsg: pwdErrorMsg, UserName: username});
        }

    } 
});

app.get("/article", async (req, res) => {
    //GLOBALWHATSNEW FETCH
    var globalwhatsnewFetch = await modules.fetchOne(globalwhatsnew);

    //ARTICLE COLLECTIONS FETCH
    var articleFetch = await modules.fetchOne(article);
    var commentsFetch = await modules.fetchMany(comments);

    res.render('read_more', {
        articleNav: true, globalwhatsnew: globalwhatsnewFetch, article: articleFetch, comments: commentsFetch
    })
});

app.get("/register", async (req, res) => {
    //GLOBALWHATSNEW FETCH
    var globalwhatsnewFetch = await modules.fetchOne(globalwhatsnew);
    res.render('register', {
        registerNav: true, globalwhatsnew: globalwhatsnewFetch
    })
});

app.post("/register", async (req, res) => {
    //GLOBALWHATSNEW FETCH
    var globalwhatsnewFetch = await modules.fetchOne(globalwhatsnew);

    var fname = req.body.fname1;
    var lname = req.body.lname1;
    var username = req.body.uname2;
    var email = req.body.email1;
    var phone = req.body.phonenum;
    var password = req.body.pwd2;
    var nameErr;
    var unameErr;
    var emailErr;
    var numErr;
    var passErr;


    var registerData = {
        fname: fname,
        lname: lname,
        username: username,
        email: email,
        phone: phone,
        password: password
    }



    var nullErr;
    var keys = Object.keys(registerData);

    // null check
    keys.forEach(key => {
        var value = registerData[key];
        if(!value){
            nullErr = "Please fill out all the fields!";
        }
    })

    keys.forEach((key) => {
        var value = registerData[key];
        switch(key){
            case 'fname', 'lname':
                if(modules.spCheck(value)){
                    nameErr = "Name can not have any special characters!";
                }
            break;

            case 'username':
                if (modules.spCheck(value)){ 
                    unameErr = "Username can not have any special characters!";
                }    
            break;

            case 'email':
                if(!(modules.emailCheck(value))){
                    emailErr = "The email you provided is invalid!";
                }
            break;

            case 'phone':
                if(!modules.phoneCheck(value)){
                    numErr = "Phone number can not have anything but numbers!";
                }
            break;

            case 'password':
                if(!modules.pwdCheck(value)){
                    passErr = "Password must include at least 1 character of the following: uppercase letter, lowercase letter, number and special character";
                }
            break;
        }
    })

    const lado = registerDb.findOne({"username": username});
    const puti = await lado.exec();
    if(puti){
        unameErr = "This username is already in use!";
    }

    const gula = registerDb.findOne({"email": email});
    const chak = await gula.exec();
    if(chak){
        emailErr = "This email is already in use!";
    }
  
    var Errs = {
        nameErr: nameErr,
        unameErr: unameErr,
        emailErr: emailErr,
        numErr: numErr,
        passErr: passErr
    }
    let falses = 0;
    Object.keys(Errs).forEach(key => {
        if(Errs[key]){
            falses = falses + 1;
        }
    })
    if (falses > 0){
        res.render('register', {registerNav: true, globalwhatsnew: globalwhatsnewFetch, RegData: registerData, Errs: Errs, nullErr});    
    }else{
        registerData.password = Bcrypt.hashSync(password, 12);
        
        let userRegister = new registerDb(registerData).save((e, data) => {
        if (e) {
            console.log(e);
        } else {
            console.log("User Registered:\n\t" + data);
            res.render('dashboard', {globalwhatsnew: globalwhatsnewFetch, UserName: username, Name: (fname + " " + lname), Email: email});
        }

    })
    }  

});

app.get("*", async (req, res) => {
    //GLOBALWHATSNEW FETCH
    var globalwhatsnewFetch = await modules.fetchOne(globalwhatsnew);

    res.render('404', {globalwhatsnew: globalwhatsnewFetch});
});

app.listen(port, ()=>{
    console.log(`LISTENING ON http://localhost:${port}`);
});