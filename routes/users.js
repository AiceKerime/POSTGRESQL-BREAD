const fs = require('fs')
const express = require('express');
const router = express.Router();
const moment = require('moment')

const dataPath = './json/data.json'
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

module.exports = function (db) {
  router.get('/', async (req, res) => {
    try {
      const { rows: data } = await db.query('SELECT * FROM public."dataBread"')

      res.render('users/list', { data, moment })

    } catch (err) {
      console.log(err)
    }
  })

  router.get('/add', async (req, res) => {
    try {
      const { string, integer, float, date, boolean } = req.body

      const { rows: data } = await db.query('INSERT INTO dataBread (string, integer, float, date, boolean) VALUES ($1, $2, $3, $4, $5)', [string, integer, float, date, boolean])

      console.log(data)

      res.render('users/add', data)
    } catch (err) {
      console.log(err)
    }
  })

  router.get('/edit', (req, res) => {
    res.render('users/edit')
  })

  router.get('/edit/:id', async (req, res) => {
    try {
      const { id } = req.params.id
      console.log(id)
      const { rows } = await db.query('SELECT * FROM public."dataBread" WHERE id = $1', [id])

      res.render('users/edit', rows[id])

    } catch (err) {
      console.log('error', err)
      res.send(err)
    }
  })

  router.get('/delete/:id', async (req, res) => {
    try {
      const { id } = req.params.id

      const { rows: data } = await db.query('DELETE FROM dataBread WHERE id = $1', [id])

      res.redirect('/users', { data })
    } catch (err) {
      console.log(err)
    }
  })

  // POST
  router.post('/add', (req, res) => {
    data.push({ string: req.body.string, integer: parseInt(req.body.integer), float: parseFloat(req.body.float), date: req.body.date, boolean: JSON.parse(req.body.boolean) })
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 3))
    res.redirect('/users')
  })

  router.post('/edit/:id', (req, res) => {
    const id = req.params.id
    data[id] = { string: req.body.string, integer: parseInt(req.body.integer), float: parseFloat(req.body.float), date: req.body.date, boolean: JSON.parse(req.body.boolean) }
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 3))
    res.redirect('/users')
  })

  return router;
}