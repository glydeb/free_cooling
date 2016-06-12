myApp.factory('DataFactory', ['$http', function ($http) {
  console.log('dataFactory running');

  // PRIVATE

  // create hour array and fill it
  var hourList = create12HrArray(' AM', 1).concat(create12HrArray(' PM', 13));

  function create12HrArray(postfix, startHour) {
    var halfDayList = [];
    for (var j = 1; j < 12; j++) {
      halfDayList.push({ hour: (j + startHour - 1), label: j + postfix });
    }

    halfDayList.unshift({ hour: (startHour - 1), label: 12 + postfix });
    return halfDayList;
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
