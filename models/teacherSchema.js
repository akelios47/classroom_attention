const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const User = mongoose.model('User');
const Course = mongoose.model('Course');

/**
 * @swagger
 * definitions:
 *      teacher:
 *          type: object
 *          required:
 *              - _id
 *              - owner
 *          properties:
 *              _id: 
 *                  type: string
 *              name:
 *                  type: string
 *              description:
 *                  type: string
 *              courses: 
 *                  description: list of course names
 *                  type: array
 *                  items:
 *                      $ref: '#/paths/definitions/courses'
 *              owner:
 *                  description: the user who creates the teacher
 *                  type: 
 *                      $ref: '#/paths/definitions/user'
 */
const teacherSchema = new mongoose.Schema({
    _id: { type: String, required: "Please, supply an _id" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', autopopulate: true },
    name: { type: String },
    courses: [{ type: String, ref:'Course' }],
    timestamp: { type: Date, default: Date.now, select: false },
    description: { type: String }
});

teacherSchema.set('toJSON', { versionKey: false });
teacherSchema.index({ owner: 1 });
teacherSchema.plugin(paginate);
teacherSchema.plugin(require('mongoose-autopopulate'));

// validate owner
teacherSchema.path('owner').validate({
    validator: async function (value) {
        let user = await User.findById(value);
        if (!user) return false;
        return true;
    },
    message: 'User not existent'
});

// validate courses
teacherSchema.path('courses').validate({
    validator: async function (values) {
        for (let i = 0; i < values.length; i++) {
            const course = await Course.findById(values[i]);
            if (!course) return false;
        };
        return true;
    },
    message: 'Course not existent'
});

// validate id
teacherSchema.pre('save', async function () {
    const res = await this.constructor.findOne({ _id: this._id });
    if (res) throw new Error('Teacher validation failed: the _id is already used (' + this._id + ')');
});

module.exports = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);
