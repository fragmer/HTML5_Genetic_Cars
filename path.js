/* ========================================================================= */
/* ==== Floor ============================================================== */

function cw_createFloor() {
  var last_tile = null;
  var tile_position = new b2Vec2(-5,0);
  cw_floorTiles = new Array();
  Math.seedrandom(floorseed);

  // keep old impossible tracks if not using mutable floors
  // if path is mutable over races, create smoother tracks
  var roughness = (mutable_floor ? 1.2 : 1.5);

  for(var k = 0; k < maxFloorTiles; k++) {
    var angle = (Math.random()*3 - 1.5) * roughness*k/maxFloorTiles;

    // when approaching the upper or lower edge of the minimap (h=35 or -35),
    // bias the angle by 5% to lean towards h=0, to avoid the terrain going off-screen
    var angle_bias = (tile_position.y/35);
    angle -= angle_bias*angle_bias*sign(angle_bias)/20;

    last_tile = cw_createFloorTile(tile_position, angle);
    cw_floorTiles.push(last_tile);
    last_fixture = last_tile.GetFixtureList();
    last_world_coords = last_tile.GetWorldPoint(last_fixture.GetShape().m_vertices[3]);
    tile_position = last_world_coords;
  }
}

function sign(x) {
  x = +x // convert to a number
  if (x === 0 || isNaN(x))
    return x
  return x > 0 ? 1 : -1
}


function cw_createFloorTile(position, angle) {
  // Cap the angle to +/-(PI/2) to avoid impossible slopes
  angle = Math.max(Math.min(angle, 1.5), -Math.PI/2);
  body_def = new b2BodyDef();

  body_def.position.Set(position.x, position.y);
  var body = world.CreateBody(body_def);
  fix_def = new b2FixtureDef();
  fix_def.shape = new b2PolygonShape();
  fix_def.friction = 0.5;

  var coords = new Array();
  coords.push(new b2Vec2(0,0));
  coords.push(new b2Vec2(0,-groundPieceHeight));
  coords.push(new b2Vec2(groundPieceWidth,-groundPieceHeight));
  coords.push(new b2Vec2(groundPieceWidth,0));

  var center = new b2Vec2(0,0);

  var newcoords = cw_rotateFloorTile(coords, center, angle);

  fix_def.shape.SetAsArray(newcoords);

  body.CreateFixture(fix_def);
  return body;
}

function cw_rotateFloorTile(coords, center, angle) {
  var newcoords = new Array();
  for(var k = 0; k < coords.length; k++) {
    nc = new Object();
    nc.x = Math.cos(angle)*(coords[k].x - center.x) - Math.sin(angle)*(coords[k].y - center.y) + center.x;
    nc.y = Math.sin(angle)*(coords[k].x - center.x) + Math.cos(angle)*(coords[k].y - center.y) + center.y;
    newcoords.push(nc);
  }
  return newcoords;
}

/* ==== END Floor ========================================================== */
/* ========================================================================= */


function cw_drawFloor() {
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#666";
  ctx.lineWidth = 1/zoom;
  ctx.beginPath();

  outer_loop:
  for(var k = Math.max(0,last_drawn_tile-20); k < cw_floorTiles.length; k++) {
    var b = cw_floorTiles[k];
    for (f = b.GetFixtureList(); f; f = f.m_next) {
      var s = f.GetShape();
      var shapePosition = b.GetWorldPoint(s.m_vertices[0]).x;
      if((shapePosition > (camera_x - 5)) && (shapePosition < (camera_x + 10))) {
        cw_drawVirtualPoly(b, s.m_vertices, s.m_vertexCount);
      }
      if(shapePosition > camera_x + 10) {
        last_drawn_tile = k;
        break outer_loop;
      }
    }
  }
  ctx.fill();
  ctx.stroke();
}
