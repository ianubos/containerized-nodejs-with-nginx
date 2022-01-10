const express = require('express')
const cors = require('cors')

const app = express()

app.enable('trust proxy')
app.use(cors({}))
app.use(express.json())

app.get('/', (req, res) => {
    res.send('<h1>hi / from another!!!!</h1>')
    console.log('/ root is active.')
})

app.get('/another', (req, res) => {
    res.send('<h1>hi another!!!!</h1>')
    console.log('/ root is active.')
})

app.get('/another/other', (req, res) => {
    res.send('<h1>hi another/other!!!!</h1>')
    console.log('/ root is active.')
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`listening on port ${port}`))
