let currentView = "home";
let currentStudentIndex = 0;
let darkMode = JSON.parse(localStorage.getItem("darkMode")) || false;

let students = JSON.parse(localStorage.getItem("students")) || [
  {
    name: "Ernest",
    subjects: [
      { name: "Mathematics", score: 72 },
      { name: "English", score: 65 },
      { name: "Science", score: 88 }
    ],
    averageHistory: [],
    previousAverage: 0,
    goalAverage: 85
  }
];

/* ===============================
   INITIALIZE DATA
================================= */
students.forEach(student => {
  if (!student.averageHistory) student.averageHistory = [];
  if (!student.goalAverage) student.goalAverage = 85;

  if (student.averageHistory.length === 0) {
    const avg =
      student.subjects.length > 0
        ? Math.round(
            student.subjects.reduce((sum, s) => sum + s.score, 0) /
              student.subjects.length
          )
        : 0;

    student.averageHistory.push({
      date: new Date().toLocaleString(),
      value: avg
    });
  }
});

/* ===============================
   UTILITIES
================================= */
function saveAll() {
  localStorage.setItem("students", JSON.stringify(students));
  localStorage.setItem("darkMode", JSON.stringify(darkMode));
}

function getCurrentStudent() {
  return students[currentStudentIndex];
}

function calculateAverage() {
  const subjects = getCurrentStudent().subjects;
  if (subjects.length === 0) return 0;

  return Math.round(
    subjects.reduce((sum, s) => sum + s.score, 0) / subjects.length
  );
}

function getLowestSubject() {
  const subjects = getCurrentStudent().subjects;
  if (subjects.length === 0) return null;

  return subjects.reduce((lowest, current) =>
    current.score < lowest.score ? current : lowest
  );
}

function recordAverageHistory() {
  const student = getCurrentStudent();
  const avg = calculateAverage();

  student.averageHistory.push({
    date: new Date().toLocaleString(),
    value: avg
  });
}

/* ===== TREND PREDICTION ===== */
function predictNextAverage() {
  const history = getCurrentStudent().averageHistory;
  if (history.length < 2) return null;

  const values = history.map(h => h.value);
  const n = values.length;

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const slope =
    (n * sumXY - sumX * sumY) /
    (n * sumXX - sumX * sumX);

  const intercept = (sumY - slope * sumX) / n;
  const prediction = slope * n + intercept;

  return Math.round(prediction);
}

/* ===============================
   EXPORT FUNCTION
================================= */
function exportData() {
  const dataStr = JSON.stringify(students, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "student-performance-data.json";
  a.click();

  URL.revokeObjectURL(url);
}

/* ===============================
   RENDER
================================= */
function render() {
  const student = getCurrentStudent();
  const subjects = student.subjects;
  const avg = calculateAverage();
  const lowest = getLowestSubject();
  const prediction = predictNextAverage();

  document.body.style.background = darkMode ? "#1c1c1e" : "#f5f5f7";
  document.body.style.color = darkMode ? "white" : "black";

  let html = `<div class="app">`;

  html += `
    <div class="header">
      ${student.name}'s Dashboard
      <button onclick="toggleDarkMode()" style="float:right;">
        ${darkMode ? "☀️" : "🌙"}
      </button>
    </div>

    <div class="card">
      ${students
        .map(
          (s, i) => `
        <button onclick="switchStudent(${i})"
          style="margin:5px; ${
            i === currentStudentIndex ? "font-weight:bold;" : ""
          }">
          ${s.name}
        </button>
      `
        )
        .join("")}
      <button onclick="addStudent()">+ Add Student</button>
      <button onclick="exportData()" style="margin-left:10px;">
        📤 Export Data
      </button>
    </div>
  `;

  if (currentView === "home") {
    html += `
      <div class="card" style="background:#007aff; color:white;">
        Average: ${avg}%
      </div>
    `;

    subjects.forEach((s, index) => {
      const isLowest = lowest && s.name === lowest.name;

      html += `
        <div class="card" style="
          ${isLowest ? "border:2px solid #ff3b30;" : ""}
        ">
          <div style="font-weight:600;">
            ${s.name}
            ${
              isLowest
                ? `<span style="color:#ff3b30; font-size:12px;"> ⚠ Needs Attention</span>`
                : ""
            }
          </div>
          <div>${s.score}%</div>
          <button onclick="editSubject(${index})">Edit</button>
          <button onclick="deleteSubject(${index})">Delete</button>
        </div>
      `;
    });

    html += `
      <div class="card" style="text-align:center; cursor:pointer;"
        onclick="addSubject()">
        + Add Subject
      </div>
    `;
  }

  if (currentView === "analytics") {
    let predictionDisplay = "Not enough data";
    if (prediction !== null) {
      const trendUp = prediction > avg;
      predictionDisplay = `
        <strong>${prediction}%</strong>
        <span style="color:${trendUp ? "#34c759" : "#ff3b30"};">
          ${trendUp ? "↑ Improving" : "↓ Declining"}
        </span>
      `;
    }

    html += `
      <div class="card">
        <strong>Performance Summary</strong><br><br>
        Average Score: <strong>${avg}%</strong><br>
        Weakest Subject: <strong>${lowest ? lowest.name : "N/A"}</strong><br>
        Predicted Next Average: ${predictionDisplay}
      </div>

      <div class="card">
        <canvas id="analyticsChart"></canvas>
      </div>

      <div class="card">
        <canvas id="historyChart"></canvas>
      </div>
    `;
  }

  html += `
    <div class="bottom-nav">
      <div onclick="currentView='home'; render()"
        style="${currentView === "home" ? "font-weight:bold;" : ""}">
        Home
      </div>
      <div onclick="currentView='analytics'; render()"
        style="${currentView === "analytics" ? "font-weight:bold;" : ""}">
        Analytics
      </div>
    </div>
  </div>
  `;

  document.getElementById("appRoot").innerHTML = html;

  if (currentView === "analytics") {
    renderBarChart();
    renderHistoryChart();
  }
}

/* ===============================
   CHARTS
================================= */
function renderBarChart() {
  const ctx = document.getElementById("analyticsChart");
  const subjects = getCurrentStudent().subjects;
  const lowest = getLowestSubject();

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: subjects.map(s => s.name),
      datasets: [
        {
          data: subjects.map(s => s.score),
          backgroundColor: subjects.map(s =>
            lowest && s.name === lowest.name ? "#ff3b30" : "#007aff"
          ),
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      animation: { duration: 800 },
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, max: 100 } }
    }
  });
}

function renderHistoryChart() {
  const ctx = document.getElementById("historyChart");
  const history = getCurrentStudent().averageHistory;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: history.map(h => h.date),
      datasets: [
        {
          label: "Average Over Time",
          data: history.map(h => h.value),
          borderColor: "#34c759",
          backgroundColor: "rgba(52,199,89,0.2)",
          tension: 0.4,
          fill: true,
          pointRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      animation: { duration: 800 },
      scales: { y: { beginAtZero: true, max: 100 } }
    }
  });
}

/* ===============================
   ACTIONS
================================= */
function switchStudent(index) {
  currentStudentIndex = index;
  render();
}

function addStudent() {
  const name = prompt("Student name:");
  if (!name) return;

  students.push({
    name,
    subjects: [],
    averageHistory: [],
    previousAverage: 0,
    goalAverage: 85
  });

  currentStudentIndex = students.length - 1;
  saveAll();
  render();
}

function addSubject() {
  const student = getCurrentStudent();

  const name = prompt("Subject name:");
  const score = parseInt(prompt("Score:"));

  if (!name || isNaN(score)) return;

  student.subjects.push({ name, score });
  recordAverageHistory();
  saveAll();
  render();
}

function editSubject(index) {
  const student = getCurrentStudent();
  const subject = student.subjects[index];

  const newScore = parseInt(prompt("New score:", subject.score));
  if (isNaN(newScore)) return;

  subject.score = newScore;
  recordAverageHistory();
  saveAll();
  render();
}

function deleteSubject(index) {
  const student = getCurrentStudent();

  if (!confirm("Delete subject?")) return;

  student.subjects.splice(index, 1);
  recordAverageHistory();
  saveAll();
  render();
}

function toggleDarkMode() {
  darkMode = !darkMode;
  saveAll();
  render();
}

window.onload = render;