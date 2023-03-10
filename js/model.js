export let state = {
  savedNotes: [],
  userTags: ["Personal", "Work", "Important"],
  currentPreview: [],
  currentPreviewTitle: "All Notes",
  themes: "light",
  fonts: [],
  welcomeScreen: true,
};

let timeSpent;

export const updateState = function (newState) {
  state = _.cloneDeep(newState);
};

const getDate = function () {
  return new Date().toString().slice(4, 15);
};

const createID = function () {
  return Date.now().toString().slice(5);
};

export const initNoteValues = function () {
  const newNote = {
    date: getDate(),
    id: createID(),
    tags: [],
    bookmarked: false,
    saved: false,
    title: "Untitled note",
  };
  return newNote;
};

export const getGraphData = function () {
  return {
    labels: ["Notes", "Tags", "Hours Spent", "Minutes"],

    datasets: [
      {
        label: "Total Used",
        data: [
          state.savedNotes.length,
          state.userTags.length,
          Math.floor(timeSpent / 3600),
          Math.trunc(Math.floor(timeSpent % 3600) / 60),
        ],
        backgroundColor: ["#ff6384", "#36a2eb", "#4b0082", "#32cd32"],
      },
    ],
  };
};
// Create the data for the graph

// LOCAL STORAGE /////////////////////////////////////////
/**
 * This function saves data to Local Storage
 * @param {Object | Object[]} data Pass in the state object to be saved for the user (e.g. bookmarks, tags, etc.)
 * @author Ryan Iguchi
 * @
 */
export const setLocalStorage = function (data) {
  data.savedNotes.forEach((note, i) => {
    if (!note.delta && i !== 0) data.savedNotes.splice(i, 1);
  });
  localStorage.setItem("state", JSON.stringify(state));
};

/**
 * This function gets a deep clone of the saved object in Local Storage
 * @returns {Object | Object[]} The users saved settings (e.g. bookmarks, tags, etc.)
 * @author Ryan Iguchi
 */
const getLocalStorage = function () {
  return _.cloneDeep(JSON.parse(localStorage.getItem("state")));
};

export const getPreview = function (note) {
  let text = "";
  note.delta?.ops.forEach((obj) => (text += obj.insert));
  return text;
};

export const getNoteIndexByID = function (id) {
  return state.savedNotes.findIndex((note) => note.id === id);
};

const createTitle = function (note) {
  return note.delta.ops[0].insert.slice(0, -2).slice(0, 20);
};

export const setPreviewSectionState = function (size) {
  if (size > 600) state.previewSectionOpen = true;
  if (size <= 600) state.previewSectionOpen = false;
};

export const saveNote = function (contents, title) {
  if (!state.savedNotes[0]) {
    state.savedNotes[0] = initNoteValues();
  }
  const note = state.savedNotes[0];
  note.delta = _.cloneDeep(contents);
  // if there isn't any content yet, then doesn't save
  if (note.delta.ops[0].insert === "\n") return;

  if (title === "") note.title = createTitle(note);

  if (title !== "") note.title = title;

  note.preview = getPreview(note);
  // renderPreview(state.currentPreview, state.currentPreviewTitle);
  setLocalStorage(state);
};

export const togglePreviewSectionOpenState = function () {
  state.previewSectionOpen = !state.previewSectionOpen;
};

export const addNewNoteToState = function () {
  state.savedNotes.unshift(initNoteValues());
};

export const toggleBookmarkState = function (id) {
  const note = state.savedNotes[getNoteIndexByID(id)];
  note.bookmarked = note.bookmarked ? false : true;
};

export const deleteNoteFromState = function (id) {
  const index = getNoteIndexByID(id);
  state.savedNotes.splice(index, 1);
  setLocalStorage(state);
};

export const toggleTagToNote = function (tag) {
  const tags = state.savedNotes[0].tags;
  tags.includes(tag)
    ? tags.splice(
        tags.findIndex((t) => t === tag),
        1
      )
    : tags.push(tag);
};

export const moveNoteToFront = function (index, note) {
  state.savedNotes.splice(index, 1);
  state.savedNotes.unshift(note);
};

export const toggleStateWelcomeScreen = function () {
  state.welcomeScreen = false;
};

export const setCurrentPreviewToState = function (notesArr, title) {
  state.currentPreview = notesArr;
  state.currentPreviewTitle = title;
};

export const toggleNoteBookmarkInState = function (note) {
  note.bookmarked = !note.bookmarked;
};

export const addCustomTagToState = function (tag) {
  state.userTags.push(tag);
};

export const addCustomFontToState = function (font) {
  state.fonts.push(font);
};

const checkTime = function () {
  timeSpent++;
  localStorage.setItem("timeSpent", timeSpent);
};

const init = function () {
  const savedState = getLocalStorage();
  if (savedState) {
    state = getLocalStorage();
    state.currentPreview = state.savedNotes;
    state.currentPreviewTitle = "All Notes";
  }
  // timer
  if (localStorage.getItem("timeSpent")) {
    timeSpent = localStorage.getItem("timeSpent");
  }
  setInterval(checkTime, 1000);
};

init();
