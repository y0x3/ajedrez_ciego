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
