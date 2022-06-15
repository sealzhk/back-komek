const express = require('express')
const router  = express.Router()
const multer  = require('multer');
const fs = require('fs')


const Category = require('../models/category')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images')
    },
    filename: (req, file, cb) => {
        console.log(file);
        var filetype = '';
        if(file.mimetype === 'image/gif') {
            filetype = 'gif';
        }
        if(file.mimetype === 'image/png') {
            filetype = 'png';
        }
        if(file.mimetype === 'image/jpeg') {
            filetype = 'jpg';
        }
        cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});

const upload = multer({ storage: storage });

router.get('/', (req, res) => {
	Category.find({}, (err, categories) => {
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			res.json(categories);
		}
	});
});

router.post('/create', upload.single('imagePath'), (req, res, next) => {
    let categoryData = req.body
	console.log(req.file.filename)
    categoryData.imagePath = 'http://localhost:3000/images/' + req.file.filename 
    let category = new Category(categoryData)
    category.save((error, enteredCategory) => {
        if (error) {
            console.log(error)
        } else {
            res.status(200).send(enteredCategory)
        }
    })
});

router.get('/:id', function(req, res){
	console.log('Get request for a single category');
	Category.findById(req.params.id)
	.exec(function(err, category){
		if (err){
			console.log("Error retrieving category");
		} else {
			res.json(category);
		}
	})
})

router.get("/delete/:id", (req, res)=>{
    console.log(req.params.id);
    // delete image from server
	Category.findById(req.params.id)
    .then(doc => {
        let imgPath = doc.imagePath.split('/')[4]
        console.log('delete image ' + imgPath)
        fs.unlink('./public/images/' + imgPath, function (err) {
            if (err && err.code == 'ENOENT') {
                // file doens't exist
                console.info("File doesn't exist, won't remove it.");
            } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
                console.error("Error occurred while trying to remove file");
            } else {
                console.info('image removed');
            }
        }); 
    })
    .catch(err => {
        console.log(err);
    });

    Category.deleteOne({ _id: req.params.id }, function(err, data) {
        if (!err) {
            console.log(data);
            console.log("category successfully deleted");
            res.status(200).send(data)
        }
        else {
            console.log("error")
        }
    });
});

router.put('/edit/:id', upload.single('imagePath'), function (req, res){
    var category = {
        name: req.body.name,
        details:  req.body.details,
		upd_date: new Date(),
        imagePath: 'http://localhost:3000/images/' + req.file.filename
    };
    console.log(req.file.filename)
    console.log('Update category data');

	// delete previous image from server
	Category.findById(req.params.id)
    .then(doc => {
        let imgPath = doc.imagePath.split('/')[4]
        console.log('delete image ' + imgPath)
        fs.unlink('./public/images/' + imgPath, function (err) {
            if (err && err.code == 'ENOENT') {
                // file doens't exist
                console.info("File doesn't exist, won't remove it.");
            } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
                console.error("Error occurred while trying to remove file");
            } else {
                console.info('image removed');
            }
        }); 
    })
    .catch(err => {
        console.log(err);
    });

    Category.findByIdAndUpdate(req.params.id,
        { $set: category },
        { new: true },
        (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in Category Update :' + JSON.stringify(err, undefined, 2)); }
    });
});

router.put('/activate/:id', function (req, res){
	console.log("active  " + req.body.active)
	var category = {
		active: req.body.active,
		upd_date: new Date(),
	}

	console.log('De/Activate category data');
    Category.findByIdAndUpdate(req.params.id,
        { $set: category },
        { new: true },
        (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in Category Activate :' + JSON.stringify(err, undefined, 2)); }
    });
});

module.exports = router
