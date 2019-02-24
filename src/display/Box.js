/**
 * @author kozakluke@gmail.com
 */
Box.fixDef = new Box2D.Dynamics.b2FixtureDef();
Box.fixDef.shape   = new Box2D.Collision.Shapes.b2PolygonShape();
Box.fixDef.density = 2;

Box.bodyDef = new Box2D.Dynamics.b2BodyDef();

/**
 * @extends {Actor}
 * @constructor
 */
function Box(world)
{
    Actor.call(this, world, TextureUtil.fromFrame('box'));
    //public
    this.origin = new PIXI.Point();
    this.body   = null;
    
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    
    Box.fixDef.shape.SetAsBox(this.width  * 0.5 / Main.meter,
                              this.height * 0.5 / Main.meter);
    
    Box.bodyDef.type     = b2Body.b2_dynamicBody;
    Box.bodyDef.userData = this;
    
    var body = this.body = world.CreateBody(Box.bodyDef);
    body.CreateFixture(Box.fixDef);
}

Box.prototype = Object.create(Actor.prototype);
Box.prototype.constructor = Box;

Box.prototype.setPosition = function(x, y)
{
    var v = new b2Vec2();
    v.Set(x / Main.meter, y / Main.meter);
    this.body.SetPosition(v);
    
    this.position.x = x;
    this.position.y = y;
};
