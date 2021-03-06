const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// IMPORT MODELS
require('./models/Battle');
require('dotenv').config({ path: '.env'});

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
const db = mongoose.connection;
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('connected to database'))

app.use(bodyParser.json());

// IMPORT ROUTES
require('./routes/battleRoutes')(app);
require('./routes/battleBlacklistRoutes')(app)
require('./routes/battleCommentsRoutes')(app)
require('./routes/battlePlayerRoutes')(app)
require('./routes/battleSubscriberRoutes')(app)
require('./routes/battleTokenRoutes')(app)
require('./routes/battleViewerRoutes')(app)

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    const path = require('path');
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`app running on port ${PORT}`)
})