document.addEventListener("DOMContentLoaded", function () {

    const ctx = document.getElementById("myChart").getContext("2d");

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Math", "Science", "English", "History", "Coding"],
            datasets: [{
                label: "Performance Score",
                data: [85, 92, 78, 88, 95],
                backgroundColor: [
                    "#4CAF50",
                    "#2196F3",
                    "#FF9800",
                    "#9C27B0",
                    "#F44336"
                ],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

});
