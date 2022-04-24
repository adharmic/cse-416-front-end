// Handles all calls to and from the server

function httpGetAsync(theUrl, callback) {
  let xmlHttpReq = new XMLHttpRequest();
  xmlHttpReq.onreadystatechange = function () {
    if (xmlHttpReq.readyState == 4 && xmlHttpReq.status == 200)
      callback(xmlHttpReq.responseText);
  }
  xmlHttpReq.open("GET", theUrl, true); // true for asynchronous 
  xmlHttpReq.send(null);
}

httpGetAsync('https://jsonplaceholder.typicode.com/posts', function (result) {
  console.log(result);
});