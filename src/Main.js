/**
 * @author kozakluke@gmail.com
 * @constructor
 */
function Main()
{
    //protected private
    this.stage       = null;
    this.renderer    = null;
    this.world       = null;
    this.loader      = null;
    this.debugCanvas = null;
    
    window.b2RayCastInput  = Box2D.Collision.b2RayCastInput;
    window.b2RayCastOutput = Box2D.Collision.b2RayCastOutput;
    window.b2CircleShape   = Box2D.Collision.Shapes.b2CircleShape;
    window.b2MassData      = Box2D.Collision.Shapes.b2MassData;
    window.b2PolygonShape  = Box2D.Collision.Shapes.b2PolygonShape;
    window.b2Vec2          = Box2D.Common.Math.b2Vec2;
    window.b2Body          = Box2D.Dynamics.b2Body;
    window.b2BodyDef       = Box2D.Dynamics.b2BodyDef;
    window.b2DebugDraw     = Box2D.Dynamics.b2DebugDraw;
    window.b2Fixture       = Box2D.Dynamics.b2Fixture;
    window.b2FixtureDef    = Box2D.Dynamics.b2FixtureDef;
    window.b2World         = Box2D.Dynamics.b2World;
    
    try {
        window.devicePixelRatio = window['devicePixelRatio'] || 1;
    } catch(event) { }
    
    var screenWidth  = Math.max(screen.width, screen.height);
    var screenHeight = Math.min(screen.width, screen.height);
    var innerWidth   = Math.max(window.innerWidth, window.innerHeight);
    var innerHeight  = Math.min(window.innerWidth, window.innerHeight);
    var width  = screenWidth  / window.devicePixelRatio >= innerWidth ?
                 screenWidth  / window.devicePixelRatio : screenWidth;
    var height = screenHeight / window.devicePixelRatio >= innerHeight ?
                 screenHeight / window.devicePixelRatio : screenHeight;
    Main.scaleView   = Math.min(width  * window.devicePixelRatio / 960,
                                height * window.devicePixelRatio / 640);
    Main.scaleAsset2 = MathUtil.clamp(Math.round(Main.scaleView * 4) / 4, 0.5, 1.75);
    Main.scaleView   = DetectDevice.isDesktop() ? window.devicePixelRatio : Main.scaleView;
    Main.scaleAsset  = DetectDevice.isDesktop() ? MathUtil.clamp(Math.round(window.devicePixelRatio * 4) / 4, 0.5, 1.75) :
                                                  MathUtil.clamp(Math.round(Main.scaleView          * 4) / 4, 0.5, 1.75);
    Main.viewWidth   = window.innerWidth  * window.devicePixelRatio / Main.scaleView;
    Main.viewHeight  = window.innerHeight * window.devicePixelRatio / Main.scaleView;
    Main.meter       = 30;
    
    window.onload = this.onLoad.bind(this);
}

Main.prototype.constructor = Main;

/**
 * @private
 */
Main.prototype.onLoad = function()
{
    var stats = new Stats();
    document.body.appendChild(stats.domElement);
    stats.domElement.style.position = 'absolute';
    
    var stage = this.stage = new PIXI.Container();
    stage.interactive = true;
    stage.scale.x = Main.scaleView;
    stage.scale.y = Main.scaleView;
    var renderer = this.renderer = new PIXI.WebGLRenderer(0, 0);
    document.body.appendChild(renderer.view);
    renderer.backgroundColor = 0x333333;
    renderer.view.style.position = 'absolute';
    
    var world = this.world = new b2World(new b2Vec2(0, 9.8), true);
    
    /*var listener = new Box2D.Dynamics.b2ContactListener;
    listener.BeginContact = function(contact) {
         console.log(contact.GetFixtureB().GetBody().GetUserData());
    };
    listener.EndContact = function(contact) {
        // console.log(contact.GetFixtureA().GetBody().GetUserData());
    };
    listener.PostSolve = function(contact, impulse) {
        
    };
    listener.PreSolve = function(contact, oldManifold) {

    };
    this.world.SetContactListener(listener);*/
    
    var loader = PIXI.loader;
    loader.add('assets/graphics/@{0}x/atlas.json'.replace('{0}',  Main.scaleAsset2));
    loader.add('assets/graphics/@{0}x/atlas3.json'.replace('{0}', Main.scaleAsset2));
    loader.load(this.onLoadAssets.bind(this));
    
    window.addEventListener('resize', this.onResize.bind(this));
    setTimeout(this.onResize.bind(this), 0);
    renderer.view.addEventListener('touchstart', function(event) {
        event.preventDefault();
        if (screenfull.enabled && !screenfull.isFullscreen)
            screenfull.request();
    });
    
    var self = this;
    (function update(now)
    {
        requestAnimationFrame(update);
        //if (self.content) {
        //    var v = new b2Vec2(self.content.ball.body.GetMass() * -world.GetGravity().x,
        //                       self.content.ball.body.GetMass() * -world.GetGravity().y);
        //    self.content.ball.body.ApplyForce(v, self.content.ball.body.GetWorldCenter());
        //}
        
        world.Step(1 / 30, 8, 3);
        world.ClearForces();
        world.DrawDebugData();
        for (var body = world.GetBodyList(); body; body = body.GetNext())
        {
            var actor = body.GetUserData();
            if (actor) {
                actor.rotation   = body.GetAngle();
                actor.position.x = body.GetPosition().x * Main.meter;
                actor.position.y = body.GetPosition().y * Main.meter;
            }
        }
        
        stats.update();
        renderer.render(stage);
    })(0);
};

/**
 * @private
 */
Main.prototype.onLoadAssets = function()
{
    var content = this.content = new Content(this.world);
    this.stage.addChild(content);
    
    this.setDebugDraw();
    this.onResize();
    
    document.addEventListener('mousedown', this.onBegin.bind(this));
    document.addEventListener('mouseup',   this.onEnd.bind(this));
    document.addEventListener('mousemove', this.onMove.bind(this));
};

/**
 * @private
 */
Main.prototype.setDebugDraw = function()
{
    var debugCanvas = this.debugCanvas = document.createElement('canvas');
    document.body.appendChild(debugCanvas);
    debugCanvas.style.position      = 'absolute';
    debugCanvas.style.pointerEvents = 'none';
    
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(debugCanvas.getContext('2d'));
    debugDraw.SetDrawScale(Main.meter);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit |
                       b2DebugDraw.e_jointBit);
    this.world.SetDebugDraw(debugDraw);
};

/**
 * @private
 */
Main.prototype.onBegin = function()
{
    this.content.updateBegin();
};

/**
 * @private
 */
Main.prototype.onEnd = function(event)
{
    this.content.updateEnd(event);
};

/**
 * @private
 */
Main.prototype.onMove = function(event)
{
    this.content.updateMove(event);
};

/**
 * @private
 */
Main.prototype.onResize = function()
{
    Main.viewWidth  = window.innerWidth  * window.devicePixelRatio / Main.scaleView;
    Main.viewHeight = window.innerHeight * window.devicePixelRatio / Main.scaleView;
    
    if (null) {
        
    }
    else if (this.content)
    {
        ScaleUtil.scale(this.content, ScaleUtil.SHOW_ALL,
                        this.content.width, this.content.height,
                        Main.viewWidth, Main.viewHeight, 0, Infinity);
        this.content.position.x = Main.viewWidth  * 0.5 - this.content.width  * 0.5 *
                                                          this.content.scale.x;
        this.content.position.y = Main.viewHeight * 0.5 - this.content.height * 0.5 *
                                                          this.content.scale.y;
        
        if (this.debugCanvas)
        {
            this.debugCanvas.style.width  = (this.content.width  * this.content.scale.x) + 'px';
            this.debugCanvas.style.height = (this.content.height * this.content.scale.y) + 'px';
            this.debugCanvas.style.left   = (this.content.position.x / window.devicePixelRatio * Main.scaleView) + 'px';
            this.debugCanvas.style.top    = (this.content.position.y / window.devicePixelRatio * Main.scaleView) + 'px';
            this.debugCanvas.width  = this.content.width  * window.devicePixelRatio / Main.scaleView;
            this.debugCanvas.height = this.content.height * window.devicePixelRatio / Main.scaleView;
        }
    }
    this.renderer.view.style.width  = window.innerWidth  + 'px';
    this.renderer.view.style.height = window.innerHeight + 'px';
    this.renderer.resize(window.innerWidth  * window.devicePixelRatio,
                         window.innerHeight * window.devicePixelRatio);
    this.renderer.render(this.stage);
    window.scrollTo(0, 0);
};

Main.instance = new Main();
