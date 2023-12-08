const express = require("express")
const app = express()

app.use(express.json());
const rooms = [];
app.get("/", (req, res) => { res.status(200).json({ status: "success" }) })


app.post("/room", (req, res) => {
    console.log(req.body);
    if (!req.body.roomNo) {
        res.status(400).json({ message: "error" })
    }
    rooms.push(req.body);
    res.status(200).json({ message: "room created" })
})

app.get("/room", (req, res) => {
    res.status(200).json({ rooms })
})

app.listen(8000)