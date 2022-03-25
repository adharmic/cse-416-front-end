const ctx = document.getElementById('myChart');
const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

var marksCanvas = document.getElementById("marksChart");

var marksData = {
  labels: ["0%", "20%", "40%", "60%", "80%", "100%"],
  datasets: [{
    label: "Republican",
    backgroundColor: "rgba(200,0,0,0.2)",
    data: [0, 20, 85, 90, 95, 100],
    lineTension: .4
  }, {
    label: "Democrat",
    backgroundColor: "rgba(0,0,200,0.2)",
    data: [0, 5, 10, 20, 80, 100],
    lineTension: .5
  }]
};

var compareData = {
  labels: ["Polsby-Popper", "Num Maj/Min Districts", "Efficiency-Gap", "Competitive Districts", "Projected Fairness", "Compactness"],
  datasets: [{
    label: "Republican",
    backgroundColor: "rgba(200,0,0,0.2)",
    data: [34, 10, 24, 3, 53, 36]
  }, {
    label: "Democrat",
    backgroundColor: "rgba(0,0,200,0.2)",
    data: [65, 5, 31, 4, 75, 26]
  }]
};


var radarChart = new Chart(marksCanvas, {
  type: 'radar',
  data: compareData
});

var popequal = document.getElementById("popequal");

var seatsvotes = new Chart(popequal, {
  type: 'line',
  data: marksData
})


var trace1 = {
  x: [1, 2, 3, 4, 4, 4, 8, 9, 10],
  type: 'box',
  name: 'Enacted Plan'
};

var trace2 = {
  x: [2, 3, 3, 3, 3, 5, 6, 6, 7],
  type: 'box',
  name: 'Set 2'
};

var data = [trace1];

var layout = {
  title: 'Horizontal Box Plot'
};

Plotly.newPlot('boxplot', data, layout);
