 $(document).ready(function() {

  // image effects
  (function ($) {
    $(function () {
      $('.button-collapse').sideNav();
      $('.parallax').parallax();
    }); 
  })(jQuery); // end of jQuery name space

  //google maps geocode api: AIzaSyD66EiTmbLSvi2GWAiZSLKB3CowEYbvxRc
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCnvr_DzP4nJOhWuYNMPR1mOP03ECQ19yA",
    authDomain: "recradar-90218.firebaseapp.com",
    databaseURL: "https://recradar-90218.firebaseio.com",
    projectId: "recradar-90218",
    storageBucket: "recradar-90218.appspot.com",
    messagingSenderId: "1059119511624"
  };
  firebase.initializeApp(config);
  var database = firebase.database();

  //this will store all the inputs from the form into variables
  var userObj = {
    firstName: '',
    lastName: '',
    age: '',
    phone: '',
    zip: '',
    city: '',
    coordinates: ''
  };

  //clears the form
  var clearForm = function() {
    $("#first-name").val('');
    $("#last-name").val('');
    $("#age").val('');
    $('#number').val('');
    $('#zip').val('');
  };

  //gets user input from the form
  var getUserInput = function() {
    userObj.firstName = $("#first-name").val().trim();
    userObj.lastName = $("#last-name").val().trim();
    userObj.age = $("#age").val().trim();
    userObj.phone = $('#number').val().trim();
    userObj.zip = $('#zip').val().trim();
  };

  // passed into the .then promise found in locationRequest(), to run upon a successful request
  var ajaxDone = function(response) {

    // creates an error message if the ajax call was unsuccessful.
    if (response.status !== 'OK') {
      if (response.status === 'ZERO_RESULTS') {
        throw new Error('Address not found.');
      } else {
        throw new Error('Could not connect to server.')
      }
    }

     //stores the user latitude and longitude based on the zip as an object
     userObj.coordinates = response.results[0].geometry.location;

     //stores the user city based on zip code
     userObj.city = response.results[0].address_components[1].long_name;

     //sets the user to the db. We do this at the end of the ajax request to get the location of the user from the geolocation api, to set all user data at once
     database.ref().push(userObj);

     //invoke function to display map
     initMap(userObj.coordinates);

    // filters db results by the users. Creates div to append each user to the DOM. removes listener so it only runs when a new user is added.
    database.ref().orderByChild("city").startAt(userObj.city).endAt(userObj.city).on("child_added", function(snapshot) {
      console.log(snapshot.val());
    
    // adds results to the page
    $(".results").append("<div class='card-panel teal' id='result-card'><div id='icon-div'><i class='large material-icons'>account_circle</i></div><div id='name-div'> " + snapshot.val().firstName + "</div></div>");
   };

  //gets user location based on zip code
  var locationRequest = function(zipCode) {
    var url = 'https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:' + zipCode + '&key=AIzaSyAvug71J9dikt9EgBYuElKS4-9ahCJ1dow';
    $.ajax({ url: url, method: 'GET' })
      // .then is invoked upon a successful response from the ajax request
      .then( resolve => ajaxDone(resolve) )
      // .catch is invoked upon an error response from the ajax request
      .catch( error => console.log(error) );
  };

  // Dropdown initialization
  //$('.dropdown-trigger').click(function(e){
    //console.log("working");
    $('.dropdown-trigger').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: true, 
      hover: false, 
      gutter: 0, 
      belowOrigin: false 
    });  

  //gets user input, and creates location request on click
  $('#submit-form').on('click', function(e) {
    e.preventDefault();

    //sets the user values
    getUserInput();

    //sets user name to session storage 
    sessionStorage.name = userObj.firstName;

    //clears the user input
    clearForm();

    //hides form when submit is pressed
    $('#input-form').hide();

    //gets the user location based on zip code
    locationRequest(userObj.zip);
  });
 });