const express = require('express')
const router = express.Router()

const {models} = require('../../db/')

router.get('/', (req, res, next) => {
  models.Products.findAll({include: [models.Categories], order: ['id']})
    .then((response) => res.send(response))
    .catch(next)
})

router.get('/:id', (req, res, next) => {
  models.Products.findOne({where: {id: req.params.id}, include: [models.Categories]})
    .then((response) => res.send(response))
    .catch(next)
})

module.exports = router
