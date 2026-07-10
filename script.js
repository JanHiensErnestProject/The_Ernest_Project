document.addEventListener("DOMContentLoaded", function () {

/* ===================== DATA ===================== */

let subjects = JSON.parse(localStorage.getItem("subjects"));

if (!subjects || subjects.length === 0) {
  subjects = [
    { name: "Math", score: 99 },
    { name: "History", score: 93 },
    { name: "Science", score: 88 },
    { name: "Biology", score: 86 }
  ];
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

let chartInstance = null;
let currentChartType = "doughnut";

/* ===================== SAVE ===================== */

function save() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

/* ===================== AVERAGE ===================== */

function calculateAverage() {
  const total = subjects.reduce((sum, s) => sum + s.score, 0);
  return subjects.length ? Math.round(total / subjects.length) : 0;
}

function getAverageColor(avg) {
  if (avg < 60) return "#ff3b30";
  if (avg < 75) return "#ff9500";
  return "#34c759";
}

/* ===================== RENDER CHART ===================== */

function renderChart() {

  const canvas = document.getElementById("gradesChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (chartInstance) chartInstance.destroy();

  const baseColors = [
    "#0a84ff",
    "#34c759",
    "#ff9500",
    "#af52de",
    "#ff3b30",
    "#5ac8fa",
    "#ffd60a"
  ];

  chartInstance = new Chart(ctx, {
    type: currentChartType,
    data: {
      labels: subjects.map(s => s.name),
      datasets: [{
        data: subjects.map(s => s.score),
        backgroundColor: baseColors,
        borderColor: "white",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: currentChartType === "doughnut" ? "65%" : 0,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: currentChartType === "bar" ? {
        y: {
          beginAtZero: true,
          max: 100
        }
      } : {}
    }
  });
}

/* ===================== RENDER SUBJECTS ===================== */

function render() {

  const container = document.getElementById("subjectsContainer");
  if (!container) return;

  container.innerHTML = "";

  subjects.forEach((subject, index) => {

    const card = document.createElement("div");
    card.className = "subject-card";

    card.innerHTML = `
      <div>
        <h3>${subject.name}</h3>
        <p>${subject.score}%</p>
      </div>
      <div>
        <button onclick="deleteSubject(${index})">Delete</button>
      </div>
    `;

    container.appendChild(card);
  });

  const avg = calculateAverage();
  const avgColor = getAverageColor(avg);

  const fill = document.getElementById("averageFill");
  const value = document.getElementById("averageValue");

  if (fill) {
    fill.style.width = avg + "%";
    fill.style.background = avgColor;
  }

  if (value) {
    value.innerText = avg + "%";
  }

  renderChart();
}

/* ===================== DELETE ===================== */

window.deleteSubject = function(index) {
  subjects.splice(index, 1);
  save();
  render();
};

/* ===================== TOGGLE ===================== */

window.toggleChartType = function() {
  currentChartType =
    currentChartType === "doughnut" ? "bar" : "doughnut";
  renderChart();
};

/* ===================== INIT ===================== */

render();

});
