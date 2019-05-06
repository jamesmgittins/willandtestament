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
var levelLeaderboardQuery = "SELECT c.name, c.race, c.class, c.level, c.totaltime - c.leveltime AS 'time', playerFlags & 0x00000010 AS 'ghost' FROM classiccharacters.characters c, classicrealmd.account a WHERE c.account = a.id AND a.gmlevel = 0 ORDER BY 4 DESC, 5 ASC LIMIT 10;";

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

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password"
});

con.connect();



/* GET home page. */
router.get('/', function(req, res, next) {
  con.query(levelLeaderboardQuery, function(err, result, fields){

    var levelLeaderboard = [];

    for (var i=0; i < result.length; i++) {
      levelLeaderboard[i] = {
        name:result[i].name,
        level:result[i].level,
        race:charRaceTranslate(result[i].race),
        class:charClassTranslate(result[i].class),
        time:result[i].time,
        status:result[i].ghost > 0 ? "Dead" : "Alive"
      };
    }

    res.render('index', { title: 'Will and Testament', accountmessage:req.query.accountmessage, levelLeaderboard:levelLeaderboard });
  });
  
});




/* POST create account form */
router.post('/createaccount', function(req, res) {
  var accountname = req.body.username.trim();
  var password = req.body.password.trim();
  var confirmpass = req.body.confirm.trim();

  if (password !== confirmpass) {
    res.redirect('/?accountmessage=' + encodeURIComponent("Passwords don't match") + '#createaccount');
    return;
  }

  if (password.length < 8) {
    res.redirect('/?accountmessage=' + encodeURIComponent("Password too short") + '#createaccount');
    return;
  }
  
  con.query(accountCheckQuery.format(accountname.toUpperCase()), function (err, result, fields) {
    if (err) throw err;
    if (result.length > 0) {
      res.redirect('/?accountmessage=' + encodeURIComponent("Account already exists") + '#createaccount');
      return;
    } else {

      con.query(accountIdQuery, function(err, result, fields){
        if (err) throw err;
        console.log(result);

        var passwordHash = sha1(accountname.toUpperCase() + ":" + password.toUpperCase());
        console.log("passwordHash: " + passwordHash);

        con.query(accountCreateQuery.format(result[0].id, accountname.toUpperCase(), passwordHash), function(err){
          if (err) throw err;
          res.redirect('/?accountmessage=' + encodeURIComponent("Account created") + '#createaccount');
        });
      });
      
    }
  });

});

module.exports = router;
