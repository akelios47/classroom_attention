const express = require('express');
const router = express.Router();
const readingController = require('../controllers/readingController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

/**
 * @swagger
 * /readings:
 *  get:
 *     summary: returns a paginated list of filtered readings
 *     tags:
 *       - Reading 
 *     parameters:
 *       - name: query
 *         description: query criteria for the filter specified using mongo rules https://docs.mongodb.com/manual/tutorial/query-documents/
 *         in: query
 *         example: { feature: average-speed }
 *         required: false
 *         type: json
 *       - name: sort
 *         description: specifies the field(s) to sort by and the respective sort order (asc or desc)
 *         in: query
 *         example: { startDate: desc } 
 *         required: false
 *         type: json
 *       - name: select
 *         description: fields to return (by default returns all fields)
 *         in: query
 *         example: { startDate: 0 } 
 *         required: false
 *         type: json
 *       - name: page
 *         description: page number of the request
 *         in: query
 *         example: 1
 *         required: false
 *         type: number
 *       - name: limit
 *         description: number of readings to be returned
 *         in: query
 *         example: 10
 *         required: false
 *         type: number
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: the list of readings
 *         schema:
 *           $ref: '#/paths/definitions/readings'
 *       400:
 *         description: errors in the request
 *         schema:
 *           $ref: '#/paths/definitions/error'
 */
router.get('/',  catchErrors(readingController.get));

/**
 * @swagger
 * /readings/{id}:
 *  get:
 *      summary: returns a single reading
 *      tags:
 *          - Reading
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            description: reading id
 *            in: path
 *            required: true
 *            type: guid
 *      responses:
 *          200:
 *              description: a single reading
 *              schema:
 *                  $ref: '#/paths/definitions/reading'
 *          404:
 *              description: reading not found
 *              schema:
 *                  $ref: '#/paths/definitions/error'        
 */
router.get('/:id', catchErrors(readingController.getone));

/**
 * @swagger
 * /readings:
 *   post:
 *     summary: creates one or several readings
 *     tags:
 *       - Reading
 *     description: creates a new reading
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: reading
 *         description: reading object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/paths/definitions/reading'
 *     responses:
 *       200:
 *         description: successfully created
 */
router.post('/', catchErrors(readingController.post));

/**
 * @swagger
 * /readings:
 *   delete:
 *     summary: deletes a single reading
 *     tags: 
 *       - Reading
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: reading id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *          description: the deleted reading
 *          schema:
 *              $ref: '#/paths/definitions/reading'
 *       404:
 *          description: reading to be deleted not found
 *          schema:
 *              $ref: '#/paths/definitions/error'
 */
router.delete('/:id',  catchErrors(readingController.deleteOne));

/**
 * @swagger
 * /readings:
 *   delete:
 *     summary: deletes a many readings according to filter
 *     tags: 
 *       - Reading
 *     produces:
 *       - application/json
 *     parameters:
 *       - filter: string
 *         description: mongo db query
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *          description: the deleted readings
 *          schema:
 *              $ref: '#/paths/definitions/reading'
 *       404:
 *          description: readings to be deleted not found
 *          schema:
 *              $ref: '#/paths/definitions/error'
 */
router.delete('/',  catchErrors(readingController.delete));

/**
 * @swagger
 * /readings:
 *   put:
 *     summary: updates one reading
 *     tags:
 *       - Reading
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: reading id
 *         in: body
 *         required: true
 *         schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/reading'
 *     responses:
 *       200:
 *          description: the updated reading
 *          schema:
 *              $ref: '#/paths/definitions/reading'
 *       404:
 *          description: Reading to be updated not found
 *          schema:
 *              $ref: '#/paths/definitions/error'
 */
router.put('/:id', catchErrors(readingController.put));

/**
 * @swagger
 * /readings:
 *   put:
 *     summary: updates one reading
 *     tags:
 *       - Reading
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: filter
 *         description: w.r.t feature, tags, etc...
 *         in: body
 *         required: true
 *         schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/reading'
 *     responses:
 *       200:
 *          description: the upserted reading
 *          schema:
 *              $ref: '#/paths/definitions/reading'
 *       404:
 *          description: Filter resulted in multiple readings
 *          schema:
 *              $ref: '#/paths/definitions/error'
 */
router.put('/', catchErrors(readingController.put));

module.exports = router;