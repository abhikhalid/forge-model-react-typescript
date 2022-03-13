import React, { Component } from 'react'
import Axios from "axios";

let viewer: Autodesk.Viewing.GuiViewer3D;
var FORGE_CLIENT_ID = 'dAKUAnHaCKfbiz7uSzMA0b9IdCH8xeM8';//process.env.FORGE_CLIENT_ID;
var FORGE_CLIENT_SECRET = 'F8NLv548X6FPVLnT';//process.env.FORGE_CLIENT_SECRET;
var access_token = '';
var scopes = 'data:read data:write data:create bucket:create bucket:read';
const querystring = require('querystring');

export default class View extends Component {
    render() {
        return (
            <div>
                <div>Autodesk Forge: 3D Viewer App Sample</div>
                <div id="MyViewerDiv"></div>
            </div>
        )
    }

    public componentDidMount() {
        if (!window.Autodesk) {
            this.loadCss('https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css');

            this.loadScript('https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js')
                .onload = () => {
                    this.onScriptLoaded();
                };
        }
    }
    public loadCss(src: string): HTMLLinkElement {
        const link = document.createElement('link');
        link.rel = "stylesheet";
        link.href = src;
        link.type = "text/css";
        document.head.appendChild(link);
        return link;
    }

    private loadScript(src: string): HTMLScriptElement {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        return script;
    }

    private onScriptLoaded() {
        var options = {
            env: 'AutodeskProduction2',
            api: 'streamingV2',  // for models uploaded to EMEA change this option to 'streamingV2_EU'
            getAccessToken: getForgeToken
        };
        var documentId = 'urn:' + 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZGFrdWFuaGFja2ZiaXo3dXN6bWEwYjlpZGNoOHhlbThfdHV0b3JpYWxfYnVja2V0L3JzdF9iYXNpY19zYW1wbGVfcHJvamVjdC5ydnQ';//getUrlParameter('urn');
        // Run this when the page is loaded
        Autodesk.Viewing.Initializer(options, function onInitialized() {
            // Find the element where the 3d viewer will live.    
            var htmlElement = document.getElementById('MyViewerDiv');
            if (htmlElement) {
                // Create and start the viewer in that element    
                viewer = new Autodesk.Viewing.GuiViewer3D(htmlElement);
                viewer.start();
                // Load the document into the viewer.
                Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
            }
        });

    }
}
async function onDocumentLoadSuccess(doc: any) {
    // Load the default viewable geometry into the viewer.
    // Using the doc, we have access to the root BubbleNode,
    // which references the root node of a graph that wraps each object from the Manifest JSON.

    const { MyExtension } = await import('./MyExtension');
    MyExtension.register();
    viewer.loadExtension('MyExtension');

    var viewable = doc.getRoot().getDefaultGeometry();
    if (viewable) {
        viewer.loadDocumentNode(doc, viewable).then(function (result) {
            console.log('Viewable Loaded!');
        }).catch(function (err) {
            console.log('Viewable failed to load.');
            console.log(err);
        }
        )
    }
}
function onDocumentLoadFailure(viewerErrorCode: any) {
    console.error('onDocumentLoadFailure() - errorCode: ' + viewerErrorCode);
    jQuery('#MyViewerDiv').html('<p>Translation in progress... Please try refreshing the page.</p>');
}
function getUrlParameter(name: string) {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(window.location.search);
    console.log('urn');
    console.log(results);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
function getForgeToken(callback: any) {

    // Limit public token to Viewer read only
    Axios({
        method: 'POST',
        url: 'https://developer.api.autodesk.com/authentication/v1/authenticate',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        data: querystring.stringify({
            client_id: FORGE_CLIENT_ID,
            client_secret: FORGE_CLIENT_SECRET,
            grant_type: 'client_credentials',
            scope: 'viewables:read'
        })
    })
        .then(function (response) {
            // Success
            console.log(response);
            callback(response.data.access_token, response.data.expires_in);
            //res.json({ access_token: response.data.access_token, expires_in: response.data.expires_in });
        })
        .catch(function (error) {
            // Failed
            console.log(error);
            //res.status(500).json(error);
        });
}
