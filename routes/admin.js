var express = require('express');
var router = express.Router();
var shell = require('shelljs');
var mysql = require('mysql');

var deadCharsQuery = "SELECT c.guid, c.name, c.race, c.class, c.level, playerFlags & 0x00000010 AS 'ghost', c.online FROM classiccharacters.characters c WHERE c.account != 0 AND playerFlags & 0x00000010 != 0 ORDER BY 2 ASC;";

var deadChars = [];

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password"
});

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

function updateDeadChars(after) {
  con.query(deadCharsQuery, function(err, result, fields){
    if (err) throw err;
    deadChars = [];

    for (var i=0; i < result.length; i++) {
      deadChars[i] = {
        id:result[i].guid,
        name:result[i].name,
        level:result[i].level,
        race:charRaceTranslate(result[i].race),
        class:charClassTranslate(result[i].class),
        online:result[i].online == 1
      };
    }
    after();
  });
}

function resurrectCharacter(guid, after) {
  con.query("DELETE FROM classiccharacters.character_aura WHERE guid = " + guid + ";", function(err, result, fields){
    if (err) throw err;
    con.query("UPDATE classiccharacters.characters SET playerFlags = 0, health = 10000 WHERE guid = " + guid + ";", function(err, result, fields){
      if (err) throw err;
      after();
    });
  });
}


/* GET home page. */
router.get('/', function(req, res, next) {
  updateDeadChars(function(){
    res.render('admin', { title: 'Will and Testament', message:req.query.message, deadchars:deadChars});
  });
});


router.get('/resurrectplayer/:guid', function(req, res, next) {
  console.log(req.params);
  resurrectCharacter(req.params.guid, function(){
    res.redirect('/chudmin?message=' + encodeURIComponent("Character resurrected"));
  });
});

/* POST create account form */
router.post('/resetserver', function(req, res) {
  if(shell.exec('sudo service mangosd restart').code !== 0) {
    shell.echo('Error restarting server');
    shell.exit(1);
    res.redirect('/chudmin?message=' + encodeURIComponent("Server Restart Failed"));
  } else {
    res.redirect('/chudmin?message=' + encodeURIComponent("Server Restarted"));
  }
});

module.exports = router;
