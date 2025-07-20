const { body } = require('express-validator');

exports.updateProfileValidator = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),

  body('address')
    .optional()
    .isString()
    .withMessage('Address must be valid string'),


  body('profileImage')
    .optional()
    .isString()
    .withMessage('profileImage must be valid string')

];
