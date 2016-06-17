(function (exports) {

  exports.absoluteHumidity = function (celsius, rh) {
    var temp = parseFloat(celsius);
    var logTen = (temp * 7.5) / (temp + 237.3);
    var satPressure = Math.pow(10, logTen) * 6.11;
    absHumidity = (satPressure * rh * 2.1674) / (celsius + 273.15);
    return absHumidity;
  };

})(typeof exports === 'undefined'? this.calc={}: exports);
