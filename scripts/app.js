// Configure
require.config({
    baseUrl : 'scripts'
    , paths : {
        'app' : 'app'
        , 'jquery'                : 'lib/jquery'
        , 'underscore'            : 'lib/underscore'
        , 'backbone'              : 'lib/backbone'
        , 'color'                 : 'lib/color'
        , 'socialite'             : 'lib/socialite'
    }
    , shim : {
        'jquery': {
            'exports' : '$'
        }
        , 'underscore': {
            'exports' : '_'
        }
        , 'socket-io': {
            'exports' : 'io'
        }
        , 'backbone' : {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        }
        , 'color': {
            exports: 'net.brehaut.Color'
        }
        , 'socialite': {
            exports: 'Socialite'
        }
    }
});

// Drop the puck
define([
    'main'
    , 'analytics'
    
]);
