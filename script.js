let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  { name: "Mathematics", score: 72 },
  { name: "English", score: 65 },
  { name: "Science", score: 88 }
];

function save() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

function calculateAverage() {
  const total = subjects.reduce((sum, s) => sum + s.score, 0);
  return subjects.length ? Math.round(total / subjects.length) : 0;
}

function render() {
  const container = document.getElementById("subjectsContainer");
  container.innerHTML = "";

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
        <button onclick="editSubject(${index})">Edit</button>
        <button onclick="deleteSubject(${index})">Delete</button>
      </div>
    `;

    container.appendChild(card);
  });

  const avg = calculateAverage();
  document.getElementById("averageValue").innerText = avg + "%";
  document.getElementById("averageFill").style.width = avg + "%";
}

function addSubject() {
  const name = prompt("Subject name:");
  const score = parseInt(prompt("Score:"));

  if (!name || isNaN(score)) return;

  subjects.push({ name, score });
  save();
  render();
}

function editSubject(index) {
  const newScore = parseInt(prompt("New score:", subjects[index].score));
  if (isNaN(newScore)) return;

  subjects[index].score = newScore;
  save();
  render();
}

function deleteSubject(index) {
  subjects.splice(index, 1);
  save();
  render();
}

render();
