'use strict'
const models = require('../models/');
const router = require('express').Router();
const Promise = require('bluebird');

const Page = models.Page;
const User = models.User;

module.exports = router;

// retrieve all users 
router.get('/', function (req, res, next) {
	User.findAll()
	.then(function(listUsers){
		res.render('users', {users: listUsers});
	})
	.catch(next);	
});

router.get('/:userId', function (req, res, next) {
	//find all the pages the author wrote
	const pagesWrittenUser = Page.findAll({
		where: {
			authorId: req.params.userId
		}
	});
	const user = User.findById(req.params.userId);

	Promise.all([pagesWrittenUser, user])
	.spread(function(pages, user){
		user.pages = pages;
		res.render('userpage', {user: user});
	})
	.catch(next);	
});