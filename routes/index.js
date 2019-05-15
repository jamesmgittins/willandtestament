var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var sha1 = require('js-sha1');

// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

var accountCheckQuery = "SELECT * FROM classicrealmd.account WHERE username = '{0}';";
var accountIdQuery = "SELECT MAX(id)+1 AS 'id' FROM classicrealmd.account;"
var accountCreateQuery = "INSERT INTO classicrealmd.account (id, username, sha_pass_hash) VALUES ({0}, '{1}', '{2}');";
var levelLeaderboardQuery = "SELECT c.name, c.race, c.class, c.level, c.totaltime - c.leveltime AS 'time', playerFlags & 0x00000010 AS 'ghost', c.deleteInfos_Name as deadname, c.online FROM classiccharacters.characters c, classicrealmd.account a WHERE (c.account = a.id OR deleteInfos_Account = a.id) AND a.gmlevel = 0 AND c.level > 1 ORDER BY 4 DESC, 5 ASC LIMIT 1000;";

function charClassTranslate(id) {
  switch(id){
    case 1:
      return "Warrior";
    case 2:
      return "Paladin";
    case 3:
      return "Hunter";
    case 4:
      return "Rogue";
    case 5:
      return "Priest";
    case 7:
      return "Shaman";
    case 8:
      return "Mage";
    case 9:
      return "Warlock";
    case 11:
      return "Druid";
    default:
      return "";
  }
}

function charRaceTranslate(id) {
  switch(id){
    case 1:
      return "Human";
    case 2:
      return "Orc";
    case 3:
      return "Dwarf";
    case 4:
      return "Night Elf";
    case 5:
      return "Undead";
    case 6:
      return "Tauren";
    case 7:
      return "Gnome";
    case 8:
      return "Troll";
    default:
      return "";
  }
}

function timeTranslate(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  return h > 0 ? h + 'h ' + m + 'm' : m + 'm';
}

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password"
});

con.connect();

var levelLeaderboard = [];
var lastLeaderboarUpdate = 0;

function updateLeaderBoard(after) {

  if (lastLeaderboarUpdate < Date.now() - 600000)  {
    lastLeaderboarUpdate = Date.now();
    con.query(levelLeaderboardQuery, function(err, result, fields){
      if (err) throw err;
      levelLeaderboard = [];
  
      for (var i=0; i < result.length; i++) {
        levelLeaderboard[i] = {
          name:result[i].name !== "" ? result[i].name : result[i].deadname,
          level:result[i].level,
          race:charRaceTranslate(result[i].race),
          class:charClassTranslate(result[i].class),
          time:timeTranslate(result[i].time),
          status:result[i].ghost > 0 ? "Dead" : "Alive",
          online:result[i].online == 1
        };
      }
  
      after();
    });
  }
  else {
    after();
  }  
}


/* GET home page. */
router.get('/', function(req, res, next) {
  updateLeaderBoard(function(){
    res.render('index', { title: 'Will and Testament', accountmessage:req.query.accountmessage, levelLeaderboard:levelLeaderboard });
  });
});

/* GET home page. */
router.get('/leaderboard', function(req, res, next) {
  updateLeaderBoard(function(){
    res.render('leaderboard', { title: 'Will and Testament', levelLeaderboard:levelLeaderboard });
  });
});


var accountNameRegex = /^\w+$/;


/* POST create account form */
router.post('/createaccount', function(req, res) {
  var accountname = req.body.username.trim();
  var password = req.body.password.trim();
  var confirmpass = req.body.confirm.trim();

  if (accountname.length < 5 || accountname.length > 20) {
    res.redirect('/?accountmessage=' + encodeURIComponent("Account name must be between 5 and 20 characters"));
    return;
  }

  if (!accountNameRegex.test(accountname)) {
    res.redirect('/?accountmessage=' + encodeURIComponent("Account name contains invalid characters"));
    return;
  }

  if (password !== confirmpass) {
    res.redirect('/?accountmessage=' + encodeURIComponent("Passwords don't match"));
    return;
  }

  if (password.length < 8) {
    res.redirect('/?accountmessage=' + encodeURIComponent("Password must be 8 characters or more"));
    return;
  }
  
  con.query(accountCheckQuery.format(accountname.toUpperCase()), function (err, result, fields) {
    if (err) throw err;
    if (result.length > 0) {
      res.redirect('/?accountmessage=' + encodeURIComponent("Account already exists"));
      return;
    } else {

      con.query(accountIdQuery, function(err, result, fields){
        if (err) throw err;
        console.log(result);

        var passwordHash = sha1(accountname.toUpperCase() + ":" + password.toUpperCase());
        console.log("passwordHash: " + passwordHash);

        con.query(accountCreateQuery.format(result[0].id, accountname.toUpperCase(), passwordHash), function(err){
          if (err) throw err;
          res.redirect('/?accountmessage=' + encodeURIComponent("Account created"));
        });
      });
      
    }
  });

});

module.exports = router;
