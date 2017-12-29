var app,guiMd;
var config = {
    outdoorProp:"outdoor",
    b1Prop:"b1",
    b2Prop:"b2",
    b3Prop:"b3",
    exitPropValue:"exit",
    outdOffset:[-200,101,100],
    builOffset:[80,101,-80],
    exitOffset:[0,30,-80],
    
    signBoard:"signboard_subway",
    
    mark_blue:"mark_blue",
    mark_yellow:"mark_yellow"
}
var treeB = {
    name:"Building"
}
var treeF = {
    0:{name:"B3"},
    1:{name:"B2"},
    2:{name:"B1"}
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
    this.outdOffset=c.outdOffset;
    this.builOffset=c.builOffset;
    
    compasses.push(app.query('Compass01'));
    compasses.push(app.query('Compass02'));
    compasses.push(app.query('Compass03'));
}

window.onload = function () {
    app = new t3d.App({
        el: "div3d",
        skyBox:'SunCloud',
        url: "https://speech.uinnova.com/static/models/subway",
        ak:'app_test_key',
        complete: function () {
            console.log("app scene loaded");
            init(config);
            guiFunction();
            CreatePanels();
            panelsAddListener();
            EnterOutdoor();
            // AddTexture();
        }
    });
}
// function AddTexture(){
//     var texture = new THREE.TextureLoader().load( "../images/momoda.png" );
//     texture.wrapS = THREE.RepeatWrapping;
//     texture.wrapT = THREE.RepeatWrapping;
//     texture.repeat.set( 4, 4 );
// }
function CreatePanels() {
    /*belong的路径不能太具体，比如app.outdoors.things就不行了*/
    CreateExitPanels( GetThingsByProp(this.outdoorProp),this.mark_blue, " " + this.outdoorProp,"none");
    CreateExitPanels( GetThingsByProp(this.b1Prop), this.mark_yellow," " + this.b1Prop,"none");
    CreateExitPanels( GetThingsByProp(this.b2Prop), this.mark_yellow," " + this.b2Prop,"none");
    CreateExitPanels( GetThingsByProp(this.b3Prop), this.mark_yellow," " + this.b3Prop,"none");
}

/* 创建导航面板 */
var temp;
function guiFunction() {
    guiMd = new dat.gui.GUI({
        type: 'nav-md1'
    });
    guiMd.setPosition(0,null,null,0);
    temp = app.tree;
    Object.assign(temp.buildings[0],treeB);
    for(var i=0;i<Object.keys(treeF).length;i++){
        Object.assign(temp.buildings[0].floors[i],treeF[i]);
    }
    var f1 = guiMd.addAppTree('全景',temp);
    var v1 = guiMd.addTree('View1');
    var v2 = guiMd.addTree('View2');
    guiMd.treeBind('click', function(o,target) {
        guiMd.highLight(target);
        if(o=='View1'){
            ChangeBG(true);
            ShowThisPanels(0);
            ShowWhere(true,false);
            app.camera.flyTo({
                position: [30.34,79.36,-252.177],
                target: [41.33, 2.63, -37.31],
                time: 1000
            });
        }else if(o=='View2'){
            ChangeBG(true);
            ShowThisPanels(0);
            ShowWhere(true,false);
            app.camera.flyTo({
                position: [112.54,120.58,144.88],
                target: [41.34, 2.63, -37.31],
                time: 1000
            });
        }else if(o=="全景"){
            ChangeBG(true);
            ShowWhere(true,false);
            CameraFly(app.tree.outdoor.position,this.outdOffset);
            ShowThisPanels(0);
        }else{
            EnterWhere(o);
        }
    });
}
var compasses = [];
function ShowCompass(index) {
    compasses.forEach(function (t) { t[0].show(false);/*console.log(t)*/});
    index+=1;
    // console.log('Compass0'+index);
    var a = app.query('Compass0'+index);
    a[0].show(true);
    // console.log( a[0].visible);
}
function EnterWhere(obj) {
    var offset;
    HideRoofNode();
    ShowOrHideObjects( app.tree.outdoor, false );
    ShowOrHideObjects( app.tree.buildings[0].floors, false);
    var isShowBG;
    if(isContains(obj.name,"Building")){
        isShowBG=false;
        HideAllPanels();
        ShowCompass(0);
        ShowOrHideObjects( obj.floors, true);
        offset=this.builOffset;
    }else if(isContains(obj.name,"Outdoor")){
        isShowBG=true;
        ShowThisPanels(0);
        ShowOrHideObjects( obj, true );
        offset=this.outdOffset;
    }else if(obj.hasOwnProperty('levelNum')){
        guiMd.pathHighLight('全景.Building.'+obj.name);
        isShowBG=false;
        ShowThisFloor( app.tree.buildings[0].floors, obj.levelNum );
        ShowThisPanels( obj.levelNum+1 );
        // ShowCompass(obj.levelNum);
        app.query('Compass0' + (3-obj.levelNum).toString())[0].visible=true;
        offset=this.builOffset;
    }
    ChangeBG(isShowBG);
    CameraFly(obj.position,offset);
}
function CameraFly(tarPOS,offPOS) {
    app.camera.flyTo({
        position: [tarPOS[0]+offPOS[0], tarPOS[1]+offPOS[1], tarPOS[2]+offPOS[2]],
        target: [tarPOS[0], tarPOS[1], tarPOS[2]],
        time: 2000});
}

/* 隐藏房顶 */
function HideRoofNode() {
    ShowOrHideObjects( app.buildings[0].floors[0].roofNode, false);
    ShowOrHideObjects( app.buildings[0].floors[1].roofNode, false);
    ShowOrHideObjects( app.buildings[0].floors[2].roofNode, false);
    // 有一些房顶没算在roofNode里
    app.buildings[0].floors[2].node.children[2].visible=false;
    app.buildings[0].floors[1].node.children[2].visible=false;
    app.buildings[0].floors[0].node.children[2].visible=false;
}
/* 所有牌子隐藏 */
function HideAllPanels() {
    var children = document.all;
    for(var i=0;i<children.length;i++){
        var child=children[i];
        if(child.classList.contains('signboard_subway')){
            // console.log(child.className);
            child.style.display='none';
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
        var text = panel.children[0];
        if(obj.name.indexOf("Entrance") > -1){
            text.innerHTML = "Entrance";
        }else{
            text.innerHTML = subName(obj.name);
        }
        text.style.fontSize = 8 + 'px';
        document.getElementById("div3d").insertBefore(panel, panelEle);
        panel.style.display = display;
        panel.style.zIndex = 10;
        panel.className += className;
        panel.id += className;
        var box = new THREE.Box3().setFromObject(obj.node);
        obj.addUI(panel, [0, box.getSize().y, 0 ],[0.2,1]);
        var result = app.camera.worldToScreen(obj.position);
    })
}
function subName( modelName ) {
    var index = modelName.indexOf('_');
    modelName = modelName.substr(index+1);
    return modelName;
}
function panelsAddListener() {
    var panels_parent = document.getElementsByClassName( this.outdoorClassName);
    var panels = [];
    for(var i = 0; i < panels_parent.length; i++){
        panels.push(panels_parent[i].children[0]);
    }
    for (var i = 0; i < panels.length; i++){
        
        panels[i].addEventListener("click",function () {
            PanelsByClassName(this.outdoorClassName,"none");
            ShowCompass(0);
            // 进入地下，地上隐藏
            HideRoofNode();
            HideAllPanels();
            ShowOrHideObjects( app.tree.outdoor, false );
            ShowOrHideObjects( app.tree.buildings[0].floors, true);
            ChangeBG(false);
            var pos = app.query("b1_"+this.innerHTML)[0].position;
            CameraFly(pos,config.exitOffset);
        })
    }
}
function isContains(str, substr) {
    // console.log(str);
    return str.indexOf(substr) >= 0;
}
function EnterOutdoor() {
    ChangeBG( true );
    // 进入地上，地下隐藏
    ShowOrHideObjects( app.tree.outdoor, true );
    ShowOrHideObjects( app.tree.buildings[0].floors, false);
    ShowThisPanels(0);
}
function ChangeBG( bSkyBox ) {
    if(bSkyBox){
        app.setSkyBox( "SunCloud" );
    }else{
        app.background = new THREE.Color( 0x00000000 );
    }
}
// 显示/隐藏整体
function ShowOrHideObjects( objects, bShow ) {
    
    if( isArray(objects) ){
        for(var i = 0;i < objects.length;i++) {
            objects[i].visible = bShow;
        }
    }else{
        objects.visible = bShow;
    }
}
function ShowWhere(outShow, buiShow,) {
    ShowOrHideObjects( app.tree.outdoor, outShow );
    ShowOrHideObjects( app.tree.buildings[0].floors, buiShow);
}
function ShowFloor(num) {
    ShowOrHideObjects( app.tree.outdoor, false );
    ShowThisFloor( app.tree.buildings[0].floors, number - 1 );
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
function GetThingsByProp( propKey ) {
    var _things = app.query('['+propKey+'='+this.exitPropValue+']');
    return _things;
}