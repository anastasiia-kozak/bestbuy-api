const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region: 'us-west-2'});

const express = require('express');
const app = express();
const port = 3001;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.json());

app.get('/leaderboard', (req, res) => {
  const params = {
    TableName: "bestbuy"
  };
  dynamodb.scan(params, function(err, data) {
    if (err) {
      res.send(err);
      return;
    }

    let leaderboard = data.Items;
    leaderboard = leaderboard.map(record => {
      return {
        uuid: record.uuid.S,
        winner: record.winner.S,
        players: record.players.S,
        datetime: record.datetime.N
      }
    });

    res.json(leaderboard);
  });
});

app.post('/leaderboard', (req, res) => {
  const uuid = "" + (Math.random() * 1000);
  const winner = req.body.winner;
  const players = req.body.players;
  const datetime = "" + Date.now();

  const params = {
    Item: {
      "uuid": {
        S: uuid,
      },
      "winner": {
        S: winner
      },
      "players": {
        S: players
      },
      "datetime": {
        N: datetime
      }
    },
    ReturnConsumedCapacity: "TOTAL",
    TableName: "bestbuy"
  };
  dynamodb.putItem(params, function(err, data) {
    if (err) {
      res.send('Error' + err);
      return;
    }

    res.send('Success');
  });

});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
