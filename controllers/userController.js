const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const User = mongoose.model('User');
const Tag = mongoose.model('Tag');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => {
    try {
        if (!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.user_authorization_error); 
        if(!req.query.page) req.query.page = '1';
        if(!req.query.limit) req.query.limit = '10';
        if(!req.query.filter) req.query.filter = '{}';
        if(!req.query.sort) req.query.sort = '{ "username": "desc" }';
        if(!req.query.select) req.query.select = '{}';
        const filter   = JSON.parse(req.query.filter);
        const options = {
            select:     JSON.parse(req.query.select),
            sort:       JSON.parse(req.query.sort),
            page:       parseInt(req.query.page), 
            limit:      parseInt(req.query.limit)
        }
        const users = await User.paginate(filter, options);
        return res.status(200).json(users);
    }
    catch (err) { return errors.manage(res, errors.generic_request_error, err); }
};

exports.getusernames = async (req, res) => {
    try {
        if(!req.query.page) req.query.page = '1';
        if(!req.query.limit) req.query.limit = '5';
        if(!req.query.filter) req.query.filter = '{}';
        if(!req.query.sort) req.query.sort = '{ "username": "desc" }';
        const select = { type: 0, _id: 0};
        const filter   = JSON.parse(req.query.filter);
        const options = {
            select:     select,
            sort:       JSON.parse(req.query.sort),
            page:       parseInt(req.query.page), 
            limit:      parseInt(req.query.limit)
        }
        const users = await User.paginate(filter, options);
        return res.status(200).json(users);
    }
    catch (err) { return errors.manage(res, errors.generic_request_error, err); }
};

exports.getone = async (req, res) => {
    if(!ObjectId.isValid(req.params.id)) return errors.manage(res, errors.user_not_found, req.params.id);
    if(!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.user_authorization_error);
    const user = await User.findById(req.params.id);
    if(!user) return errors.manage(res, errors.user_not_found, req.params.id);
    return res.status(200).json(user);
};

exports.post = async (req, res) => {
    if(!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.user_authorization_error);
    if (req.body.constructor == Array) {
        const results = { users: [], errors: [] };
        for (let element of req.body) {
            try { results.users.push(await (new User(element)).save()); }
            catch(err) { results.errors.push(err.message); }
        }
        if(results.errors.length === 0) return res.status(200).json(results);
        else return res.status(202).json(results);
    }
    try { res.status(200).json(await (new User(req.body)).save()); }
    catch (err) { return errors.manage(res, errors.user_post_request_error, err); }
};

exports.delete = async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return errors.manage(res, errors.user_not_found, req.params.id);
    const user = await User.findById(req.params.id);
    if(!user) return errors.manage(res, errors.user_not_found, req.params.id); 
    if(!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.user_authorization_error);
    const tag = await Tag.find({ owner: req.params.id }).limit(1);
    if (tag.length != 0) return errors.manage(res, errors.user_cannot_be_deleted_with_tag, tag); 
    const result = await User.deleteOne({ _id: req.params.id });
    if (!result) return errors.manage(res, errors.user_not_found, req.params.id);
    else return res.status(200).json(user);
};

