// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

// Configuración de tu proyecto
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.getElementById('crearLobby').addEventListener('click', () => {
  const nombre = document.getElementById('nombre').value.trim();
  if (!nombre) {
    alert('Pon tu nombre we');
    return;
  }

  const lobbyId = Math.floor(1000 + Math.random() * 9000);
  const lobbyRef = ref(database, 'lobbies/' + lobbyId);

  // Guardar en Firebase
  set(lobbyRef, {
    jugador1: nombre,
    jugador2: null
  });

  // Mostrar en pantalla
  document.getElementById('menu').style.display = 'none';
  document.getElementById('lobby').style.display = 'block';
  document.getElementById('tituloLobby').textContent = `Lobby #${lobbyId}`;
  document.getElementById('jugador1Nombre').textContent = nombre;

  const urlConLobby = `${window.location.origin}?lobby=${lobbyId}&nombre=${encodeURIComponent(nombre)}`;
  document.getElementById('copiarLink').addEventListener('click', () => {
    navigator.clipboard.writeText(urlConLobby);
    alert("Enlace copiado");
  });
});
