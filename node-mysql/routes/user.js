const bcrypt = require('bcrypt');
var NodeRSA = require('node-rsa');
var key = new NodeRSA({b: 512});

var passwordValidator = require('password-validator');

var schema = new passwordValidator();

exports.signup = function(req, res){
   message = '';
   if(req.method == "POST"){
      var post  = req.body;
      var name= post.user_name;
      var pass= post.password;
      var fname= post.first_name;
      var lname= post.last_name;
      var mob= post.mob_no;
      schema.is().min(8);                         
      schema.is().max(16);                         
      schema.has().uppercase();     
      schema.has().digits(1);      
      schema.has().lowercase();                       
      schema.has().not().spaces();
      if(schema.validate(pass) === false) {
         message = "Пароль имеет неправильную форму!";
         res.render('signup.ejs',{message: message});
      }
      else {
         var sql2 = "SELECT id, first_name, last_name, user_name FROM `users` WHERE `user_name`='"+name+"'";      
         db.query(sql2, function(err, results){     
            if(results.length > 0) {
               message = "Такой username уже существует!";
               res.render('signup.ejs',{message: message});
            }
            else {
               /*
               var cfname = key.encrypt(fname, 'base64');
               var clname = key.encrypt(fname, 'base64');
               var cmob = key.encrypt(fname, 'base64');
               var cname = key.encrypt(fname, 'base64');
               */
               saltRounds = 10;
               const hash = bcrypt.hashSync(pass, saltRounds);
               var sql = "INSERT INTO `users`(`first_name`,`last_name`,`mob_no`,`user_name`, `password`) VALUES ('" + fname + "','" + lname + "','" + mob + "','" + name + "','" + hash + "')";
               var query = db.query(sql, function(err, result) {
                  message = "Успешно! Ваш аккаунт был создан.";
                  res.render('signup.ejs',{message: message});
               });
            }
         });
     }  
      } else {
      res.render('signup');
   }
};
 
exports.login = function(req, res){
   var message = '';
   var sess = req.session; 

   if(req.method == "POST"){
      var post = req.body;
      var name = post.user_name;
      var pass = post.password;

      var sql="SELECT `id`, `first_name`, `last_name`, `mob_no`, `user_name`, `password` FROM `users`  WHERE `user_name`='"+name+"'";                           
      db.query(sql, function(err, results) {      
         if(results.length) {
            const isValid = bcrypt.compare(pass, results[0].password);
            if(isValid) {              
               req.session.userId = results[0].id;
               req.session.user = results[0];
               console.log(results[0].id);
               res.redirect('/home/dashboard');
            } 
            else {
                  message = 'Неправильные учетные данные.';
                  res.render('index.ejs',{message: message});
               }               
         }      
         else {
            message = 'Неправильные учетные данные.';
            res.render('index.ejs',{message: message});
         }
      });
   } else {
      res.render('index.ejs',{message: message});
   }
           
};
           
exports.dashboard = function(req, res, next){
           
   var user =  req.session.user,
   userId = req.session.userId;
   console.log('ddd='+userId);
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";

   db.query(sql, function(err, results){
      res.render('dashboard.ejs', {user:user});    
   });       
};

exports.logout=function(req,res){
   req.session.destroy(function(err) {
      res.redirect("/login");
   })
};

exports.profile = function(req, res){

   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";          
   db.query(sql, function(err, result){  
      res.render('profile.ejs',{data:result});
   });
};

exports.editprofile=function(req,res){
   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";
   db.query(sql, function(err, results){
      res.render('edit_profile.ejs',{data:results});
   });
};
