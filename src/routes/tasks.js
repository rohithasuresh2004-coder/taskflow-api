const router = require('express').Router();
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const c = require('../controllers/taskController');

const STATUS = ['todo', 'in-progress', 'done'];
const PRIORITY = ['low', 'medium', 'high'];

const idRule = param('id').isMongoId().withMessage('Invalid task id');

const taskFields = (required) => [
  required
    ? body('title').trim().notEmpty().withMessage('Title is required')
    : body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('title').optional().isLength({ max: 120 }).withMessage('Title max length is 120'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description max length is 1000'),
  body('status').optional().isIn(STATUS).withMessage(`Status must be one of: ${STATUS.join(', ')}`),
  body('priority').optional().isIn(PRIORITY).withMessage(`Priority must be one of: ${PRIORITY.join(', ')}`),
  body('dueDate').optional().isISO8601().withMessage('dueDate must be a valid ISO 8601 date'),
];

router.use(protect); // all task routes require authentication

router
  .route('/')
  .get(
    [
      query('status').optional().isIn(STATUS),
      query('priority').optional().isIn(PRIORITY),
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 }),
    ],
    validate,
    c.getTasks
  )
  .post(taskFields(true), validate, c.createTask);

router
  .route('/:id')
  .get(idRule, validate, c.getTask)
  .put(idRule, taskFields(false), validate, c.updateTask)
  .delete(idRule, validate, c.deleteTask);

module.exports = router;
