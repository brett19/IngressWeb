function IngressGame( )
{
  var _classThis = this;
  
  var client = new IngressClient( );
  var globGathers = [];
  var cellTimestamps = {};
  var lastKnobTimestamp = 0;
  var lastInvTimestamp = 0;
  var playerName = '';
  var playerLat = 0;
  var playerLng = 0;
  var playerEntity = {};
  var gameEntities = {};
  var invEntities = {};
  var globEntities = {};
  
  var cellLoadRecursion = 2;
  var cellTimeout = 300 * 1000;
  
  function _cleanupEntities( ) {
    var cleanupTime = new Date();
    cleanupTime.setTime( cleanupTime.getTime() - cellTimeout );

    for( var guid in gameEntities ) {
      if( gameEntities[guid]._addTime <= cleanupTime ) {
        _removeEntity( guid );
      }
    }
    
    for( var guid in globEntities ) {
      if( globEntities[guid]._addTime <= cleanupTime ) {
        _removeEntity( guid );
      }
    }
  }
  setInterval( _cleanupEntities, 1000 );
  
  function _playerLocationE6( ) {
    return toE6Hex(playerLat)+","+toE6Hex(playerLng);
  }
  
  this.onPlayerChanged = function(){};
  this.onGameEntityChanged = function(entity,removed){};
  this.onGlobEntityChanged = function(entity,removed){};
  this.onInvEntityChanged = function(item,removed){};
  this.onPositionChanged = function(lat, lng){};
  
  this.getPlayerName = function() { return playerName; };
  this.getPlayerEntity = function() { return playerEntity; };
  this.getPlayerLat = function() { return playerLat; };
  this.getPlayerLng = function() { return playerLng; };
  
  function _distanceTo( lat, lng )
  {
    return (new LatLon(playerLat, playerLng)).distanceTo(new LatLon(lat, lng)) * 1000;
  }
  
  function _parseEntity(entData) {
    var entity = entData[2];
    entity.guid = entData[0];
    entity.lastModifiedMs = entData[1];
    return entity;
  }
  
  this.getGlobLocation = function( entity, done )
  {
    client.getCellLatLng( entity.cellId, function(lat,lng) {
      done(lat,lng);
    });
  }

  function _addGlobGuid( guid )
  {
    var realGuid = guid.substr(0,16);
    
    entity = {
      guid: guid,
      cellId: guid.substr(0,16),
      quantity: parseInt(guid.substr(24,8),16)
    };
    
    _removeEntity( entity.guid );
    
    entity._addTime = new Date();
    globEntities[realGuid] = entity;
   
    _classThis.onGlobEntityChanged(entity, false);
    entity._notified = true;
  }
  
  function _addInvEntity( entity )
  {
    _removeEntity( entity.guid );
    
    entity._addTime = new Date();
    invEntities[entity.guid] = entity;
    
    _classThis.onInvEntityChanged(entity, false);
    entity._notified = true;
  }
  
  function _addGameEntity( entity )
  {
    _removeEntity( entity.guid );
    
    entity._addTime = new Date();
    gameEntities[entity.guid] = entity;
    
    _classThis.onGameEntityChanged(entity,false);
    entity._notified = true;
  }
  
  function _removeGameEntity( guid ) {
    if( gameEntities[guid] ) {
      var deletedEntity = gameEntities[guid];
      delete gameEntities[guid];
      if( deletedEntity._notified ) {
        _classThis.onGameEntityChanged(deletedEntity,true);
      }
    }
  }
  
  function _removeInvEntity( guid ) {
    if( invEntities[guid] ) {
      var deletedEntity = invEntities[guid];
      delete invEntities[guid];
      if( deletedEntity._notified ) {
        _classThis.onInvEntityChanged(deletedEntity,true);
      }
    }
  }
  function _removeGlobEntity( guid ) {
    var realGuid = guid.substr(0,16);
    if( globEntities[realGuid] ) {
      var deletedEntity = globEntities[realGuid];
      delete globEntities[realGuid];
      if( deletedEntity._notified ) {
        _classThis.onGlobEntityChanged(deletedEntity,true);
      }
    }
  }
  
  function _removeEntity( guid ) {
    _removeGameEntity(guid);
    _removeInvEntity(guid);
    _removeGlobEntity(guid);
  }
  
  function _handleGameBasket( gameBasket )
  {
    if( !gameBasket ) return;
    
    if( gameBasket.playerEntity ) {
      playerEntity = _parseEntity(gameBasket.playerEntity);
      _classThis.onPlayerChanged();
    }
    if( gameBasket.deletedEntityGuids ) {
      for( var i = 0; i < gameBasket.deletedEntityGuids.length; ++i ) {
        _removeEntity(gameBasket.deletedEntityGuids[i]);
      }
    }
    if( gameBasket.gameEntities ) {
      var ents = gameBasket.gameEntities;
      for( var i = 0; i < ents.length; ++i ) {
        _addGameEntity(_parseEntity(ents[i]));          
      }
    }
    if( gameBasket.inventory ) {
      var ents = gameBasket.inventory;
      for( var i = 0; i < ents.length; ++i ) {
        _addInvEntity(_parseEntity(ents[i]));          
      }
    }
    if( gameBasket.energyGlobGuids ) {
      var globs = gameBasket.energyGlobGuids;
      for( var i = 0; i < globs.length; ++i ) {
        _addGlobGuid(globs[i]);
      }
    }
  }
  
  this.login = function( email, password, authToken, done )
  {
    client.doLogin( email, password, authToken, function(err,data) {
      if(err) return done(err);
      
      if( data.result.versionMatch != 'CURRENT' ) {
        return done('gameVersion ISNT CURRENT!');
      }
      if( !data.result.canPlay ) {
        return done('canPlay is FALSE!');
      }
      
      playerName = data.result.nickname;
      playerEntity = _parseEntity(data.result.playerEntity);
      _classThis.onPlayerChanged();
      
      client.setXsrfToken( data.result.xsrfToken );
      done(null);
    });
  }
  
  this.moveTimeRequired = function( startLat, startLng, endLat, endLng )
  {
    var targetLatLon = new LatLon(endLat, endLng);
    var totalDistance = ((new LatLon(startLat, startLng)).distanceTo(targetLatLon) * 1000);
    var totalTime = -0.00000050*totalDistance^2 + 0.051*totalDistance + 20;
    return totalTime;
  }
  
  var playerMoveTimer = null;
  this.movePosition = function( lat, lng, done )
  {
    if( playerMoveTimer ) {
      clearInterval(playerMoveTimer);
    }
    
    var targetLatLon = new LatLon(lat, lng);
    var totalDistance = ((new LatLon(playerLat, playerLng)).distanceTo(targetLatLon) * 1000);
    var totalTime = this.moveTimeRequired(playerLat, playerLng, lat, lng);
    var metersPerSecond = totalDistance / totalTime;
    if( metersPerSecond < 1 ) {
      metersPerSecond = 1;
    }
    
    /* High SPeed Override */
    //metersPerSecond = totalDistance / 3;
    
    function _moveTick() {
      var tickDistance = metersPerSecond / 10;
      var playerLatLon = new LatLon(playerLat, playerLng);
      var bearing = playerLatLon.bearingTo(targetLatLon);
      var distance = playerLatLon.distanceTo(targetLatLon) * 1000;
      if( distance <= tickDistance ) {
        playerLat = lat;
        playerLng = lng;
        clearInterval(playerMoveTimer);
        _classThis.onPositionChanged( );
        done();
      } else {
        var curLatLon = playerLatLon.destinationPoint(bearing, tickDistance/1000);
        playerLat = curLatLon.lat();
        playerLng = curLatLon.lon();
        _classThis.onPositionChanged( );
      }
      
    }
    playerMoveTimer = setInterval(_moveTick, 100);
  }
  
  this.setPosition = function( lat, lng )
  {
    playerLat = lat;
    playerLng = lng;
    
    _classThis.onPositionChanged( );
  }
  
  this.loadInventory = function( done )
  {
    client.doRpc( 'playerUndecorated', 'getInventory', {
      "lastQueryTimestamp": lastInvTimestamp
    }, function(err, data) {
      if(err) return done(err);      
      _handleGameBasket(data.gameBasket);
      if(data.error) return done(data.error);
      
      lastInvTimestamp = parseInt(data.result);
      done();
    });
  }

  var lastLevelUp = 0;
  this.checkLevelUp = function( ) {
    var curClientLevel = playerEntity.playerPersonal.clientLevel;
    if( this.myClientLevel() > curClientLevel ) {
      if( lastLevelUp < curClientLevel ) {
        this.levelUp(curClientLevel, function(){});        
        //lastLevelUp = curClientLevel;
      }
    }
  }
  
  this.updateMyRegion = function( done )
  {
    this.updateRegion( playerLat, playerLng, done );
  }
  
  this.updateRegion = function( lat, lng, done )
  {
    var _classThis = this;
    
    client.getCellsInRange( lat, lng, cellLoadRecursion, function(nearCells) {
      timeList = [];
      for( var i = 0; i < nearCells.length; ++i ) {
        if( cellTimestamps[nearCells[i]] ) {
          timeList.push( cellTimestamps[nearCells[i]] );
        } else {
          timeList.push(0);
        }
      }
      
      client.doRpc( 'gameplay', 'getObjectsInCells', {
        "cells":null,
        "cellsAsHex":nearCells,
        "dates":timeList,
        "energyGlobGuids":globGathers,
        "knobSyncTimestamp":lastKnobTimestamp,
        "playerLocation":_playerLocationE6()
      }, function(err, data) {
        if(err) return done(err);
        _handleGameBasket(data.gameBasket);
        if(data.error) return done(data.error);
        
        // Whenever we get a region, check level up stuff
        // Coupled with automatic region updates, this works good
        _classThis.checkLevelUp( );
        
        /* Full request every time
        for(var i = 0; i < nearCells.length; ++i) {
          cellTimestamps[nearCells[i]] = parseInt(data.result);
        }
        */
       
        done(null);
      });
      globGathers = [];
    });
  }
  
  this.gatherEnergy = function( done )
  {
    var lookupReqs = 0;
    var pickupEnergy = 0;
    for( guid in globEntities ) {
      function _wrapHandleGlob(glob) {
        lookupReqs++;
        _classThis.getGlobLocation( glob, function(lat,lng) {
          
          if( _distanceTo(lat,lng) < 100 ) {
            if( playerEntity.playerPersonal.energy + pickupEnergy < _classThis.myMaxEnergy() ) {
              globGathers.push( glob.guid );
              pickupEnergy += glob.quantity;
            }
          }
          
          lookupReqs--;
          if( lookupReqs == 0 ) {
            _classThis.updateRegion( playerLat, playerLng, function(err) {
              if(err) return done(err);
              done(null);
            });
          }
        });
      }
      _wrapHandleGlob(globEntities[guid]);
    }
  }
  
  this.fireXmp = function( itemGuid, done )
  {
    client.doRpc( 'gameplay', 'fireUntargetedRadialWeapon', {
      "itemGuid": itemGuid,
      "energyGlobGuids":[],
      "knobSyncTimestamp":lastKnobTimestamp,
      "playerLocation":_playerLocationE6()
    }, function(err, data) {
      if(err) return done(err);      
      _handleGameBasket(data.gameBasket);
      if(data.error) return done(data.error);
      
      done(null, data.result.damages);
    });
  }
  
  this.pickupItem = function( itemGuid, done )
  {
    client.doRpc( 'gameplay', 'pickUp', {
      "itemGuid": itemGuid,
      "energyGlobGuids":[],
      "knobSyncTimestamp":lastKnobTimestamp,
      "playerLocation":_playerLocationE6()
    }, function(err, data) {
      if(err) return done(err);      
      _handleGameBasket(data.gameBasket);
      if(data.error) return done(data.error);
      
      done(null);
    });
  }
  
  this.levelUp = function( level, done )
  {
    client.doRpc( 'player', 'levelUp', [
      level
    ], function(err, data) {
      _handleGameBasket(data.gameBasket);
      if(data.error) return done(data.error);
      
      done(null);
    });
  }
  
  this.dropItem = function( itemGuid, done )
  {
    client.doRpc( 'gameplay', 'dropItem', {
      "itemGuid": itemGuid,
      "energyGlobGuids":[],
      "knobSyncTimestamp":lastKnobTimestamp,
      "playerLocation":_playerLocationE6()
    }, function(err, data) {
      if(err) return done(err);      
      _handleGameBasket(data.gameBasket);
      if(data.error) return done(data.error);
      
      done(null);
    });
  }
  
  this.hackPortal = function( portalGuid, done )
  {
    client.doRpc( 'gameplay', 'collectItemsFromPortal', {
      "itemGuid": portalGuid,
      "energyGlobGuids":[],
      "knobSyncTimestamp":lastKnobTimestamp,
      "playerLocation":_playerLocationE6()
    }, function(err, data) {
      if(err) return done(err);      
      _handleGameBasket(data.gameBasket);
      if(data.error) return done(data.error);
      
      done(null, data.result.addedGuids);
    });
  }
  
  this.linkPortal = function( portalGuid, itemGuid, done )
  {
    var item = invEntities[ itemGuid ];
    var otherPortalGuid = item.portalCoupler.portalGuid;
    
    client.doRpc( 'gameplay', 'createLink', {
      "originPortalGuid":portalGuid,
      "destinationPortalGuid":otherPortalGuid,
      "linkKeyGuid":itemGuid,
      "energyGlobGuids":[],
      "knobSyncTimestamp":lastKnobTimestamp,
      "playerLocation":_playerLocationE6()
    }, function(err, data) {
      if(err) return done(err);      
      _handleGameBasket(data.gameBasket);
      if(data.error) return done(data.error);
      
      done(null);
    });
  }
  
  this.deployResonator = function( portalGuid, itemGuid, preferredSlot, done )
  {
    client.doRpc( 'gameplay', 'deployResonatorV2', {          
      "itemGuids": [itemGuid],
      "portalGuid": portalGuid,
      "preferredSlot": preferredSlot,
      "location":_playerLocationE6(),
      "energyGlobGuids":[],
      "knobSyncTimestamp":lastKnobTimestamp
    }, function(err, data) {
      if(err) return done(err);      
      _handleGameBasket(data.gameBasket);
      if(data.error) return done(data.error);
      
      done(null);
    });
  }
  
  this.upgradeResonator = function( portalGuid, itemGuid, slot, done )
  {
    client.doRpc( 'gameplay', 'upgradeResonatorV2', {          
      "emitterGuid": itemGuid,
      "portalGuid": portalGuid,
      "resonatorSlotToUpgrade": slot,
      "location":_playerLocationE6(),
      "energyGlobGuids":[],
      "knobSyncTimestamp":lastKnobTimestamp
    }, function(err, data) {
      if(err) return done(err);      
      _handleGameBasket(data.gameBasket);
      if(data.error) return done(data.error);
      
      done(null);
    });
  }
  
  this.deployShield = function( portalGuid, itemGuid, slot, done )
  {
    client.doRpc( 'gameplay', 'addMod', {
      "modResourceGuid": itemGuid,
      "modableGuid": portalGuid,
      "index": slot,
      "energyGlobGuids":[],
      "knobSyncTimestamp":lastKnobTimestamp,
      "playerLocation":_playerLocationE6()
    }, function(err, data) {
      if(err) return done(err);      
      _handleGameBasket(data.gameBasket);
      if(data.error) return done(data.error);
      
      done(null);
    });
  }
  
  this.getGameEntity = function(guid){ return gameEntities[guid]; };
  this.getInvEntity = function(guid){ return invEntities[guid]; };
  this.getGameEntities = function() { return gameEntities; };
  this.getInvEntities = function() { return invEntities; };
  
  this.playerMaxEnergy = function( level ) {
    var maxEnergy = [0,3000,4000,5000,6000,7000,8000,9000,10000];
    return maxEnergy[level];
  }
  
  var clientLevelList = [0, 2000, 4000, 6000, 8000, 10000, 14000, 18000, 22000, 26000, 30000,
    38000, 46000, 54000, 62000, 70000, 86000, 102000, 118000, 134000, 150000,
    180000, 210000, 240000, 270000, 300000, 360000, 420000, 480000, 540000, 
    600000, 720000, 840000, 960000, 1080000, 1200000, 9223372036854775807 ];
  var accessLevelList = [0, 10000, 30000, 70000, 150000, 300000, 600000, 1200000 ];
  
  this.myClientLevel = function() {
    for( var i = 0; i < clientLevelList.length; ++i ) {
      if( playerEntity.playerPersonal.ap < clientLevelList[i] ) {
        return i;
      }
    }
    return 0;
  }
  
  this.myLevel = function() {
    for( var i = 0; i < accessLevelList.length; ++i ) {
      if( playerEntity.playerPersonal.ap < accessLevelList[i] ) {
        return i;
      }
    }
    return 0;
  }
  
  this.myPrevLevelAp = function() {
    return accessLevelList[ this.myLevel() - 1 ];
  }
  
  this.myNextLevelAp = function() {
    return accessLevelList[ this.myLevel() ];
  }
  
  this.myNextLevelPer = function() {
    var curAp = playerEntity.playerPersonal.ap;
    var prevAp = this.myPrevLevelAp();
    var nextAp = this.myNextLevelAp();
    return Math.round( (curAp-prevAp) / (nextAp-prevAp) * 100 );
  }
  
  this.myActionRange = function( ) {
    return 35;
  }

  this.myMaxEnergy = function( ) {
    return this.playerMaxEnergy( this.myLevel() );
  }
  
  this.resonatorMaxEnergy = function( level ) {
    var maxEnergy = [0, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000];
    return maxEnergy[level];
  }
}