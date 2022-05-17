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

function upper(sentence) {
  return sentence.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
}

function getState(state_code) {
  current_state = "";
  available_plans = [];
  selected_plan = null;
  $.get("http://localhost:8080/state/" + state_code, function (data) {
    $(".result").html(data);
    $(function () {
      current_state = state_code;

      // Populates summary table with state data
      data.districtPlanMetricsList.forEach(element => {
        element.name = upper(element.name.replaceAll("_", " "));
        available_plans.push([element.id, element.name]);
      });
      available_plans.sort((a, b) => (a[1] > b[1]) ? 1 : ((b[1] > a[1]) ? -1 : 0));
      displayPlanOptions();
      // for (const [key, value] of Object.entries(data.districtPlanIdToMetricsMap)) {
      //   value.meanPopulationDeviation = parseFloat(value.meanPopulationDeviation).toFixed(4);
      //   value.compactness = parseFloat(value.compactness).toFixed(4);
      //   plan_summary.push(value);
      // }
      $('#table').bootstrapTable({
        data: data.districtPlanMetricsList
      });
    });
  });
}

function queryPlan(id) {
  selected_plan = id;
  $.get('http://localhost:8080/district/population-metrics/' + current_state + '/' + available_plans[id][0], function (data) {
    console.log(data);
    plan_stats = data;
  });
  $.get('http://localhost:8080/district/geojson/' + current_state + '/' + available_plans[id][0], function (data) {
    for (let i = 0; i < data.features.length; i++) {
      democrat = plan_stats[i]["DEMOCRAT"];
      republican = plan_stats[i]["REPUBLICAN"];
      total = democrat + republican;
      lean = 100 * ((republican / total) - (democrat / total));
      data.features[i].properties.lean = lean;
      data.features[i].properties.pop = plan_stats[i]["TOTAL_POPULATION"];
    }
    showDistrict(data);
  });
}

function querySeatShare() {
  var sv_display = document.getElementById('sv-chart');
  var loader = document.getElementById('load-sv');
  // displayLoading(loader);

  $.get('http://localhost:8080/district/seat-share/' + current_state + '/' + available_plans[selected_plan][0], function (data) {
    // hideLoading(loader);

    var x_coordinates_dem = [];
    var y_coordinates_dem = [];
    for (const [key, value] of Object.entries(data.democratData)) {
      x_coordinates_dem.push(value.x);
      y_coordinates_dem.push(value.y);
    }


    var x_coordinates_rep = [];
    var y_coordinates_rep = [];
    for (const [key, value] of Object.entries(data.republicanData)) {
      x_coordinates_rep.push(value.x);
      y_coordinates_rep.push(value.y);
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

    var layout = {
      width: 600,
      height: 400,
      xaxis: {
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

    var plotly_data = [trace_dem, trace_rep];

    Plotly.newPlot('sv-chart', plotly_data, layout);

    document.getElementById('sv-responsiveness').innerHTML = "Responsiveness: " + data.responsiveness;
    document.getElementById('sv-baf').innerHTML = "Bias at 50%: " + data.biasAt50;
    document.getElementById('sv-symmetry').innerHTML = "Symmetry: " + data.symmetry;
    document.getElementById('sv-header').innerHTML = "Seats-Votes Curve for " + available_plans[selected_plan][1];
  });
}

function queryBoxWhisker(demographic, name) {
  var loader = document.getElementById('load-boxplot');

  $.get('http://localhost:8080/district/box-whisker/' + current_state + '/' + selected_plan, function (data) {
    var seawulf_plots = data.boxAndWhiskerData[demographic];
    var district_plots = data.districtData[demographic];

    var final = [];
    const reducer = (accumulator, curr) => accumulator + curr;
    district_plots.forEach(element => {
      const sum = district_plots.reduce(reducer);
      final.push((element / sum) * 100);
    });

    var data = [];
    for (var i = 0; i < seawulf_plots.length; i++) {
      var result = {
        type: 'box',
        y: Object.values(seawulf_plots[i]),
        name: "SeaWulf Plan " + i,
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
    data.push({
      type: 'box',
      y: final,
      name: available_plans[selected_plan][1],
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
    });

    layout = {
      plot_bgcolor: "#EEEEEE",
      paper_bgcolor: "#EEEEEE",
      width: 800,
      height: 400,
      title: name + ' Population Data for ' + available_plans[selected_plan][1] + ' vs. Selected SeaWulf Plans',
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
  $.get('http://localhost:8080/district/compare/' + current_state + '/' + selected_plan + "/" + id, function (data) {
    factor = 10;
    while(data.meanPopulationDeviation1 / factor > 1) {
      factor *= 10;
    }
    var plan1 = [data.compactness1, data.efficiencyGap1, data.meanPopulationDeviation1 / factor, data.numCombinedMajorityMinorityDistricts1/available_plans.length, data.numIncumbentSafeDistricts1/available_plans.length];
    var plan2 = [data.compactness2, data.efficiencyGap2, data.meanPopulationDeviation2 / factor, data.numCombinedMajorityMinorityDistricts2/available_plans.length, data.numIncumbentSafeDistricts2/available_plans.length];
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
  $.get('http://localhost:8080/state/geojson/all', function (data) {
    state_shapes = data;
    loadStates();
  });
}