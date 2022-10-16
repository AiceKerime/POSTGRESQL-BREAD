const express = require('express');
const router = express.Router();
const moment = require('moment');

// const dataPath = './json/data.json'
// const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

module.exports = function (db) {
    router.get('/', (req, res) => {
        const url = req.url == '/' ? '/?page=1' : req.url;
        const page = req.query.page || 1;
        const limit = 3;
        const offset = (page - 1) * limit;
        const position = []
        const values = []
        var count = 1;


        const filter = `&idCheck=${req.query.idCheck}&id=${req.query.id}&stringCheck=${req.query.stringCheck}&string=${req.query.string}&integerCheck=${req.query.integerCheck}&integer=${req.query.integer}&floatCheck=${req.query.floatCheck}&float=${req.query.float}&dateCheck=${req.query.dateCheck}&startDate=${req.query.startDate}&endDate=${req.query.endDate}&booleanCheck=${req.query.booleanCheck}&boolean=${req.query.boolean}`
        console.log(filter)


        var sortBy = req.query.sortBy == undefined ? `id` : req.query.sortBy;
        var sortMode = req.query.sortMode == undefined ? `asc` : req.query.sortMode;

        if (req.query.id && req.query.idCheck == 'on') {
            position.push(`id = $${count++}`);
            values.push(req.query.id);
        }

        if (req.query.string && req.query.stringCheck == 'on') {
            position.push(`string like '%' || $${count++} || '%'`);
            values.push(req.query.string);
        }

        if (req.query.integer && req.query.integerCheck == 'on') {
            position.push(`integer like '%' || $${count++} || '%'`)
            values.push(req.query.integer);
        }

        if (req.query.float && req.query.floatCheck == 'on') {
            position.push(`float like '%' || $${count++} || '%'`)
            values.push(req.query.float);
        }

        if (req.query.dateCheck == 'on') {
            if (req.query.startDate != '' && req.query.endDate != '') {
                position.push(`date BETWEEN $${count++} AND $${count++}`)
                values.push(req.query.startDate);
                values.push(req.query.endDate);
            }
            else if (req.query.startDate) {
                position.push(`date > $${count++}`)
                values.push(req.query.startDate);
            }
            else if (req.query.endDate) {
                position.push(`date < $${count++}`)
                values.push(req.query.endDate);
            }
        }

        if (req.query.boolean && req.query.booleanCheck == 'on') {
            position.push(`boolean = $${count++}`);
            values.push(req.query.boolean);
        }

        let sql = 'SELECT COUNT(*) AS total FROM public."dataBread"';
        if (position.length > 0) {
            sql += ` WHERE ${position.join(' AND ')}`
        }

        db.query(sql, values, (err, data) => {
            if (err) {
                console.error(err);
            }
            const pages = Math.ceil(data.rows[0].total / limit)

            sql = 'SELECT * FROM public."dataBread"'
            if (position.length > 0) {
                sql += ` WHERE ${position.join(' AND ')}`
            }
            sql += ` ORDER BY ${sortBy} ${sortMode} LIMIT $${count++} OFFSET $${count++}`;

            console.log('sql', sql)
            db.query(sql, [...values, limit, offset], (err, data) => {
                if (err) {
                    console.error(err);
                }
                console.log()
                res.render('users/list', { data: data.rows, pages, page, query: req.query, moment, url, filter, sortBy, sortMode })
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

            res.redirect('/')
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

            res.redirect('/')
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

            res.redirect('/')
        } catch (err) {
            res.send(err)
        }
    })

    return router;
}