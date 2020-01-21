const mongoose = require('mongoose');
const Teacher = mongoose.model('Teacher');
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
        const teachers = await Teacher.paginate(filter, options);
        return res.status(200).json(teachers);
    }
    catch (err) { return errors.manage(res, errors.generic_request_error, err); }
};

exports.getone = async (req, res) => {
    const Teacher = await Teacher.findById(req.params.id);
    if (teacher) return res.status(200).json(Teacher);
    else return errors.manage(res, errors.teacher_not_found, req.params.id);
};

exports.post = async (req, res) => {
    if (req.body.constructor == Array) {
        const results = { teachers: [], errors: [] };
        for (let element of req.body) {
            element.owner = req.user._id;
            try { results.teachers.push(await (new Teacher(element)).save()); }
            catch (err) { results.errors.push(err.message); }
        }
        if (results.errors.length === 0) return res.status(200).json(results);
        else return res.status(202).json(results);
    }
    else {
        try {
            req.body.owner = req.user._id;
            res.status(200).json(await (new Teacher(req.body)).save());
        }
        catch (err) { return errors.manage(res, errors.teacher_post_request_error, err); }
    }
};

exports.delete = async (req, res) => {
    const teacher = await Teacher.findById(req.params.id);
    if(!teacher) return errors.manage(res, errors.teacher_not_found, req.params.id); 
    if (!Authorization.isOwner(req.user, teacher)) return errors.manage(res, errors.teacher_cannot_be_deleted_from_not_owner, req.params.id);
    const other = await Teacher.find({ teachers : { $elemMatch : {$in: [req.params.id]}  } }).limit(1);
    if (other.length != 0) return errors.manage(res, errors.teacher_cannot_be_deleted_with_teacher, other); 
    const result = await Teacher.deleteOne({ _id: req.params.id });
    if (!result) return errors.manage(res, errors.teacher_not_found, req.params.id);
    else return res.status(200).json(teacher);
};

