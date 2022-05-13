// Handles all calls to and from the server, as well as storing current data from server in web memory


var district_data;
var current_state;
var available_plans;
var selected_plan;

function getState(state_code) {
  $.get("http://localhost:8080/state/" + state_code, function (data) {
    $(".result").html(data);
    $(function () {
      current_state = state_code;
      displayPlanOptions(data.districtPlanIdToMetricsMap);
      available_plans = data.districtPlanIdToMetricsMap;

      // Populates summary table with state data
      var plan_summary = []
      for (const [key, value] of Object.entries(data.districtPlanIdToMetricsMap)) {
        value.meanPopulationDeviation = parseFloat(value.meanPopulationDeviation).toFixed(4);
        value.compactness = parseFloat(value.compactness).toFixed(4);
        plan_summary.push(value);
      }
      $('#table').bootstrapTable({
        data: plan_summary
      });
    });
  });
}

function queryPlan(id) {
  selected_plan = id;
}

function querySeatShare() {
  var sv_display = document.getElementById('sv-chart');
  var loader = document.getElementById('load-sv');
  displayLoading(loader);

  $.get('http://localhost:8080/district/seat-share/' + current_state + '/' + selected_plan, function (data) {
    hideLoading(loader);

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
    document.getElementById('sv-header').innerHTML = "Seats-Votes Curve for " + available_plans[selected_plan].name;
  });
}

function queryBoxWhisker() {
  $.get('http://localhost:8080/district/box-whisker/' + state_code + '/' + selected_plan, function (data) {
  });

}

function displayPlanOptions(plan_names) {
  plan_list = document.getElementById("picker");
  first_plan = document.getElementById("default-plan")

  first_plan.firstChild.nextSibling.innerHTML = plan_names[0].name;

  for (let index = 1; index < 4; index++) {
    new_plan = first_plan.cloneNode(true);
    new_plan.id = "";
    new_plan.onclick = function () { loadPlan(index) };
    new_plan.firstChild.nextSibling.innerHTML = plan_names[index].name;
    plan_list.appendChild(new_plan);
  }
  document.getElementById("default-plan").click();
}