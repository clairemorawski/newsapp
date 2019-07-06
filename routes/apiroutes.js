require('dotenv').config();
// dotenv.config();

//DEPENDENCIES
var express = require('express');
var router = express.Router();
var axios = require('axios');
var cheerio = require('cheerio');

//REQUIRE MODEL-edit
var db = require('../models/Index');

//HOME PAGE ROUTE
router.get('/', function(req, res) {
    res.render('index');
});

//ROUTES
//SCRAPE Route (Scrape Reddit Sports site & save response in DB)
router.get('/scrape', function(req, res) {
//put global data calls here
     axios.get('https://www.reddit.com/r/sports/').then(function(response) {
        console.log(response.data);

        // $('article').each(function(i, element) {
        //     var result = {};
        //     result.title = $('element')
        //     .find("div article")
        //     .text();
        //     result.link = 'https://www.reddit.com/' + 
        //     $('element')
        //     .find('a')
        //     .attr('href');
        //     result.description = $('element')
        //     .find("img")
        //     .attr('src');
        //     db.Article.create(result)
        //     .then(function(dbArticle) {
        //         console.log(dbArticle);
        //         res.send(dbArticle);
        //     })
        //     .catch(function(err) {
        //         return res.json(err);
        //     });});


         // Then, we load that into cheerio and save it to $ for a shorthand selector
         console.log(response.data);
         var $ = cheerio.load(response.data);
         

         var genre = "sports";

         // initiate an empty entry object
         var data = {};

         // For each article element with a "buckets-bottom" class
         $("div.stream article").each(function (i, element) {

             // add the title , url, content and image to the object
             data.title = $(this).children('div.story-body').children('a').children('div.story-meta').children('h2').text().trim();
             data.text = $(this).children('div.story-body').children('a').children('div.story-meta').children('p.summary').text().trim();
             data.author = $(this).children('div.story-body').children('a').children('div.story-meta').children('p.byline').text().trim();
             data.link = $(this).children('div.story-body').children('a').attr("href");
             data.image = $(this).children('div.story-body').children('a').children('div.wide-thumb').children('img').attr('src');
             data.genre = genre;

             console.log(data);


             var hbsObject = {
                 articles: data
             };

             console.log(hbsObject);
        
             res.render("scrape-articles", hbsObject);


         });
    });
    res.end();
    // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
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