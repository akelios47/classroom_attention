const mongoose = require('mongoose');
const Reading = mongoose.model('Reading');
const Teacher = mongoose.model('Teacher');
const User = mongoose.model('User');
const Authorization = require('../security/authorization.js');
const ObjectId = require('mongoose').Types.ObjectId;
const paginate = require("paginate-array");
const errors = require('../commons/errors.js');

exports.get = async (req, res) => {
    try {
        if (!req.query.page) req.query.page = '1';
        if (!req.query.limit) req.query.limit = '10';
        if (!req.query.filter) req.query.filter = '{}';
        if (!req.query.aggregator) req.query.aggregator = '{}';
        if (!req.query.sort) req.query.sort = "{ \"timestamp\": \"desc\" }";
        if (!req.query.select) req.query.select = '{}';
        if (req.query.filter.startsWith("[")) { req.query.filter = "{ \"$or\": " + req.query.filter + " }" };
        let filter = JSON.parse(req.query.filter);
        let aggregator = JSON.parse(req.query.aggregator);
        const options = {
            select: JSON.parse(req.query.select),
            sort: JSON.parse(req.query.sort),
            page: parseInt(req.query.page),
            limit: parseInt(req.query.limit)
        }       
        let readings = {};
        if (!(req.query.aggregator == "{}")) readings = paginate(await Reading.aggregate(aggregator), req.query.page);
        else readings = await Reading.paginate(filter, options);
        return res.status(200).json(readings);
    }
    catch (err) { return errors.manage(res, errors.generic_request_error, err); }
};

exports.getone = async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return errors.manage(res, errors.reading_not_found, req.params.id);
    const reading = await Reading.findById(req.params.id);
    if(!reading) return errors.manage(res, errors.reading_not_found, req.params.id);
    return res.status(200).json(reading);
};

exports.post = async (req, res) => {
    if (req.body.constructor == Array) {
        const results = { readings: [], errors: [] };
        for (let [i, element] of req.body.entries()) {
            try {
                element.owner = req.user._id;
                results.readings.push(await (new Reading(element)).save());
            }
            catch (err) { results.errors.push("Index: " + i+  " (" + err.message + ")"); }
        }
        if (req.query.verbose == 'true') {
            if (results.errors.length === 0) { return res.status(200).json(results); }
            else { return res.status(202).json(results); }
        }
        else {
            if (results.errors.length === 0) { return res.status(200).json({ saved: results.readings.length, errors: results.errors.length }); }
            else { return res.status(202).json({ saved: results.readings.length, errors: results.errors.length, Indexes: results.errors }); }
        }
    }
    else {
        try {
            req.body.owner = req.user._id;
            return res.status(200).json(await (new Reading(req.body)).save());
        }
        catch (err) { return errors.manage(res, errors.reading_post_request_error, err); }
    }
};

exports.deleteOne = async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return errors.manage(res, errors.reading_not_found, req.params.id);
    const reading = await Reading.findById(req.params.id);
    if(!reading) return errors.manage(res, errors.reading_not_found, req.params.id); 
    if (!Authorization.isOwner(req.user, reading)) return errors.manage(res, errors.reading_cannot_be_deleted_from_not_owner, req.params.id);
    const result = await Reading.deleteOne({ _id: req.params.id });
    if (!result) return errors.manage(res, errors.reading_not_found, req.params.id);
    else return res.status(200).json(reading);
}

exports.delete = async (req, res) => {
    if (!req.query.filter) return errors.manage(res, errors.reading_delete_needs_filter);
    if (req.query.filter.startsWith("[")) { req.query.filter = "{ \"$or\": " + req.query.filter + " }" };
    req.query.filter = "{ \"$and\": [" + req.query.filter + " ,{\"owner\": \"" + req.user._id + "\"} ]}"
    const filter = JSON.parse(req.query.filter);
    const result = await Reading.deleteMany(filter);
    if (result.n == 0) return errors.manage(res, errors.reading_not_found, req.params.id);
    else return res.status(200).json({ message: + result.n + " readings deleted!" });
};



/*
exports.put = async (req, res) => {
    try {
        // update by id
        if (req.params.id) {
            const reading = await Reading.findById(req.params.id);
            if (!Authorization.isOwner(req.user, reading))
                return res.status(403).json({ status: 403, message: "Only the owner can update a reading" });
            var feature = req.body.feature;
            if (!feature)
                feature = reading.feature;
            var baseFeatures = [req.body.baseFeatures];
            if (!baseFeatures)
                baseFeatures = reading.baseFeatures;
            var values = req.body.values;
            if (!values)
                values = reading.values;
            const readingres = await Reading.findByIdAndUpdate({ _id: req.params.id }, { $set: req.body }, {
                feature: feature,
                baseFeatures: baseFeatures,
                values: values
            });
            if (!readingres)
                return res.status(404).json({ message: "Reading " + req.params.id + " not found" });
            else {
                return res.status(200).json({ message: "Reading " + req.params.id + " updated" });
            }
        }
        // upsert by filter
        else {
            var body = new Reading(req.body);

            // construct a query from body info
            //var readingTagsRaw = body.tags;
            var readingTags = body.tags;
            var readingFeature = body.feature;
            var readingBaseFeatures = body.baseFeatures;
            if (readingBaseFeatures) {
                for (var i = 0; i < readingBaseFeatures.length; i++) {
                    var featureReturned = await Feature.findById(readingBaseFeatures[i]);
                    if (!featureReturned) {
                        return res.status(404).json({ message: "At least one baseFeature does not exist!" });
                    }
                }
            }
            //var readingStartDate = body.startDate;
            //var readingEndDate = body.endDate;
            var arrayConditions = [];
            //var elementTags = [];
            var logicName = "$and";
            //var elemetMatch = "$elemMatch";
            if (readingTags.length != 0) {
                var tagName = "tags";
                var sizeName = "$size";
                var allname = "$all";
                //var combinedObject = { [sizeName]: readingTags.length, [allname]: readingTags }
                //var combinedObject = { [allname]: readingTags }
                //arrayConditions.push({ [tagName]: combinedObject });
                arrayConditions.push({ [tagName]: readingTags });
            }

            if (readingFeature) {
                var featureName = "feature";
                arrayConditions.push({ [featureName]: readingFeature });
            }

            if (readingBaseFeatures.length != 0) {
                var baseFeaturesName = "baseFeatures";
                //for (var i = 0; i < readingBaseFeatures.length; i++)
                arrayConditions.push({ [baseFeaturesName]: readingBaseFeatures });
            }

            var readings = await Reading.find({ [logicName]: arrayConditions });

            req.body.owner = req.user._id;

            if (readings.length > 1)
                return res.status(404).json({ message: "Filter points to multiple readings, please narrow it down!" });
            else {
                var feature = req.body.feature;
                var baseFeatures = req.body.baseFeatures;
                var values = req.body.values;
                if ((readings.length == 0 && (!feature || !baseFeatures || !values)))
                    return res.status(404).json({ message: "Error while attempting to insert since no Reading was found to update, inserting needs more arguments: (feature, baseFeatures, or values!)" });
                else {
                    if (!feature)
                        feature = readings.feature;
                    if (!baseFeatures)
                        baseFeatures = readings.baseFeatures;
                    if (!values)
                        values = readings.values;
                }

                var bodyElement = req.body;
                // Check if values are not numeric, thus convert (this is needed in case of inserting ref. IDs as value)
                // For UI to get the reverse conversion: hexString = value.toString(16);
                var values = bodyElement.values;
                for (var i = 0; i < values.length; i++) {
                    var value = values[i].value;
                    for (var l = 0; l < value.length; l++) {
                        if (typeof (value[l]) != 'number') {
                            var output = "";
                            var splitOutput = [];
                            var input = bodyElement.values[i].value[l];
                            // split each hex char and convert to decimal and store separately in sub-array
                            // reason: js can only parse to 53rd bit, the id is 154 bits!
                            for (var n = 0; n < input.length; n++) {
                                output = input[n];
                                splitOutput.push(parseInt(output, 16));
                            }
                            bodyElement.values[i].value[l] = splitOutput;
                        }
                    }
                }
                var reading_new = new Reading(bodyElement);
                for (var j = 0; j < reading_new.values.length; j++) {
                    var vector = [];
                    var sum = 0;
                    for (var k = 0; k < reading_new.values[j].value.length; k++) {
                        for (var l = 0; l < reading_new.values[j].value[k].length; l++) {
                            vector[k] = Math.pow(reading_new.values[j].value[k][l], 2);
                            sum += vector[k];
                        }
                    }
                    reading_new.values[j].magnitude = Math.sqrt(sum);
                }

                var reading = await Reading.findOneAndUpdate({
                    [logicName]:
                        arrayConditions
                },
                    { $set: req.body },
                    {
                        feature: feature,
                        baseFeatures: [baseFeatures],
                        values: reading_new.values,
                        upsert: true,
                        returnNewDocument: true
                    }

                if (!reading)
                    return res.status(200).json({ message: "Reading created" });
                else {
                    return res.status(200).json({ message: "Reading updated" });
                }

            }
        }
    }
    catch (err) {
        if (err.name == 'CastError')
            return res.status(404).json({ message: "Reading upsert not successful!" });
        else
            throw (err);
    }
};
*/
