/**
 * @author kozakluke@gmail.com
 * @extends {Actor}
 * @constructor
 */
function Bullet(world)
{
    Actor.call(this, world, TextureUtil.fromFrame('bullet'));
    //public
    this.body = null;
    
    var fixDef = new b2FixtureDef();
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(this.width  * 0.5 / Main.meter,
                          this.height * 0.5 / Main.meter);
    fixDef.friction    = 0.0;
    fixDef.restitution = 1.0;
    fixDef.density     = 1.0;
    
    var bodyDef = new b2BodyDef();
    bodyDef.userData      = this;
    bodyDef.fixedRotation = true;
    bodyDef.bullet        = true;
    bodyDef.type          = b2Body.b2_staticBody;
    
    var body = this.body = world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);
    
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
}

Bullet.prototype = Object.create(Actor.prototype);
Bullet.prototype.constructor = Ball;

Bullet.prototype.setPosition = function(x, y)
{
    var v = new b2Vec2();
    v.Set(x / Main.meter, y / Main.meter);
    this.body.SetPosition(v);
    
    this.position.x = x;
    this.position.y = y;
};
