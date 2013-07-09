define([
    'calculations',
    'settings',
    'asyncAPI',
    'scene',
    'geometrygraphsingleton',
    './sceneview',
    'modelviews/modelgraph',
  ],
  function(
    calc,
    settings, 
    AsyncAPI, 
    sceneModel,
    geometryGraph,
    TransformSceneView,
    modelGraph) {

  var TranslateSceneView = TransformSceneView.extend({

    greyLineColor: 0xcc9999,
    greyFaceColor: 0xcc9999,
    highlightFaceColor: 0xcc3333,
    highlightLineColor: 0xcc3333,

    initialize: function() {
      TransformSceneView.prototype.initialize.call(this);
    },

    render: function() {
      TransformSceneView.prototype.render.call(this);

      var extents = this.model.selectedModel.getExtents();

      var boundaryGeometry = new THREE.Geometry();
      var buffer = 5;
      boundaryGeometry.vertices.push(new THREE.Vector3(
        + extents.dx + buffer, 
        + extents.dy + buffer, 
        0));
      boundaryGeometry.vertices.push(new THREE.Vector3(
        - extents.dx - buffer, 
        + extents.dy + buffer, 
        0));
      boundaryGeometry.vertices.push(new THREE.Vector3(
        - extents.dx - buffer, 
        - extents.dy - buffer, 
        0));
      boundaryGeometry.vertices.push(new THREE.Vector3(
        + extents.dx + buffer, 
        - extents.dy - buffer, 
        0));
      boundaryGeometry.vertices.push(boundaryGeometry.vertices[0]);
      var boundary = new THREE.Line(boundaryGeometry, 
        new THREE.LineBasicMaterial({ color: this.greyLineColor }));

      boundary.position = new THREE.Vector3(extents.center.x, extents.center.y, 0);
      this.sceneObject.add(boundary);

      var cornerGeometry = new THREE.Geometry();
      cornerGeometry.vertices.push(new THREE.Vector3(0,0,0));
      cornerGeometry.vertices.push(new THREE.Vector3(-buffer/2, 0, 0));
      cornerGeometry.vertices.push(new THREE.Vector3(-buffer/2, -1, 0));
      cornerGeometry.vertices.push(new THREE.Vector3(-1, -1, 0));
      cornerGeometry.vertices.push(new THREE.Vector3(0, -buffer/2, 0));
      cornerGeometry.vertices.push(new THREE.Vector3(-1, -buffer/2, 0));
      cornerGeometry.vertices.push(new THREE.Vector3(-1, -1, 0));
      cornerGeometry.faces.push(new THREE.Face4(0,1,2,3));
      cornerGeometry.faces.push(new THREE.Face4(0,6,5,4));
      cornerGeometry.computeFaceNormals();

      var that = this;
      this.corners = [
        {
          rotation: 0,
          offset: new THREE.Vector3(extents.dx + buffer, extents.dy + buffer, 0)
        },
        {
          rotation: Math.PI/2,
          offset: new THREE.Vector3(-extents.dx - buffer, extents.dy + buffer, 0)
        },
        {
          rotation: Math.PI,
          offset: new THREE.Vector3(-extents.dx - buffer, -extents.dy - buffer, 0)
        },
        {
          rotation: 3*Math.PI/2,
          offset: new THREE.Vector3(extents.dx + buffer, -extents.dy - buffer, 0)
        },

      ].map(function(rotationAndOffset) {
        var corner = THREE.SceneUtils.createMultiMaterialObject(
          cornerGeometry,
          [
            new THREE.MeshBasicMaterial({color: that.greyFaceColor, transparent: true, opacity: 0.5, side: THREE.DoubleSide } ),
          ]);
        corner.position = new THREE.Vector3(extents.center.x, extents.center.y, 0)
          .add(rotationAndOffset.offset);
        corner.rotation.z = rotationAndOffset.rotation;
        that.sceneObject.add(corner);
        corner.scale = that.cameraScale;
        return corner;
        
      });
    },

    updateCameraScale: function() {
      TransformSceneView.prototype.updateCameraScale.call(this);

      if (this.corners) {
        var that = this;
        this.corners.forEach(function(corner) {
          corner.scale = that.cameraScale;
        })
      }

      if (!this.dragging) {
        var extents = this.model.selectedModel.getExtents();
        this.initialPosition = extents.center.clone().add(
          new THREE.Vector3(0, 0, extents.dz + 2*this.cameraScale.z));
      }
    },

    dragStarted: function() {
      this.model.hideOtherViews(this);

      this.originalVertex = this.model.vertex;
      this.originalVertex.transforming = true;
      this.editingVertex = AsyncAPI.edit(this.model.vertex);
      this.editingModel = modelGraph.get(this.editingVertex.id);
      this.dragging = true;
      this.sceneObject.add(this.axis);
    },

    // drag: function(position, intersection, event) {
    //   var sceneElement = $('#scene');
    //   var camera = sceneModel.view.camera;
    //   var mouseRay = calc.mouseRayForEvent(sceneElement, camera, event);

    //   var extents = this.model.selectedModel.getExtents();
    //   var rayOrigin = calc.objToVector(extents.center, geometryGraph, THREE.Vector3);
    //   var rayDirection = new THREE.Vector3(0,0,1);
    //   var ray = new THREE.Ray(rayOrigin, rayDirection);

    //   var positionOnNormal = calc.positionOnRay(mouseRay, ray);

    //   this.arrow.position = positionOnNormal;
    //   var diff = new THREE.Vector3().subVectors(positionOnNormal, this.initialPosition);
    //   var grid = settings.get('gridsize');
    //   var translation = new THREE.Vector3(Math.round(diff.x/grid) * grid,
    //                                       Math.round(diff.y/grid) * grid,
    //                                       Math.round(diff.z/grid) * grid).add(this.initialTranslation);
      
    //   this.editingModel.translate(translation);
    // },

    // dragEnded: function() {
    //   this.sceneObject.remove(this.axis);
    //   this.dragging = false;
    //   this.editingVertex.transforming = false;
    //   this.editingModel.tryCommit();
    // },

    mouseenter: function() {
      this.sceneObject.add(this.axis);
    },

    mouseleave: function() {
      this.sceneObject.remove(this.axis);
    },

  });

  return TranslateSceneView;

});