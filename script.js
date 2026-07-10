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

/* ✅ CENTER TEXT */
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
    ctx.fillStyle = "#bbb";
    ctx.fillText("Average", x, y + 18);

    ctx.restore();
  }
};

Chart.register(centerTextPlugin);

function renderChart() {
  const canvas = document.getElementById("gradesChart");
  const ctx = canvas.getContext("2d");

  const labels = subjects.map(s => s.name);
  const data = subjects.map(s => s.score);

  if (chartInstance) {
    chartInstance.destroy();
  }

  const chartType = currentChartType === "bar" ? "bar" : "doughnut";

  // ✅ CLEAN GRADIENT COLORS
  const gradientColors = chartType === "doughnut"
    ? [
        createGradient(ctx, "#0a84ff", "#64d2ff"),
        createGradient(ctx, "#34c759", "#30d158"),
        createGradient(ctx, "#ff9500", "#ffd60a"),
        createGradient(ctx, "#af52de", "#bf5af2"),
        createGradient(ctx, "#ff3b30", "#ff453a"),
        createGradient(ctx, "#5ac8fa", "#70e1ff")
      ]
    : [
        "#0a84ff",
        "#34c759",
        "#ff9500",
        "#af52de",
        "#ff3b30",
        "#5ac8fa"
      ];

  chartInstance = new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: gradientColors,
        borderWidth: 3,
        borderColor: "#ffffff"
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
    }
  });
}

function createGradient(ctx, color1, color2) {
  const gradient = ctx.createLinearGradient(0, 0, 300, 300);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
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
