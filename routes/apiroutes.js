//DEPENDENCIES
var express = require('express');
var router = express.Router();
var axios = require('axios');
var cheerio = require('cheerio');

//REQUIRE MODEL-edit
var db = require('../models/index');

//HOME PAGE ROUTE
router.get('/', function(req, res) {
    res.render('index');
});

//ROUTES
//SCRAPE Route (Scrape WSJ site & save response in DB)
router.get('/scrape', function(req, res) {
    axios.get('https://www.nytimes.com/').then(function(response) {
        var $ = cheerio.load(response.data);

        $('article').each(function(i, element) {
            var result = {};
            result.title = $('element')
            .find('h2.esl82me2')
            .text();
            result.link = 'https://www.nytimes.com/' + 
            $('element')
            .find('a')
            .attr('href');
            result.description = $('element')
            .find('p.e1n8kpyg0')
            .text();

            db.Article.create(result)
            .then(function(dbArticle) {
                console.log(dbArticle);
            })
            .catch(function(err) {
                return res.json(err);
            });
        });
        res.send('Scrape Complete');
    });
});

//GET Route (Get articlelist.handlebars with DB info)
router.get('../models/article.js', function(req, res) {
    //Grab each document in articles
    db.Article.find({ saved: false })
    .then(function(dbArticle) {
        res.render('articlelist', { articles: dbArticle });
    })
    .catch(function(err) {
        res.json(err);
    });
});

//SAVED Route (Render saved.handlebars with DB info)
router.get('../views/saved.handlebars', function(req, res) {
    db.Article.find({ saved: true })
    .populate('notes')
    .exec(function(error, articles) {
        res.render('saved', { articles: articles });
    });
});

//GET Route (clear, drop collection)
router.get('/clear', function(req, res) {
    db.Article.remove({})
    .then(function() {
        console.log('Erased');
    })
    .catch(function(err) {
        res.json(err);
    });
});

//CHANGE Route (save boleean to true when saved is clicked)
router.post('/articles/save/:id', function(req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true }).exec(
        function(err, doc) {
            if (err) {
                console.log(err);
            } else {
                res.send(doc);
            }
        }
    );
});

//POPULATE Note
router.get('/articles/:id', function (req, res) {
    db.Article.findOne({ _id: req.params.id })
    .populate('note')
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

//DELETE Article through its ID
router.post('/articles/delete/:id', function(req, res) {
    db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { saved: false, notes: [] }
    ).then(function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.send(doc);
        }
    });
});

//SAVE Note
router.post('/articles/:id', function(req, res) {
    db.Note.create(req.body)
    .then(function(dbNote) {
        return db.Article.findOneAndUpdate(
            { _id: req.params.id },
            { note: dbNote._id },
            { new: true }
        );
    })
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

//EXPORT Router
module.exports = router;