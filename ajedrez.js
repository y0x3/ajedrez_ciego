import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBrRRbpqUToMUsfTb_XeAOMt_HcmHiDz14",
  authDomain: "ajedrez-ciego.firebaseapp.com",
  databaseURL: "https://ajedrez-ciego-default-rtdb.firebaseio.com",
  projectId: "ajedrez-ciego",
  storageBucket: "ajedrez-ciego.appspot.com",
  messagingSenderId: "214392140581",
  appId: "1:214392140581:web:a089e7007ec3071044a0cc",
  measurementId: "G-S25HK9P8WW"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

//CREACION DE TABLERO DE AJEDREZ

const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const numeros = [8, 7, 6, 5, 4, 3, 2, 1];

// Coordenadas horizontales (letras)
document.getElementById('letras-arriba').innerHTML = letras.map(l => `<span>${l}</span>`).join('');
document.getElementById('letras-abajo').innerHTML = letras.map(l => `<span>${l}</span>`).join('');

// Coordenadas verticales (números)
document.getElementById('numeros-izquierda').innerHTML = numeros.map(n => `<span>${n}</span>`).join('');
document.getElementById('numeros-derecha').innerHTML = numeros.map(n => `<span>${n}</span>`).join('');

// Generar tablero (8x8)
const tablero = document.getElementById("tablero");
for (let row = 0; row < 8; row++) {
  const tr = document.createElement("tr");
  for (let col = 0; col < 8; col++) {
    const td = document.createElement("td");
    const color = (row + col) % 2 === 0 ? 'white' : 'black';
    td.classList.add('casilla', color);
    td.id = `${letras[col]}${numeros[row]}`;
    tr.appendChild(td);
  }
  tablero.appendChild(tr);
}

//LOGICA DEL TABLERO
let temporizadorIniciado = false;
function obtenerParametros() {
  const params = new URLSearchParams(window.location.search);
  return {
    lobby: params.get("lobby"),
    nombre: params.get("nombre")
  };
}

const { lobby, nombre } = obtenerParametros();
const db = getDatabase();
const lobbyRef = ref(db, `lobbies/${lobby}`);

let intervalo;
let soyJugador1 = false;
let tiempo1 = 0;
let tiempo2 = 0;

onValue(lobbyRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  soyJugador1 = data.jugador1 === nombre;

  document.getElementById("nombre-j1").textContent = data.jugador1;
  document.getElementById("nombre-j2").textContent = data.jugador2;
  tiempo1 = data.tiempo1;
  tiempo2 = data.tiempo2;

  actualizarTiempos();

  if (data.iniciar && !temporizadorIniciado) {
    temporizadorIniciado = true;

    const msg = document.getElementById("mensajeInicio");
    msg.style.display = "block";
    setTimeout(() => {
      msg.style.display = "none";
      iniciarTemporizador(data.turno);
    }, 2000);
  }
});

function actualizarTiempos() {
  document.getElementById("tiempo-j1").textContent = formatearTiempo(tiempo1);
  document.getElementById("tiempo-j2").textContent = formatearTiempo(tiempo2);
}

function formatearTiempo(segundos) {
  const m = Math.floor(segundos / 60).toString().padStart(2, '0');
  const s = (segundos % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function iniciarTemporizador(turnoActual) {
  clearInterval(intervalo);

  intervalo = setInterval(() => {
    if (turnoActual === 'jugador1') {
      tiempo1--;
    } else {
      tiempo2--;
    }

    updateTiemposEnFirebase(tiempo1, tiempo2, turnoActual);
    actualizarTiempos();

    if (tiempo1 <= 0 || tiempo2 <= 0) {
      clearInterval(intervalo);
      alert("¡Tiempo agotado!");
    }
  }, 1000);
}

function updateTiemposEnFirebase(t1, t2, turnoActual) {
  set(ref(db, `lobbies/${lobby}`), {
    tiempo1: t1,
    tiempo2: t2,
    turno: turnoActual,
    jugador1: document.getElementById("nombre-j1").textContent,
    jugador2: document.getElementById("nombre-j2").textContent,
    iniciar: true
  });
}

//cambiar turno al hacer click en una casilla
document.querySelectorAll("td").forEach(casilla => {
  casilla.addEventListener("click", () => {
    // Solo puede cambiar turno quien tiene el turno actual
    const nuevoTurno = soyJugador1 ? 'jugador2' : 'jugador1';
    set(ref(db, `lobbies/${lobby}/turno`), nuevoTurno);
  });
});


//LOGICA DE MENU DE PIEZAS
// Función para agregar el menú de piezas
const piezasBlancas = [
  { nombre: 'PeonBlanco.png', cantidad: 8 },
  { nombre: 'TorreBlanca.png', cantidad: 2 },
  { nombre: 'CaballoBlanco.png', cantidad: 2 },
  { nombre: 'AlfilBlanco.png', cantidad: 2 },
  { nombre: 'ReyBlanco.png', cantidad: 1 },
  { nombre: 'ReynaBlanca.png', cantidad: 1 }
];

const piezasNegras = [
  { nombre: 'PeonNegro.png', cantidad: 8 },
  { nombre: 'TorreNegra.png', cantidad: 2 },
  { nombre: 'CaballoNegro.png', cantidad: 2 },
  { nombre: 'AlfilNegro.png', cantidad: 2 },
  { nombre: 'ReyNegro.png', cantidad: 1 },
  { nombre: 'ReynaNegra.png', cantidad: 1 }
];

function mostrarMenuPiezas(color) {
  const menu = document.getElementById('menu-piezas');
  menu.innerHTML = '';
  const piezas = color === 'blanco' ? piezasBlancas : piezasNegras;
  piezas.forEach(pieza => {
    for (let i = 0; i < pieza.cantidad; i++) {
      const img = document.createElement('img');
      img.src = `assets/${pieza.nombre}`;
      img.alt = pieza.nombre;
      menu.appendChild(img);
    }
  });
}


// Mostrar solo el menú correspondiente al jugador
if (soyJugador1) {
  mostrarMenuPiezas('blanco');
  document.getElementById('menu-piezas').style.display = 'block';
} else {
  mostrarMenuPiezas('negro');
  document.getElementById('menu-piezas').style.display = 'block';
}
//noc