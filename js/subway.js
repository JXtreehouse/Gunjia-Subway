var app,gui;
var config = {
    outdoorProp:"outdoor",
    b1Prop:"b1",
    b2Prop:"b2",
    b3Prop:"b3",
    exitPropValue:"exit",
    
    signBoard:"signboard1",
    
    mark_blue:"mark_blue",
    mark_yellow:"mark_yellow"
}
function init(c){
    this.outdoorProp=c.outdoorProp;
    this.b1Prop=c.b1Prop;
    this.b2Prop=c.b2Prop;
    this.b3Prop=c.b3Prop;
    
    this.exitPropValue=c.exitPropValue;
    
    this.signBoard=c.signBoard;
    this.outdoorClassName=c.signBoard+" "+c.outdoorProp;
    this.b1ClassName=c.signBoard+" "+c.b1Prop;
    this.b2ClassName=c.signBoard+" "+c.b2Prop;
    this.b3ClassName=c.signBoard+" "+c.b3Prop;
    this.mark_blue=c.mark_blue;
    this.mark_yellow=c.mark_yellow;
}
function setFPS() {
    var camControls = new THREE.FirstPersonControls(camera);
    camControls.lookSpeed = 0.4;
    camControls.movementSpeed = 20;
    camControls.noFly = true;
    camControls.lookVertical = true;
    camControls.constrainVertical = true;
    camControls.verticalMin = 1.0;
    camControls.verticalMax = 2.0;
    camControls.lon = -150;
    camControls.lat = 120;
}

window.onload = function () {
    app = new t3d.App({
        el: "div3d",
        skyBox:'SunCloud',
        url: "https://speech.uinnova.com/static/models/subway",
        complete: function () {
            console.log("app scene loaded");
            init(config);
            EnterOutdoor();
            guiFunction();
            CreatePanels();
            panelsAddListener();
        }
    });
}

function CreatePanels() {
    /*belong的路径不能太具体，比如app.outdoors.things就不行了*/
    CreateExitPanels( GetThingsByProp(this.outdoorProp),this.mark_blue, " " + this.outdoorProp,"none");
    CreateExitPanels( GetThingsByProp(this.b1Prop), this.mark_yellow," " + this.b1Prop,"none");
    CreateExitPanels( GetThingsByProp(this.b2Prop), this.mark_yellow," " + this.b2Prop,"none");
    CreateExitPanels( GetThingsByProp(this.b3Prop), this.mark_yellow," " + this.b3Prop,"none");
}

/* 创建导航面板 */
var full,b,f;
function guiFunction() {
    gui = new dat.gui.GUI({
        type: 'nav1'
    });
    gui.addTree(app, '全景');
    gui.setPosition({left:5,top:200});
    full = gui.getFullView();
    b = gui.getBuildings();
    f = gui.getFloors(b[0]);
    
    full.addEventListener("click",function () {
        EnterOutdoor();
    });
    b[0].addEventListener("click",function () {
        EnterBuilding();
    });
    b[1].addEventListener("click",function () {
        EnterOutdoor();
    });
    f[0].addEventListener("click",function () {
        EnterFloor(1);
    });
    f[1].addEventListener("click",function () {
        EnterFloor(2);
    });
    f[2].addEventListener("click",function () {
        EnterFloor(3);
    });
}

/* 隐藏房顶 */
function HideRoofNode() {
    ShowOrHideObjects( app.buildings[0].floors[0].roofNodes, false);
    ShowOrHideObjects( app.buildings[0].floors[1].roofNodes, false);
    ShowOrHideObjects( app.buildings[0].floors[2].roofNodes, false);
}
/* 所有牌子隐藏 */
function HideAllPanels() {
    var children = document.getElementsByTagName('*') || document.all;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var classNames = child.className.split(' ');
        for (var j = 0; j < classNames.length; j++) {
            if (classNames[j] == this.signBoard) {
                child.style.display = "none";
                break;
            }
        }
    }
}
/* 显示某层牌子 0---outdoors  1---B1  2--B2  3---B3 */
function ShowThisPanels( number ) {
    HideAllPanels();
    switch( number ){
        case 0:PanelsByClassName( this.outdoorClassName, "block");break;
        case 1:PanelsByClassName( this.b3ClassName, "block");break;
        case 2:PanelsByClassName( this.b2ClassName, "block");break;
        case 3:PanelsByClassName( this.b1ClassName, "block");break;
    }
}

/* 根据 className 显隐 Panel */
function PanelsByClassName( className, display ) {
    
    var panels = document.getElementsByClassName( className );
    
    for(var i = 0;i < panels.length; i++){
        panels[i].style.display = display;
    }
}

/* 创建 Panel */
function CreateExitPanels( things, markID, className, display ) {
    
    var panelEle = document.getElementById( markID );
    things.forEach(function (obj) {
        var panel = panelEle.cloneNode(true);
        var text = panel.children[1];
        text.innerHTML = subName(obj.name);
        text.style.fontSize = 8 + 'px';
        document.body.insertBefore(panel, panelEle);
        panel.style.display = display;
        panel.className += className;
        panel.id += className;
        app.create({
            type: 'UI',
            el: panel,
            offset: [0, -150],
            parent: obj});
    })
}
function subName( modelName ) {
    var index = modelName.indexOf('_');
    modelName = modelName.substr(index+1);
    return modelName;s
}
function panelsAddListener() {
    var panels = document.getElementsByClassName( this.outdoorClassName);
    for (var i = 0; i < panels.length; i++){
        panels[i].addEventListener("click",function () {
            PanelsByClassName(this.outdoorClassName,"none");
            EnterBuilding();
        })
    }
    var view1 = document.getElementById( "view1" );
    var view2 = document.getElementById( "view2" );
    var view3 = document.getElementById( "view3" );
    view1.addEventListener("click",function () {
        EnterOutdoor();
        app.camera.flyTo({
            position: [30.34,79.36,-252.177],
            target: [41.33, 2.63, -37.31],
            time: 1000
        });
    });
    view2.addEventListener("click",function () {
        EnterBuilding();
    });
    view3.addEventListener("click",function () {
        EnterOutdoor();
        app.camera.flyTo({
            position: [112.54,120.58,144.88],
            target: [41.34, 2.63, -37.31],
            time: 1000
        });
    });
}
var bPOS,oPOS,fPOS;
function EnterBuilding() {
    ChangeBG( false );
    // 进入地下，地上隐藏
    HideRoofNode();
    HideAllPanels();
    ShowOrHideObjects( app.outdoors, false );
    ShowOrHideObjects( app.buildings[0].floors, true);
    // bPOS = app.buildings[0].position;
    // app.camera.flyTo({
    //     position: [bPOS[0]+80, bPOS[1]+101, bPOS[2]-80],
    //     target: [bPOS[0],bPOS[1], bPOS[2]],
    //     time: 1000
    // });
    app.camera.flyTo({target:app.buildings[0]});
}
function EnterFloor( number ) {
    ChangeBG( false );
    // 进入地下某层，地上隐藏
    HideRoofNode();
    ShowOrHideObjects( app.outdoors, false );
    ShowThisFloor( app.buildings[0].floors, number - 1 );
    ShowThisPanels( number );
    // fPOS = app.buildings[0].floors[number-1].position;
    // app.camera.flyTo({
    //     position: [fPOS[0]+80, fPOS[1]+101+ number * 1, fPOS[2]-80],
    //     target: [fPOS[0],fPOS[1], fPOS[2]],
    //     time: 1000
    // });
    app.camera.flyTo({target:app.buildings[0].floors[number-1]});
}

function EnterOutdoor() {
    ChangeBG( true );
    HideRoofNode();
    // 进入地上，地下隐藏
    ShowOrHideObjects( app.outdoors, true );
    ShowOrHideObjects( app.buildings[0].floors, false);
    ShowThisPanels(0);

    // oPOS = app.outdoors.position;
    // app.camera.flyTo({
    //     position: [oPOS[0]-200, oPOS[1]+101, oPOS[2]+100],
    //     target: [oPOS[0], oPOS[1], oPOS[2]],
    //     time: 1000
    // });
    app.camera.flyTo({target:app.outdoors});
}
function ChangeBG( bSkyBox ) {
    if(bSkyBox){
        app.setSkyBox( "SunCloud" );
    }else{
        app._real.scene.background = new THREE.Color( 0x00000000 );
    }
}

// 显示/隐藏整体
function ShowOrHideObjects(  objects, bShow ) {
    
    if( isArray(objects) ){
        for(var i = 0;i < objects.length;i++) {
            objects[i].visible = bShow;
        }
    }else{
        objects.visible = bShow;
    }
}
// 显示某层，绑在导航栏
function ShowThisFloor( floors, number ) {
    ShowOrHideObjects( floors, false );
    floors[number].visible = true;
}
// 判断是否是数组
function isArray(o){
    return Object.prototype.toString.call(o) === '[object Array]';
}
/* 得到属性名/属性值索引的数组 */
function GetThingsByProp( prop ) {
    console.log('[propKey='+prop+',propValue='+this.exitPropValue+']');
    // var _things = app.query(/*'[propKey='+prop+']'*/{propKey:prop,propValue:this.exitPropValue}/*).query('[propValue='+this.exitPropValue+']'*/);
    var _things = app.query('[propKey='+prop+']').query('[propValue='+this.exitPropValue+']');
    return _things;
}