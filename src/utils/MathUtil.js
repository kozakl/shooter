/**
 * @author kozakluke@gmail.com
 */
MathUtil.RADIANS = Math.PI / 180;
MathUtil.DEGREES = 180 / Math.PI;

/**
 * @constructor
 */
function MathUtil() { }

MathUtil.rndRange = function(min, max)
{
    return min + (Math.random() * (max - min));
};

MathUtil.rndIntRange = function(min, max)
{
    return Math.round(MathUtil.rndRange(min, max));
};

MathUtil.toRadians = function(degrees)
{
    return degrees * MathUtil.RADIANS;
};

MathUtil.toDegrees = function(radians)
{
    return radians * MathUtil.DEGREES;
};

MathUtil.clamp = function(value, min, max)
{
    return Math.max(min, Math.min(value, max));
};

MathUtil.hitTest = function(x1, y1, w1, h1,
                            x2, y2, w2, h2)
{
    if (x1 + w1 > x2)
        if (x1 < x2 + w2)
            if (y1 + h1 > y2)
                if (y1 < y2 + h2)
                    return true;
    return false;
};

MathUtil.hitPoint = function(px, py, x, y, w, h)
{
    return MathUtil.hitTest(px, py, 1, 1,
                            x,  y,  w, h);
};

MathUtil.distancePoint = function(x1, y1,
                                  x2, y2)
{
    var dx = x1 - x2;
    var dy = y1 - y2;
    return Math.sqrt(dx*dx + dy*dy) + 0.5 | 0;
};

MathUtil.distancePoint2 = function(x1, y1,
                                   x2, y2)
{
    var dx = x1 - x2;
    var dy = y1 - y2;
    return dx*dx + dy*dy;
};
