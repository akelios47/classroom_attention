const mongoose = require('mongoose');
const geojson = require('mongoose-geojson-schema');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;

const Teacher = mongoose.model('Teacher');
const Tag = mongoose.model('Tag');
const Course = mongoose.model('Course');
const User = mongoose.model('User');

/**
* @swagger
* definitions:
*      level:
*          type: object
*          required:
*              - value
*              - date
*          properties:
*              levels:
*                  description: vector of values
*                  type: array
*                  items: 
*                      type: number or array    
*              delta:
*                  description: delta time of that value (relative to the reading start date)
*                  type: number
*/
const levelSchema = new mongoose.Schema({
    levels: { type: [[Number]], default: [] },
    delta: { type: Number } },
    { _id: false }
);


/**
 * @swagger
 * definitions:
 *      reading:
 *          type: object
 *          required:
 *              - course
 *              - teacher
 *              - levels
 *          properties:
 *              location:
 *                  description: the geografical location where the reading was taken (expressed usgin GeoJSON standard) 
 *                  type: mongoose.SchemaTypes.GeoJSON
 *              startDate:
 *                  description: start time for the reading activities   
 *                  type: date
 *              endDate:
 *                  description: end time for the reading activities (if the reading is instantaneous can be equal to start date)  
 *                  type: date
 *              course: 
 *                  description: reference to the course during which the reading wa taken
 *                  type: string
 *              teacher: 
 *                  description: reference to the teacher of the class upon reading upload
 *                  type: string
 *              tags: 
 *                  description: list of labels related to the reading
 *                  type: array
 *                  items:
 *                      $ref: '#/paths/definitions/tag' 
 *              attentionLevels: 
 *                  description: list of values related to the reading
 *                  type: array
 *                  items:
 *                      $ref: '#/paths/definitions/levels'
 *      readings:
 *          type: object
 *          properties:
 *              docs: 
 *                  description: array of readings
 *                  type: array
 *                  items:
 *                      $ref: '#/paths/definitions/reading' 
 *              total:
 *                  description: total number of readings that match a query 
 *                  type: number
 *              limit: 
 *                  description: page size
 *                  type: number
 *              page: 
 *                  description: page number (1 to n)
 *                  type: number 
 *              pages: 
 *                  description: total number of pages
 *                  type: number
 */
const readingSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, autopopulate: true },
    location: { type: mongoose.SchemaTypes.GeoJSON, required: false, index: "2dsphere" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: Date.now },
    course: { type: String, required: "Please, supply a course", ref: 'Course', index: true },
    teacher: { type: String, required: "Please, supply a teacher", ref: 'Teacher', index: true },
    tags: [{ type: String, ref: 'Tag' }],
    attentionLevels: [levelSchema],
    timestamp: { type: Date, default: Date.now },
    lastmod: { type: Date, default: Date.now, select: false }
});

readingSchema.set('toJSON', { versionKey: false });
readingSchema.index({ owner: 1 });
readingSchema.plugin(paginate);
readingSchema.plugin(require('mongoose-autopopulate'));

// validate teacher
readingSchema.path('teacher').validate({
    validator: async function (value) {
        const teacher = await Teacher.findById(value);
        if (!teacher) throw new Error('Teacher not existent (' + value + ')');
        return true;
    }
});

// validate course
readingSchema.path('course').validate({
    validator: async function (value) {
        const course = await Course.findById(value);
        if (!course) throw new Error('Course not existent (' + value + ')');
        return true;
    }
});

// validate tags
readingSchema.path('tags').validate({
    validator: async function (values) {
        for (let value of values) {
            const tag = await Tag.findById(value);
            if (!tag) throw new Error('Tag not existent (' + value + ')');
        };
        return true;
    }
});

// validate owner
readingSchema.path('owner').validate({
    validator: async function (value) {
        let user = await User.findById(value);
        if (!user) throw new Error('User not existent (' + value + ')');
        return true;
    }
});

// check if already have a similar reading (idempotent)
// same start/end date, thing, device and feature
readingSchema.pre('save', async function() {
    const res = await this.constructor.findOne( { teacher: this.teacher,
                                                  startDate: this.startDate,
                                                  endDate: this.endDate,
                                                  course: this.course });
    if(res) throw new Error('The reading already exists');                       
});

module.exports = mongoose.models.Reading || mongoose.model('Reading', readingSchema);
