var mapMain;
var widgetEditor;

// @formatter:off
require(["esri/dijit/Print",
        "esri/tasks/PrintTemplate",
        "esri/map",

        "dojo/ready",
        "dojo/parser",
        "dojo/on",
        "dojo/_base/array",

        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",

        "esri/layers/FeatureLayer",
        "esri/tasks/GeometryService",
        "esri/dijit/editing/Editor",
        "esri/dijit/editing/TemplatePicker",
        "esri/geometry/Extent",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/toolbars/navigation"
    ],
    function (Print,PrintTemplate,Map,
              ready, parser, on, array,
              BorderContainer, ContentPane,FeatureLayer,GeometryService,Editor,TemplatePicker,Extent,ArcGISDynamicMapServiceLayer, Navigation) {
// @formatter:on

        // Wait until DOM is ready *and* all outstanding require() calls have been resolved
        ready(function () {

            // Parse DOM nodes decorated with the data-dojo-type attribute
            parser.parse();

            /*
             * Step: Specify the proxy Url
             */
            // config.defaults.io.proxyUrl = "http://localhost/proxy/proxy.ashx";


            var extentInitial = new Extent(
                {"xmin":-867010.9011963734,
                    "ymin":3970205.633871793,"xmax":-823938.6357577345,"ymax":3983391.021250968,"spatialReference":{"wkid":102100}}
            );



            // Create the map
            mapMain = new Map("divMap", {
                basemap: "satellite",
                extent: extentInitial,

            });




            var CasaBaseMap = new ArcGISDynamicMapServiceLayer("http://localhost:6080/arcgis/rest/services/MiniProjet/FondCarte/MapServer", {
                opacity: 0.7
            });
            var Sites = new ArcGISDynamicMapServiceLayer("http://localhost:6080/arcgis/rest/services/MiniProjet/Sites/MapServer");

            var ReclamationLayer = new FeatureLayer("http://localhost:6080/arcgis/rest/services/ProjetSig/Reclamation/FeatureServer/0",{
                outFields : ['*']
            });

            //mapMain.addLayers([CasaBaseMap]);

            //var flFirePoints, flFireLines, flFirePolygons;
            /*
             * Step: Construct the editable layers
             */
            var BV = new FeatureLayer("http://localhost:6080/arcgis/rest/services/MiniProjet/BidonvillesFinal/FeatureServer/0", {
                outFields : ['*']
            });
            var Reclamation = new FeatureLayer("http://localhost:6080/arcgis/rest/services/ProjetSig/Reclamation/FeatureServer/0", {
                outFields : ['*']
            });

            // Listen for the editable layers to finish loading
            mapMain.on("layers-add-result", initEditor);

            // add the editable layers to the map
            //mapMain.addLayers([Reclamation]);
            mapMain.addLayers([BV]);

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

                /*
                 * Step: Build the Editor constructor's first parameter
                 */

                var editorParams = {
                    settings : editorSettings
                };

                /*
                 * Step: Construct the Editor widget
                 */

                widgetEditor = new Editor(editorParams, "divTop");
                widgetEditor.startup();

            };

        });
    });
