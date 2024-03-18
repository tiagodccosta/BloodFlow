const express = require('express');
const app = express();
const port = 4000;

app.get('/api', (req, res) => {
  res.json({"users": ["Tiago", "Ada", "Carlos"]});
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});