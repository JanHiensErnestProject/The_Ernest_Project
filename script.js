let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  { name: "Math", score: 99 },
  { name: "History", score: 93 },
  { name: "Science", score: 88 },
  { name: "Biology", score: 86 }
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

/* ✅ CENTER TEXT INSIDE DOUGHNUT */
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

    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = color;
    ctx.fillText(avg + "%", x, y - 10);

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#999";
    ctx.fillText("Average", x, y + 18);

    ctx.restore();
  }
};

Chart.register(centerTextPlugin);

/* ✅ SMOOTH FADING GRADIENT */
function createGradient(ctx, color1, color2) {
  const gradient = ctx.createRadialGradient(
    200, 200, 40,
    200, 200, 260
  );

  gradient.addColorStop(0, color1);
  gradient.addColorStop(0.5, color1);
  gradient.addColorStop(0.8, color2);
  gradient.addColorStop(1, color2);

  return gradient;
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

  const baseColors = [
    ["#0a84ff", "#64d2ff"],
    ["#34c759", "#30d158"],
    ["#ff9500", "#ffd60a"],
    ["#af52de", "#bf5af2"],
    ["#ff3b30", "#ff453a"],
    ["#5ac8fa", "#70e1ff"]
  ];

  const backgroundColors =
    chartType === "doughnut"
      ? baseColors.map(pair => createGradient(ctx, pair[0], pair[1]))
      : baseColors.map(pair => pair[0]);

  chartInstance = new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors,
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: chartType === "doughnut" ? "65%" : 0,
      animation: {
        duration: 1000,
        easing: "easeOutQuart"
      },
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
      } : {}
    }
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

  document.getElementById("averageFill").style.width = avg + "%";
  document.getElementById("averageFill").style.background = avgColor;
  document.getElementById("averageValue").innerText = avg + "%";

  renderChart();
}

function openModal(index = null) {
  editIndex = index;
  document.getElementById("modal").style.display = "flex";

  if (index !== null) {
    document.getElementById("subjectName").value = subjects[index].name;
    document.getElementById("subjectScore").value = subjects[index].score;
  } else {
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
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

function loadDarkMode() {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }
}

loadDarkMode();
render();
