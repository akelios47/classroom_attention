const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController.js');
const { catchErrors } = require('../commons/errorHandlers.js');


/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: returns a list of the available teachers
 *     teachers: 
 *       - Teacher
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *          description: an array of teachers
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/teacher'
 */
router.get('/',  catchErrors(teacherController.get));

/**
 * @swagger
 * /teachers/{id}:
 *  get:
 *      summary: returns a single teacher
 *      teachers:
 *          - teacher
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            description: teacher id
 *            in: path
 *            required: true
 *            type: guid
 *      responses:
 *          200:
 *              description: a single teacher
 *              schema:
 *                  $ref: '#paths/definitions/teacher'
 *          404:
 *              description: teacher not found
 *              schema:
 *                  $ref: '#/paths/definitions/error'        
 */
router.get('/:id', catchErrors(teacherController.getone));

/**
 * @swagger
 * /teachers:
 *   post:
 *     summary: creates one or several teachers
 *     teachers:
 *       - teacher
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: teacher
 *         description: the object or an array of objects describing the teachers to be created
 *         in: body
 *         required: true
 *         schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/teacher'
 *     responses:
 *       200:
 *          description: the list of created teachers
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/teacher'
 *       202:
 *          description: the list of created teachers and the list of errors
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/teacher'
 */
router.post('/', catchErrors(teacherController.post));

/**
 * @swagger
 * /teachers:
 *   delete:
 *     summary: deletes a teacher, only if it is not used in measurements
 *     teachers: 
 *       - teacher
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: teacher id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *          description: the deleted teacher
 *          schema:
 *              $ref: '#/paths/definitions/teacher'
 *       404:
 *          description: teacher to be deleted not found
 *          schema:
 *              $ref: '#/paths/definitions/error'
 *       409:
 *          description: teacher already used in a measurement
 *          schema:
 *              $ref: '#/paths/definitions/error'
 */
router.delete('/:id',  catchErrors(teacherController.delete));
module.exports = router;