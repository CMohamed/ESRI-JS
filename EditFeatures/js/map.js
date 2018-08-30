var mapMain;
var widgetEditor;

// @formatter:off
require([
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
        "esri/toolbars/navigation"
    ],
    function (Map,
              ready, parser, on, array,
              BorderContainer, ContentPane,FeatureLayer,GeometryService,Editor,TemplatePicker, Navigation) {
// @formatter:on

        // Wait until DOM is ready *and* all outstanding require() calls have been resolved
        ready(function () {

            // Parse DOM nodes decorated with the data-dojo-type attribute
            parser.parse();

            /*
             * Step: Specify the proxy Url
             */
           // config.defaults.io.proxyUrl = "http://localhost/proxy/proxy.ashx";


            // Create the map
            mapMain = new Map("divMap", {
                basemap: "topo",
                center: [-116.64, 34.37],
                zoom: 10
            });


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
