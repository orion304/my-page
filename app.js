const vocabKey = "chineseVocabList";
let list = JSON.parse(localStorage.getItem(vocabKey) || "[]");

function render() {
  const ul = document.getElementById("vocabList");
  ul.innerHTML = "";
  list.forEach(entry => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${entry.hanzi}</strong><br>
      <em>Pinyin:</em> ${entry.pinyin}<br>
      <em>Zhuyin:</em> ${entry.zhuyin}<br>
      <em>IPA:</em> ${entry.ipa}<br>
      <em>English:</em> ${entry.english}
    `;
    ul.appendChild(li);
  });
}

function addWord() {
  const hanzi = document.getElementById("hanzi").value;
  const pinyin = document.getElementById("pinyin").value;
  const zhuyin = document.getElementById("zhuyin").value;
  const ipa = document.getElementById("ipa").value;
  const english = document.getElementById("english").value;

  if (!hanzi || !pinyin || !english) {
    alert("Hanzi, Pinyin, and English are required.");
    return;
  }

  list.push({ hanzi, pinyin, zhuyin, ipa, english });
  localStorage.setItem(vocabKey, JSON.stringify(list));
  render();
}

function exportWords() {
  const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "chinese-vocab.json";
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
