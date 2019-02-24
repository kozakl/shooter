/**
 * @author kozakluke@gmail.com
 * @extends {Container}
 * @constructor
 */
function Content(world)
{
    PIXI.Container.call(this);
    //args
    this.world  = world;
    //public
    //protected private
    this.gun    = null; 
    this.bullet = null;
    this.target = null;
    
    var bg = new PIXI.Sprite(TextureUtil.fromFrame('bg'));
    this.addChild(bg);
    
    this.createBorder(983, 617);
    this.createBoxes();
    
    var bullet = this.bullet = new Bullet(this.world);
    this.addChild(bullet);
    
    var gun = this.gun = new PIXI.Sprite(TextureUtil.fromFrame('gun'));
    this.addChild(gun);
    gun.anchor.y = 0.5;
    gun.position.x = 100;
    gun.position.y = 425;
    
    var target = this.target = new PIXI.Sprite(TextureUtil.fromFrame('target'));
    this.addChild(target);
    target.anchor.x = 0.5;
    target.anchor.y = 0.5;
    
    
    this.currentRayAngle = 0;
    this.input = new b2RayCastInput();
    this.output = new b2RayCastOutput();
    this.b = new b2BodyDef();
    this.f = new b2FixtureDef();
    this.closestFraction = 1;
    this.intersectionNormal = new b2Vec2(0,0);
    this.intersectionPoint = new b2Vec2();
    this.rayLength = 25; //long enough to hit the walls
    this.p1 = new b2Vec2( 11, 7 ); //center of scene
    this.p2 = new b2Vec2();
    this.normalEnd = new b2Vec2();
    
    var shape = this.shape = new PIXI.Graphics();
    this.addChild(shape);
    
    this.width  = bg.width;
    this.height = bg.height;
}

Content.prototype = Object.create(PIXI.Container.prototype);
Content.prototype.constructor = Content;

Object.defineProperties(Content.prototype, {
    width: {
        set: function(value) {
            this._width = value;
        },
        get: function() {
            return this._width;
        }
    },
    height: {
        set: function(value) {
            this._height = value;
        },
        get: function() {
            return this._height;
        }
    }
});

Content.prototype.updateBegin = function()
{
    this.isBegin = true;
};

Content.prototype.updateEnd = function()
{
    if (this.isBegin)
    {
        this.isBegin  = false;
        this.bullet.body.SetType(b2Body.b2_staticBody);
        
        
        var pos = new b2Vec2((this.gun.position.x + Math.cos(this.gun.rotation - 15 * MathUtil.RADIANS) * 90) / Main.meter,
                             (this.gun.position.y + Math.sin(this.gun.rotation - 15 * MathUtil.RADIANS) * 90) / Main.meter);
        this.bullet.body.SetPosition(pos);
        this.bullet.body.SetAngle(this.gun.rotation);
        this.bullet.body.SetType(b2Body.b2_dynamicBody);
        
        
        var dx = this.target.position.x - this.gun.position.x;
        var dy = this.target.position.y - this.gun.position.y;
        var dir = new b2Vec2();
        dir.Set(dx, dy);
        dir.Normalize();
        
        var impulse = new b2Vec2();
        impulse.Set(dir.x, dir.y);
        impulse.Multiply(32);
        
        this.bullet.body.SetAwake(true);
        this.bullet.body.SetLinearVelocity(impulse);
    }
};

Content.prototype.updateMove = function(event)
{
    this.target.position.x = (event.x - this.x) / this.scale.x;
    this.target.position.y = (event.y - this.y) / this.scale.y;
    if (this.target.position.x < this.target.width * 0.5)
        this.target.position.x = this.target.width * 0.5;
    else if (this.target.position.x > this._width - this.target.width * 0.5)
        this.target.position.x = this._width - this.target.width * 0.5;
    if (this.target.position.y < this.target.height * 0.5)
        this.target.position.y = this.target.height * 0.5;
    else if (this.target.position.y > this._height - this.target.height * 0.5)
        this.target.position.y = this._height - this.target.height * 0.5;
    
    var rot = Math.atan2(this.target.position.y - this.gun.position.y,
                         this.target.position.x - this.gun.position.x);
    this.gun.rotation = rot + 15 * MathUtil.RADIANS;
};

/**
 * @private
 */
Content.prototype.createBorder = function(width, height)
{
    var fixDef = new b2FixtureDef();
    fixDef.shape = new b2PolygonShape();
    
    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_staticBody;
    
    var body = this.world.CreateBody(bodyDef);
    
    //top
    fixDef.shape.SetAsOrientedBox(width * 0.5 / Main.meter,
                                  20     * 0.5 / Main.meter, new b2Vec2(width * 0.5 / Main.meter,
                                                                       0));
    body.CreateFixture(fixDef);
    
    //down
    fixDef.shape.SetAsOrientedBox(width * 0.5 / Main.meter,
                                  20     * 0.5 / Main.meter, new b2Vec2(width * 0.5 / Main.meter,
                                                                       height      / Main.meter));
    body.CreateFixture(fixDef);
    
    //left
    fixDef.shape.SetAsOrientedBox(20 * 0.5 / Main.meter,
                                  height  / Main.meter, new b2Vec2());
    body.CreateFixture(fixDef);
    
    //right
    fixDef.shape.SetAsOrientedBox(20 * 0.5 / Main.meter,
                                  height  / Main.meter, new b2Vec2(width / Main.meter));
    body.CreateFixture(fixDef);
};

/**
 * @private
 */
Content.prototype.createBoxes = function()
{
    for (var i = 0; i < 5; ++i)
    {
        var box = new Box(this.world);
        this.addChild(box);
        box.setPosition(960    - 350 - i * 10 ,
                        500   - 50 - i * 10);
        box.origin.x = box.position.x;
        box.origin.y = box.position.y;
        
        //this.boxes.push(box);
    }
};

/**
 * @private
 */
Content.prototype.updateTransform = function()
{
    
    
    
    //in Step() function
    var k = 360/20;
    var t = k/60;
    var DEGTORAD = Math.PI/180;
    this.currentRayAngle += t * DEGTORAD; //one revolution every 20 seconds
    //console.log(currentRayAngle*(180/Math.PI));

    //calculate points of ray
    this.p2.x = this.p1.x + this.rayLength * Math.sin(this.currentRayAngle);
    this.p2.y = this.p1.y + this.rayLength * Math.cos(this.currentRayAngle);

    
    this.input.p1 = this.p1;
    this.input.p2 = this.p2;
    this.input.maxFraction = 1;
    this.closestFraction = 1;

    var b = new b2BodyDef();
    var f = new b2FixtureDef();
    for(b = this.world.GetBodyList(); b; b = b.GetNext())    {           
        for(f = b.GetFixtureList(); f; f = f.GetNext()) {
            if(!f.RayCast(this.output, this.input))
                continue;
            else if(this.output.fraction < this.closestFraction)  {
                this.closestFraction = this.output.fraction;
                            this.intersectionNormal = this.output.normal;
            }
        }

    }
    this.intersectionPoint.x = this.p1.x + this.closestFraction * (this.p2.x - this.p1.x);
    this.intersectionPoint.y = this.p1.y + this.closestFraction * (this.p2.y - this.p1.y);

    this.normalEnd.x = this.intersectionPoint.x + this.intersectionNormal.x;
    this.normalEnd.y = this.intersectionPoint.y + this.intersectionNormal.y;
    
    this.shape.clear();
    this.shape.lineStyle(5, 0xFF0000, 1);
    this.shape.moveTo(this.p1.x*30,this.p1.y*30);
    this.shape.lineTo(this.intersectionPoint.x*30, this.intersectionPoint.y*30);
    
    this.shape.moveTo(this.intersectionPoint.x*30, this.intersectionPoint.y*30);
    this.shape.lineTo(this.normalEnd.x*30, this.normalEnd.y*30);
 
    this.containerUpdateTransform();
};
