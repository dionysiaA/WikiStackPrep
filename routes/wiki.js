'use strict'
const models = require('../models/');
const router = require('express').Router();

const Page = models.Page;
const User = models.User;

module.exports = router;


// retrieve all wiki pages
router.get('/', function (req, res, next) {
	Page.findAll()
	.then(function(listPages){
		res.render('index', {pages: listPages});
	})
	.catch(next);
	
});

// submit a new page to the database
router.post('/', function (req, res, next) {
	console.log('POST /wiki page');
	console.log(req.body);
	User.findOrCreate({
		where: {
			name: req.body.authorName,
			email: req.body.authorEmail
		}
	})
	.spread(function(user){
		return Page.create({
			title: req.body.title,
			content: req.body.content,
			status: req.body.status,
			tags: req.body.tags
		})
		.then(function(page){
			// why do we have to return the setAuthor here?
			return page.setAuthor(user);
		});
	})
	.then(function(result){
		res.redirect(result.route);
	})
	.catch(next);
});

// retrieve the add page form
router.get('/add', function (req, res, next) {
	console.log('GET add a /wiki page');
	res.render('addpage');
});

router.get('/:urlTitle', function(req, res, next){
	if(req.query['search']) { 
		next();
		console.log(req.query, 'yes sometimes i am a query!')
	}
	else {
	// req.params.urlTitle
		Page.findOne({
			where: {
				urlTitle: req.params.urlTitle
			},
			include: [{model: User, as: 'author'}]
		})
		.then(function(page){
			res.render('wikipage', {page: page});
		})
		.catch(next);
	}	
});

router.get('/search/', function(req, res, next){
	if(!req.query['search']) { throw new Error('there is no query defined.')}
	Page.findByTag(req.query['search'])
	.then(function(pages){
		res.render('index', {pages: pages});
	})
	.catch(next);
		
});

router.get('/search/:tag', function(req, res, next){
	// req.params.urlTitle
	if(req.query) { console.log(req.query, 'yes sometimes i am a query!')}
	Page.findByTag(req.params.tag)
	.then(function(pages){
		res.render('index', {pages: pages});
	})
	.catch(next);
		
});

router.get('/:urlTitle/similar', function(req, res, next){
	
	Page.findOne({
        where: {
            urlTitle: req.params.urlTitle
        }
    })
	.then(function(page){
		if(!page){
			 var error = new Error('That page was not found!');
              error.status = 404;
              throw error;
		}
		return page.findSimilar();
	})
	.then(function(similarPages){
		console.log('i am here!!!!!!!!');
		console.log(similarPages, 'similarpages is it a value or a promise?');
		res.render('index', {pages: similarPages});
	})
	.catch(next);
		
});

// Editing functionality

router.get('/:urlTitle/edit', function (req, res, next) {
    Page.findOne({
        where: {
            urlTitle: req.params.urlTitle
        }
    })
        .then(function (page) {

            if (page === null) {
                var error = new Error('That page was not found!');
                error.status = 404;
                return next(error);
            }

            res.render('editpage', {
                page: page
            });

        })
        .catch(next);
});

router.post('/:urlTitle/edit', function (req, res, next) {

    Page.findOne({
        where: {
            urlTitle: req.params.urlTitle
        }
    })
        .then(function (page) {

            for (var key in req.body) {
            	page[key] = req.body[key];
            }

            return page.save();

        })
        .then(function (updatedPage) {
            res.redirect(updatedPage.route);
        })
        .catch(next);
});

router.get('/:urlTitle/delete', function (req, res, next) {

    Page.destroy({
        where: {
            urlTitle: req.params.urlTitle
        }
    })
        .then(function () {
            res.redirect('/wiki');
        })
        .catch(next);

});