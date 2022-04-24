// Handles all calls to and from the server

$.get("http://localhost:8080/state/all", function (data) {
  $(".result").html(data);
  $(function () {
    console.log(JSON.parse(data[0].geoJson));
  });
});