// Importa los módulos necesarios de Firebase para inicializar la app y manejar la base de datos en tiempo real
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

// Configuración de Firebase para conectar con tu proyecto
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

// Inicializa la app de Firebase y obtiene la referencia a la base de datos
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// =======================
// CREACIÓN DEL TABLERO DE AJEDREZ
// =======================

// Letras y números para las coordenadas del tablero
const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const numeros = [8, 7, 6, 5, 4, 3, 2, 1];

// Muestra las letras arriba y abajo del tablero
document.getElementById('letras-arriba').innerHTML = letras.map(l => `<span>${l}</span>`).join('');
document.getElementById('letras-abajo').innerHTML = letras.map(l => `<span>${l}</span>`).join('');

// Muestra los números a la izquierda y derecha del tablero
document.getElementById('numeros-izquierda').innerHTML = numeros.map(n => `<span>${n}</span>`).join('');
document.getElementById('numeros-derecha').innerHTML = numeros.map(n => `<span>${n}</span>`).join('');

// Genera el tablero de 8x8 dinámicamente y asigna clases de color y un id único a cada casilla
const tablero = document.getElementById("tablero");
for (let row = 0; row < 8; row++) {
  const tr = document.createElement("tr");
  for (let col = 0; col < 8; col++) {
    const td = document.createElement("td");
    const color = (row + col) % 2 === 0 ? 'white' : 'black'; // Alterna colores
    td.classList.add('casilla', color);
    td.id = `${letras[col]}${numeros[row]}`; // Ejemplo: A8, B8, etc.
    tr.appendChild(td);
  }
  tablero.appendChild(tr);
}

// =======================
// LÓGICA DEL TABLERO Y TEMPORIZADOR
// =======================

// Bandera para saber si el temporizador ya inició
let temporizadorIniciado = false;

// Obtiene los parámetros de la URL (lobby y nombre del jugador)
function obtenerParametros() {
  const params = new URLSearchParams(window.location.search);
  return {
    lobby: params.get("lobby"),
    nombre: params.get("nombre")
  };
}

// Extrae los parámetros y prepara la referencia al lobby en la base de datos
const { lobby, nombre } = obtenerParametros();
const db = getDatabase();
const lobbyRef = ref(db, `lobbies/${lobby}`);

let intervalo;        // Intervalo del temporizador
let soyJugador1 = false; // Bandera para saber si soy el jugador 1
let tiempo1 = 0;      // Tiempo restante jugador 1
let tiempo2 = 0;      // Tiempo restante jugador 2
let miColor = null; // Guardará el color asignado a este jugador
let menuMostrado = false; // Bandera para mostrar el menú solo una vez

// Escucha los cambios en el lobby en tiempo real
onValue(lobbyRef, async (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  // Si ambos jugadores están presentes y aún no hay colores asignados, los asignamos aleatoriamente
  if (data.jugador1 && data.jugador2 && !data.colores) {
    // Solo uno de los clientes debe hacer la asignación
    const nombres = [data.jugador1, data.jugador2];
    if (Math.random() < 0.5) nombres.reverse(); // Aleatoriza el orden
    const colores = {};
    colores[nombres[0]] = "blanco";
    colores[nombres[1]] = "negro";
    // Guardamos en Firebase
    await set(ref(db, `lobbies/${lobby}/colores`), colores);
    // Esperamos a que el onValue se dispare de nuevo con los colores
    return;
  }

  // Asigna el color a este cliente según lo guardado en Firebase
  if (data.colores && data.colores[nombre]) {
    miColor = data.colores[nombre];
  }

  // Mostrar el menú de piezas según el color asignado SOLO UNA VEZ
  if (miColor && !menuMostrado) {
    mostrarMenuPiezas(miColor);
    document.getElementById('menu-piezas').style.display = 'block';
    menuMostrado = true;

    // Mostrar nombres y tiempos en el HUD según el color
    if (soyBlanco()) {
      document.getElementById("nombre-j1").textContent = nombre;
      document.getElementById("nombre-j2").textContent = data.jugador2;
    } else {
      document.getElementById("nombre-j1").textContent = data.jugador1;
      document.getElementById("nombre-j2").textContent = nombre;
    }

    // Mostrar coordenadas y tablero según el color
    mostrarCoordenadas();
    generarTablero();

    // Rotar visualmente el tablero y coordenadas si eres negras
    const tableroElem = document.getElementById('tablero');
    const letrasArriba = document.getElementById('letras-arriba');
    const letrasAbajo = document.getElementById('letras-abajo');
    const numerosIzquierda = document.getElementById('numeros-izquierda');
    const numerosDerecha = document.getElementById('numeros-derecha');
    if (soyNegro()) {
      tableroElem.classList.add('rotado');
      letrasArriba.classList.add('rotado');
      letrasAbajo.classList.add('rotado');
      numerosIzquierda.classList.add('rotado');
      numerosDerecha.classList.add('rotado');
    } else {
      tableroElem.classList.remove('rotado');
      letrasArriba.classList.remove('rotado');
      letrasAbajo.classList.remove('rotado');
      numerosIzquierda.classList.remove('rotado');
      numerosDerecha.classList.remove('rotado');
    }
  }

  // Actualiza los nombres y tiempos en la interfaz
  document.getElementById("nombre-j1").textContent = data.jugador1;
  document.getElementById("nombre-j2").textContent = data.jugador2;
  tiempo1 = data.tiempo1;
  tiempo2 = data.tiempo2;

  actualizarTiempos();

  // Si el juego debe iniciar y el temporizador aún no ha iniciado, lo inicia
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

// Actualiza los tiempos en pantalla
function actualizarTiempos() {
  document.getElementById("tiempo-j1").textContent = formatearTiempo(tiempo1);
  document.getElementById("tiempo-j2").textContent = formatearTiempo(tiempo2);
}

// Convierte los segundos a formato mm:ss
function formatearTiempo(segundos) {
  const m = Math.floor(segundos / 60).toString().padStart(2, '0');
  const s = (segundos % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Inicia el temporizador y descuenta el tiempo del jugador que tiene el turno
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

    // Si algún jugador se queda sin tiempo, termina el juego
    if (tiempo1 <= 0 || tiempo2 <= 0) {
      clearInterval(intervalo);
      alert("¡Tiempo agotado!");
    }
  }, 1000);
}

// Actualiza los tiempos y el turno en Firebase
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

// =======================
// CAMBIO DE TURNO AL HACER CLICK EN UNA CASILLA
// =======================

// Permite cambiar el turno al hacer click en cualquier casilla del tablero
document.querySelectorAll("td").forEach(casilla => {
  casilla.addEventListener("click", () => {
    // Solo puede cambiar turno quien tiene el turno actual
    const nuevoTurno = soyJugador1 ? 'jugador2' : 'jugador1';
    set(ref(db, `lobbies/${lobby}/turno`), nuevoTurno);
  });
});

// =======================
// MENÚ DE PIEZAS
// =======================

// Listas de piezas blancas y negras con su cantidad
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

// Muestra el menú de piezas correspondiente al color del jugador
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


// Utilidad para saber si eres blanco o negro
function soyBlanco() {
  return miColor === "blanco";
}
function soyNegro() {
  return miColor === "negro";
}

function mostrarCoordenadas() {
  let letrasArr = letras;
  let numerosArr = numeros;
  if (soyNegro()) {
    letrasArr = [...letras].reverse();
    numerosArr = [...numeros].reverse();
  }
  document.getElementById('letras-arriba').innerHTML = letrasArr.map(l => `<span>${l}</span>`).join('');
  document.getElementById('letras-abajo').innerHTML = letrasArr.map(l => `<span>${l}</span>`).join('');
  document.getElementById('numeros-izquierda').innerHTML = numerosArr.map(n => `<span>${n}</span>`).join('');
  document.getElementById('numeros-derecha').innerHTML = numerosArr.map(n => `<span>${n}</span>`).join('');
}

function generarTablero() {
  const tablero = document.getElementById("tablero");
  tablero.innerHTML = '';
  let letrasArr = letras;
  let numerosArr = numeros;
  if (soyNegro()) {
    letrasArr = [...letras].reverse();
    numerosArr = [...numeros].reverse();
  }
  for (let row = 0; row < 8; row++) {
    const tr = document.createElement("tr");
    for (let col = 0; col < 8; col++) {
      const td = document.createElement("td");
      const color = (row + col) % 2 === 0 ? 'white' : 'black';
      td.classList.add('casilla', color);
      td.id = `${letrasArr[col]}${numerosArr[row]}`;
      tr.appendChild(td);
    }
    tablero.appendChild(tr);
  }
}
