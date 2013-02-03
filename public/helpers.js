function timeFormat(seconds) {
  var ktime = '';
  var hours = 0;
  var minutes = 0;
  if( seconds >= 3600 ) {
    hours = Math.floor(seconds/3600);
    seconds -= hours * 3600;
  }
  if( seconds >= 60 ) {
    minutes = Math.floor(seconds/60);
    seconds -= minutes * 60;
  }
  if( hours > 0 ) ktime += hours + 'h ';
  if( hours > 0 || minutes > 0 ) ktime += minutes + 'm ';
  ktime += seconds + 's';
  return ktime;
}

function toHex(number)
{
    if (number < 0) {
      number = 0xFFFFFFFF + number + 1;
    }
    var hexval = number.toString(16).toUpperCase();
    while( hexval.length < 8 ) {
      hexval = '0' + hexval;
    }
    return hexval;
}

function fromHex(number) {
  return parseInt(number,16);
}

function toE6(number)
{
  return Math.round(number*1E6);
}

function toE6Hex(number)
{
  return toHex(toE6(number));
}

function fromE6(number)
{
  return number / 1E6;
}

function fromE6Hex(number)
{
  return fromE6(fromHex(number));
}

function fromLocationE6(locationE6)
{
  return {
    lat: fromE6(locationE6.latE6),
    lng: fromE6(locationE6.lngE6)
  };
}
