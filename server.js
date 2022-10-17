// Handles all calls to and from the server, as well as storing current data from server in web memory


var district_data;
var current_state;
var available_plans;
var selected_plan;
var plan_offset;
var offset;
var state_shapes = [];
var plan_stats;

const plan_base = document.getElementById("default-plan").cloneNode(true);
const address = "https://continual-math-365420.ue.r.appspot.com/";
//const address = "http://localhost:8080/";

function upper(sentence) {
  return sentence.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
}

function getState(state_code) {
  current_state = "";
  available_plans = [];
  selected_plan = null;
  $.get(address + "state/" + state_code, function (data) {
    $(".result").html(data);
    $(function () {
      current_state = state_code;
      console.log(data);

      // Populates summary table with state data
      data.districtPlanMetricsList.forEach(element => {
        element.name = upper(element.name.replaceAll("_", " "));
        available_plans.push([element.id, element.name]);
      });
      available_plans.sort((a, b) => (a[1] > b[1]) ? 1 : ((b[1] > a[1]) ? -1 : 0));
      displayPlanOptions();

      district_plan_data = []
      for (const plan_metrics of data.districtPlanMetricsList) {
        console.log(plan_metrics);
        plan_metrics.compactness = parseFloat(plan_metrics.compactness).toFixed(2)
        plan_metrics.meanPopulationDeviation = parseFloat(plan_metrics.meanPopulationDeviation).toFixed(2)
        district_plan_data.push(plan_metrics)
      }
      console.log(district_plan_data)
      $('#table').bootstrapTable({
        data: district_plan_data
      });
    });
  });
}

function queryPlan(id) {
  selected_plan = id;
  $.get(address + 'district/population-metrics/' + current_state + '/' + available_plans[id][0], function (data) {
    plan_stats = data;
  });
  $.get(address + 'district/geojson/' + current_state + '/' + available_plans[id][0], function (data) {
    console.log("PLAN:")
    console.log(data);
    for (let i = 0; i < data.features.length; i++) {
      democrat = plan_stats[i]["DEMOCRAT"];
      republican = plan_stats[i]["REPUBLICAN"];
      total = democrat + republican;
      lean = 100 * ((republican / total) - (democrat / total));
      data.features[i].properties.lean = lean;
      data.features[i].properties.pop = plan_stats[i]["TOTAL_POPULATION"];
      data.features[i].properties.rep = plan_stats[i]["REPUBLICAN"];
      data.features[i].properties.dem = plan_stats[i]["DEMOCRAT"];
      data.features[i].properties.af = plan_stats[i]["AFRICAN_AMERICAN"];
      data.features[i].properties.nat = plan_stats[i]["AMERICAN_INDIAN"];
      data.features[i].properties.asian = plan_stats[i]["ASIAN"]; 
      data.features[i].properties.pacific = plan_stats[i]["PACIFIC_ISLANDER"];
      data.features[i].properties.white = plan_stats[i]["WHITE"];
      data.features[i].properties.his = plan_stats[i]["HISPANIC_LATINO"];
    }
    showDistrict(data);
  });
}

function querySeatShare() {
  var sv_display = document.getElementById('sv-chart');
  var loader = document.getElementById('load-sv');
  // displayLoading(loader);

  $.get(address + 'district/seat-share/' + current_state + '/' + available_plans[selected_plan][0], function (data) {
    // hideLoading(loader);

    var x_coordinates_dem = [];
    var y_coordinates_dem = [];
    console.log(data);
    for (const [key, value] of Object.entries(data.districtPlan.democratData)) {
      x_coordinates_dem.push(value.x);
      y_coordinates_dem.push(value.y);
    }


    var x_coordinates_rep = [];
    var y_coordinates_rep = [];
    for (const [key, value] of Object.entries(data.districtPlan.republicanData)) {
      x_coordinates_rep.push(value.x);
      y_coordinates_rep.push(value.y);
    }

    var x_seawulf_dem = [];
    var y_seawulf_dem = [];
    for (const [key, value] of Object.entries(data.seawulfData.democratData)) {
      x_seawulf_dem.push(value.x);
      y_seawulf_dem.push(value.y);
    }

    var x_seawulf_rep = [];
    var y_seawulf_rep = [];
    for (const [key, value] of Object.entries(data.seawulfData.republicanData)) {
      x_seawulf_rep.push(value.x);
      y_seawulf_rep.push(value.y);
    }

    var trace_dem = {
      x: x_coordinates_dem,
      y: y_coordinates_dem,
      mode: 'lines',
      name: 'Democrat Seat Share',
      line: {
        color: 'rgb(55, 128, 191)',
        width: 1
      }
    };

    var trace_rep = {
      x: x_coordinates_rep,
      y: y_coordinates_rep,
      mode: 'lines',
      name: 'Republican Seat Share',
      line: {
        color: 'rgb(219, 64, 82)',
        width: 1
      }
    };

    var seawulf_dem = {
      x: x_seawulf_dem,
      y: y_seawulf_dem,
      mode: 'markers',
      name: 'SeaWulf Democratic',
      marker: {
        color: 'rgb(55, 128, 191)',
        size: 2,
        opacity: .8
      }
    };

    var seawulf_rep = {
      x: x_seawulf_rep,
      y: y_seawulf_rep,
      mode: 'markers',
      name: 'SeaWulf Republican',
      marker: {
        color: 'rgb(219, 64, 82)',
        size: 2,
        opacity: .8
      }
    };

    var layout = {
      width: 600,
      height: 400,
      xaxis: {
        range: [.2, .8],
        title: {
          text: 'Percentage of Vote',
          font: {
            family: 'Montserrat'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Percentage of Seats',
          font: {
            family: 'Montserrat'
          }
        }
      }
    };

    var plotly_data = [trace_dem, trace_rep, seawulf_dem, seawulf_rep];

    Plotly.newPlot('sv-chart', plotly_data, layout);

    document.getElementById('sv-responsiveness').innerHTML = "Responsiveness: " + data.districtPlan.responsiveness;
    document.getElementById('sv-baf').innerHTML = "Bias at 50%: " + data.districtPlan.biasAt50;
    document.getElementById('sv-symmetry').innerHTML = "Symmetry: " + data.districtPlan.symmetry;
    document.getElementById('sv-header').innerHTML = "Seats-Votes Curve for " + available_plans[selected_plan][1];
  });
}

function queryBoxWhisker(demographic, name) {
  var loader = document.getElementById('load-boxplot');

  $.get(address + 'district/box-whisker/' + current_state + '/' + available_plans[selected_plan][0], function (data) {
    var seawulf_plots = data.boxAndWhiskerData[demographic];
    var district_plots = data.districtData[demographic];
    console.log(data);

    var final = [];
    const reducer = (accumulator, curr) => accumulator + curr;
    district_plots.forEach(element => {
      const sum = district_plots.reduce(reducer);
      final.push((element / sum));
    });
    var data = [];
    for (var i = 0; i < seawulf_plots.length; i++) {
      var result = {
        type: 'box',
        y: Object.values(seawulf_plots[i]),
        name: "ID " + i,
        boxpoints: 'all',
        jitter: 0.5,
        whiskerwidth: 0.2,
        fillcolor: 'cls',
        marker: {
          size: 2
        },
        line: {
          width: 1
        }
      };
      data.push(result);
    }
    for (var i = 0; i < seawulf_plots.length; i++) {
      data.push({
        x: ["ID " + i],
        y: [final[i]],
        name: available_plans[selected_plan][1],
        marker: {
          size: 10
        }
      })

    }

    layout = {
      plot_bgcolor: "#EEEEEE",
      paper_bgcolor: "#EEEEEE",
      width: 800,
      height: 400,
      title: name + ' Box and Whisker Data vs. Approved',
      showlegend: false,
      yaxis: {
        autorange: true,
        showgrid: true,
        zeroline: true,
        dtick: 5,
        gridcolor: 'rgb(255, 255, 255)',
        gridwidth: 1,
        zerolinecolor: 'rgb(255, 255, 255)',
        zerolinewidth: 2
      },
      margin: {
        l: 40,
        r: 30,
        b: 80,
        t: 100
      }
    };

    Plotly.newPlot('boxplot-chart', data, layout);
  });

}

function displayPlanOptions() {
  var plan_names = available_plans;
  plan_list = document.getElementById("picker");
  first_plan = document.getElementById("default-plan");

  first_plan.firstChild.nextSibling.innerHTML = plan_names[0][1];

  for (let index = 1; index < 4; index++) {
    new_plan = first_plan.cloneNode(true);
    new_plan.id = "";
    new_plan.onclick = function () { loadPlan(index) };
    new_plan.firstChild.nextSibling.innerHTML = plan_names[index][1];
    plan_list.appendChild(new_plan);
  }
  document.getElementById("default-plan").click();
}

function queryComparePlans(id) {
  $.get(address + 'district/compare/' + current_state + '/' + available_plans[selected_plan][0] + "/" + available_plans[id][0], function (data) {
    factor = 10;
    while (data.meanPopulationDeviation1 / factor > 1) {
      factor *= 10;
    }
    var plan1 = [data.compactness1, data.efficiencyGap1, data.meanPopulationDeviation1 / factor, data.numCombinedMajorityMinorityDistricts1 / available_plans.length, data.numIncumbentSafeDistricts1 / available_plans.length];
    var plan2 = [data.compactness2, data.efficiencyGap2, data.meanPopulationDeviation2 / factor, data.numCombinedMajorityMinorityDistricts2 / available_plans.length, data.numIncumbentSafeDistricts2 / available_plans.length];
    var axes = ["Compactness", "Eff. Gap", "Mean Pop. Dev.", "Combined Maj-Min Districts", "Incumbent Safe Districts"];

    data = [
      {
        type: "scatterpolar",
        r: plan1,
        theta: axes,
        fill: 'toself',
        name: available_plans[selected_plan][1]
      },
      {
        type: "scatterpolar",
        r: plan2,
        theta: axes,
        fill: 'toself',
        name: available_plans[id][1]
      }
    ]
    layout = {
      title: 'Comparison of ' + available_plans[selected_plan][1] + " vs. " + available_plans[id][1],
      width: 600,
      height: 400,
      polar: {
        radialaxis: {
          visible: true,
          range: [0, 1]
        }
      }
    }
    Plotly.newPlot("compare-chart", data, layout);

  });
}

function queryStateShapes() {
  $.get(address + 'state/geojson/all', function (data) {
    state_shapes = data;
    loadStates();
  });
}

function querySeaWulfStats(metric, demographic = null) {
  $.get(address + 'state/seawulf/' + current_state, function (data) {
    demodrop = document.getElementById("demo-seawulf");
    switch (metric) {
      case "republicanDemocratSplit":
        demodrop.style.display = "none";
        xaxis = [];
        yaxis = [];
        data[metric].forEach(element => {
          xaxis.push(element.republicanSeats + "-" + element.democratSeats);
          yaxis.push(element.count);
        });
        console.log("Xaxis")
        console.log(xaxis);
        console.log("Yaxis")
        console.log(yaxis);

        var chart = [
          {
            x: xaxis,
            y: yaxis,
            type: 'bar',
            marker: {
              color: '#007bff'
            }
          }
        ];

        var layout = {
          width: 600,
          height: 400,
          title: 'SeaWulf R-D Split',
          showlegend: false,
          xaxis: {
            title: 'Republican-Democrat Seats',
            type: 'category'
          },
        };

        Plotly.newPlot('seawulf-chart', chart, layout);
        break;
      case "combinedMajorityMinorityMap":
        demodrop.style.display = "none";
        xaxis = [];
        yaxis = [];
        data[metric].forEach(element => {
          console.log(element);
          xaxis.push(element.numCombinedMajorityMinorityDistricts);
          yaxis.push(element.count);
        });
        var chart = [
          {
            x: xaxis,
            y: yaxis,
            type: 'bar',
            marker: {
              color: '#007bff'
            }
          }
        ];

        var layout = {
          bargap: 0.0,
          width: 600,
          height: 400,
          title: 'SeaWulf Combined Majority-Minority Statistics',
          showlegend: false,
        };

        Plotly.newPlot('seawulf-chart', chart, layout);
        break;
      case "compactnessData":
        demodrop.style.display = "none";
        xaxis = [];
        yaxis = [];
        data[metric].forEach(element => {
          xaxis.push(element.rangeMinimum + "-" + element.rangeMaximum);
          yaxis.push(element.count);
        });
        var chart = [
          {
            x: xaxis,
            y: yaxis,
            type: 'bar',
            marker: {
              color: '#007bff'
            }
          }
        ];

        var layout = {
          width: 600,
          height: 400,
          title: 'SeaWulf Compactness Stats',
          showlegend: false,
          xaxis: {
            title: ''
          },
          bargap: 0.0
        };

        Plotly.newPlot('seawulf-chart', chart, layout);
        break;
      case "efficiencyGapData":
        demodrop.style.display = "none";
        xaxis = [];
        yaxis = [];
        data[metric].forEach(element => {
          xaxis.push(element.rangeMinimum + "-" + element.rangeMaximum);
          yaxis.push(element.count);
        });
        var chart = [
          {
            x: xaxis,
            y: yaxis,
            type: 'bar',
            marker: {
              color: '#007bff'
            }
          }
        ];

        var layout = {
          width: 600,
          height: 400,
          title: 'SeaWulf Efficiency Gap Stats',
          showlegend: false,
          xaxis: {
            title: ''
          },
          bargap: 0.0
        };

        Plotly.newPlot('seawulf-chart', chart, layout);
        break;
      default:
        var demodrop = document.getElementById("demo-seawulf");
        demodrop.style.display = "inline";
        if (demographic) {
          xaxis = [];
          yaxis = [];

          for (const [key, value] of Object.entries(data[metric][demographic])) {

            xaxis.push(key);
            yaxis.push(value);
          }
          var chart = [
            {
              x: xaxis,
              y: yaxis,
              type: 'bar',
              marker: {
                color: '#007bff'
              }
            }
          ];

          var layout = {
            width: 600,
            height: 400,
            title: 'SeaWulf Majority-Minority Range Stats',
            showlegend: false,
            xaxis: {
              title: ''
            },
            bargap: 0.0
          };

          Plotly.newPlot('seawulf-chart', chart, layout);
        }
        break;
    }
  });
}