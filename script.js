
const addBtn = document.getElementById("addBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");
const notesContainer = document.getElementById("notesContainer");
const notesCount = document.getElementById("notesCount");
const heroNoteCount = document.getElementById("heroNoteCount");
const emptyState = document.getElementById("emptyState");
const emptyTitle = document.getElementById("emptyTitle");
const emptyMessage = document.getElementById("emptyMessage");
const searchInput = document.getElementById("searchInput");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

const STORAGE_KEY = "notesAppBlueBlack";
let notes = [];
let nextId = 1;

// ===== Load Saved Notes =====
function loadNotes() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (Array.isArray(saved)) {
            notes = saved
                .filter(note =>
                    note &&
                    typeof note.text === "string"
                )
                .map(note => ({
                    id: note.id ?? nextId++,
                    text: note.text,
                    updatedAt: Number(note.updatedAt) || Date.now()
                }));
        }
    } catch (error) {
        console.error("Unable to load notes:", error);
        notes = [];
    }

    nextId = Math.max(
        0,
        ...notes.map(note => Number(note.id) || 0)
    ) + 1;

    renderNotes();
}

// ===== Save Notes =====
function saveNotes() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        return true;
    } catch (error) {
        console.error("Unable to save notes:", error);
        alert("Notes could not be saved. Browser storage may be full or unavailable.");
        return false;
    }
}

// ===== Create Note =====
function addNote() {
    const note = {
        id: nextId++,
        text: "",
        updatedAt: Date.now()
    };

    notes.unshift(note);
    saveNotes();
    renderNotes();

    const card = notesContainer.querySelector(
        `[data-id="${note.id}"]`
    );

    card?.querySelector("textarea")?.focus();
}

// ===== Delete Note =====
function deleteNote(id) {
    if (!confirm("Are you sure you want to delete this note?")) {
        return;
    }

    notes = notes.filter(note => note.id !== id);
    saveNotes();
    renderNotes();
}

// ===== Format Date =====
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// ===== Render Notes =====
function renderNotes() {
    const query = searchInput.value.trim().toLowerCase();

    const filteredNotes = notes.filter(note =>
        note.text.toLowerCase().includes(query)
    );

    notesContainer.replaceChildren();

    filteredNotes.forEach(note => {
        const card = document.createElement("article");
        card.className = "note";
        card.dataset.id = note.id;

        const top = document.createElement("div");
        top.className = "note-top";

        const label = document.createElement("span");
        label.className = "note-label";
        label.textContent = "✦ My Note";

        const actions = document.createElement("div");
        actions.className = "note-actions";

        const copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.textContent = "Copy";
        copyBtn.setAttribute("aria-label", "Copy note text");

        copyBtn.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(note.text);
                copyBtn.textContent = "Copied!";

                setTimeout(() => {
                    copyBtn.textContent = "Copy";
                }, 1200);
            } catch {
                alert("Clipboard access is unavailable. Try using localhost or HTTPS.");
            }
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.setAttribute("aria-label", "Delete this note");

        deleteBtn.addEventListener("click", () => {
            deleteNote(note.id);
        });

        actions.append(copyBtn, deleteBtn);
        top.append(label, actions);

        const textarea = document.createElement("textarea");
        textarea.value = note.text;
        textarea.placeholder = "Write your thoughts here...";
        textarea.setAttribute("aria-label", "Note content");

        textarea.addEventListener("input", () => {
            note.text = textarea.value;
            note.updatedAt = Date.now();

            saveNotes();

            date.textContent = `Edited ${formatDate(note.updatedAt)}`;
            characterCount.textContent =
                `${note.text.length} characters`;

            updateCounts();
        });

        const footer = document.createElement("div");
        footer.className = "note-footer";

        const date = document.createElement("span");
        date.textContent = `Edited ${formatDate(note.updatedAt)}`;

        const characterCount = document.createElement("span");
        characterCount.textContent = `${note.text.length} characters`;

        footer.append(date, characterCount);
        card.append(top, textarea, footer);
        notesContainer.appendChild(card);
    });

    updateCounts();

    const hasResults = filteredNotes.length > 0;
    emptyState.style.display = hasResults ? "none" : "block";

    if (!hasResults && query) {
        emptyTitle.textContent = "No matching notes";
        emptyMessage.textContent =
            "Try a different keyword to find your notes.";
        emptyAddBtn.style.display = "none";
    } else {
        emptyTitle.textContent = "Your notebook is waiting!";
        emptyMessage.textContent =
            "Create your first note and bring your ideas to life.";
        emptyAddBtn.style.display = "inline-flex";
    }
}

// ===== Update Counters =====
function updateCounts() {
    const total = notes.length;

    notesCount.textContent =
        `${total} ${total === 1 ? "note" : "notes"} saved`;

    heroNoteCount.textContent = total;
}

// ===== Responsive Navigation =====
menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "✕" : "☰";
});

navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
    });
});

// ===== Events =====
addBtn.addEventListener("click", addNote);
emptyAddBtn.addEventListener("click", addNote);
searchInput.addEventListener("input", renderNotes);

// ===== Footer Year =====
document.getElementById("year").textContent =
    new Date().getFullYear();

// ===== Start Application =====
loadNotes();
