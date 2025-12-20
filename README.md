# Connect Four

## Project Overview
This project is a web-based implementation of the classic **Connect Four** game.  
It was developed as a mini project using **React**, **TypeScript**, and **Vite**, with a focus on clean state management, persistence, and responsive design.

The game is fully playable in the browser and deployed via **GitHub Pages**.

---

## Team
- [Maxim Zelensky](https://github.com/MaxZell)

---

## Features

### Core Gameplay
- Two-player Connect Four game (Red vs. Blue)
- Turn-based gameplay
- **Player vs Player (PvP) and Player vs AI (PvE) modes**
- Automatic detection of:
    - Horizontal wins
    - Vertical wins
    - Diagonal wins
    - Draw situations

### AI (Player vs Computer)
- Optional **PvE mode** with a computer-controlled opponent
- AI implemented using a **heuristic, rule-based strategy**
- Decision process:
  1. Play a winning move if available
  2. Block the opponent’s immediate winning move
  3. Prefer central columns for better board control
- AI moves are executed with a short delay for natural gameplay
- The AI follows the same game rules and validations as human players

### State Management
- Game state is managed using a custom `useHistoryState` hook
- Full **undo functionality** (multiple undo steps)
- Game state is **persisted in localStorage**
    - Reloading the page restores the last game

### Controls
- **Undo**: Reverts the last move
- **Reset**: Starts a new game (in-memory reset)
- **Clear Save**: Deletes the persisted game state from localStorage
- **Mode Selection**:
  - **PvP**: Two human players on the same device
  - **PvE**: Human player versus AI opponent

### Visual & UX Features
- Fully responsive design (desktop and mobile)
- Board always fits within the viewport (no scrolling)
- Clear visual distinction between players
- Highlight of the last move
- Confetti animation when a player wins

---

## Technical Details

- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **State Persistence**: Browser `localStorage`
- **Styling**: CSS
- **Deployment**: GitHub Pages (via GitHub Actions)
- **AI Logic**:
  - Heuristic, rule-based decision-making
  - No recursive search or minimax algorithm used
  - Constant-time evaluation per move

Game logic (win detection, move handling) is implemented efficiently by checking only the last placed disc, ensuring constant-time performance per move.

---

## Game
Game can be played [here](xhttps://maxzell.github.io/connect-four-game/).

---

## Screenshots
### Desktop View
![Desktop – Gameplay](./src/assets/docu/screenshots/screenshot-desktop.png)

### Mobile View
![Mobile – Gameplay](./src/assets/docu/screenshots/screenshot-mobile.png)

### Win States
**Red Player Wins**  
![Red Wins](./src/assets/docu/screenshots/screenshot-red-wins.png)

**Blue Player Wins**  
![Blue Wins](./src/assets/docu/screenshots/screenshot-blue-wins.png)

**Draw**  
![Draw](./src/assets/docu/screenshots/screenshot-draw.png)