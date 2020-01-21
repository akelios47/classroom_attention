const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController.js');
const { catchErrors } = require('../commons/errorHandlers.js');


/**
 * @swagger
 * /courses:
 *   get:
 *     summary: returns a list of the available courses
 *     courses: 
 *       - Course
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *          description: an array of courses
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/course'
 */
router.get('/',  catchErrors(courseController.get));

/**
 * @swagger
 * /courses/{id}:
 *  get:
 *      summary: returns a single course
 *      courses:
 *          - course
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            description: course id
 *            in: path
 *            required: true
 *            type: guid
 *      responses:
 *          200:
 *              description: a single course
 *              schema:
 *                  $ref: '#paths/definitions/course'
 *          404:
 *              description: course not found
 *              schema:
 *                  $ref: '#/paths/definitions/error'        
 */
router.get('/:id', catchErrors(courseController.getone));

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: creates one or several courses
 *     courses:
 *       - course
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: course
 *         description: the object or an array of objects describing the courses to be created
 *         in: body
 *         required: true
 *         schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/course'
 *     responses:
 *       200:
 *          description: the list of created courses
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/course'
 *       202:
 *          description: the list of created courses and the list of errors
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/course'
 */
router.post('/', catchErrors(courseController.post));

/**
 * @swagger
 * /courses:
 *   delete:
 *     summary: deletes a course, only if it is not used in measurements
 *     courses: 
 *       - course
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: course id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *          description: the deleted course
 *          schema:
 *              $ref: '#/paths/definitions/course'
 *       404:
 *          description: course to be deleted not found
 *          schema:
 *              $ref: '#/paths/definitions/error'
 *       409:
 *          description: course already used in a measurement
 *          schema:
 *              $ref: '#/paths/definitions/error'
 */
router.delete('/:id',  catchErrors(courseController.delete));
module.exports = router;