// fillGrid.js

// Configuration du jeu
const GRID_SIZE = 12;
const MINES_COUNT = 12;

// Variables du jeu
let grid = [];
let minesLocations = [];
let timeElapsed = 0;
let timerInterval;
let isGameOver = false;

// Fonction principale pour créer la grille
function createGrid() {
    const container = document.getElementById('grid-container');
    container.innerHTML = ''; // Réinitialise le conteneur

    // Créer la grille HTML
    const gridElement = document.createElement('div');
    gridElement.className = 'grid';
    
    // Initialiser la grille de données
    grid = [];
    
    // Créer chaque cellule
    for (let i = 0; i < GRID_SIZE; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        row.id = "row"+i;
        grid[i] = [];
        gridElement.appendChild(row);
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            // Ajouter les événements
            cell.addEventListener('click', () => handleCellClick(i, j));
            cell.addEventListener('contextmenu', (e) => handleRightClick(e, i, j));
            
            row.appendChild(cell);
            
            // Initialiser la cellule dans notre grille de données
            grid[i][j] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborCount: 0
            };
        }
    }
    
    container.appendChild(gridElement);
    
    // Placer les mines
    placeMines();
    
    // Calculer les nombres de voisins
    calculateNeighbors();
    
    // Mettre à jour l'affichage des mines
    document.getElementById('mines-count').textContent = MINES_COUNT;
    
    // Réinitialiser le timer
    timeElapsed = 0;
    document.getElementById('timer').textContent = timeElapsed;
    clearInterval(timerInterval);
    
    isGameOver = false;
}

// Placer les mines aléatoirement
function placeMines() {
    minesLocations = [];
    let placedMines = 0;
    
    while (placedMines < MINES_COUNT) {
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        
        if (!grid[row][col].isMine) {
            grid[row][col].isMine = true;
            minesLocations.push({ row, col });
            placedMines++;
        }
    }
}

// Calculer le nombre de mines voisines pour chaque cellule
function calculateNeighbors() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (!grid[i][j].isMine) {
                let count = 0;
                // Vérifier les 8 cellules voisines
                for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                        const newRow = i + di;
                        const newCol = j + dj;
                        if (newRow >= 0 && newRow < GRID_SIZE && 
                            newCol >= 0 && newCol < GRID_SIZE && 
                            grid[newRow][newCol].isMine) {
                            count++;
                        }
                    }
                }
                grid[i][j].neighborCount = count;
            }
        }
    }
}

// Gérer le clic sur une cellule
function handleCellClick(row, col) {
    if (isGameOver || grid[row][col].isRevealed || grid[row][col].isFlagged) {
        return;
    }
    
    // Démarrer le timer au premier clic
    if (timeElapsed === 0) {
        startTimer();
    }
    
    revealCell(row, col);
    
    if (grid[row][col].isMine) {
        gameOver(false);
    } else {
        checkWin();
    }
}

// Révéler une cellule
function revealCell(row, col) {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE || 
        grid[row][col].isRevealed || grid[row][col].isFlagged) {
        return;
    }
    
    grid[row][col].isRevealed = true;
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add('revealed');
    
    if (grid[row][col].isMine) {
        cell.textContent = '💣';
        cell.classList.add('mine');
    } else if (grid[row][col].neighborCount > 0) {
        cell.textContent = grid[row][col].neighborCount;
        cell.classList.add(`number-${grid[row][col].neighborCount}`);
    } else {
        // Révéler automatiquement les voisins si pas de mines autour
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                revealCell(row + di, col + dj);
            }
        }
    }
}

// Gérer le clic droit (drapeau)
function handleRightClick(e, row, col) {
    e.preventDefault();
    
    if (isGameOver || grid[row][col].isRevealed) {
        return;
    }
    
    grid[row][col].isFlagged = !grid[row][col].isFlagged;
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    
    if (grid[row][col].isFlagged) {
        cell.textContent = '🚩';
        cell.classList.add('flagged');
    } else {
        cell.textContent = '';
        cell.classList.remove('flagged');
    }
}

// Démarrer le timer
function startTimer() {
    timerInterval = setInterval(() => {
        timeElapsed++;
        document.getElementById('timer').textContent = timeElapsed;
    }, 1000);
}

// Vérifier si le joueur a gagné
function checkWin() {
    let revealedCount = 0;
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j].isRevealed && !grid[i][j].isMine) {
                revealedCount++;
            }
        }
    }
    
    if (revealedCount === GRID_SIZE * GRID_SIZE - MINES_COUNT) {
        gameOver(true);
    }
}

// Terminer le jeu
function gameOver(won) {
    isGameOver = true;
    clearInterval(timerInterval);
    
    // Révéler toutes les mines
    minesLocations.forEach(({ row, col }) => {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell.classList.contains('revealed')) {
            cell.classList.add('revealed');
            cell.textContent = '💣';
            cell.classList.add('mine');
        }
    });
    
    const message = won ? 'Félicitations ! Vous avez gagné !' : 'Game Over ! Vous avez perdu !';
    alert(message);
}

// Ajouter un bouton pour recommencer
function addRestartButton() {
    const statusArea = document.getElementById('status-area');
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Nouvelle partie';
    restartButton.addEventListener('click', createGrid);
    statusArea.appendChild(restartButton);
}

// Initialiser le jeu quand la page est chargée
window.addEventListener('DOMContentLoaded', () => {
    createGrid();
    addRestartButton();
});