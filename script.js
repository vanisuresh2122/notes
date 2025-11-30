// FINAL JS WITHOUT REMINDER FEATURE (corrected)
// -------------------------------------------------------------
// All reminder-related code removed. This file is complete and ready.

let notes = JSON.parse(localStorage.getItem("notesApp")) || [];
let selectedColor = "#fff475";

const container = document.getElementById("notesContainer");
const input = document.getElementById("noteInput");
const titleInput = document.getElementById("noteTitle");
const search = document.getElementById("search");
const darkBtn = document.getElementById("darkToggle");

// Correct element assignments
const addTypedBtn = document.getElementById("addBtn");       // typed add button
const addBtn = document.getElementById("addNoteBtn");        // quick sticky "+"

const colorEls = document.querySelectorAll(".color");

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function saveNotes() {
  localStorage.setItem("notesApp", JSON.stringify(notes));
}

function formatDate(ts) {
  try {
    return ts ? new Date(ts).toLocaleString() : "";
  } catch (e) {
    return "";
  }
}

// Dark mode
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

if (darkBtn) {
  darkBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
  });
}

// Color selection
colorEls.forEach((el) =>
  el.addEventListener("click", () => {
    selectedColor = el.dataset.color;
    colorEls.forEach((c) => (c.style.outline = "none"));
    el.style.outline = "3px solid rgba(0,0,0,0.06)";
  })
);

// Create note (typed)
if (addTypedBtn) {
  addTypedBtn.addEventListener("click", () => {
    if (titleInput.value.trim() === "" && input.value.trim() === "") return;

    const newNote = {
      id: uid(),
      title: titleInput.value.trim(),
      text: input.value.trim(),
      color: selectedColor,
      pinned: false,
      date: Date.now(),
      rotate: `${Math.floor(Math.random() * 7 - 3)}deg`,
    };

    notes.push(newNote);
    saveNotes();
    render();

    titleInput.value = "";
    input.value = "";
  });
}

// Quick sticky note (plus)
if (addBtn) {
  addBtn.addEventListener("click", () => {
    const colors = [
      "#FFF685",
      "#FFD1DC",
      "#B5EAD7",
      "#C7CEEA",
      "#FFDAC1",
      "#fff475",
      "#f28b82",
      "#fbbc04",
      "#ccff90",
      "#aecbfa",
    ];

    const newNote = {
      id: uid(),
      title: "",
      text: "Write something...",
      color: colors[Math.floor(Math.random() * colors.length)],
      pinned: false,
      date: Date.now(),
      rotate: `${Math.floor(Math.random() * 7 - 3)}deg`,
    };

    notes.push(newNote);
    saveNotes();
    render();

    setTimeout(() => {
      const el = container.querySelector(`[data-id="${newNote.id}"]`);
      if (el) {
        const textEl = el.querySelector(".text");
        if (textEl) {
          textEl.focus();
          document.getSelection().selectAllChildren(textEl);
        }
      }
    }, 60);
  });
}

// Create note element
function createNoteElement(note) {
  const div = document.createElement("div");
  div.className = "note";
  div.style.setProperty("--color", note.color || "#fff7a8");
  div.style.setProperty("--rotate", note.rotate || "0deg");
  div.setAttribute("draggable", "true");
  div.dataset.id = note.id;

  const tape = document.createElement("div");
  tape.className = "tape";
  tape.textContent = "Tape";
  div.appendChild(tape);

  const title = document.createElement("h3");
  title.className = "title";
  title.contentEditable = false;
  title.textContent = note.title || "";
  div.appendChild(title);

  const text = document.createElement("p");
  text.className = "text";
  text.contentEditable = false;
  text.setAttribute("tabindex", "0");
  text.textContent = note.text || "";
  div.appendChild(text);

  const meta = document.createElement("div");
  meta.className = "meta";

  const dateP = document.createElement("div");
  dateP.className = "note-date";
  dateP.textContent = formatDate(note.date);

  const rightActions = document.createElement("div");

  const menuBtn = document.createElement("button");
  menuBtn.className = "menu-btn";
  menuBtn.textContent = "⋮";

  const menuBox = document.createElement("div");
  menuBox.className = "menu-box";

  const pinP = document.createElement("p");
  pinP.textContent = note.pinned ? "📌 Unpin" : "📌 Pin";
  pinP.addEventListener("click", () => {
    togglePin(note.id);
    menuBox.style.display = "none";
  });

  const editP = document.createElement("p");
  editP.textContent = "✏️ Edit";
  editP.addEventListener("click", () => {
    toggleEdit(note.id);
    menuBox.style.display = "none";
  });

  const delP = document.createElement("p");
  delP.textContent = "🗑️ Delete";
  delP.addEventListener("click", () => removeNote(note.id));

  menuBox.append(pinP, editP, delP);

  menuBtn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    document.querySelectorAll(".menu-box").forEach((m) => {
      if (m !== menuBox) m.style.display = "none";
    });
    menuBox.style.display = menuBox.style.display === "block" ? "none" : "block";
  });

  rightActions.append(menuBtn, menuBox);
  meta.append(dateP, rightActions);
  div.appendChild(meta);

  // Dragging
  div.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", note.id);
    div.classList.add("dragging");
  });

  div.addEventListener("dragend", () => {
    div.classList.remove("dragging");
    updateOrderFromDOM();
  });

  div.addEventListener("dblclick", () => toggleEdit(note.id, true));

  return div;
}

// Render
function render() {
  container.innerHTML = "";

  const pinned = notes.filter((n) => n.pinned);
  const unpinned = notes.filter((n) => !n.pinned);
  const sorted = [...pinned, ...unpinned];

  sorted.forEach((n) => container.appendChild(createNoteElement(n)));
}

// Edit
function toggleEdit(id, focusText = false) {
  const node = container.querySelector(`[data-id="${id}"]`);
  if (!node) return;

  const title = node.querySelector(".title");
  const text = node.querySelector(".text");
  const isEditing = title.isContentEditable;

  if (!isEditing) {
    title.contentEditable = true;
    text.contentEditable = true;
    title.focus();

    const menuItem = node.querySelector(".menu-box p:nth-child(2)");
    if (menuItem) menuItem.textContent = "✔ Save";
  } else {
    const newTitle = title.innerText.trim();
    const newText = text.innerText.trim();

    notes = notes.map((n) => (n.id === id ? { ...n, title: newTitle, text: newText } : n));
    saveNotes();

    title.contentEditable = false;
    text.contentEditable = false;
  }

  if (focusText && !isEditing) {
    setTimeout(() => text.focus(), 60);
  }
}

// Pin
function togglePin(id) {
  notes = notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n));
  saveNotes();
  render();
}

// Delete
function removeNote(id) {
  // if (!confirm("Delete this note?")) return;
  notes = notes.filter((n) => n.id !== id);
  saveNotes();
  render();
}

// Search
if (search) {
  search.addEventListener("input", () => {
    const key = search.value.trim().toLowerCase();

    document.querySelectorAll(".note").forEach((div) => {
      const text = (div.innerText || "").toLowerCase();
      div.style.display = text.includes(key) ? "flex" : "none";
    });
  });
}

// Dragging Sort
container.addEventListener("dragover", (e) => {
  e.preventDefault();
  const dragging = container.querySelector(".dragging");
  const elements = [...container.querySelectorAll(".note:not(.dragging)")];

  let afterEl = elements.find((el) => {
    const rect = el.getBoundingClientRect();
    return e.clientY < rect.top + rect.height / 2;
  });

  if (afterEl) {
    container.insertBefore(dragging, afterEl);
  } else {
    container.appendChild(dragging);
  }
});

function updateOrderFromDOM() {
  const newOrder = [];

  container.querySelectorAll(".note").forEach((div) => {
    const id = div.dataset.id;
    const found = notes.find((n) => n.id === id);
    if (found) newOrder.push(found);
  });

  notes = newOrder;
  saveNotes();
}

// initial render
render();
