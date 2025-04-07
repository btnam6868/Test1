// server.js
const express = require('express');
const app = express();
const port = 3000;

// Middleware để xử lý JSON request và serve static file
app.use(express.json());
app.use(express.static('public')); // Để phục vụ các file tĩnh (HTML, CSS, JS)

// Trang chủ gửi một form với nút bấm
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// API endpoint nhận POST request
app.post('/send', (req, res) => {
  const data = req.body.text;
  console.log('Received from client:', data);
  res.send({ message: `Server received: ${data}` });
});

// Lắng nghe kết nối tại port 3000
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
