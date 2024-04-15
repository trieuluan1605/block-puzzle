let statusGame = "";
const mainScreen = document.getElementById("main-screen");
const numberOfRows = 15;
const numberOfColumns = 9;
const defaultBackgroundColor = "rgb(51, 51, 51)";
let speed;
let defaultSpeed = 300;
let score = 0;
let listBoxActive = [];
const boxColor = {
  current: "",
  next: getRandomColor(),
};

init();

function init() {
  for (let row = numberOfRows - 1; row >= 0; row--) {
    for (let column = 0; column < numberOfColumns; column++) {
      const box = newBox(`box-${row}-${column}`);
      mainScreen.appendChild(box);
    }
  }
  window.onkeydown = (e) => {
    if (statusGame !== "playing") return;
    if (e.keyCode == "38") {
      // up arrow
    } else if (e.keyCode == "40") {
      // down arrow
      move("down");
    } else if (e.keyCode == "37") {
      // left arrow
      move("left");
    } else if (e.keyCode == "39") {
      // right arrow
      move("right");
    }
  };
}

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

async function handleAnimation($this) {
  $this.classList.add("active");
  await sleep(300);
  $this.classList.remove("active");
}

async function play($this) {
  if (statusGame == "") {
    speed = defaultSpeed;
    score = 0;
    nextBox();
  }
  await handleAnimation($this);
  document.getElementById("btn-pause").style.display = "block";
  document.getElementById("btn-play").style.display = "none";
  statusGame = "playing";
}

async function pause($this) {
  await handleAnimation($this);
  statusGame = "pause";
  document.getElementById("btn-pause").style.display = "none";
  document.getElementById("btn-play").style.display = "block";
}

function nextBox() {
  const x = Math.floor(numberOfColumns / 2);
  const y = numberOfRows - 1;
  boxColor.current = boxColor.next;
  boxColor.next = getRandomColor(boxColor.current);
  if (!createColorBox(x, y, boxColor.current)) return false;
  listBoxActive.push([x, y]);
  const moveInterval = setInterval(() => {
    if (statusGame == "pause") return;
    if (move("down")) {
      clearInterval(moveInterval);
      listBoxActive = [];
      if (speed < 400) speed += 5;
      if (!nextBox()) handleGameOver();
    }
  }, 500 - speed);
  return true;
}

function checkCompleted() {
  for (let row = 0; row < numberOfRows; row++) {
    for (let column = 0; column < numberOfColumns; column++) {
      if (!checkColorBox(`box-${row}-${column}`)) break;
      if (column == numberOfColumns - 1) {
        // row is full
        removeRow(row);
        row--;
        score++;
        document.getElementById("score").textContent = score;
      }
    }
  }
}

function removeRow(row) {
  for (let targetRow = row; row < numberOfRows; row++) {
    let isEmptyRow = false;
    for (let column = 0; column < numberOfColumns; column++) {
      if (checkColorBox(`box-${row}-${column}`)) {
        moveRow(row + 1, targetRow);
        targetRow++;
        break;
      }
      if (column == numberOfColumns - 1) isEmptyRow = true;
    }
    if (isEmptyRow) break;
  }
}

function moveRow(row, targetRow) {
  for (let column = 0; column < numberOfColumns; column++) {
    const rowId = `box-${row}-${column}`;
    document.getElementById(
      `box-${targetRow}-${column}`
    ).style.backgroundColor =
      document.getElementById(rowId).style.backgroundColor;
    removeRow(rowId);
  }
}

function handleGameOver() {
  statusGame = "";
  alert("Game over!!!");
}

function newBox(id) {
  const box = document.createElement("div");
  box.id = id;
  box.className = "box";
  box.style.backgroundColor = defaultBackgroundColor;
  return box;
}

function createColorBox(x, y, color) {
  const boxId = `box-${y}-${x}`;
  if (checkColorBox(boxId)) return false;
  const box = document.getElementById(boxId);
  box.style.backgroundColor = color;
  box.classList.add("active");
  return true;
}

function move(side) {
  const newListBoxActive = [];
  const move = {
    x: 0,
    y: 0,
  };
  switch (side) {
    case "down":
      move.y = -1;
      break;
    case "left":
      move.x = -1;
      break;
    case "right":
      move.x = 1;
      break;
  }

  const isCollision = collisionCheck(move);
  const isWallCollision = wallCollisionCheck(move);
  if (isCollision) {
    removeActiveListBox();
    checkCompleted();
    return true;
  } else if (!isWallCollision) {
    for (const [x, y] of listBoxActive) {
      const nextBox = document.getElementById(
        `box-${y + move.y}-${x + move.x}`
      );
      removeBox(`box-${y}-${x}`);
      createColorBox(x + move.x, y + move.y, boxColor.current);
      newListBoxActive.push([x + move.x, y + move.y]);
    }
    listBoxActive = newListBoxActive;
  }
  return false;
}

function collisionCheck(move) {
  for (const [x, y] of listBoxActive) {
    const newX = x + move.x;
    const newY = y + move.y;
    const nextBoxId = `box-${newY}-${newX}`;
    if (newY < 0) return true; // Chạm đáy
    if (checkColorBox(nextBoxId)) {
      return true;
    }
  }
  return false;
}

function wallCollisionCheck(move) {
  for (const [x] of listBoxActive) {
    const newX = x + move.x;
    if (newX < 0 || newX >= numberOfColumns) return true; // Chạm 2 bên
  }
  return false;
}

function checkColorBox(id) {
  const box = document.getElementById(id);
  if (!box) return false;
  return box.style.backgroundColor != defaultBackgroundColor;
}

function removeBox(id) {
  const box = document.getElementById(id);
  box.classList.remove("active");
  box.style.backgroundColor = defaultBackgroundColor;
}

function removeActiveListBox() {
  for (const [x, y] of listBoxActive) {
    const box = document.getElementById(`box-${y}-${x}`);
    box.classList.remove("active");
  }
}

function getRandomColor(currentColor = "") {
  let colors = ["#E84A5F", "#FF847C", "#FECEAB", "#99B898", "pink"];
  if (currentColor) {
    colors = colors.filter((color) => color != currentColor);
  }
  return colors[Math.floor(Math.random() * colors.length)];
}
