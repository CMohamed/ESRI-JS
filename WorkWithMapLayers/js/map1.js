var mapMain;

// @formatter:off
require([
        "esri/map",

        "dojo/ready",
        "dojo/parser",
        "dojo/on",

        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
        "esri/geometry/Extent",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/FeatureLayer",
        "esri/dijit/BasemapToggle",
        "esri/dijit/Legend",
        "esri/dijit/BasemapGallery",

        "dojo/dom",
        "esri/Color",
        "dojo/keys",

        "esri/config",
        "esri/sniff",
        "esri/SnappingManager",
        "esri/dijit/Measurement",
        "esri/renderers/SimpleRenderer",
        "esri/tasks/GeometryService",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",

        "esri/dijit/Search",
        "esri/tasks/PrintTemplate",
        "esri/tasks/PrintTask",
        "dojo/_base/array",
        "esri/dijit/Print",

        "esri/dijit/PopupTemplate",

        "esri/dijit/FeatureTable",

        "esri/dijit/editing/Editor",
        "esri/dijit/editing/TemplatePicker",

        "esri/dijit/Scalebar",
        "dijit/TitlePane",
        "dijit/form/CheckBox",


        "dojo/domReady!",


    ],
    function (Map,
              ready, parser, on,
              BorderContainer, ContentPane, Extent,ArcGISDynamicMapServiceLayer,FeatureLayer,BasemapToggle,Legend,BasemapGallery,
              dom, Color, keys,
              esriConfig, has, SnappingManager, Measurement,
              SimpleRenderer, GeometryService, SimpleLineSymbol, SimpleFillSymbol,
              Search, PrintTask, array, PrintTemplate, Print,
              PopupTemplate,FeatureTable,Editor,TemplatePicker) {
// @formatter:on

        // Wait until DOM is ready *and* all outstanding require() calls have been resolved
        ready(function () {

            // Parse DOM nodes decorated with the data-dojo-type attribute
            parser.parse();

           // esriConfig.defaults.io.proxyUrl = "/proxy/";
            esriConfig.defaults.io.alwaysUseProxy = false;

            /*
                 * Step: Specify the initial extent
                 * Note: Exact coordinates may vary slightly from snippet/solution
                 * Reference: https://developers.arcgis.com/javascript/jssamples/fl_any_projection.html
                 */
            var extentInitial = new Extent(
                {"xmin":-867010.9011963734,
                    "ymin":3970205.633871793,"xmax":-823938.6357577345,"ymax":3983391.021250968,"spatialReference":{"wkid":102100}}
            );



            // Create the map
            mapMain = new Map("cpCenter", {
                basemap: "satellite",
                extent: extentInitial,

            });



            /*affichage des attributs*/
            var ptQuakes = new PopupTemplate({
                "title": "BidonVille: {Nom}",
                "fieldInfos": [
                    {
                        "fieldName": "LOCATION",
                        "format": {
                            "places": 2,
                            "digitSeparator": true
                        }
                    }],
                "description": "Etat: {Etat}" +"<br/>"+
                "Prefecture: {Prefecture}" +"<br/>"+
                "Commune: {Commune}" +"<br/>"+
                "Remarques: {Remarques}"
            });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //                    Reclamation Listing
///////////////////////////////////////////////////////////////////////////////////////////////////

            //Load a FeatureTable to the application once map loads
            mapMain.on("load", loadTable1);

            function loadTable1(){

                // editable FeatureLayer
                var myFeatureLayer1 = new FeatureLayer("http://localhost:6080/arcgis/rest/services/ProjetSig/Reclamation/FeatureServer/0", {
                    mode: FeatureLayer.MODE_ONDEMAND,
                    outFields: ["*"],
                    infoTemplate : ptQuakes,
                    visible: true,
                    id: "fLayer2"
                });

                // set a selection symbol for the featurelayer
                //var selectionSymbol = new PictureMarkerSymbol("https://sampleserver6.arcgisonline.com/arcgis/rest/services/RedlandsEmergencyVehicles/FeatureServer/1/images/3540cfc7a09a7bd66f9b7b2114d24eee", 48 ,48);

                //myFeatureLayer.setSelectionSymbol(selectionSymbol);

                // listen to featurelayer click event to handle selection
                // from layer to the table.
                // when user clicks on a feature on the map, the corresponding
                // record will be selected in the table.
                myFeatureLayer1.on("click", function(evt) {
                    var idProperty = myFeatureLayer1.objectIdField,
                        feature,
                        featureId,
                        query;

                    if (evt.graphic && evt.graphic.attributes && evt.graphic.attributes[idProperty]) {
                        feature = evt.graphic,
                            featureId = feature.attributes[idProperty];

                        query = new Query();
                        query.returnGeometry = false;
                        query.objectIds = [featureId];
                        query.where = "1=1";

                        myFeatureLayer1.selectFeatures(query, FeatureLayer.SELECTION_NEW);
                    }
                });

                // Redlands police vehicle locations layer
                // this layer is an editable layer
                mapMain.addLayer(myFeatureLayer1);

                //create new FeatureTable and set its properties
                var myFeatureTable1 = new FeatureTable({
                    featureLayer : myFeatureLayer1,
                    map : mapMain,
                    editable: true,
                    syncSelection: true,
                    dateOptions: {
                        datePattern: 'M/d/y',
                        timeEnabled: true,
                        timePattern: 'H:mm',
                    },
                    // use fieldInfos object to change field's label (column header),
                    // change the editability of the field, and to format how field values are displayed
                    // you will not be able to edit callnumber field in this example.
                    fieldInfos: [
                        {
                            name: 'Name',
                            alias: 'Name',
                            editable: false //disable editing on this field
                        },
                        {
                            name: 'Type',
                            alias: 'Type'
                        },
                        {
                            name: 'Date',
                            alias: 'Date',
                            editable : false
                        }
                    ],
                    // add custom menu functions to the 'Options' drop-down Menu
                    menuFunctions: [
                        {
                            label: "Filter Non Programmee BidonVilles",
                            callback: function(evt){
                                console.log(" -- evt: ", evt);
                                // set definition expression on the layer
                                // show only available emergency vehicles
                                myFeatureLayer1.setDefinitionExpression("Etat = NP");

                                // call FeatureTable.refresh() method to re-fetch features
                                // from the layer. Table will only show records that meet
                                // layer's definition expression creteria.
                                myFeatureTable1.refresh();
                            }
                        },{
                            label: "Show All BidonVilles",
                            callback: function(evt){
                                console.log(" -- evt: ", evt);
                                myFeatureLayer1.setDefinitionExpression("1=1");
                                myFeatureTable1.refresh();
                            }
                        }]
                }, 'myTableNode');

                myFeatureTable1.startup();

                // listen to refresh event
                myFeatureTable1.on("refresh", function(evt){
                    console.log("refresh event - ", evt);
                });
            }



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //            Mesure Tool
////////////////////////////////////////////////////////////////




            esriConfig.defaults.geometryService = new GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");

            var sfs = new SimpleFillSymbol(
                "solid",
                new SimpleLineSymbol("solid", new Color([195, 176, 23]), 2),
                null
            );


            var parcelsLayer = new FeatureLayer("http://localhost:6080/arcgis/rest/services/MiniProjet/BidonvillesFinal/FeatureServer/0", {
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields: ["*"]
            });
            parcelsLayer.setRenderer(new SimpleRenderer(sfs));
            //mapMain.addLayers([parcelsLayer]);



            var snapManager = mapMain.enableSnapping({
                snapKey: has("mac") ? keys.META : keys.CTRL
            });
            var layerInfos = [{
                layer: parcelsLayer
            }];
            snapManager.setLayerInfos(layerInfos);

            var measurement = new Measurement({
                map: mapMain
            }, dom.byId("measurementDiv"));
            measurement.startup();

            /*affichage des attributs was here hhh */

            var CasaBaseMap = new ArcGISDynamicMapServiceLayer("http://localhost:6080/arcgis/rest/services/MiniProjet/FondCarte/MapServer", {
                opacity: 0.7
            });
            var Sites = new ArcGISDynamicMapServiceLayer("http://localhost:6080/arcgis/rest/services/MiniProjet/Sites/MapServer");

            var ReclamationLayer = new FeatureLayer("http://localhost:6080/arcgis/rest/services/ProjetSig/Reclamation/FeatureServer/0",{
                outFields : ['*']
            });
            /*var BidonVLayer = new FeatureLayer("http://localhost:6080/arcgis/rest/services/MiniProjet/BidonvillesFinal/FeatureServer/0",{
                outFields : ['*'],
                    infoTemplate : ptQuakes
            });*/

            mapMain.addLayers([CasaBaseMap,Sites,ReclamationLayer]);

            var basemapGallery = new BasemapGallery({
                theme:"basemapGallery",
                showArcGISBasemaps : true,
                map : mapMain
            },"basemapGallery");

            basemapGallery.startup();

            /*
             * Step: Add a legend once all layers have been added to the map
*/
            mapMain.on("layers-add-result", function() {
                var dijitLegend = new Legend({
                    map : mapMain,
                    arrangement : Legend.ALIGN_LEFT
                }, "divLegend");
                dijitLegend.startup();
            });
            //mapMain.on(); // stub


            search = new Search ({
                map: mapMain,
                autoComplete: true
            },"divSearch");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //               Edition du BV
//////////////////////////////////////////////////////////////////////////////////////

            mapMain.on("layers-add-result", initEditor);

            function initEditor(results) {

                // Map the event results into an array of layerInfo objects
                var layerInfosWildfire = array.map(results.layers, function (result) {
                    return {
                        featureLayer: result.layer
                    };
                });

                /*
                 * Step: Map the event results into an array of Layer objects
                 */

                var layersWildfire = array.map(results.layers, function(result) {
                    return result.layer;
                });

                /*
                 * Step: Add a custom TemplatePicker widget
                 */

                var tpCustom = new TemplatePicker({
                    featureLayers : layersWildfire,
                    columns : 2
                }, 'divLeft');

                tpCustom.startup();

                /*
                 * Step: Prepare the Editor widget settings
                 */

                var editorSettings = {
                    map : mapMain,
                    geometryService : new GeometryService("http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer"),
                    layerInfos : layerInfosWildfire,
                    toolbarVisible : true,
                    templatePicker : tpCustom,
                    createOptions : {
                        polygonDrawTools : [Editor.CREATE_TOOL_FREEHAND_POLYGON,
                            Editor.CREATE_TOOL_RECTANGLE, Editor.CREATE_TOOL_TRIANGLE,
                            Editor.CREATE_TOOL_CIRCLE]
                    }
                };

                var editorParams = {
                    settings : editorSettings
                };


                widgetEditor = new Editor(editorParams, "divTop");
                widgetEditor.startup();

            };



        });
})

