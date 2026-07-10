let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  { name: "Math", score: 99 },
  { name: "History", score: 93 },
  { name: "Science", score: 88 },
  { name: "Biology", score: 86 }
];

let chartInstance = null;

/* ===============================
   CALCULATE TOTAL
================================ */

function calculateTotal() {
  return subjects.reduce((sum, s) => sum + s.score, 0);
}

/* ===============================
   CUSTOM RING PLUGIN
================================ */

const ringPlugin = {
  id: "ringPlugin",
  beforeDraw(chart) {

    if (chart.config.type !== "doughnut") return;

    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.length) return;

    const x = meta.data[0].x;
    const y = meta.data[0].y;
    const innerRadius = meta.data[0].innerRadius;
    const outerRadius = meta.data[0].outerRadius;

    const total = calculateTotal();

    ctx.save();

    /* ==========================
       1️⃣ CONTINUOUS ANGULAR GRADIENT
    =========================== */

    const conic = ctx.createConicGradient(-Math.PI / 2, x, y);

    conic.addColorStop(0.0, "#b00020");
    conic.addColorStop(0.25, "#ff6f00");
    conic.addColorStop(0.5, "#ffd54f");
    conic.addColorStop(0.75, "#8bc34a");
    conic.addColorStop(1.0, "#1b5e20");

    ctx.beginPath();
    ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
    ctx.arc(x, y, innerRadius, Math.PI * 2, 0, true);
    ctx.closePath();

    ctx.fillStyle = conic;
    ctx.fill();

    /* ==========================
       2️⃣ RADIAL DEPTH OVERLAY
    =========================== */

    const radial = ctx.createRadialGradient(
      x, y, innerRadius,
      x, y, outerRadius
    );

    radial.addColorStop(0, "rgba(0,0,0,0.35)");
    radial.addColorStop(0.6, "rgba(0,0,0,0.1)");
    radial.addColorStop(1, "rgba(255,255,255,0.15)");

    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = radial;
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";

    /* ==========================
       3️⃣ SUBJECT SEPARATOR LINES
    =========================== */

    let currentAngle = -Math.PI / 2;

    subjects.forEach(subject => {

      const sliceAngle = (subject.score / total) * (Math.PI * 2);

      ctx.beginPath();
      ctx.moveTo(
        x + innerRadius * Math.cos(currentAngle),
        y + innerRadius * Math.sin(currentAngle)
      );
      ctx.lineTo(
        x + outerRadius * Math.cos(currentAngle),
        y + outerRadius * Math.sin(currentAngle)
      );

      ctx.strokeStyle = "rgba(200,200,200,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      currentAngle += sliceAngle;
    });

    ctx.restore();

    // Disable default dataset drawing
    chart.data.datasets[0].backgroundColor = "transparent";
  }
};

Chart.register(ringPlugin);

/* ===============================
   RENDER CHART
================================ */

function renderChart() {

  const ctx = document.getElementById("gradesChart").getContext("2d");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [{
        data: [100],
        backgroundColor: "transparent",
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      rotation: -90,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

/* ===============================
   CENTER TEXT
================================ */

function drawCenterText() {
  const canvas = document.getElementById("gradesChart");
  const ctx = canvas.getContext("2d");

  const total = calculateTotal();
  const avg = Math.round(total / subjects.length);

  ctx.save();
  ctx.font = "bold 48px sans-serif";
  ctx.fillStyle = "#1b5e20";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(avg + "%", canvas.width / 2, canvas.height / 2);
  ctx.restore();
}

/* ===============================
   INIT
================================ */

function render() {
  renderChart();
  setTimeout(drawCenterText, 100);
}

render();
