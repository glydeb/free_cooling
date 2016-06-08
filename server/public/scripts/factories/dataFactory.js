myApp.factory('DataFactory', ['$http', function ($http) {
  console.log('dataFactory running');

  // PRIVATE
  function makeid(len) {
    var text = [];
    var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < len; i++) {
      text.push(possible.charAt(Math.floor(Math.random() * possible.length)));
    }

    return text.join();
  }

  // create hour array
  var hourList = [];
  var postfix = ' AM';

  // Fill array with hour objects
  for (var i = 1; i < 3; i++) {
    // if second time through, switch to PM
    if (i === 2) { postfix = ' PM';}

    for (var j = 1; j < 13; j++) {
      hourList.push({ hour: j, label: j + postfix });
    }
  }
/*
  var favorites = undefined;

  function getFaveData() {
    var promise = $http.get('/pets').then(function (response) {
      console.log('Async data returned: ', response.data);
      favorites = response.data;
    });

    return promise;
  }

  function saveFave(newFav) {
    var promise = $http.post('/pets', newFav).then(function (response) {
      if (response.status == 201) {
        console.log('Hooray! Fave Saved!');
        return getFaveData();
      } else {
        console.log('Boo!', response.data);
      }
    });

    return promise;
  }

  function deleteFave(id) {
    var promise = $http.delete('/pets/' + id).then(function (response) {
      if (response.status == 201) {
        console.log('Hooray! Fave Saved!');
        return getFaveData();
      } else {
        console.log('Boo!', response.data);
      }
    });

    return promise;
  }
*/
  // PUBLIC
  var product = {
    factoryHourArray: function () {
      // return our array
      return hourList;
    }
  };

  return product;

}]);
