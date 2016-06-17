(function (exports) {

  exports.algorithm  = function (indoor, outdoor, setpoint) {
    // Default recommendation/reason
    var output = {
      recommendation: 'Open',
      reason: 'Free conditioning available'
    };

    // check 5 'reasons to close' - too cold inside, and colder outside,
    // too warm inside and warmer outside, too dry inside and drier
    // outside, too wet inside and wetter outside, and rain expected.
    if (outdoor.precipProbability > 0.25) {
      output.recommendation = 'Closed';
      output.reason = 'Rain predicted';
    }

    if (outdoor.absHumidity > setpoint.wetLimit) {
      output.recommendation = 'Closed';
      output.reason = 'Too humid outside';
    }

    if (outdoor.absHumidity < setpoint.dryLimit &&
        indoor.absHumidity < setpoint.dryLimit) {
      output.recommendation = 'Closed';
      output.reason = 'Too dry outside';
    }

    if (outdoor.celsius > setpoint.highLimit) {
      output.recommendation = 'Closed';
      output.reason = 'Too hot outside';
    }

    if (outdoor.celsius < setpoint.lowLimit &&
        indoor.celsius < setpoint.lowLimit) {
      output.recommendation = 'Closed';
      output.reason = 'Too cold outside';
    }

    return output;

  };

})(typeof exports === 'undefined'? this.recommend={}: exports);
