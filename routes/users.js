const express = require('express');
const router = express.Router();
const moment = require('moment');

// const dataPath = './json/data.json'
// const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

module.exports = function (db) {
  router.get('/', async (req, res) => {
    try {
      const { rows: data } = await db.query('SELECT * FROM public."dataBread"')

      res.render('users/list', { data, query: req.query, moment })

    } catch (err) {
      console.log(err)
    }
  })

  router.get('/add', (req, res) => {
    res.render('users/add')
  })

  router.get('/edit', (req, res) => {
    res.render('users/edit')
  })

  router.get('/edit/:id', async (req, res) => {
    try {
      const { id } = req.params
      const { rows: data } = await db.query('SELECT * FROM public."dataBread" WHERE id = $1', [id])

      res.render('users/edit', { item: data[0] })

    } catch (err) {
      console.log(err)
    }
  })

  router.get('/delete/:id', async (req, res) => {
    try {
      const { id } = req.params.id

      const { rows: data } = await db.query('DELETE FROM public."dataBread" WHERE id = $1', [id])

      res.redirect('/users', { item: data[0] })
    } catch (err) {
      console.log(err)
    }
  })

  // POST
  router.post('/add', async (req, res) => {
    try {
      const { string, integer, float, date, boolean } = req.body

      const { rows: data } = await db.query('INSERT INTO public."dataBread" (string, integer, float, date, boolean) VALUES ($1, $2, $3, $4, $5)', [string, integer, float, date, boolean])

      res.redirect('/users', { data })
    } catch (err) {
      console.log(err)
    }
  })

  router.post('/edit/:id', async (req, res) => {
    try {
      const { string, integer, float, date, boolean } = req.body

      const { rows: data } = await db.query('UPDATE FROM public."dataBread" SET string = $1, integer = $2, float = $3, date = $4, boolean = $5 WHERE id = $1', [string, integer, float, date, boolean])
    } catch (err) {

    }
  })

  return router;
}