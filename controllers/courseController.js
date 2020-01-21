const mongoose = require('mongoose');
const Course = mongoose.model('Course');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => {
    try {
        if (!req.query.page) req.query.page = '1';
        if (!req.query.limit) req.query.limit = '10';
        if (!req.query.filter) req.query.filter = '{}';
        if (!req.query.sort) req.query.sort = "{ \"timestamp\": \"desc\" }";
        if (!req.query.select) req.query.select = '{}';
        if (req.query.filter.startsWith("[")) { req.query.filter = "{ \"$or\": " + req.query.filter + " }" };
        const filter = JSON.parse(req.query.filter);
        const options = {
            select: JSON.parse(req.query.select),
            sort: JSON.parse(req.query.sort),
            page: parseInt(req.query.page),
            limit: parseInt(req.query.limit)
        }
        const courses = await course.paginate(filter, options);
        return res.status(200).json(courses);
    }
    catch (err) { return errors.manage(res, errors.generic_request_error, err); }
};

exports.getone = async (req, res) => {
    const Course = await Course.findById(req.params.id);
    if (course) return res.status(200).json(Course);
    else return errors.manage(res, errors.course_not_found, req.params.id);
};

exports.post = async (req, res) => {
    if (req.body.constructor == Array) {
        const results = { courses: [], errors: [] };
        for (let element of req.body) {
            element.owner = req.user._id;
            try { results.courses.push(await (new Course(element)).save()); }
            catch (err) { results.errors.push(err.message); }
        }
        if (results.errors.length === 0) return res.status(200).json(results);
        else return res.status(202).json(results);
    }
    else {
        try {
            req.body.owner = req.user._id;
            res.status(200).json(await (new Course(req.body)).save());
        }
        catch (err) { return errors.manage(res, errors.Course_post_request_error, err); }
    }
};

exports.delete = async (req, res) => {
    const Course = await Course.findById(req.params.id);
    if(!course) return errors.manage(res, errors.course_not_found, req.params.id); 
    if (!Authorization.isOwner(req.user, course)) return errors.manage(res, errors.course_cannot_be_deleted_from_not_owner, req.params.id);
    const other = await Course.find({ courses : { $elemMatch : {$in: [req.params.id]}  } }).limit(1);
    if (other.length != 0) return errors.manage(res, errors.course_cannot_be_deleted_with_course, other); 
    const result = await Course.deleteOne({ _id: req.params.id });
    if (!result) return errors.manage(res, errors.course_not_found, req.params.id);
    else return res.status(200).json(course);
};

