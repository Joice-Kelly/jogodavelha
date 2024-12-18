const express  = require('express');
const http = require('http')
const { Server } = require('socket.io')
const { Field } = require("./components/field");

const app = express();
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})


const field = new Field();
let players = {
    1: "",
    2: ""
};
let started = false;
let activePlayer = 1;
let gameOver = false;


io.on("connection", socket => {
    if (io.sockets.sockets.size > 2) {
        console.log("Muitos jogadores tentando conectar");
        socket.disconnect();
    }

    
    const sockId = socket.id;
    joinPlayers(sockId)

    
    const id = getKeyByValue(players, sockId);
    socket.emit('clientId', id);

    // inicia o jogo com 2 jogadores
    if (io.sockets.sockets.size == 2 && !started) {
        started = true;
        io.emit('start', activePlayer);
        console.log("Partida iniciada");
    }

        if (started) {
        socket.emit('continue', activePlayer, field.getField());
    }

    // enviando a servidor o  jogador da vez
    socket.on("turn", (turn) => {
        console.log(`Vez de: ${id}: ${turn.x}, ${turn.y}`);
        if (gameOver) return;

        
        activePlayer = 3 - activePlayer;

        
        field.setCell(turn.x, turn.y, id);

        // notifica o cliente
        io.emit('turn', {
            "x": turn.x,
            "y": turn.y,
            "next": activePlayer
        });

        // game over
        let overObj = field.checkGameOver(id);
        gameOver = overObj['over'];
        if (gameOver) {
            console.log(overObj['id'] != 0 ? `Game over! Vencedor do jogo ${id}` :
                `Game over! Empate`);
            io.emit('over', overObj);

            // reset jogo
            field.resetField();
            started = false;
            gameOver = false;
        }
    });

    // remover socket id do jogador
    socket.on("disconnect", () => {
        let key = getKeyByValue(players, socket.id)
        players[key] = "";
    })
});

server.listen(3000, () => {
console.log("API em execução")
});

// add socket id ao jogador
function joinPlayers(clientId) {
    for (const keyIdx in players) {
        let curr = players[keyIdx];
        if (curr == "") {
            players[keyIdx] = clientId;
            console.log(players)
            return;
        }
    }
}

function getKeyByValue(obj, value) {
    return Object.keys(obj).find(key => obj[key] === value);
}