const tabla = document.querySelector("table");
const letras = ['a','b','c','d','e','f','g','h'];
const piezasPorJugador = {
  jugador1: {
    peon: 8,
    torre: 2,
    caballo: 2,
    alfil: 2,
    reina: 1,
    rey: 1
  },
  jugador2: {
    peon: 8,
    torre: 2,
    caballo: 2,
    alfil: 2,
    reina: 1,
    rey: 1
  }
};


for (let fila = 0; fila <= 8; fila++) {
  const tr = document.createElement("tr");

  for (let col = 0; col <= 8; col++) {
    const td = document.createElement("td");

    // Esquina superior izquierda vacía
    if (fila === 0 && col === 0) {
      td.textContent = '';
      td.classList.add('coord');
    }
    // Fila de letras (arriba)
    else if (fila === 0) {
      td.textContent = letras[col - 1];
      td.classList.add('coord');
    }
    // Columna de números (izquierda)
    else if (col === 0) {
      td.textContent = 9 - fila; // del 8 al 1
      td.classList.add('coord');
    }
    // Casillas reales del tablero
    else {
      const color = (fila + col) % 2 === 0 ? 'white' : 'black';
      td.classList.add('casilla', color);

      const letra = letras[col - 1];
      const numero = 9 - fila;
      td.id = letra + numero;
    }

    tr.appendChild(td);
  }

  tabla.appendChild(tr);
}

let turnoActual = 'jugador1';
function colocarPieza(casillaId, tipo) {
  const jugador = turnoActual;
  const enemigo = jugador === 'jugador1' ? 'jugador2' : 'jugador1';

  // Verificar si quedan piezas
  if (piezasPorJugador[jugador][tipo] <= 0) {
    alert("Ya no te quedan piezas de ese tipo");
    return;
  }

  // Verificar si hay pieza enemiga
  const ocupante = tablero[casillaId];
  if (ocupante) {
    if (ocupante.jugador === enemigo && ocupante.tipo === "rey") {
      alert(`${jugador} ha ganado al eliminar al rey enemigo`);
      // fin del juego
      return;
    }
  }

  // Colocar o reemplazar pieza
  tablero[casillaId] = {
    jugador,
    tipo
  };

  // Actualizar HTML (poner imagen en la celda)
  const celda = document.getElementById(casillaId);
  celda.innerHTML = `<img src="img/${jugador}_${tipo}.png">`;

  // Restar pieza
  piezasPorJugador[jugador][tipo]--;

  // Cambiar turno
  turnoActual = enemigo;
}
