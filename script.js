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

/* ===================== COLOR SHADE ===================== */

function shadeColor(color, percent) {
  let R = parseInt(color.substring(1,3),16);
  let G = parseInt(color.substring(3,5),16);
  let B = parseInt(color.substring(5,7),16);

  R = Math.min(255, Math.max(0, parseInt(R * (100 + percent) / 100)));
  G = Math.min(255, Math.max(0, parseInt(G * (100 + percent) / 100)));
  B = Math.min(255, Math.max(0, parseInt(B * (100 + percent) / 100)));

  return "#" +
    R.toString(16).padStart(2, '0') +
    G.toString(16).padStart(2, '0') +
    B.toString(16).padStart(2, '0');
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
        borderColor: "rgba(220,220,220,0.4)",
        borderWidth: 2,
        hoverOffset: 8,
        backgroundColor: function(context) {

          if (currentChartType !== "doughnut") {
            return baseColors[context.dataIndex % baseColors.length];
          }

          const chart = context.chart;
          const meta = chart.getDatasetMeta(0);
          const arc = meta.data[context.dataIndex];

          if (!arc) {
            return baseColors[context.dataIndex % baseColors.length];
          }

          const { x, y, innerRadius, outerRadius } = arc;
          const base = baseColors[context.dataIndex % baseColors.length];

          const gradient = ctx.createRadialGradient(
            x, y, innerRadius,
            x, y, outerRadius
          );

          gradient.addColorStop(0, shadeColor(base, -25));
          gradient.addColorStop(0.6, base);
          gradient.addColorStop(1, shadeColor(base, 35));

          return gradient;
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: currentChartType === "doughnut" ? "65%" : 0,
      animation: {
        animateRotate: true,
        duration: 1200,
        easing: "easeOutExpo"
      },
      plugins: {
        legend: {
          display: currentChartType === "doughnut"
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

/* ===================== RENDER SUBJECT LIST ===================== */

function render() {

  const container = document.getElementById("subjectsContainer");
  if (!container) return;

  container.innerHTML = "";

  subjects.sort((a, b) => b.score - a.score);

  subjects.forEach((subject, index) => {

    const card = document.createElement("div");
    card.className = "subject-card";

    card.innerHTML = `
      <div class="subject-info">
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
