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

// 🔁 Mostrar solo una sección
function mostrarSeccion(idVisible) {
  const secciones = ["menu", "crearLobbySection", "unirseLobbySection", "lobby"];
  secciones.forEach(id => {
    document.getElementById(id).style.display = (id === idVisible) ? "block" : "none";
  });
}

// 📦 Obtener parámetros de URL
function obtenerParametros() {
  const params = new URLSearchParams(window.location.search);
  return {
    lobby: params.get("lobby"),
    nombre: params.get("nombre")
  };
}

// 🎮 Navegación entre secciones
document.getElementById("btnCrear").addEventListener("click", () => {
  mostrarSeccion("crearLobbySection");
});

document.getElementById("btnUnirse").addEventListener("click", () => {
  mostrarSeccion("unirseLobbySection");
});

document.getElementById("volverDesdeCrear").addEventListener("click", () => {
  mostrarSeccion("menu");
});

document.getElementById("volverDesdeUnirse").addEventListener("click", () => {
  mostrarSeccion("menu");
});

// 🛠️ Crear lobby
document.getElementById("crearLobby").addEventListener("click", () => {
  const nombre = document.getElementById("nombreJugador1").value.trim();
  if (!nombre) {
    alert("Escribe tu nombre.");
    return;
  }

  const lobbyId = Math.floor(1000 + Math.random() * 9000);
  const lobbyRef = ref(database, 'lobbies/' + lobbyId);

  set(lobbyRef, {
    jugador1: nombre,
    jugador2: null
  }).then(() => {
    const url = `${window.location.origin}?lobby=${lobbyId}&nombre=${encodeURIComponent(nombre)}`;
    window.location.href = url;
  }).catch((error) => {
    console.error("Error al crear el lobby:", error);
    alert("No se pudo crear el lobby.");
  });
});

// 👥 Unirse a lobby
document.getElementById("unirseLobby").addEventListener("click", () => {
  const nombre = document.getElementById("nombreJugador2").value.trim();
  const lobbyId = document.getElementById("codigoLobby").value.trim();

  if (!nombre || !lobbyId) {
    alert("Faltan datos para unirse.");
    return;
  }

  const url = `${window.location.origin}?lobby=${lobbyId}&nombre=${encodeURIComponent(nombre)}`;
  window.location.href = url;
});

// 🧪 Cargar lobby en tiempo real
document.addEventListener("DOMContentLoaded", () => {
  const { lobby, nombre } = obtenerParametros();

  if (lobby && !nombre) {
    mostrarSeccion("unirseLobbySection");
    document.getElementById("codigoLobby").value = lobby;
    return;
  }

  if (lobby && nombre) {
    mostrarSeccion("lobby");

    const lobbyRef = ref(database, 'lobbies/' + lobby);

    onValue(lobbyRef, async (snapshot) => {
      if (!snapshot.exists()) {
        alert("Este lobby no existe.");
        window.location.href = "index.html";
        return;
      }

      const data = snapshot.val();
      let jugador1 = data.jugador1;
      let jugador2 = data.jugador2;

      if (!jugador1) {
        await set(lobbyRef, { jugador1: nombre, jugador2: null });
        jugador1 = nombre;
      } else if (!jugador2 && nombre !== jugador1) {
        await set(lobbyRef, { jugador1: jugador1, jugador2: nombre });
        jugador2 = nombre;
      }

      document.getElementById("tituloLobby").textContent = `Lobby #${lobby}`;
      document.getElementById("jugador1Nombre").textContent = jugador1 || 'Esperando...';
      document.getElementById("jugador2Nombre").textContent = jugador2 || 'Esperando...';

      if (jugador1 && jugador2) {
        document.getElementById("estado").textContent = "¡Listo para iniciar!";
        document.getElementById("iniciarPartida").style.display = "inline-block";
      }

      const urlLobby = `${window.location.origin}?lobby=${lobby}&nombre=`;
      document.getElementById("copiarLink").addEventListener("click", () => {
        navigator.clipboard.writeText(urlLobby).then(() => {
          alert("¡Enlace copiado!");
        });
      });

      document.getElementById("iniciarPartida").addEventListener("click", () => {
        window.location.href = `ajedrez.html?lobby=${lobby}&nombre=${encodeURIComponent(nombre)}`;
      });
    });

  } else {
    mostrarSeccion("menu");
  }
});

