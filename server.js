// Handles all calls to and from the server, as well as storing current data from server in web memory

var currState;

function getState(state_code) {
  $.get("http://localhost:8080/state/" + state_code, function (data) {
    $(".result").html(data);
    $(function () {
      parseSummary(data);
      // Populates summary table with state data
      $('#table').bootstrapTable({
        data: [data]
      });
    });
  });
}

$.get("http://localhost:8080/state/all", function (data) {
  $(".result").html(data);
  $(function () {
    console.log(JSON.parse(data[0].geoJson));
  });
});