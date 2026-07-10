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

/* ✅ CENTER TEXT PLUGIN */
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

    ctx.font = "bold 34px sans-serif";
    ctx.fillStyle = color;
    ctx.fillText(avg + "%", x, y - 12);

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#999";
    ctx.fillText("Average", x, y + 18);

    ctx.restore();
  }
};

Chart.register(centerTextPlugin);

/* ✅ SHADE HELPER FOR DARK/LIGHT FADE */
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1,3),16);
  let G = parseInt(color.substring(3,5),16);
  let B = parseInt(color.substring(5,7),16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R<255)?R:255;
  G = (G<255)?G:255;
  B = (B<255)?B:255;

  const RR = ((R.toString(16).length==1)?"0":"")+R.toString(16);
  const GG = ((G.toString(16).length==1)?"0":"")+G.toString(16);
  const BB = ((B.toString(16).length==1)?"0":"")+B.toString(16);

  return "#"+RR+GG+BB;
}

/* ✅ RENDER CHART WITH TRUE RADIAL FADING */
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
    "#0a84ff",
    "#34c759",
    "#ffcc00",
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
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 12,
        backgroundColor: function(context) {

          if (chartType !== "doughnut") {
            return baseColors;
          }

          const chart = context.chart;
          const arc = chart.getDatasetMeta(0).data[context.dataIndex];
          if (!arc) return baseColors[context.dataIndex];

          const { x, y, innerRadius, outerRadius } = arc;
          const base = baseColors[context.dataIndex % baseColors.length];

          const gradient = chart.ctx.createRadialGradient(
            x, y, innerRadius,
            x, y, outerRadius
          );

          // Darker inside
          gradient.addColorStop(0, shadeColor(base, -25));

          // Normal middle
          gradient.addColorStop(0.5, base);

          // Lighter outside
          gradient.addColorStop(1, shadeColor(base, 35));

          return gradient;
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: chartType === "doughnut" ? "65%" : 0,
      rotation: -90,
      animation: {
        animateRotate: true,
        duration: 1400,
        easing: "easeOutExpo"
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

/* ✅ TOGGLE CHART TYPE */
function toggleChartType() {
  currentChartType = currentChartType === "bar" ? "doughnut" : "bar";
  renderChart();
}

/* ✅ RENDER SUBJECT LIST */
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

/* ✅ MODAL CONTROLS */
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

/* ✅ DARK MODE */
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
