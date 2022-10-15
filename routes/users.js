const express = require('express');
const router = express.Router();
const moment = require('moment');

// const dataPath = './json/data.json'
// const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

module.exports = function (db) {
  router.get('/', (req, res) => {
    const page = req.query.page || 1
    const url = req.url == '/' ? '/?page=1' : req.url
    const limit = 3;
    const offset = (page - 1) * limit

    const position = []
    const values = []

    db.query('SELECT * FROM public."dataBread"', (err, total) => {
      if (err) {
        console.log('Failed to get data')
      }
      console.log(url)

      if (req.query.id && req.query.idCheck == 'on') {
        position.push(`id = ?`);
        values.push(req.query.id);
      }

      if (req.query.string && req.query.stringCheck == 'on') {
        position.push(`string like '%' || ? || '%'`);
        values.push(req.query.string);
      }

      if (req.query.integer && req.query.integerCheck == 'on') {
        position.push(`integer like '%' || ? || '%'`);
        values.push(req.query.integer);
      }

      if (req.query.float && req.query.floatCheck == 'on') {
        position.push(`float like '%' || ? || '%'`);
        values.push(req.query.float);
      }
      //
      if (req.query.dateCheck == 'on') {
        if (req.query.startDate != '' && req.query.endDate != '') {
          position.push('date BETWEEN ? AND ?')
          values.push(req.query.startDatsql += e);
          values.push(req.query.endDate);
        }
        else if (req.query.startDate) {
          position.push('date > ?')
          values.push(req.query.startDate);
        }
        else if (req.query.endDate) {
          position.push('date < ?')
          values.push(req.query.endDate);
        }
      }
      //
      if (req.query.boolean && req.query.booleanCheck == 'on') {
        position.push(`boolean = ?`);
        values.push(req.query.boolean);
      }

      let sql = 'SELECT COUNT(*) AS total FROM public."dataBread"';
      if (position.length > 0) {
        sql += ` WHERE ${position.join(' AND ')}`
      }
      console.log(sql)

      db.query(sql, values, (err, data) => {
        if (err) {
          console.error(err);
        }
        const pages = Math.ceil(data.rows[0].total / limit)
        console.log(pages)

        sql = 'SELECT * FROM public."dataBread"'
        if (position.length > 0) {
          sql += ` WHERE ${position.join(' AND ')}`
        }
        sql += ' LIMIT $1 OFFSET $2';

        db.query(sql, [...values, limit, offset], (err, data) => {
          if (err) {
            console.error(err);
          }
          console.log(data.rows)
          res.render('users/list', { data, moment, pages, page, query: req.query, url, total })
        })
      })
    })
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