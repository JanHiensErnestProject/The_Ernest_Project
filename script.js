let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  { name: "Math", score: 99 },
  { name: "History", score: 93 },
  { name: "Science", score: 88 },
  { name: "Biology", score: 86 }
];

let chartInstance = null;
let currentChartType = "doughnut";

/* ===============================
   SAVE + AVERAGE
================================ */

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

/* ===============================
   CENTER TEXT
================================ */

const centerTextPlugin = {
  id: "centerTextPlugin",
  afterDraw(chart) {
    if (chart.config.type !== "doughnut") return;

    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.length) return;

    const x = meta.data[0].x;
    const y = meta.data[0].y;

    const avg = calculateAverage();
    const color = getAverageColor(avg);

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "bold 36px sans-serif";
    ctx.fillStyle = color;
    ctx.fillText(avg + "%", x, y - 12);

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#888";
    ctx.fillText("Average", x, y + 18);

    ctx.restore();
  }
};

Chart.register(centerTextPlugin);

/* ===============================
   SAFE GRADIENT FUNCTION
================================ */

function createRadialFade(ctx, chartArea, baseColor) {

  const centerX = (chartArea.left + chartArea.right) / 2;
  const centerY = (chartArea.top + chartArea.bottom) / 2;

  const outerRadius = Math.min(
    chartArea.right - chartArea.left,
    chartArea.bottom - chartArea.top
  ) / 2;

  const gradient = ctx.createRadialGradient(
    centerX, centerY, outerRadius * 0.4,
    centerX, centerY, outerRadius
  );

  gradient.addColorStop(0, shadeColor(baseColor, -25));
  gradient.addColorStop(0.6, baseColor);
  gradient.addColorStop(1, shadeColor(baseColor, 35));

  return gradient;
}

/* ===============================
   COLOR SHADING
================================ */

function shadeColor(color, percent) {
  let R = parseInt(color.substring(1,3),16);
  let G = parseInt(color.substring(3,5),16);
  let B = parseInt(color.substring(5,7),16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = Math.min(255, Math.max(0, R));
  G = Math.min(255, Math.max(0, G));
  B = Math.min(255, Math.max(0, B));

  return "#" +
    R.toString(16).padStart(2, '0') +
    G.toString(16).padStart(2, '0') +
    B.toString(16).padStart(2, '0');
}

/* ===============================
   RENDER CHART
================================ */

function renderChart() {

  const canvas = document.getElementById("gradesChart");
  const ctx = canvas.getContext("2d");

  const labels = subjects.map(s => s.name);
  const data = subjects.map(s => s.score);

  if (chartInstance) chartInstance.destroy();

  const baseColors = [
    "#0a84ff",
    "#34c759",
    "#ffcc00",
    "#af52de",
    "#ff3b30",
    "#5ac8fa"
  ];

  chartInstance = new Chart(ctx, {
    type: currentChartType,
    data: {
      labels: labels,
      datasets: [{
        data: data,
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 12,
        backgroundColor: function(context) {

          if (currentChartType !== "doughnut") {
            return baseColors;
          }

          const { chart } = context;
          const { ctx, chartArea } = chart;

          if (!chartArea) return baseColors[context.dataIndex];

          return createRadialFade(
            ctx,
            chartArea,
            baseColors[context.dataIndex % baseColors.length]
          );
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      animation: {
        animateRotate: true,
        duration: 1200,
        easing: "easeOutExpo"
      },
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });
}

/* ===============================
   TOGGLE
================================ */

function toggleChartType() {
  currentChartType =
    currentChartType === "doughnut" ? "bar" : "doughnut";
  renderChart();
}

/* ===============================
   RENDER PAGE
================================ */

function render() {

  const container = document.getElementById("subjectsContainer");
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

  document.getElementById("averageFill").style.width = avg + "%";
  document.getElementById("averageFill").style.background = avgColor;
  document.getElementById("averageValue").innerText = avg + "%";

  renderChart();
}

function deleteSubject(index) {
  subjects.splice(index, 1);
  save();
  render();
}

render();
