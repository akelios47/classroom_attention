const mongoose = require('mongoose');
const Tag = mongoose.model('Tag');
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
        const tags = await Tag.paginate(filter, options);
        return res.status(200).json(tags);
    }
    catch (err) { return errors.manage(res, errors.generic_request_error, err); }
};

exports.getone = async (req, res) => {
    const tag = await Tag.findById(req.params.id);
    if (tag) return res.status(200).json(tag);
    else return errors.manage(res, errors.tag_not_found, req.params.id);
};

exports.post = async (req, res) => {
    if (req.body.constructor == Array) {
        const results = { tags: [], errors: [] };
        for (let element of req.body) {
            element.owner = req.user._id;
            try { results.tags.push(await (new Tag(element)).save()); }
            catch (err) { results.errors.push(err.message); }
        }
        if (results.errors.length === 0) return res.status(200).json(results);
        else return res.status(202).json(results);
    }
    else {
        try {
            req.body.owner = req.user._id;
            res.status(200).json(await (new Tag(req.body)).save());
        }
        catch (err) { return errors.manage(res, errors.tag_post_request_error, err); }
    }
};

exports.delete = async (req, res) => {
    const tag = await Tag.findById(req.params.id);
    if(!tag) return errors.manage(res, errors.tag_not_found, req.params.id); 
    if (!Authorization.isOwner(req.user, tag)) return errors.manage(res, errors.tag_cannot_be_deleted_from_not_owner, req.params.id);
    const other = await Tag.find({ tags : { $elemMatch : {$in: [req.params.id]}  } }).limit(1);
    if (other.length != 0) return errors.manage(res, errors.tag_cannot_be_deleted_with_tag, other); 
    const result = await Tag.deleteOne({ _id: req.params.id });
    if (!result) return errors.manage(res, errors.tag_not_found, req.params.id);
    else return res.status(200).json(tag);
};

