var game = new IngressGame( );

var mapSetup = false;
var map = null;
var myMarker = null;
var myCircle = null;

var viewOptimization = false;

function _distanceBetween( startLat, startLng, endLat, endLng )
{
  return (new LatLon(startLat, startLng)).distanceTo(new LatLon(endLat, endLng)) * 1000;
}
function _distanceTo( lat, lng )
{
  return _distanceBetween( game.getPlayerLat(), game.getPlayerLng(), lat, lng );
}


var iconGroundItem = new google.maps.MarkerImage(
    'images/icon_item_unknown.png',
    null, /* size is determined at runtime */
    null, /* origin is 0,0 */
    new google.maps.Point(10, 10),
    new google.maps.Size(20, 20)
);
var iconPortalEnlFake = new google.maps.MarkerImage(
    "images/icon_portal_enl_fake.png",
    null, /* size is determined at runtime */
    null, /* origin is 0,0 */
    new google.maps.Point(14, 14),
    new google.maps.Size(28, 28)
);
var iconPortalResFake = new google.maps.MarkerImage(
    "images/icon_portal_res_fake.png",
    null, /* size is determined at runtime */
    null, /* origin is 0,0 */
    new google.maps.Point(12, 12),
    new google.maps.Size(24, 24)
);
var iconPortalNoneFake = new google.maps.MarkerImage(
    "images/icon_portal_none_fake.png",
    null, /* size is determined at runtime */
    null, /* origin is 0,0 */
    new google.maps.Point(12, 12),
    new google.maps.Size(24, 24)
);

var iconPortalEnl = new google.maps.MarkerImage(
    "images/icon_portal_enl.png",
    null, /* size is determined at runtime */
    null, /* origin is 0,0 */
    new google.maps.Point(24, 24),
    new google.maps.Size(48, 48)
);
var iconPortalRes = new google.maps.MarkerImage(
    "images/icon_portal_res.png",
    null, /* size is determined at runtime */
    null, /* origin is 0,0 */
    new google.maps.Point(24, 24),
    new google.maps.Size(48, 48)
);
var iconPortalNone = new google.maps.MarkerImage(
    "images/icon_portal_none.png",
    null, /* size is determined at runtime */
    null, /* origin is 0,0 */
    new google.maps.Point(24, 24),
    new google.maps.Size(48, 48)
);

var iconResonators = [
  new google.maps.MarkerImage(
      "images/icon_resonator_0of4.png",
      null, /* size is determined at runtime */
      null, /* origin is 0,0 */
      new google.maps.Point(8, 8),
      new google.maps.Size(16, 16)
  ),
  new google.maps.MarkerImage(
      "images/icon_resonator_1of4.png",
      null, /* size is determined at runtime */
      null, /* origin is 0,0 */
      new google.maps.Point(8, 8),
      new google.maps.Size(16, 16)
  ),
  new google.maps.MarkerImage(
      "images/icon_resonator_2of4.png",
      null, /* size is determined at runtime */
      null, /* origin is 0,0 */
      new google.maps.Point(8, 8),
      new google.maps.Size(16, 16)
  ),
  new google.maps.MarkerImage(
      "images/icon_resonator_3of4.png",
      null, /* size is determined at runtime */
      null, /* origin is 0,0 */
      new google.maps.Point(8, 8),
      new google.maps.Size(16, 16)
  ),
  new google.maps.MarkerImage(
      "images/icon_resonator_4of4.png",
      null, /* size is determined at runtime */
      null, /* origin is 0,0 */
      new google.maps.Point(8, 8),
      new google.maps.Size(16, 16)
  )
];

var iconWaypoint = new google.maps.MarkerImage(
    "images/icon_waypoint.png",
    null, /* size is determined at runtime */
    null, /* origin is 0,0 */
    null,
    null
);

var iconPlayer = new google.maps.MarkerImage(
    "images/icon_player.png",
    null, /* size is determined at runtime */
    null, /* origin is 0,0 */
    null,
    null
);

function nemLog(text) {
  $('#console').prepend("[" + (new Date()).toTimeString().substr(0,8) + "] " + text + "<br />");
}
function nemLogX(text) {
  $('#consolex').prepend("[" + (new Date()).toTimeString().substr(0,8) + "] " + text + "<br />");
}

function teamColor(teamName) {
  var edgeColor = '#FF0000';
  if( teamName == 'ALIENS' ) {
    edgeColor = '#00FF00';
  } else if( teamName == 'RESISTANCE' ) {
    edgeColor = '#0000FF';
  }
  return edgeColor;
}

function resonatorIcon(percent) {
  if( percent < 0.2) {
    return iconResonators[0];
  } else if( percent < 0.4 ) {
    return iconResonators[1];
  } else if( percent < 0.6 ) {
    return iconResonators[2];
  } else if( percent < 0.8 ) {
    return iconResonators[3];
  } else {
    return iconResonators[4];
  }
}

function resonatorDirText(slot) {
  var slots = [ "East", "North-East", "North", "North-West", "West", "South-West", "South", "South-East" ];
  return slots[slot].toLowerCase( );
}

function teamFakePortalIcon(teamName) {
  var portalIcon = iconPortalNoneFake;
  if( teamName == 'ALIENS' ) {
    portalIcon = iconPortalEnlFake;
  } else if( teamName == 'RESISTANCE' ) {
    portalIcon = iconPortalResFake;
  }
  return portalIcon;
}

function teamPortalIcon(teamName) {
  var portalIcon = iconPortalNone;
  if( teamName == 'ALIENS' ) {
    portalIcon = iconPortalEnl;
  } else if( teamName == 'RESISTANCE' ) {
    portalIcon = iconPortalRes;
  }
  return portalIcon;
}

function itemIconPath( itemData )
{
  if( itemData.resourceWithLevels ) {
    if( itemData.resourceWithLevels.resourceType == 'EMP_BURSTER' ) {
      return 'images/icon_item_xmp.png';
    } else if( itemData.resourceWithLevels.resourceType == 'EMITTER_A' ) {
      return 'images/icon_item_resonator.png';
    } else if( itemData.resourceWithLevels.resourceType == 'MEDIA' ) {
      return 'images/icon_item_media.png';
    }
  } else if( itemData.modResource ) {
    if( itemData.modResource.resourceType == 'RES_SHIELD' ) {
      return 'images/icon_item_shield.png';
    }
  } else if( itemData.resource ) {
    if( itemData.resource.resourceType == 'PORTAL_LINK_KEY' ) {
      return 'images/icon_item_key.png';
    }
  }
  return 'images/icon_item_unknown.png';
}

function itemText( itemData )
{
  if( itemData.resourceWithLevels ) {
    if( itemData.resourceWithLevels.resourceType == 'EMP_BURSTER' ) {
      return 'L' + itemData.resourceWithLevels.level + ' XMP Burster';
    } else if( itemData.resourceWithLevels.resourceType == 'EMITTER_A' ) {
      return 'L' + itemData.resourceWithLevels.level + ' Resonator';
    } else if( itemData.resourceWithLevels.resourceType == 'MEDIA' ) {
      return 'L' + itemData.resourceWithLevels.level + ' Media';
    } else {
      return itemData.resourceWithLevels.resourceType + ' (LVL: ' + itemData.resourceWithLevels.level + ')';
    }
  } else if( itemData.modResource ) {
    if( itemData.modResource.resourceType == 'RES_SHIELD' ) {
      return 'Portal Shield (' + itemData.modResource.rarity + ')';
    } else {
      return itemData.modResource.resourceType + ' (' + itemData.modResource.rarity + ')';
    }
  } else if( itemData.resource ) {
    if( itemData.resource.resourceType == 'PORTAL_LINK_KEY' ) {
      return 'Portal Key (' + itemData.portalCoupler.portalTitle + ' - ' + itemData.portalCoupler.portalAddress + ')';
    } else {
      return itemData.resource.resourceType;
    }
  } else {
    return ' ** BAD ITEM TYPE ** ';
  }
}

function initMap( latlng )
{
  if( mapSetup ) return;
  
  var mapOptions = {
    center: latlng,
    zoom: 17,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDoubleClickZoom: true,
    panControl: false,
    rotateControl: false,
    scaleControl: false,
    streetViewControl: false,
    zoomControl: false,
    //styles: [{featureType:"all", elementType:"all", stylers:[{visibility:"on"}, {hue:"#0091ff"}, {invert_lightness:true}]}, {featureType:"water", elementType:"all", stylers:[{visibility:"on"}, {hue:"#005eff"}, {invert_lightness:true}]}, {featureType:"poi", stylers:[{visibility:"off"}]}, {featureType:"transit", elementType:"all", stylers:[{visibility:"off"}]}]
    styles: [
      {
        "featureType": "poi",
        "elementType": "labels",
        "stylers": [
          { "visibility": "off" }
        ]
      },{
        "featureType": "transit",
        "stylers": [
          { "visibility": "off" }
        ]
      }
    ]
  };
  map = new google.maps.Map(document.getElementById("map_canvas"),
      mapOptions);
  
  google.maps.event.addListener(map, 'click', function(e) {
    game.updateRegion( e.latLng.lat(), e.latLng.lng(), function(err) {
      console.log( 'Updated Region!' );
    });
    console.log( e.latLng.lat() + "," + e.latLng.lng() );
  });
  
  google.maps.event.addListener(map, 'dblclick', function(e) {
    game.movePosition( e.latLng.lat(), e.latLng.lng(), function(){
      console.log( "Move Complete!" );
    });
  });
  
  google.maps.event.addListener(map, 'rightclick', function(e) {
    game.setPosition( e.latLng.lat(), e.latLng.lng() );
  });
  
  myMarker = new google.maps.Marker({
    position: latlng,
    map: map,
    title: 'My Position',
    zIndex: 40000,
    icon: iconPlayer,
    clickable: false
  });
  
  myCircle = new google.maps.Circle({
    strokeColor: '#FF00DD',
    strokeOpacity: 0.5,
    strokeWeight: 2,
    fillColor: '#FF00DD',
    fillOpacity: 0.2,
    map: map,
    center: latlng,
    radius: game.myActionRange(),
    zIndex: -40000,
    clickable: false
  });
  
  mapSetup = true;
}

var selectedInvGuid = null;
function setInvSelection( guid )
{  
  selectedInvGuid = guid;
 
  $('#itemacts button').hide();
  if( !guid ) return;
  
  var item = game.getInvEntity(guid);  
  if( !item ) return;
  
  $('#actdrop').show();
  $('#actdropx').show();
  if( item.resourceWithLevels ) {
    if( item.resourceWithLevels.resourceType == 'EMP_BURSTER' ) {
      $('#actfire').show();
      $('#actfirex').show();
    }
  }
}

var selectedPortalGuid = null;
function updatePortalPanel( )
{
  $('#portalInfo').hide();
  
  if( !selectedPortalGuid ) return;  
  var portal = game.getGameEntity(selectedPortalGuid);
  if( !portal ) return;
  
  $('#portalInfo').show();
  
  $('#portalName').text( portal.portalV2.descriptiveText.TITLE );
  $('#portalAddr').text( portal.portalV2.descriptiveText.ADDRESS );

  for( var i = 0; i < 4; ++i ) {
    var mod = portal.portalV2.linkedModArray[i];
    if( mod ) {
      $('#shield'+(i+1)+'type').text(mod.type);
      $('#shield'+(i+1)+'rarity').text(mod.rarity);
      $('#actaddshield'+(i+1)).attr('disabled', 'disabled');
    } else {
      $('#shield'+(i+1)+'type').text('-');
      $('#shield'+(i+1)+'rarity').text('-');
      $('#actaddshield'+(i+1)).removeAttr('disabled');
    }
  }
  
  var portalLevel = 0;
  var sidename = [ 'e', 'ne', 'n', 'nw', 'w', 'sw', 's', 'se' ];
  for( var i = 0; i < 8; ++i ) {
    var res = portal.resonatorArray.resonators[i];
    
    if( res ) {
      portalLevel += res.level;
      $('#res'+sidename[i]+'cur').text( res.energyTotal );
      $('#res'+sidename[i]+'max').text( game.resonatorMaxEnergy(res.level) );
      $('#res'+sidename[i]+'lvl').text( res.level );
      $('#actdeploy'+sidename[i]).hide();
      $('#actupgrade'+sidename[i]).show();
    } else {
      $('#res'+sidename[i]+'cur').text( '-' );
      $('#res'+sidename[i]+'max').text( '-' );
      $('#res'+sidename[i]+'lvl').text( '-' );
      $('#actdeploy'+sidename[i]).show();
      $('#actupgrade'+sidename[i]).hide();
    }
  }
  
  $('#portalLevel').text( portalLevel/8 );
}

function setPortalSelection( guid )
{
  selectedPortalGuid = guid;
  updatePortalPanel();
}

function pickupItem( itemGuid )
{
  nemLog( "Picking up item " + itemGuid + "..." );
  game.pickupItem( itemGuid, function(err){
    nemLog( "Pickup Complete." );
  });
}

function doGatherItems( )
{
  if( !confirm("Are you sure you want to gather items?  This will move you!") ) {
    return;
  }
  
  nemLog( "Gathering Items..." );
  
  var entities = game.getGameEntities();
  var pickupList = [];
  for( var guid in entities ) {
    var entity = entities[guid];
    if( entity.portalV2 || entity.edge || entity.capturedRegion ) {
      // Wrong kind of entity
      continue;
    }
    
    var location = fromLocationE6(entity.locationE6);
    if( _distanceTo(location.lat, location.lng) < game.myActionRange() ) {
      pickupList.push(guid);
    }
  }
  
  if( pickupList.length <= 0 ) return;
  
  $('#uiblocker').show();
  var activeCnt = 0;
  var batchSize = 10;
  function pickupOne()
  {
    activeCnt++;
    var itemGuid = pickupList.shift();
    nemLog( "Picking up item " + itemGuid );
    game.pickupItem( itemGuid, function(err) {
      activeCnt--;
      if( activeCnt < batchSize && pickupList.length > 0 ) {
        pickupOne();
      } else if( activeCnt == 0 && pickupList.length == 0 ) {
        nemLog( "Item gather completed." );
        $('#uiblocker').hide();
      }
      if( err ) return nemLog( "Item Pickup Error: " + err);
      nemLog( "Item Pickup Complete." );
    });
  }
  for( var i = 0; i < batchSize; ++i ) {
    if( i >= pickupList.length ) break;
    pickupOne();
  }
}


function doGatherXm( )
{
  nemLog( "Gathering Energy..." );
  game.gatherEnergy(function(){
    nemLog( "Gathered Energy." );
  });
}

function actHack( done )
{
  if( !selectedPortalGuid ) return;
  
  $('#uiblocker').show();
  game.hackPortal( selectedPortalGuid, function(err, addedGuids) {
    $('#uiblocker').hide();
    if(err) return done(err);
    done(null,addedGuids);    
  });
}

function doActHack( )
{
  nemLog( "Hacking portal " + selectedPortalGuid );
  
  actHack( function(err, addedGuids){ 
    if( err ) return nemLog( "Portal Hack Error: " + err);
    
    for( var i = 0; i < addedGuids.length; ++i ) {
      nemLog( "Hack Item: " + itemText(game.getInvEntity(addedGuids[i])) );
    }
    
    nemLog( "Portal Hack Complete." );
  })
}

function doActDrop( )
{
  if( !selectedInvGuid ) return;
  
  nemLog( "Dropping item " + selectedInvGuid );
  
  game.dropItem( selectedInvGuid, function(err) {
    if( err ) return nemLog( "Item Drop Error: " + err);
    nemLog( "Item Drop Complete." );
  });
}

function doActDropX( )
{
  if( !selectedInvGuid ) return;
  
  var invEntities = game.getInvEntities( );
  var startItem = invEntities[selectedInvGuid];
  
  var totalDrop = prompt( "How many would you like to drop?", 0 );
  if( !totalDrop ) return;
 
  nemLog( "Mass dropping " + totalDrop + " of " + startItem.smallKey );
  
  var dropList = [];
  for( var guid in invEntities ) {
    var item = invEntities[guid];
    if( item.smallKey == startItem.smallKey) {
      dropList.push( item.guid );
    }
    if( dropList.length >= totalDrop ) break;
  }
  
  if( dropList.length <= 0 ) return;
  
  $('#uiblocker').show();
  var activeCnt = 0;
  var batchSize = 10;
  function dropOne()
  {
    activeCnt++;
    var itemGuid = dropList.shift();
    nemLog( "Dropping item " + itemGuid );
    game.dropItem( itemGuid, function(err) {
      activeCnt--;
      if( activeCnt < batchSize && dropList.length > 0 ) {
        dropOne();
      } else if( activeCnt == 0 && dropList.length == 0 ) {
        nemLog( "Mass drop completed." );
        $('#uiblocker').hide();
      }
      if( err ) return nemLog( "Item Drop Error: " + err);
      nemLog( "Item Drop Complete." );
    });
  }
  for( var i = 0; i < batchSize; ++i ) {
    if( i >= dropList.length ) break;
    dropOne();
  }
}

function doActFire( )
{
  if( !selectedInvGuid ) return;

  nemLog( "Firing XMP: " + selectedInvGuid );
  
  $('#uiblocker').show();
  game.fireXmp( selectedInvGuid, function(err, damages) {
    $('#uiblocker').hide();
    if( err ) return nemLog( "XMP Fire Error: " + err);
    
    damages.sort(function(a,b){
      return a.damageAmount - b.damageAmount;
    });
    for( var i = 0; i < damages.length; ++i ) {
      var dmg = damages[i];
      
      if( dmg.targetDestroyed ) {
        nemLog( "<b>Destroyed</b> " + resonatorDirText(dmg.targetSlot) + "</b> resonator." );
      } else {
        if( dmg.criticalHit ) {
          nemLog( "Hit " + resonatorDirText(dmg.targetSlot) + " resonator for <b>" + dmg.damageAmount + "</b> damage. <i>(CRITICAL)</i>" );
        } else {
          nemLog( "Hit " + resonatorDirText(dmg.targetSlot) + " resonator for <b>" + dmg.damageAmount + "</b> damage." );
        }        
      }
    }
    
    nemLog( "XMP Firing Complete." );
  });
}

function doActFireX( )
{
  if( !selectedInvGuid ) return;
  
  var invEntities = game.getInvEntities( );
  var startItem = invEntities[selectedInvGuid];
  
  var totalDrop = prompt( "How many would you like to fire?", 0 );
  if( !totalDrop ) return;
 
  nemLog( "Mass firing " + totalDrop + " of " + startItem.smallKey );
  
  var dropList = [];
  for( var guid in invEntities ) {
    var item = invEntities[guid];
    if( item.smallKey == startItem.smallKey) {
      dropList.push( item.guid );
    }
    if( dropList.length >= totalDrop ) break;
  }
  
  if( dropList.length <= 0 ) return;
  
  $('#uiblocker').show();
  var activeCnt = 0;
  var batchSize = 10;
  function dropOne()
  {
    activeCnt++;
    var itemGuid = dropList.shift();
    nemLog( "Firing XMP: " + itemGuid );
    game.fireXmp( itemGuid, function(err, damages) {
      activeCnt--;
      if( activeCnt < batchSize && dropList.length > 0 ) {
        dropOne();
      } else if( activeCnt == 0 && dropList.length == 0 ) {
        nemLog( "Mass fire completed." );
        $('#uiblocker').hide();
      }
      
      
      if( err ) return nemLog( "XMP Fire Error: " + err);
      
      damages.sort(function(a,b){
        return a.damageAmount - b.damageAmount;
      });
      for( var i = 0; i < damages.length; ++i ) {
        var dmg = damages[i];
        
        if( dmg.targetDestroyed ) {
          nemLog( "<b>Destroyed</b> " + resonatorDirText(dmg.targetSlot) + "</b> resonator." );
        } else {
          if( dmg.criticalHit ) {
            nemLog( "Hit " + resonatorDirText(dmg.targetSlot) + " resonator for <b>" + dmg.damageAmount + "</b> damage. <i>(CRITICAL)</i>" );
          } else {
            nemLog( "Hit " + resonatorDirText(dmg.targetSlot) + " resonator for <b>" + dmg.damageAmount + "</b> damage." );
          }        
        }
      }
      
      nemLog( "XMP Firing Complete." );
    });
  }
  for( var i = 0; i < batchSize; ++i ) {
    if( i >= dropList.length ) break;
    dropOne();
  }
}

function doActLink( )
{
  if( !selectedInvGuid ) return;
  if( !selectedPortalGuid ) return;
  
  nemLog( "Linking portal " + selectedPortalGuid + " with key " + selectedInvGuid );
  
  $('#uiblocker').show();
  game.linkPortal( selectedPortalGuid, selectedInvGuid, function(err) {
    $('#uiblocker').hide();
    if( err ) return nemLog( "Portal Link Error: " + err);
    
    nemLog( "Portal Link Complete." );
  });
}

function doActAddShield( slot )
{
  if( !selectedInvGuid ) return;
  if( !selectedPortalGuid ) return;
  
  nemLog( "Deploying shield " + selectedInvGuid + " to portal " + selectedPortalGuid );
  
  $('#uiblocker').show();
  game.deployShield( selectedPortalGuid, selectedInvGuid, slot, function(err) {
    $('#uiblocker').hide();
    if( err ) return nemLog( "Shield Deploy Error: " + err);
    
    nemLog( "Shield Deploy Complete." );
  });
}

function doActRecharge( )
{
  if( !selectedPortalGuid ) return;
  
  nemLog( "Recharging portal " + selectedPortalGuid );
  
  game.rechargeResonators( selectedPortalGuid, [0,1,2,3,4,5,6,7], function(err) {
    if( err ) return nemLog( "Resonator Recharge Error: " + err);
    
    nemLog( "Resonator Recharge Complete." );
  });
}

function doActDeploy( slot )
{
  if( !selectedInvGuid ) return;
  if( !selectedPortalGuid ) return;
  
  nemLog( "Deploying resonator " + selectedInvGuid + " to portal " + selectedPortalGuid );
  
  $('#uiblocker').show();
  game.deployResonator( selectedPortalGuid, selectedInvGuid, slot, function(err) {
    $('#uiblocker').hide();
    if( err ) return nemLog( "Resonator Deploy Error: " + err);
    
    nemLog( "Resonator Deploy Complete." );
  });
}

function doActUpgrade( slot )
{
  if( !selectedInvGuid ) return;
  if( !selectedPortalGuid ) return;
  
  nemLog( "Upgrading resonator " + selectedInvGuid + " to portal " + selectedPortalGuid );
  
  $('#uiblocker').show();
  game.upgradeResonator( selectedPortalGuid, selectedInvGuid, slot, function(err) {
    $('#uiblocker').hide();
    if( err ) return nemLog( "Resonator Upgrade Error: " + err);
    
    nemLog( "Resonator Upgrade Complete." );
  });
}

function updateInventoryView( )
{
  console.log('Updating Inventory View...');
  var invEntities = game.getInvEntities( );
  
  var totalItems = 0;
  var smallInv = {};
  for( guid in invEntities ) {
    var item = invEntities[guid];
    totalItems++;
    
    var smallKey = '';
    if( item.resourceWithLevels ) {
      smallKey = 'a:' + item.resourceWithLevels.resourceType + ':' + item.resourceWithLevels.level;
    } else if( item.modResource ) {
      smallKey = 'b:' + item.modResource.resourceType + ':' + item.modResource.rarity;
    } else if( item.resource ) {
      if( item.resource.resourceType == 'PORTAL_LINK_KEY' ) {
        smallKey = 'c:' + item.portalCoupler.portalTitle + ':' + item.portalCoupler.portalGuid;
      } else {
        smallKey = 'y:' + smallKeyIdx++;
      }
    } else {
      smallKey = 'z:' + smallKeyIdx++;
    }
    item.smallKey = smallKey;
    
    if( !smallInv[smallKey] ) {
      smallInv[smallKey] = [];
    }
    smallInv[smallKey].push(item);
  }
  
  var dispItemList = [];
  for( smallKey in smallInv ) {
    dispItemList.push([
      smallKey,
      smallInv[smallKey]
    ])
  }
  
  dispItemList.sort(function(a,b){
    return a[0].localeCompare(b[0]);
  });
  
  var prevSmallKey = $('#invlist li.selected .smallkey').text();
  
  var newItemList = '';
  for( var i = 0; i < dispItemList.length; ++i ) {
    var smallKey = dispItemList[i][0];
    var smallItem = dispItemList[i][1];
    
    var iconPath = itemIconPath(smallItem[0]);
    
    var myClass = '';
    if( smallKey == prevSmallKey ) {
      myClass = 'selected';
      setInvSelection( smallItem[0].guid );
    }
    
    newItemList += '<li class="' + myClass + '"><img class="icon" src="' + iconPath + '" /><span class="info">' + itemText(smallItem[0]) + ' [QTY:' + smallItem.length + ']' + '</span><span class="guid">' + smallItem[0].guid + '</span><span class="smallkey">' + smallKey + '</span></li>';
  }

  $('#invlist').children().remove();
  $('#invlist').append(newItemList);
   
  $('#invlist li').click(function(){
    $('#invlist li.selected').removeClass('selected');
    $(this).addClass('selected');
    setInvSelection($(this).find('.guid').text());
  });
  
  $('#invTotal').text( totalItems );
  
  console.log('Inventory View Update Complete.');
}

function doPasscode( code, done )
{
  nemLog( "Redeeming Code `" + code + "`");
  game.redeemReward(code, function(err, result){
    done();
    
    if( err ) return nemLog( "Redeem Error: " + err);
    
    nemLog( "Reward Base: " + result.apAward + "ap, " + result.xmAward + "xm.");
    for( var i = 0; i < result.inventoryAward.length; ++i ) {
      var itam = result.inventoryAward[i][2];
      nemLog( "Reward Item: " + itemText(itam) );
    }
    
    nemLog( "Redeem Complete." );
  });
}
//ADU34xx,GAH80xx,HZZ7691,FYD46xx,6SNU700
function doReward( )
{
  var i = 100;
  function doOne() {
    doPasscode( '' + i + 'NY3', function(){
      i++;
      doOne();
    });
  }
  doOne();
  //doPasscode(prompt("Enter a passcode!"));
}

var fakePortals = {};
function createFakePortal( entity )
{
  destroyFakePortal( entity );

  var fakePortal = {
    guid: entity.guid,
    title: entity.portalV2.descriptiveText.TITLE + " (" + entity.controllingTeam.team + ")",
    team: entity.controllingTeam.team,
    location: fromLocationE6(entity.locationE6)
  };
  
  fakePortal.dispPortal = new google.maps.Marker({
    position: new google.maps.LatLng(fakePortal.location.lat, fakePortal.location.lng),
    map: map,
    title: fakePortal.title,
    icon: teamFakePortalIcon(fakePortal.team),
    zIndex: 9000,
    clickable: false
  });
  
  fakePortals[fakePortal.guid] = fakePortal;
}
function destroyFakePortal( entity )
{
  var fakePortal = fakePortals[ entity.guid ];
  if( !fakePortal ) return;
  delete fakePortals[ entity.guid ];
  
  if( fakePortal.dispPortal ) {
    fakePortal.dispPortal.setMap(null);
    fakePortal.dispPortal = null;
  }
}

$(document).ready(function(){
  game.onPositionChanged = function() {
    var latlng = new google.maps.LatLng(game.getPlayerLat(),game.getPlayerLng());
    initMap( latlng );
    myMarker.setPosition(latlng);
    myCircle.setCenter(latlng);
  };
  
  game.onPlayerChanged = function() {
    document.title = 'HTML5 Ingress - ' + game.getPlayerName();
    $('#playerName').text( game.getPlayerName() );
    $('#playerAp').text( game.getPlayerEntity().playerPersonal.ap );
    $('#playerLvlAp').text( game.myNextLevelAp() );
    $('#playerLvlPer').text( game.myNextLevelPer() );
    $('#playerLvl').text( game.myLevel() );
    $('#playerCLvl').text( game.getPlayerEntity().playerPersonal.clientLevel );
    $('#playerRCLvl').text( game.myClientLevel() );
    $('#playerXm').text( game.getPlayerEntity().playerPersonal.energy );
    $('#playerMaxXm').text( game.myMaxEnergy() );
    $('#playerXmState').text( game.getPlayerEntity().playerPersonal.energyState );
  };
  
  game.onGlobEntityChanged = function( entity, removed ) {
    if( !viewOptimization ) {
      if( !removed ) {
        entity.dispMarker = new google.maps.Marker({
          position: new google.maps.LatLng(0,0),
          map: map,
          title: "Energy Glob ("+entity.quantity+")",
          icon: 'images/icon_glob.png',
          clickable: false,
          visible: false
        });
        
        game.getGlobLocation( entity, function(lat,lng){
          if( entity.dispMarker ) {
            entity.dispMarker.setPosition(new google.maps.LatLng(lat,lng));
            entity.dispMarker.setVisible(true);
          }
        });
      } else {
        entity.dispMarker.setMap(null);
        entity.dispMarker = null;
      }
    }
  }
  
  var invUpdateTimer = null;
  game.onInvEntityChanged = function( entity, removed ) {
    if( invUpdateTimer ) {
      clearTimeout(invUpdateTimer);
    }
    invUpdateTimer = setTimeout(function(){
      invUpdateTimer = null;
      updateInventoryView();
    }, 100);
  }
  
  game.onGameEntityChanged = function( entity, removed ) {
    updatePortalPanel( );
    
    if( entity.portalV2 ) {
      if( !removed ) {
        destroyFakePortal( entity );
        var location = fromLocationE6(entity.locationE6);
      
        if( !viewOptimization ) {
          entity.dispPortal = new google.maps.Marker({
            position: new google.maps.LatLng(location.lat, location.lng),
            map: map,
            title: entity.portalV2.descriptiveText.TITLE + " (" + entity.controllingTeam.team + ")",
            icon: teamPortalIcon(entity.controllingTeam.team),
            zIndex: 10000
          });
        } else {
          entity.dispPortal = new google.maps.Marker({
            position: new google.maps.LatLng(location.lat, location.lng),
            map: map,
            title: entity.portalV2.descriptiveText.TITLE + " (" + entity.controllingTeam.team + ")",
            icon: teamFakePortalIcon(entity.controllingTeam.team),
            zIndex: 10000
          });
        }
        
        entity.dispRess = [];
        entity.dispResLinks = [];
        
        google.maps.event.addListener(entity.dispPortal, 'click', function(e) {
          setPortalSelection( entity.guid );
        });
        
        if( !viewOptimization ) {
          for( var i = 0; i < entity.resonatorArray.resonators.length; ++i ) {
            var res = entity.resonatorArray.resonators[i];
            if( !res ) continue;
            
            var baseLocation = new LatLon( location.lat, location.lng );    
            var resLocation = baseLocation.destinationPoint( res.slot*-45+90, res.distanceToPortal/1000 );
            
            var resMarker = new google.maps.Marker({
              position: new google.maps.LatLng(resLocation.lat(), resLocation.lon()),
              map: map,
              title: "Resonator " + res.slot + " (Lvl: "+ res.level +", NRG: " + res.energyTotal + "/" + game.resonatorMaxEnergy(res.level) + ")",
              icon: resonatorIcon( res.energyTotal / game.resonatorMaxEnergy(res.level) ),
              zIndex: 5500,
              clickable: false
            });
            
            var resLink = new google.maps.Polyline({
              path: [
                new google.maps.LatLng(location.lat, location.lng),
                new google.maps.LatLng(resLocation.lat(), resLocation.lon())
              ],
              clickable: false,
              strokeColor: '#000000',
              strokeOpacity: 0.4,
              strokeWeight: 1,
              zIndex: 5000
            });
            resLink.setMap(map);
            
            entity.dispRess.push(resMarker);
            entity.dispResLinks.push(resLink);
          }
        }
      } else {
        if( entity.dispPortal ) {
          entity.dispPortal.setMap(null);
          entity.dispPortal = null;
        }
        if( entity.dispRess ) {
          for( var i = 0; i < entity.dispRess.length; ++i ) {
            entity.dispRess[i].setMap(null);
          }
          entity.dispRess = null;
        }
        if( entity.dispResLinks ) {
          for( var i = 0; i < entity.dispResLinks.length; ++i ) {
            entity.dispResLinks[i].setMap(null);
          }
          entity.dispResLinks = null;
        }
        createFakePortal( entity );
      }
    } else if( entity.edge ) {
      if( !removed ) {
        var originLocation = fromLocationE6(entity.edge.originPortalLocation);
        var destinationLocation = fromLocationE6(entity.edge.destinationPortalLocation);
       
        entity.dispEdge = new google.maps.Polyline({
          path: [
            new google.maps.LatLng(originLocation.lat,originLocation.lng),
            new google.maps.LatLng(destinationLocation.lat,destinationLocation.lng)
          ],
          clickable: false,
          strokeColor: teamColor(entity.controllingTeam.team),
          strokeOpacity: 0.7,
          strokeWeight: 2,
          zIndex: -10000
        });
        entity.dispEdge.setMap(map);
      } else {
        if( entity.dispEdge ) {
          entity.dispEdge.setMap(null);
          entity.dispEdge = null;
        }
      }
    } else if( entity.capturedRegion ) {
      if( !viewOptimization ) {
        if( !removed ) {
          var vertexA = fromLocationE6(entity.capturedRegion.vertexA.location);
          var vertexB = fromLocationE6(entity.capturedRegion.vertexB.location);
          var vertexC = fromLocationE6(entity.capturedRegion.vertexC.location);
          
          entity.dispField = new google.maps.Polygon({
            paths: [
              new google.maps.LatLng(vertexA.lat,vertexA.lng),
              new google.maps.LatLng(vertexB.lat,vertexB.lng),
              new google.maps.LatLng(vertexC.lat,vertexC.lng)
            ],
            strokeOpacity: 0.0,
            fillColor: teamColor(entity.controllingTeam.team),
            fillOpacity: 0.10,
            clickable: false,
            zIndex: -10000
          });
          entity.dispField.setMap(map);
        } else {
          if( entity.dispField ) {
            entity.dispField.setMap(null);
            entity.dispField = null;
          }
        }
      }
    } else {
      if( !viewOptimization ) {
        if( !removed ) {
          var location = fromLocationE6(entity.locationE6);
        
          entity.dispItem = new google.maps.Marker({
            position: new google.maps.LatLng(location.lat, location.lng),
            map: map,
            title: "Item - " + itemText(entity),
            icon: iconGroundItem,
            zIndex: 10000
          });
          
          google.maps.event.addListener(entity.dispItem, 'click', function(e) {
            pickupItem( entity.guid );
          });
        } else {
          if( entity.dispItem ) {
            entity.dispItem.setMap(null);
            entity.dispItem = null;
          }
        }
      }
    }
  }
  
  $('#reward').click(function(){doReward();});
  $('#actgatherxm').click(function(){doGatherXm();});
  $('#actgatheritems').click(function(){doGatherItems();});
  $('#actstartbot').click(function(){startBot();});
  $('#actrrecharge').click(function(){DoActRRecharge();});
  $('#actrecharge').click(function(){doActRecharge();});
  $('#actfire').click(function(){doActFire();});
  $('#actfirex').click(function(){doActFireX();});
  $('#actdrop').click(function(){doActDrop();});
  $('#actdropx').click(function(){doActDropX();});
  $('#acthack').click(function(){doActHack();});
  $('#actlink').click(function(){doActLink();});
  $('#actaddshield1').click(function(){doActAddShield(0);});
  $('#actaddshield2').click(function(){doActAddShield(1);});
  $('#actaddshield3').click(function(){doActAddShield(2);});
  $('#actaddshield4').click(function(){doActAddShield(3);});
  $('#actdeploye').click(function(){doActDeploy(0);});
  $('#actdeployne').click(function(){doActDeploy(1);});
  $('#actdeployn').click(function(){doActDeploy(2);});
  $('#actdeploynw').click(function(){doActDeploy(3);});
  $('#actdeployw').click(function(){doActDeploy(4);});
  $('#actdeploysw').click(function(){doActDeploy(5);});
  $('#actdeploys').click(function(){doActDeploy(6);});
  $('#actdeployse').click(function(){doActDeploy(7);});
  $('#actupgradee').click(function(){doActUpgrade(0);});
  $('#actupgradene').click(function(){doActUpgrade(1);});
  $('#actupgraden').click(function(){doActUpgrade(2);});
  $('#actupgradenw').click(function(){doActUpgrade(3);});
  $('#actupgradew').click(function(){doActUpgrade(4);});
  $('#actupgradesw').click(function(){doActUpgrade(5);});
  $('#actupgrades').click(function(){doActUpgrade(6);});
  $('#actupgradese').click(function(){doActUpgrade(7);});
  setInvSelection(null);
  setPortalSelection(null);  
  
  function handleLogin( email, password, authToken )
  {
    viewOptimization = $('#simple_mode').is(':checked');
    
    nemLog( 'Logging in...' );
    $('#loginform').hide();
    
    game.login( email, password, authToken, function(err){
      if( err ) return console.log('Error: ' + err); 
      
      nemLog( 'Logged in.' );
      $('#uiblocker').hide();
     
      var startLocation = [ 46.11888201136747,-64.74869728088379 ];
      game.setPosition( startLocation[0], startLocation[1] );
      
      /* Lets not waste bandwidth now...
      setInterval(function(){
        game.updateMyRegion(function(){});
      }, 10000);
      */
     
      nemLog( 'Updating Region...' );
      game.updateRegion( startLocation[0], startLocation[1], function(err) {
        nemLog( 'Region Loaded!' );
      });
      
      nemLog( 'Loading Inventory...' );
      game.loadInventory(function(err) {
        nemLog( 'Inventory Loaded!' );
      });
      
      $('#actstartbot').attr('disabled','disabled');
      prepareBot(function(){
        $('#actstartbot').removeAttr('disabled');
      });
    });
  }
  
  $('#actuplogin').click(function(){
    handleLogin( $('#login_username').val(), $('#login_password').val(), null );
  });
  $('#actauthlogin').click(function(){
    handleLogin( null, null, $('#login_authtoken').val() );
  });
  
  $('#actceriuslogin').click(function(){
    handleLogin( null, null, 'DQAAAMMAAAD6ySlixAyFt2zwKY7bwIT4X5m4MYScUc1PYyMLKHuJz3oJncvLoUuV_8RqJMTNmi9pq87pVwB_RVIX60TqqrXWeq4hrDZnvEaTMqRLm6ARagn6hSuJi28hFt8DRIII0kN10DYqhgBb3vPMnLfoOna--hw47TYUGYmjPMNLpiPE2j1AfPY8oslQ2LMzT-umP-qCuo786VpSclAQFMWqotQu-kKwyJBtZ6NoQLOirJkyyyO3PP1iESXn6lNS-6yqAXfK_6Zy755hQQN_5psnQ5ZA', null );
  });
  $('#actvulpixlogin').click(function(){
    handleLogin( null, null, 'DQAAAMIAAACkxwdmleP8IvVm8-OvaKkEZ1Qdfwc1-6uGrvRihGtJzIGRFBoWwJrvZd5GbrSTI4EiR7SF7qHpLNIidJ4svoHFtQAlUkmyf_5MTZfo9_DqmUMK_4D6SNBGKprL5LdrPpNwyetCvN-OGyqaoAop-OfPeT10fxbd9c4OCbLqzRxq7lrIt9SkuPyBsH3sWgQ_Opu6Ric6ArR77jQM2MSuHFFInUivD24pB95N1BJhvZHaACsCu_76wgD0knGXLyhU5CVy9JAF21N7G2oED4HfQAGU' );
  });
  $('#actcontestedlogin').click(function(){
    handleLogin( null, null, 'DQAAAMsAAACy-i3nes19QjBg7xUYyEI5n5vrvP5Jp_mV8kb0I9AtCNBJ0YDR_yrK-CGgEqntZuTcx-u_HQdEQ4LBPe1c2Zgpw8T8k8tDsMuxcTNF8Po4a4AKLTZS8W_WRvFxxJXhXIkiVEFEBF4pl-nw-DjSOlxNMJ3PMvCKSQQacr1ERwvCIfCSdkmposWpGX09XxojNsJncdJT6usvr6uar0qWAdFECnzNfVFXemED0v5aLYUMRl7m3NrqK5cHt9xjXG578gqNcINzux6qmGGsqdh2pMWr' );
  });
  $('#actbeliviouslogin').click(function(){
    handleLogin( null, null, 'DQAAAL0AAADHLy0pH850TwKGgSc9Q7vrFZwT15kZLa5r-ZGsqoUIuZ_92C9RMUSul1qK3kAx9dz5cZQSXnQJFV8_wR4QbEtMlSR-NNsmVFgwi7h5l8iJJkTAPrF8Kcc-iUz3X4aQ4vZv0LBu4TLVW2rc7ycq8-qusOjW-ILmXeWj0IspeDdU9c2XGyBP-AlOXfoY5q-tvVCgwP50e_VJAYimsz1hGfNcVfJ3b0orMqgM-ple-tTxIrXL_wvDlFyrlQEfUzemJBE' );
  });
  $('#actshampowlogin').click(function(){
    handleLogin( null, null, 'DQAAALYAAAABQqaBEA9ZZXEDqOdvUF4HnsCwFVmjVxcCHJ6Av-fyZvRcYcMyBtn4kBPoTDdLkEJZNux-andOerDWFcyaKN19_DnDBSloZcPcKX4PKtBa1tAy2vV8nSUrNA8FYhpE8YED0WPIINt5SQ6VLwWzkAEzLim0fi4UWFAyuTS57VvuD-mEszTmSH5QMDYOhVCYmURD2X4DerELAVyyiaPpACBOVIiC4KePw6ADZ1vKz5bSi8MAUMsbCdE9pVp2_fbPS-s' );
  });
});



var botPoisMoncton = [
  [46.11179981923307,-64.77399319410324, "Elmwood Post Office" ],
  [46.10893433141679,-64.7776772081852, "Elmwood Fire Station" ],
  [46.10401932893482,-64.78566080331802, "University Pavillion" ],
  [46.09744857118731,-64.77715820074081, "StGeorge Fire Station" ],
  [46.09432751244513,-64.77451622486115, "Meeting House" ],
  [46.09422056004332,-64.74873080849648, "Dieppe Library" ],
  [46.09312777361673,-64.75562810897827, "Circle K Post Office" ],
  [46.08860573271043,-64.77489709854126, "Moncton Library" ],
  [46.087586315637715,-64.78146851062775, "Subway"],
  [46.060795683949884,-64.804025888443, "Riverview South"],
  [46.0613577546152,-64.80435311794281, "Riverview North"],
  [46.0751025095715,-64.82082188129425, "Monroe" ],
  [46.08446469874761,-64.81414318084717, "St.G Fire Station"],
  [46.098121863436816,-64.80655252933502, "Brandon St Fire Station"],
  [46.11247107680124,-64.84651744365692, "Hildegard Fire Station" ],
  [46.13672569352835,-64.90158319473267, "Lutz Mountain" ]
];
var botPoisOuterMoncton = [
  [46.274157785498886,-64.58143472671509, "Shediac Bridge" ],
  [46.07120702116117,-64.10993725061417, "Port Elgin Fire North"],
  [46.052055865693745,-64.07971411943436, "Port Elgin Fire South"],
  [45.83370883469037,-64.21322375535965, "Amherst Statues"],
  [45.828477787163095,-64.2016875743866, "Amherst Museum"],
  [45.826877911685074,-64.20828312635422, "Amherst Fire Station"],
  [45.86398841115963,-64.29401725530624, "Aulac"],
  [45.896433723701364,-64.36670243740082, "Sackville Struts Center"],
  [45.89653452559692,-64.3692398071289, "Sackville Public Library"],
  [45.895756106209696,-64.3699398636818, "Sackville Post Office"],
  [45.89132618815698,-64.37085449695587, "Sackville Heritage Center"],
  [45.90113388409296,-64.51680421829224, "Dorchester Museum"],
  [45.895821441589746,-64.5197868347168, "Dorchester Library"],
  [45.91229703665273,-64.6384584903717, "Hills Library"],
  [45.923067058925994,-64.64579701423645, "Hills Museum"],
  [45.925065303262066,-64.6438980102539, "Hills William House"],
  [45.92807652710994,-64.6494609117508, "Hills Railroad"],
  [45.97438101250328,-64.56548631191254, "Memeramcook Historic"],
  [45.97641562005088,-64.56577330827713, "Memeramcook Library"]
];
var botPoisMontreal = [
  [45.523089430340846,-73.59286308288574 , ""],
  [45.519101596808646,-73.58346998691559 , ""],
  [45.51866558655805,-73.58161926269531 , ""],
  [45.51620356872607,-73.57766032218933 ,""],
  [45.51703803569278,-73.56769323348999 , ""],
  [45.51524504410202,-73.56247901916504 , ""],
  [45.51414741938225,-73.5613203048706 ,""],
  [45.52011079722964,-73.5551968216896 , ""],
  [45.521811550276595,-73.5530698299408 ,""],
  [45.518436303950104,-73.55182528495789 ,""],
  [45.51254229263565,-73.55370819568634 ,""],
  [45.51039578696671,-73.55338901281357 ,""],
  [45.50965332505795,-73.55103671550751  ,""],
  [45.50891837210509,-73.55346143245697 ,""],
  [45.50833942542602,-73.55417758226395 ,""],
  [45.50263610645638,-73.55384767055511 ,""],
  [45.502177409688876,-73.55491518974304 ,""],
  [45.500158347522095,-73.5532683134079 ,""],
  [45.50107201032088,-73.55564475059509 ,""],
  [45.502079654156965,-73.5608160495758 ,""],
  [45.50171494932855,-73.56162071228027 ,""],
  [45.501132168668036,-73.56237173080444 ,""],
  [45.497970008440056,-73.56571912765503 ,""],
  [45.49636066013692,-73.56872320175171 ,""],
  [45.49598087731097,-73.57076704502106 ,""],
  [45.49842121933467,-73.56889486312866 ,""],
  [45.49880850580225,-73.5696941614151 ,""],
  [45.49956051075269,-73.57076704502106 ,""],
  [45.49943267061969,-73.57164680957794 ,""],
  [45.5017036697601,-73.57621729373932 ,""],
  [45.503914421989606,-73.57495129108429 ,""],
  [45.504222717273876,-73.57371211051941 ,""],
  [45.5042001591396,-73.57275187969208, ""],
  [45.50708376736076,-73.56982290744781, ""],
  [45.51221900630021,-73.5688465833664 , ""],
  [45.51351214049979,-73.57719093561172 , ""],
  [45.51467743947122,-73.58508467674255 ,""]
];
var botPoisAmherst = [
  [45.89653452559692,-64.3692398071289 ], //Sackville Public Library
  [45.895756106209696,-64.3699398636818 ], //Sackville Post Office
  [45.89132618815698,-64.37085449695587 ], //Sackville Heritage Center
  [45.896433723701364,-64.36670243740082 ], //Sackville Struts Center
  [45.83370883469037,-64.21322375535965 ], //Amherst Statues
  [45.828477787163095,-64.2016875743866 ], //Amherst Museum
  [45.826877911685074,-64.20828312635422 ] //Amherst Fire Station
];
var botPoisHalifax = [
  [44.648036279240884,-63.57534348964691, "Sports Hall of Fame" ],
  [44.64886444213166,-63.575241565704346, "Departement of Agriculture"],
  [44.650181082291816,-63.571902215480804, "Nathan Green Square"],
  [44.64955520489916,-63.571770787239075, "Halifax Ferry Terminal" ],
  [44.64907338919577,-63.572232127189636, "Nova Scotian Crystal" ],
  [44.64864261394536,-63.572975769639015, "Conserve Nova Scotia" ],
  [44.648077306021904,-63.57305824756622, "Nova Scotia Dept of Finance" ],
  [44.64745999301751,-63.57331842184067, "Nova Scotia Sports Heritage" ],
  [44.64657837851064,-63.573734164237976, "Center for Arts Tapes" ],
  [44.64597154515536,-63.57345521450043, "Eye Level Gallery" ],
  [44.64715467349288,-63.57191026210785, "Museum of Industry" ],
  [44.64760883570309,-63.57139527797699, "HMCS Sackville" ],
  [44.64677015943008,-63.57093930244446, "Halifax, Nova Scotia - Sailor Statue" ],
  [44.647269168502945,-63.57032507658005, "Halifax Waterfront Playground" ],
  [44.646796875129745,-63.57006087899208, "Museum of the Atlantic" ],
  [44.6438036861035,-63.56865406036377, "Mermaid Statue" ],
  [44.64112619202914,-63.56666386127472, "Samuel Cunard Statue" ],
  [44.63875012267429,-63.56571167707443, "Mary E Black Gallery" ],
  [44.63824340613963,-63.56545686721802, "Canadian Museum of Integration" ],
  [44.63984560770313,-63.56955528259277, "Cornwallis Park" ],
  [44.643563231956975,-63.57221066951752, "Welsford Parker Memorial" ],
  [44.64400978886442,-63.5745495557785, "Memorial Library"],
  [44.64728061799153,-63.58055770397186, "Citadel Hill"],
  [44.64726153550931,-63.58465075492859, "Citadel High School"],
  [44.64550592028923,-63.585251569747925, "Sutherland Steam"],
  [44.64458038435501,-63.58506917953491, "Heritage Divison"],
  [44.642620489419635,-63.5788357257843, "Office of Ombudsman"],
  [44.64103649479273,-63.57913613319397, "Sir Walter Scott"],
  [44.63766988547646,-63.57495725154877, "Post Office" ],
  [44.63130256648321,-63.582099974155426, "Saint Mary's Uni" ],
  [44.639037355505614,-63.588554710149765, "Camus Productions"],
  [44.63652091854213,-63.59208583831787, "DAL"],
  [44.63527267951139,-63.59564244747162, "Thomas Museum" ],
  [44.63804014572116,-63.60386610031128, "St. Marys Boat Club"], 
  [44.64068152139048,-63.594473004341125, "Royal NS Museum"],
  [44.648414106173895,-63.593176156282425, "A L Arbic Consulting"],
  [44.65342866689854,-63.58416795730591, "Lawrence House"],
  [44.65450670266549,-63.585613667964935, "Halifax Public Libraries"],
  [44.65898462963728,-63.593518137931824, "Maritime Command Museum"],
  [44.66974016254162,-63.57749730348587, "MacDonald Bridge Memorial"],
  [44.67107921831751,-63.57574850320816, "Metro Transit Bridge Terminal"],
  [44.67176017925971,-63.57184857130051, "Dartmouth High"],
  [44.668931373127144,-63.57531130313873, "Dartmouth Sportsplex"],
  [44.66640574108456,-63.56718957424164, "Dartmouth Post Office"],
  [44.666684252735465,-63.55992078781128, "Evergreen Green House"]
];
var botRPois = {
  "moncton": botPoisMoncton,
  "outermoncton": botPoisOuterMoncton,
  "montreal": botPoisMontreal,
  "amherst": botPoisAmherst,
  "halifax": botPoisHalifax
};

//var botPois = [];
var botPois = botPoisMoncton;
//var botPois = botPoisHalifax;
//var botPois = botPoisMontreal;


var botCurPoi = 0;

function hackLocalPortals( done )
{
  var gameEntities = game.getGameEntities( );
  var localPortals = [];
  
  for( var guid in gameEntities ) {
    var entity = gameEntities[guid];
    if( !entity.portalV2 ) continue;
    
    var location = fromLocationE6( entity.locationE6 );
    var distance = _distanceTo( location.lat, location.lng );
    if( distance < game.myActionRange() ) {
      localPortals.push( entity );
    }
  }
  
  var portalIdx = 0;
  function _hackOne( )
  {
    if( portalIdx >= localPortals.length ) {
      done(null);
      return;
    }
    var portal = localPortals[portalIdx];

    setPortalSelection( portal.guid );
    nemLog( "BOT: Hacking portal " + selectedPortalGuid );
    
    // Skip actual hack for now
    /*
    nemLog( "BOT: Next portal!" );
    portalIdx++;
    _hackOne();
    return;
    */
   
    var orgEnergy = game.getPlayerEntity().playerPersonal.energy;
    if( orgEnergy <= 0 ) {
      nemLog("BOT: Portal Hack Error: No Energy");
      return;
    }
    
    actHack(function(err,addedGuids) {
      if( err ) {
        nemLog( "BOT: Portal Hack Error: " + err);
      } else {
        for( var i = 0; i < addedGuids.length; ++i ) {
          nemLog( "BOT: Hack Item: " + itemText(game.getInvEntity(addedGuids[i])) );
        }
        nemLog( "BOT: Portal Hack Complete." );
      }
      
      if( !err && game.getPlayerEntity().playerPersonal.energy == orgEnergy ) {
        nemLog( "BOT: Portal Hack Error: No Energy Consumed" );
      } else {
        portalIdx++;
      }
      
      if( portalIdx >= localPortals.length ) {
        // No Portal, Go Immediate
        _hackOne();
      } else {
        // Portal, wait a few seconds for safety
        nemLog( "BOT: Next portal! (Waiting First)" );
        setTimeout( _hackOne, 4000 );
      }
    });
  }
  _hackOne( );
}

function stepBot( )
{
  var botPoi = botPois[botCurPoi];
  
  var fakeGatherEnergy = function(done){done(null);};
  
  nemLog( "BOT: Moving to waypoint..." );
  game.movePosition( botPoi[0], botPoi[1], function(err) {
    nemLog( "BOT: Moved to waypoint." );
    
    nemLog( 'BOT: Updating region...' );
    game.updateRegion( botPoi[0], botPoi[1], function(err) {
      nemLog( 'BOT: Region updated.' );
      
      nemLog( "BOT: Gathering Energy..." );
      game.gatherEnergy(function(err){
        nemLog( "BOT: Gathered Energy." );
        
        nemLog( "BOT: Hacking Portals..." );
        hackLocalPortals( function(err){
          nemLog( "BOT: Hacked Portals..." );
          
          nemLog( "BOT: Next Waypoint!" );
          botCurPoi++;
          if( botCurPoi >= botPois.length ) botCurPoi = 0;
          stepBot();
        });
      });
    });
  });
}

function startBot( )
{
  var poiNameList = '';
  for( var i in botRPois ) {
    if(poiNameList!='') poiNameList += ',';
    poiNameList += i;
  }
  
  var newName = prompt("Please enter the name of the area you want to bot (" + poiNameList + ")", "");
  if( !newName ) return;
  newName = newName.toLowerCase();
  
  botPois = botRPois[newName];
  if( !botPois ) {
    nemLog("Bad name entered.");
  }
  
  botCurPoi = 0;
  stepBot( );
}

function _addPoiMarker( lat, lng, title )
{
    var waypMarker = new google.maps.Marker({
      position: new google.maps.LatLng(lat,lng),
      map: map,
      icon: 'images/icon_waypoint.png',
      title: title
    });
}

function _addPoiPath( startLat, startLng, endLat, endLng, color )
{
  var resPath = new google.maps.Polyline({
    path: [
      new google.maps.LatLng(startLat, startLng),
      new google.maps.LatLng(endLat, endLng)
    ],
    strokeColor: color,
    strokeOpacity: 0.4,
    strokeWeight: 4,
    clickable: false,
    icons: [{
      icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
      offset: '100%'
    }]
  });
  resPath.setMap(map);
}

function prepareBot( done ) 
{
  var prevPoi = null;
  var totalRouteTime = 0;
  for( var j in botRPois )
  {
    var botLastPoi = botRPois[j][botRPois[j].length-1];
    for( var i = 0; i < botRPois[j].length; ++i )
    {
      var botPoi = botRPois[j][i];
      
      // about 7 seconds average to hack a portal
      //totalRouteTime += 6;
      
      _addPoiMarker( botPoi[0], botPoi[1], "Waypoint " + i + " (" + botPoi[2] + ")" );
      if( prevPoi ) {
        _addPoiPath( prevPoi[0], prevPoi[1], botPoi[0], botPoi[1], '#FF0000' );
        totalRouteTime += game.moveTimeRequired( prevPoi[0], prevPoi[1], botPoi[0], botPoi[1] );
      } else {
        totalRouteTime += game.moveTimeRequired( botLastPoi[0], botLastPoi[1], botPoi[0], botPoi[1] );
        _addPoiPath( botLastPoi[0], botLastPoi[1], botPoi[0], botPoi[1], '#00FF00' );
      }
      
      prevPoi = botPoi;
      
    }
    
    secondsPerPortal = totalRouteTime / botRPois[j].length;
    nemLog( "Route `"+j+"` travel time is " + timeFormat(totalRouteTime) + " (" + (botRPois[j].length) + " portals at " + Math.floor(secondsPerPortal) + " seconds per portal)");
    
    prevPoi = null;
    totalRouteTime = 0;
  }

  done();
}



