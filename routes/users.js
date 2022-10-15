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

  router.get('/edit/:id', async (req, res) => {
    try {
      const { id } = req.params

      const { rows: data } = await db.query('SELECT * FROM public."dataBread" WHERE id = $1', [id])


      res.render('users/edit', { item: data[0], moment })
    } catch (err) {
      console.log(err)
    }
  })

  router.get('/delete/:id', async (req, res) => {
    try {
      const { id } = req.params

      await db.query('DELETE FROM public."dataBread" WHERE id = $1', [id])

      res.redirect('/users')
    } catch (err) {
      res.send(err)
    }
  })

  // POST
  router.post('/add', async (req, res) => {
    try {
      console.log(req.body)
      const { string, integer, float, date, boolean } = req.body

      if (date) {
        await db.query('INSERT INTO public."dataBread" (string, "integer", "float", date, "boolean") VALUES ($1, $2, $3, $4, $5)', [string, parseInt(integer), parseFloat(float), date, JSON.parse(boolean)])
      } else {
        await db.query('INSERT INTO public."dataBread" (string, "integer", "float" ,"boolean") VALUES ($1, $2, $3, $4)', [string, parseInt(integer), parseFloat(float), JSON.parse(boolean)])
      }

      res.redirect('/users')
    } catch (err) {
      console.log(err)
      res.send(err)
    }
  })

  router.post('/edit/:id', async (req, res) => {
    try {
      const { id } = req.params
      const { string, integer, float, date, boolean } = req.body

      await db.query('UPDATE public."dataBread" SET string = $1, "integer" = $2, "float" = $3, date = $4, "boolean" = $5 WHERE id = $6', [string, parseInt(integer), parseFloat(float), date, JSON.parse(boolean), id])

      res.redirect('/users')
    } catch (err) {
      res.send(err)
    }
  })

  return router;
}