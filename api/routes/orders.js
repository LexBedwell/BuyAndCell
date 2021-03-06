const express = require('express')
const router = express.Router()

const {Op} = require('sequelize')

const {models} = require('../../db/')
const {sendConfirmationEmail} = require('../email/sendEmail')
const {findUser, findOrCreateUser} = require('../../utils/services/accountService.js')
const { sendInventoryServiceOrder } = require('../../utils/services/inventoryService.js')

router.get('/history', (req, res, next) => {
  const attr = {
    userId: req.user.id,
    status: {
      [Op.or]: ['processing', 'cancelled', 'completed', 'delivered']
    }
  }
  models.Orders.findAll({
    where: attr,
    include: [{model: models.LineItems, include: models.Products }],
    order: [['createdAt', 'DESC']]
  })
    .then( response => res.send(response))
    .catch(next)
})

router.get('/orderconfirmation/:id', (req, res, next) => {
  const attr = {
    id: req.params.id,
    status: {
      [Op.or]: ['processing', 'completed', 'delivered']
    }
  }
  models.Orders.findOne({
    where: attr
  })
    .then( response => res.send({id: response.id}))
    .catch( () => res.send({id: 'unable to retrieve order'}))
})

router.get('/cart', async (req, res, next) => {
  if (!req.user){
    const cart = await models.Orders.create({})
    const sentCart = await models.Orders.findOne({ where: {id: cart.id}, include: [{model: models.LineItems, include: models.Products }] })
    res.send(sentCart)
    return
  }
  const attr = {
    userId: req.user.id,
    status: 'cart'
  }
  try {
    let cart = await models.Orders.findOne({ where: attr, include: [{model: models.LineItems, include: models.Products }] })
    if (!cart){
      const createdCart = await models.Orders.create({userId: req.user.id, status: 'cart'})
      cart = await models.Orders.findOne({ where: {id: createdCart.id}, include: [{model: models.LineItems, include: models.Products }] })
    }
    res.send(cart);
  }
  catch (err){
    next(err)
  }
})

router.put('/', async (req, res, next) => {
  try {
    req.body.lineItems.forEach(async lineItem => {
      await models.LineItems.update({
        quantity: lineItem.quantity
      }, {
        where: {
            id: lineItem.id
        }
      })
    })
    const editedCart = await models.Orders.findOne({ where: {id: req.body.id}, include: [{model: models.LineItems, include: models.Products }] })
    res.send(editedCart)
  } catch (err) {
    next(err)
  }
})

router.put('/submit', async (req, res, next) => {
  try {
    let orderEmail
    let orderId = req.body.id
    if (!req.body.userId){
      let searchUser = await findOrCreateUser(req.body.email)
      await models.Orders.update({
        userId: searchUser.id
      }, {
        where: {
          id: orderId
        }
      })
      orderEmail = req.body.email
    } else {
      let searchUser = await findUser(req.body.userId)
      orderEmail = searchUser.email
    }
    let inventoryServiceOrder = {}
    req.body.lineItems.forEach( elem => inventoryServiceOrder[elem.productId] = elem.quantity)
    let inventoryServiceResponse = await sendInventoryServiceOrder(inventoryServiceOrder)
    if (inventoryServiceResponse.processTransaction === true) {
      req.body.lineItems.forEach(async lineItem => {
        await models.LineItems.update({
          quantity: lineItem.quantity
        }, {
          where: {
              id: lineItem.id
          }
        })
      })
      await models.Orders.update({
          status: 'processing',
          isPaid: true,
          addressName: req.body.addressName,
          addressLine: req.body.addressLine,
          addressCity: req.body.addressCity,
          addressState: req.body.addressState,
          addressZip: req.body.addressZip
        }, {
        where: {
          id: orderId
        }
      })
      sendConfirmationEmail(orderId, orderEmail)
    }
    res.status(202).send(inventoryServiceResponse)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', (req, res, next) => {
  const attr = {
    id: req.params.id,
    status: {
      [Op.or]: ['processing', 'cancelled', 'completed', 'delivered']
    }
  }
  models.Orders.findOne({
    where: attr,
    include: [{model: models.LineItems, include: models.Products }]
  })
  .then( response => res.send(response))
  .catch(next)
})

//dev purposes only!
if (process.env.NODE_ENV === 'development'){
  router.get('/', (req, res, next) => {
    models.Orders.findAll({
      include: [{model: models.LineItems, include: models.Products }],
      order: [['createdAt', 'DESC']]
    })
      .then( response => res.send(response))
      .catch(next)
  })
}

module.exports = router
