const express = require('express');
const router = express.Router();
const usersModel = require('../models').Users;
const transactionModel = require('../models').Transaction;
const balanceModel = require('../models').Balance;
const { sequelize } = require('../models');
router.get('/', function (req, res) {
  usersModel.findAll().then(
    function (users) {
      res.status(200).json(users);
    },
    function (error) {
      res.status(500).send(error);
    }
  );
});
router.post('/', function (req, res) {
  const { username, email, password } = req.body;
  usersModel
    .create({ username, email, password })
    .then(function (user) {
      res.status(200).json(user);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});
router.get('/balance', function (req, res) {
  balanceModel.findAll().then(
    function (users) {
      res.status(200).json(users);
    },
    function (error) {
      res.status(500).send(error);
    }
  );
});
router.post('/balance', function (req, res) {
  const { balance, userid } = req.body;
  balanceModel
    .create({ balance, userid })
    .then(function (user) {
      res.status(200).json(user);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});
router.get('/transaction', function (req, res) {
  transactionModel.findAll().then(
    function (users) {
      res.status(200).json(users);
    },
    function (error) {
      res.status(500).send(error);
    }
  );
});
router.post('/transaction', function (req, res) {
  const { transaction_date, transaction_amount, userid } = req.body;
  transactionModel
    .create({ transaction_date, transaction_amount, userid })
    .then(function (transaction) {
      res.status(200).json(transaction);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});
router.post('/transfer', async (req, res) => {
  const { sender, receiver, transaction_amount } = req.body;
  let transaction;
  try {
    transaction = await sequelize.transaction();
    const senderId = await balanceModel.findOne({ where: { userid: sender } });
    const receiverId = await balanceModel.findOne({
      where: { userid: receiver },
    });
    transactionModel.create({
      transaction_date: new Date(),
      transaction_amount,
      userid: sender,
    });
    const debitMoney = await balanceModel.update(
      { balance: senderId.balance - parseInt(transaction_amount) },
      {
        where: {
          userid: sender,
        },
      },
      { transaction }
    );
    const creditMoney = await balanceModel.update(
      { balance: receiverId.balance + parseInt(transaction_amount) },
      {
        where: {
          userid: receiver,
        },
      },
      { transaction }
    );
    await transaction.commit();
    res.json({ status: 1, data: 'money send succesfull' });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    res.json({ status: 0, error });
  }
});
module.exports = router;
