var express = require('express');
var router = express.Router();
var shell = require('shelljs')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin', { title: 'Will and Testament', message:req.query.message});
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
