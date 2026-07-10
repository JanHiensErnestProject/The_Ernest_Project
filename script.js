let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  { name: "Mathematics", score: 72 },
  { name: "English", score: 65 },
  { name: "Science", score: 88 }
];

let editIndex = null;

function save() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

function calculateAverage() {
  const total = subjects.reduce((sum, s) => sum + s.score, 0);
  return subjects.length ? Math.round(total / subjects.length) : 0;
}

function getAverageColor(avg) {
  if (avg < 60) return "#ff3b30";
  if (avg < 75) return "#ff9500";
  return "#34c759";
}

function render() {
  const container = document.getElementById("subjectsContainer");
  container.innerHTML = "";

  subjects.sort((a, b) => b.score - a.score);

  subjects.forEach((subject, index) => {
    const card = document.createElement("div");
    card.className = "subject-card";

    if (subject.score < 70) {
      card.classList.add("low-score");
    }

    card.innerHTML = `
      <div class="subject-info">
        <h3>${subject.name}</h3>
        <p>${subject.score}%</p>
      </div>
      <div>
        <button onclick="openModal(${index})">Edit</button>
        <button onclick="deleteSubject(${index})">Delete</button>
      </div>
    `;

    container.appendChild(card);
  });

  const avg = calculateAverage();
  const avgColor = getAverageColor(avg);

  const fill = document.getElementById("averageFill");
  fill.style.width = avg + "%";
  fill.style.background = avgColor;

  document.getElementById("averageValue").innerText = avg + "%";
}

function openModal(index = null) {
  editIndex = index;

  const modal = document.getElementById("modal");
  modal.style.display = "flex";

  if (index !== null) {
    document.getElementById("modalTitle").innerText = "Edit Subject";
    document.getElementById("subjectName").value = subjects[index].name;
    document.getElementById("subjectScore").value = subjects[index].score;
  } else {
    document.getElementById("modalTitle").innerText = "Add Subject";
    document.getElementById("subjectName").value = "";
    document.getElementById("subjectScore").value = "";
  }
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function saveSubject() {
  const name = document.getElementById("subjectName").value.trim();
  const score = parseInt(document.getElementById("subjectScore").value);

  if (!name || isNaN(score) || score < 0 || score > 100) return;

  if (editIndex !== null) {
    subjects[editIndex] = { name, score };
  } else {
    subjects.push({ name, score });
  }

  save();
  render();
  closeModal();
}

function deleteSubject(index) {
  subjects.splice(index, 1);
  save();
  render();
}

render();
