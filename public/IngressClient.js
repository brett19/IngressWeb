function IngressClient( )
{
  var proxyCookies = {};
  var xsrfToken = null;
  
  function _proxyAjax( opts )
  {
    console.log(opts);
    
    // Preprocess Data
    if( !opts.contentType ) {
      var params = [];
      for( key in opts.data ) {
        params.push( key + "=" + encodeURIComponent(opts.data[key]) );
      }
      opts.url += '?' + params.join("&");
      opts.data = null;
    } else if( opts.contentType.indexOf('application/json') != -1 ) {
      if( opts.method == 'GET' ) {
        opts.url += '?json=' + encodeURIComponent(JSON.stringify(opts.data));
        opts.data = null;
      } else {
        opts.data = JSON.stringify(opts.data);
      }
    } else if( opts.contentType.indexOf('application/x-www-form-urlencoded') != -1 ) {
      var params = [];
      for( key in opts.data ) {
        params.push( key + "=" + encodeURIComponent(opts.data[key]) );
      }
      opts.data = params.join("&");
    }

    // Send Proxy Request
    $.ajax({
      type: 'POST',
      url: '/api/proxy.x',
      processData: false,
      dataType: 'json',
      cache: false,
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify({
        method: opts.method,
        contentType: opts.contentType,
        url: opts.url,
        body: opts.data,
        xsrfToken: xsrfToken,
        cookies: proxyCookies
      }),
      success: function(data) {
        // Preprocess the received data
        if( opts.dataType == 'json' ) {
          try {
            if( data.body.substr(0,9).toLowerCase() == 'while(1);') {
              data.body = JSON.parse(data.body.substr(9));
            } else {
              data.body = JSON.parse(data.body);
            }
          } catch( e ) {
            data.body = {};
          }
        }
        
        // Log the Data
        console.log(data);
        
        // Store the cookies and emit completion
        proxyCookies = data.cookies;
        opts.success(data.body, data.statusCode);
      },
      error: opts.error
    });
  }
  
  function _reqGoogleLogin( email, password, done )
  {
    _proxyAjax({
      method: 'POST',
      url: 'https://www.google.com/accounts/ClientLogin',
      contentType: 'application/x-www-form-urlencoded',
      data: {
        "Email": email,
        "Passwd": password,
        "service": "ah"
      },
      dataType: 'text',
      success: function(data, statusCode)
      {  
        if( statusCode != 200 ) {
          done( 'Authentication Error - Status Code' );
        }
        
        var authToken = '';
        var splitData = data.split("\n");
        for( var i = 0; i < splitData.length; ++i ) {
          if( splitData[i].substr(0,4).toLowerCase() == 'auth') {
            authToken = splitData[i].substr(5);
          }
        }
        
        if( authToken ) {
          done( null, authToken );
        } else {
          done( 'Google Auth Error - No Token' );
        }
      }
    });
  }
  
  function _reqNemesisLogin( authToken, done )
  {
    _proxyAjax({
      method: 'GET',
      url: 'https://betaspike.appspot.com/_ah/login',
      data: {
        "continue": "https://betaspike.appspot.com",
        "auth": authToken
      },
      success: function(data, statusCode) {
        if( statusCode == 200 ) {
          done( null );
        } else {
          done( 'Login Error - Status Code' );
        }
      }
    })
  }
  
  function _reqHandshake( done )
  {
    _proxyAjax({
      method: 'GET',
      url: 'https://betaspike.appspot.com/handshake',
      contentType: 'application/json;charset=UTF-8',
      dataType: 'json',
      data: {
        "nemesisSoftwareVersion": "2013-01-24T11:26:38Z bfb6a817656f opt",
        "deviceSoftwareVersion": "4.2.1"
      },
      success: function(data, statusCode) {
        if( statusCode == 200 ) {
          done( null, data );
        } else {
          done( 'Handshake Error - Status Code' );
        }
      }
    });
  }
  
  this.setXsrfToken = function( token ) {
    xsrfToken = token;
  }
  
  this.doLogin = function( email, password, authToken, done )
  {
    function _wrapAuthLogin( authToken ) {
      _reqNemesisLogin( authToken, function(err){
        if(err) return done(err);
        _reqHandshake( function(err, data){
          if(err) return done(err);
          done(null, data);
        });
      });
    }
    
    if( !authToken ) {
      _reqGoogleLogin( email, password, function(err,authToken) {
        if( err ) return done(err);
        _wrapAuthLogin(authToken);
      });
    } else {
      _wrapAuthLogin( authToken );
    }
  }
  
  this.doRpc = function( ns, ep, params, done)
  {
    var _classThis = this;
    _proxyAjax({
      method: 'POST',
      url: 'https://betaspike.appspot.com/rpc/' + ns + '/' + ep,
      contentType: 'application/json;charset=UTF-8',
      data: {
        params: params
      },
      dataType: 'json',
      success: function(data, statusCode)
      {  
        if( statusCode != 200 ) {
          done( 'RPC Error - Status Code' );
        }
        done( null, data );
      }
    });
  }
  
  function _getCellId( lat, lng, done )
  {
    $.ajax({
      type: 'POST',
      url: '/api/cellid.x',
      dataType: 'json',
      data: {
        lat: lat,
        lng: lng
      },
      success: function(data) {
        done(data);
      }
    });
  }
  
  function _getCellNear( cellId, done )
  {
    $.ajax({
      type: 'POST',
      url: '/api/cellnear.x',
      dataType: 'json',
      data: {
        cellid: cellId
      },
      success: function(data) {
        done(data);
      }
    });
  }
  
  this.getCellLatLng = function( cellId, done )
  {
    $.ajax({
      type: 'POST',
      url: '/api/celllatlng.x',
      dataType: 'json',
      data: {
        cellid: cellId
      },
      success: function(data) {
        var dataS = data.split(",");
        done(parseFloat(dataS[0]), parseFloat(dataS[1]));
      }
    });
  }
  
  this.getCellsInRange = function( lat, lng, cellRange, done ) {
    function _doDepth( cellId, cellList, depth, done ) {
      if( depth > cellRange ) return done();
      
      _getCellNear( cellId, function(nearCells) {
        var nextDepthList = [];
        for( var i = 0; i < nearCells.length; ++i ) {
          if( cellList.indexOf(nearCells[i]) == -1 ) {
            cellList.push(nearCells[i]);
            nextDepthList.push(nearCells[i]);
          }
        }
        
        var remainCount = nextDepthList.length;
        if( remainCount <= 0 ) {
          done();
        } else {
          for( var i = 0; i < nextDepthList.length; ++i ) {
            _doDepth( nextDepthList[i], cellList, depth+1, function() {
              remainCount--;
              if( remainCount <= 0 ) {
                done();
              }
            });
          }
        }
      });
    }
    
    _getCellId( lat, lng, function(cellId) {
      var foundCellList = [cellId];
      _doDepth( cellId, foundCellList, 1, function(){
        done(foundCellList);
      });
    });    
  }
}
