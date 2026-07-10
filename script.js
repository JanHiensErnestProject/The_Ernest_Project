let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  { name: "Mathematics", score: 72 },
  { name: "English", score: 65 },
  { name: "Science", score: 88 }
];

let editIndex = null;
let chartInstance = null;
let currentChartType = "bar";

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

/* ✅ CENTER TEXT PLUGIN */
const centerTextPlugin = {
  id: "centerTextPlugin",
  afterDraw(chart) {
    if (chart.config.type !== "doughnut") return;

    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    if (!meta || !meta.data || !meta.data[0]) return;

    const x = meta.data[0].x;
    const y = meta.data[0].y;

    const avg = calculateAverage();
    const color = getAverageColor(avg);

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = color;
    ctx.fillText(avg + "%", x, y - 10);

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#aaa";
    ctx.fillText("Average", x, y + 18);

    ctx.restore();
  }
};

Chart.register(centerTextPlugin);

/* ✅ GRADIENT + GLOW CREATOR */
function createGradients(ctx, chartArea) {
  const colors = [
    ["#0a84ff", "#5ac8fa"],
    ["#34c759", "#30d158"],
    ["#ff9500", "#ffcc00"],
    ["#af52de", "#bf5af2"],
    ["#ff3b30", "#ff453a"],
    ["#5ac8fa", "#64d2ff"]
  ];

  return colors.map(pair => {
    const gradient = ctx.createLinearGradient(
      chartArea.left,
      chartArea.top,
      chartArea.right,
      chartArea.bottom
    );
    gradient.addColorStop(0, pair[0]);
    gradient.addColorStop(1, pair[1]);
    return gradient;
  });
}

function renderChart() {
  const canvas = document.getElementById("gradesChart");
  const ctx = canvas.getContext("2d");

  const labels = subjects.map(s => s.name);
  const data = subjects.map(s => s.score);

  if (chartInstance) {
    chartInstance.destroy();
  }

  const chartType = currentChartType === "bar" ? "bar" : "doughnut";

  chartInstance = new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: [{
        data: data,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: chartType === "doughnut" ? "65%" : 0,
      plugins: {
        legend: {
          display: chartType === "doughnut"
        }
      },
      scales: chartType === "bar" ? {
        y: {
          beginAtZero: true,
          max: 100
        }
      } : {},
      animation: {
        duration: 800
      }
    },
    plugins: [{
      id: "customGradient",
      beforeDatasetsDraw(chart) {
        if (chart.config.type !== "doughnut") return;

        const { ctx, chartArea } = chart;
        if (!chartArea) return;

        const gradients = createGradients(ctx, chartArea);
        chart.data.datasets[0].backgroundColor = gradients;

        // Glow effect
        ctx.save();
        ctx.shadowBlur = 25;
        ctx.shadowColor = "rgba(10,132,255,0.5)";
        ctx.restore();
      }
    }]
  });
}

function toggleChartType() {
  currentChartType = currentChartType === "bar" ? "doughnut" : "bar";
  renderChart();
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

  renderChart();
}

function openModal(index = null) {
  editIndex = index;
  document.getElementById("modal").style.display = "flex";

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

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", isDark);
}

function loadDarkMode() {
  const saved = localStorage.getItem("darkMode");
  if (saved === "true") {
    document.body.classList.add("dark");
  }
}

loadDarkMode();
render();
