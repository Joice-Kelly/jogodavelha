const socket = io("ws://localhost:3000");
const token = {
    1: "xis",
    2: "circulo"
};
let clientId;
let activeId;

// pegar o id do jogador
socket.on('clientId', (id) => {
    clientId = id;
})

// pegar o id do jogador e configurar o html 
socket.on('start', (startId) => {
    activeId = startId;

    document.getElementById('current-turn').classList.remove('hide');
    document.getElementById('clientId').innerHTML = clientId == activeId ? 'você é o jogador atual' : 'você não é o jogador atual';
});

// mostrar o estado do jogo 
socket.on('continue', (active, field) => {
    activeId = active;
    for (let x = 0; x < field.length; x++) {
        for (let y = 0; y < field.length; y++) {
            setField(x, y, field[y][x]);
        }
    }

    document.getElementById('current-turn').classList.remove('hide');
    document.getElementById('clientId').innerHTML = clientId == activeId ? 'você é o jogador atual' : 'você não é o jogador atual';
})

// mostrar a vez do jogo
socket.on('turn', (turn) => {
    const {x, y, next} = turn;
    setField(x, y, activeId);
    activeId = next;
    document.getElementById('clientId').innerHTML = clientId == activeId ? 'você é o jogador atual' : 'você não é o jogador atual';
})

// mostrar caso de vitória
socket.on('over', (overObj) => {
    let winnerId = overObj['id']
    if (winnerId != 0)
        document.getElementById('winnerId').innerHTML = clientId == winnerId ? 'ganhou' : 'perdeu';
    else
        document.getElementById('winnerId').innerHTML = 'draw';
    
    socket.disconnect();

    document.getElementById('popup').classList.remove('hide');
    document.getElementById('current-turn').classList.add('hide');
})


// enviar o evento para o servidor
function turn(x, y) {
    if (activeId != clientId) return;
    if (getField(x,y).classList.contains(token[1]) || getField(x,y).classList.contains(token[2])) return;
    socket.emit("turn", { x, y })
}

// capturar o campo
function getField(x, y) {
    return document.getElementById(`x${x}y${y}`)
}

// atulizar css
function setField(x, y, id) {
    let field = getField(x,y);
    field.classList.add(token[id]);
}

// restart o jogo
function restart() {
    window.location.reload();
}