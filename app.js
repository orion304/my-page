
const vocabKey = "vocabList";
let list = JSON.parse(localStorage.getItem(vocabKey) || "[]");

function render() {
  const ul = document.getElementById("vocabList");
  ul.innerHTML = "";
  list.forEach(({ word, meaning }) => {
    const li = document.createElement("li");
    li.textContent = `${word} — ${meaning}`;
    ul.appendChild(li);
  });
}

function addWord() {
  const word = document.getElementById("word").value;
  const meaning = document.getElementById("meaning").value;
  if (word && meaning) {
    list.push({ word, meaning });
    localStorage.setItem(vocabKey, JSON.stringify(list));
    render();
  }
}

function exportWords() {
  const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vocab.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importWords() {
  const file = document.getElementById("importFile").files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      list = JSON.parse(e.target.result);
      localStorage.setItem(vocabKey, JSON.stringify(list));
      render();
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

render();
