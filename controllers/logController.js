const mongoose = require('mongoose');
const Log = mongoose.model('Log');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => {
    try {
        if(!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.admin_restricted_access);
        if(!req.query.page) req.query.page = '1';
        if(!req.query.limit) req.query.limit = '5';
        if(!req.query.filter) req.query.filter = '{}';
        if(!req.query.sort) req.query.sort = '{ "date": "desc" }';
        if(!req.query.select) req.query.select = '{}';
        const filter  = JSON.parse(req.query.filter);
        const options = {
            select:     JSON.parse(req.query.select),
            sort:       JSON.parse(req.query.sort),
            page:       parseInt(req.query.page), 
            limit:      parseInt(req.query.limit)
        }
        const users = await Log.paginate(filter, options);
        return res.status(200).json(users);
    }  
    catch (err) { return errors.manage(res, errors.generic_request_error, err); } 
};

