const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const User = mongoose.model('User');

/**
 * @swagger
 * definitions:
 *      coursae:
 *          type: object
 *          required:
 *              - _id
 *              - owner
 *          properties:
 *              _id:
 *                  description: the code given to the course bu the teaching institution
 *                  type: string
 *              owner:
 *                  description: the user who creates the course
 *                  type: 
 *                      $ref: '#/paths/definitions/user'
 *              name:
 *                  type: string
 *              description:
 *                  type: string
 *              numberOfSessions: 
 *                  description: the total number of required teaching sessions (lecture/ tutorials/ lab) for a course
 *                  type: number
 *              hoursPerSession:
 *                  type: number 
 */
const courseSchema = new mongoose.Schema({
    _id: { type: String, required: "Please, supply an _id (course code)" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', autopopulate: true },
    name: { type: String },
    description: { type: String },
    numberOfSessions: { type: Number },
    hoursPerSession: { type: Number },
    timestamp: { type: Date, default: Date.now, select: false },
});

courseSchema.set('toJSON', { versionKey: false });
courseSchema.index({ owner: 1 });
courseSchema.plugin(paginate);
courseSchema.plugin(require('mongoose-autopopulate'));

// validate owner
courseSchema.path('owner').validate({
    validator: async function (value) {
        let user = await User.findById(value);
        if (!user) return false;
        return true;
    },
    message: 'User not existent'
});

// validate id
courseSchema.pre('save', async function () {
    const res = await this.constructor.findOne({ _id: this._id });
    if (res) throw new Error('Course validation failed: the _id is already used (' + this._id + ')');
});

module.exports = mongoose.models.Course || mongoose.model('Course', courseSchema);
