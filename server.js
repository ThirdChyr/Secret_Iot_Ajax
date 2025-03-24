const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// เชื่อมต่อกับ MQTT Broker
const client = mqtt.connect('mqtt://20.243.148.107');

let latestData = "";  // เก็บค่าข้อมูลล่าสุด
let latestTimestamp = ""; // เก็บเวลาที่ได้รับข้อมูลล่าสุด

client.on('connect', () => {
    console.log("Connected to MQTT Broker");
    client.subscribe('DIR'); // Subscribe Topic DIR
});

client.on('message', (topic, message) => {
    if (topic === 'DIR') {
        latestData = message.toString();
        latestTimestamp = new Date().toLocaleString();  // บันทึกเวลาที่ได้รับข้อมูล
        console.log(`Received from DIR: ${latestData} at ${latestTimestamp}`);
    }
});

// API ให้ดึงค่าจาก MQTT
app.get('/get-data', (req, res) => {
    res.json({ data: latestData, timestamp: latestTimestamp });
});

// API ส่งข้อมูลไปยัง MQTT Broker
app.post('/send-data', (req, res) => {
    const { value } = req.body;
    const sendTime = new Date().toLocaleString(); // บันทึกเวลาที่ส่งข้อมูล
    console.log(`Publishing: ${value} to DIR at ${sendTime}`);
    client.publish('DIR', value);
    res.json({ status: "success", sent: value, sentTime });
});

// ให้ Express ให้บริการไฟล์ static (index.html)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, '192.168.1.54', () => {
    console.log(`Server running on http://192.168.1.54:${port}`);
});
