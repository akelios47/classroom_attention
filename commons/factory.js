require('../models/userSchema');

const UserTypes = require('../models/userTypes');
const crypto = require("crypto");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Tag = mongoose.model('Tag');
const Teacher = mongoose.model('Teacher');
const Course = mongoose.model('Course');
const jwt = require('jsonwebtoken');

exports.uuid = function() { 
    return crypto.randomBytes(16).toString("hex"); 
}

exports.dropContents = async function(){  
    await mongoose.connection.dropDatabase(); 
    await this.createSuperAdministrator();
}

exports.createSuperAdministrator = async function() {
    return await this.createUser(process.env.ADMIN_USERNAME, process.env.ADMIN_USERNAME, UserTypes.admin);
};

exports.getAdminToken = async function() {
    const admin = await User.findOne({ username: process.env.ADMIN_USERNAME });
    const token = jwt.sign(admin.toJSON(), process.env.SECRET);
    return 'JWT ' + token;
};

exports.getUserToken = async function(user) {
    const token = jwt.sign(user.toJSON(), process.env.SECRET);
    return 'JWT ' + token;
};

exports.createDemoContent = async function() {
    const users = [];
    users.push(await this.createUser('user-provider-name-1', 'provider-password-1', UserTypes.provider));
    users.push(await this.createUser('user-analyst-name-1', 'analyst-password-1', UserTypes.analyst));

    const tags = [];
    tags.push(await this.createTag('diesel', users[0]));
    tags.push(await this.createTag('gasoline', users[0]));
    tags.push(await this.createTag('urban', users[0]));
    tags.push(await this.createTag('autoroute', users[0]));
    tags.push(await this.createTag('rural', users[0]));     
    
    const teachers = [];
    teachers.push(await this.createTeacher('teacher1', users[0]));
    teachers.push(await this.createTeacher('teacher2', users[0]));
    teachers.push(await this.createTeacher('teacher3', users[0]));
    teachers.push(await this.createTeacher('teacher4', users[0]));
    teachers.push(await this.createTeacher('teacher5', users[0]));

    const courses = [];
    courses.push(await this.createTeacher('course1', users[0]));
    courses.push(await this.createTeacher('course2', users[0]));
}

exports.createUser = async function(username, password, type) {
    let user = await User.findOne( { username: username });
    if(!user) {
        const req = { 
            username: username || uuid(),
            password: password ||  uuid(),
            type: type || UserTypes.provider };
        user = new User(req);
        await user.save();
    }
    return await User.findById(user._id);
};

exports.createTag = async function(name, owner, tags) {
    let tag = await Tag.findOne( { _id: name });
    if(!tag) {
        const req = { _id: name , owner: owner, tags: tags }
        tag = new Tag(req);
        await tag.save();
    }
    return tag._doc;
};
exports.createTeacher = async function(name, owner, teachers) {
    let teacher = await Teacher.findOne( { _id: name });
    if(!teacher) {
        const req = { _id: name , owner: owner }
        teacher = new Teacher(req);
        await teacher.save();
    }
    return teacher._doc;
};

exports.createCourse = async function(name, owner, courses) {
    let course = await Course.findOne( { _id: name });
    if(!course) {
        const req = { _id: name , owner: owner }
        course = new Course(req);
        await course.save();
    }
    return course._doc;
};
