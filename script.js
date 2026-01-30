const board = document.getElementById("board");

let notes = JSON.parse(localStorage.getItem("notes")) || [];
let selectedId = null;

function save() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function createNoteElement(note) {
  const div = document.createElement("div");
  div.className = "note";
  div.dataset.id = note.id;

  div.style.left = note.x + "px";
  div.style.top = note.y + "px";
  div.style.width = note.w + "px";
  div.style.height = note.h + "px";
  div.style.background = note.color;

  const header = document.createElement("div");
  header.className = "note-header";
  header.textContent = "Перетягнути";

  const content = document.createElement("div");
  content.className = "note-content";
  content.contentEditable = true;
  content.spellcheck = false;
  content.innerHTML = note.text;

  div.addEventListener("mousedown", e => {
    e.stopPropagation();
    selectNote(note.id);
  });

  content.addEventListener("input", () => {
    note.text = content.innerHTML;
    save();
  });

  let offsetX, offsetY;

  header.addEventListener("mousedown", e => {
    offsetX = e.offsetX;
    offsetY = e.offsetY;

    function move(ev) {
      note.x = ev.pageX - board.offsetLeft - offsetX;
      note.y = ev.pageY - board.offsetTop - offsetY;
      div.style.left = note.x + "px";
      div.style.top = note.y + "px";
    }

    function up() {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      save();
    }

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  });

  const ro = new ResizeObserver(() => {
    note.w = div.offsetWidth;
    note.h = div.offsetHeight;
    save();
  });
  ro.observe(div);

  div.appendChild(header);
  div.appendChild(content);
  return div;
}

function renderAll() {
  board.innerHTML = "";
  notes.forEach(note => {
    board.appendChild(createNoteElement(note));
  });
  updateSelection();
}

function selectNote(id) {
  selectedId = id;
  updateSelection();
}

function updateSelection() {
  document.querySelectorAll(".note").forEach(n => {
    n.classList.toggle("selected", n.dataset.id == selectedId);
  });
}

function addNote() {
  const note = {
    id: crypto.randomUUID(),
    text: "Нова картка",
    x: 100,
    y: 100,
    w: 180,
    h: 120,
    color: "#e3f2fd"
  };
  notes.push(note);
  save();
  board.appendChild(createNoteElement(note));
  selectNote(note.id);
}

function deleteSelected() {
  if (!selectedId) return;
  notes = notes.filter(n => n.id !== selectedId);
  document.querySelector(`.note[data-id="${selectedId}"]`)?.remove();
  selectedId = null;
  save();
}

function setColor(color) {
  if (!selectedId) return;
  const note = notes.find(n => n.id === selectedId);
  note.color = color;
  document.querySelector(`.note[data-id="${selectedId}"]`).style.background = color;
  save();
}

board.addEventListener("mousedown", () => {
  selectedId = null;
  updateSelection();
});

renderAll();
