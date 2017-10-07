/* >>>>>>>>>> BEGIN source/mixins/websocket_delegate.js */
// ==========================================================================
// Project:   SC.WebSocket
// Copyright: ©2013 Nicolas BADIA and contributors
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** 
  @namespace
  
  A WebSocket Delegate is consulted by `SC.WebSocket` when events are received.
  You may want to handle this events before propagate them to eventual listeners.

  Example:

    var ws = SC.WebSocket.create({
      server: 'ws://server',
      delegate: MyApp.WebSocketDelegate
    });
  
  @since SproutCore 1.11
  @author Nicolas BADIA
*/
SC.WebSocketDelegate = {
  
  /**
    Walk like a duck

    @type Boolean
  */
  isWebSocketDelegate: true,

  // ..........................................................
  // CALLBACKS
  //

  /**
    The passed webSocket connection is open.

    @param webSocket {SC.WebSocket} The webSocket object
    @param event {Event}
  */
  webSocketDidOpen: function (webSocket, event) {},

  /**
    A message has been received. Before processing it, you have
    a chance to check it. 

    For example, if `isJSON` is true, you will want to check if the message
    is a correct JSON.

    @param webSocket {SC.WebSocket} The webSocket object
    @param data {String}  
    @returns {String|Boolean} Return true to prevent further handling
  */
  webSocketDidReceiveMessage: function (webSocket, data) {
    switch(data) {
      case 'ping': return true; break;
    }

    if (this.get('isJSON')) {
      try {
        JSON.parse(data);
      }
      catch(e) {
        return true;
      }
    }
  },

  /**
    The websocket connection is close. Return true to prevent a
    reconnection or further handling.

    @param webSocket {SC.WebSocket} The webSocket object
    @param closeEvent {CloseEvent} The closeEvent
    @returns {Boolean} Return true to prevent further handling
  */
  webSocketDidClose: function (webSocket, closeEvent) {},

  /**
    Call when an error occur.

    @param webSocket {SC.WebSocket} The webSocket object
    @param event {Event} 
    @returns {Boolean} Return true to prevent further handling
  */
  webSocketDidError: function (webSocket, event) {},

};


/* >>>>>>>>>> BEGIN source/system/response.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global ActiveXObject */

/**
  @class

  A response represents a single response from a server request and handles the communication to
  the server.  An instance of this class is returned whenever you call `SC.Request.send()`.

  SproutCore only defines one concrete subclass of `SC.Response`,`SC.XHRResponse`. In order to
  use `SC.Request` with a non-XHR request type you should create a custom class that extends
  `SC.Response` and set your custom class as the value of `responseClass` on all requests.

  For example,

      var request = SC.Request.getUrl(resourceAddress)
                              .set('responseClass', MyApp.CustomProtocolResponse)
                              .send();

  To extend `SC.Response`, please look at the property and methods listed below. For more examples,
  please look at the code in `SC.XHRResponse`.

  @extend SC.Object
  @since SproutCore 1.0
*/
SC.Response = SC.Object.extend(
/** @scope SC.Response.prototype */ {

  /**
    Walk like a duck

    @type Boolean
  */
  isResponse: YES,

  /**
    Becomes true if there was a failure.  Makes this into an error object.

    @type Boolean
    @default NO
  */
  isError: NO,

  /**
    Always the current response

    @field
    @type SC.Response
    @default `this`
  */
  errorValue: function() {
    return this;
  }.property().cacheable(),

  /**
    The error object generated when this becomes an error

    @type SC.Error
    @default null
  */
  errorObject: null,

  /**
    Request used to generate this response.  This is a copy of the original
    request object as you may have modified the original request object since
    then.

    To retrieve the original request object use originalRequest.

    @type SC.Request
    @default null
  */
  request: null,

  /**
    The request object that originated this request series.  Mostly this is
    useful if you are looking for a reference to the original request.  To
    inspect actual properties you should use request instead.

    @field
    @type SC.Request
    @observes request
  */
  originalRequest: function() {
    var ret = this.get('request');
    while (ret.get('source')) { ret = ret.get('source'); }
    return ret;
  }.property('request').cacheable(),

  /**
    Type of request. Must be an HTTP method. Based on the request.

    @field
    @type String
    @observes request
  */
  type: function() {
    return this.getPath('request.type');
  }.property('request').cacheable(),

  /**
    URL of request.

    @field
    @type String
    @observes request
  */
  address: function() {
    return this.getPath('request.address');
  }.property('request').cacheable(),

  /**
    If set then will attempt to automatically parse response as JSON
    regardless of headers.

    @field
    @type Boolean
    @default NO
    @observes request
  */
  isJSON: function() {
    return this.getPath('request.isJSON') || NO;
  }.property('request').cacheable(),

  /**
    If set, then will attempt to automatically parse response as XML
    regardless of headers.

    @field
    @type Boolean
    @default NO
    @observes request
  */
  isXML: function() {
    return this.getPath('request.isXML') || NO;
  }.property('request').cacheable(),

  /**
    Returns the hash of listeners set on the request.

    @field
    @type Hash
    @observes request
  */
  listeners: function() {
    return this.getPath('request.listeners');
  }.property('request').cacheable(),

  /**
    The response status code.

    @type Number
    @default -100
  */
  status: -100, // READY

  /**
    Headers from the response. Computed on-demand

    @type Hash
    @default null
  */
  headers: null,

  /**
    The response body or the parsed JSON. Returns a SC.Error instance
    if there is a JSON parsing error. If isJSON was set, will be parsed
    automatically.

    @field
    @type {Hash|String|SC.Error}
  */
  body: function() {
    // TODO: support XML
    // TODO: why not use the content-type header?
    var ret = this.get('encodedBody');
    if (ret && this.get('isJSON')) {
      try {
        ret = SC.json.decode(ret);
      } catch(e) {
        return SC.Error.create({
          message: e.name + ': ' + e.message,
          label: 'Response',
          errorValue: this });
      }
    }
    return ret;
  }.property('encodedBody').cacheable(),

  /**
    @private
    @deprecated Use body instead.

    Alias for body.

    @type Hash|String
    @see #body
  */
  response: function() {
    return this.get('body');
  }.property('body').cacheable(),

  /**
    Set to YES if response is cancelled

    @type Boolean
    @default NO
  */
  isCancelled: NO,

  /**
    Set to YES if the request timed out. Set to NO if the request has
    completed before the timeout value. Set to null if the timeout timer is
    still ticking.

    @type Boolean
    @default null
  */
  timedOut: null,

  /**
    The timer tracking the timeout

    @type Number
    @default null
  */
  timeoutTimer: null,


  // ..........................................................
  // METHODS
  //

  /**
    Called by the request manager when its time to actually run. This will
    invoke any callbacks on the source request then invoke transport() to
    begin the actual request.
  */
  fire: function() {
    var req = this.get('request'),
        source = req ? req.get('source') : null;

    // first give the source a chance to fixup the request and response
    // then freeze req so no more changes can happen.
    if (source && source.willSend) { source.willSend(req, this); }
    req.freeze();

    // if the source did not cancel the request, then invoke the transport
    // to actually trigger the request.  This might receive a response
    // immediately if it is synchronous.
    if (!this.get('isCancelled')) { this.invokeTransport(); }

    // If the request specified a timeout value, then set a timer for it now.
    var timeout = req.get('timeout');
    if (timeout) {
      var timer = SC.Timer.schedule({
        target: this,
        action: 'timeoutReached',
        interval: timeout,
        repeats: NO
      });
      this.set('timeoutTimer', timer);
    }

    // if the transport did not cancel the request for some reason, let the
    // source know that the request was sent
    if (!this.get('isCancelled') && source && source.didSend) {
      source.didSend(req, this);
    }
  },

  /**
    Called by `SC.Response#fire()`. Starts the transport by invoking the
    `SC.Response#receive()` function.
  */
  invokeTransport: function() {
    this.receive(function(proceed) { this.set('status', 200); }, this);
  },

  /**
    Invoked by the transport when it receives a response. The passed-in
    callback will be invoked to actually process the response. If cancelled
    we will pass NO. You should clean up instead.

    Invokes callbacks on the source request also.

    @param {Function} callback the function to receive
    @param {Object} context context to execute the callback in
    @returns {SC.Response} receiver
  */
  receive: function(callback, context) {
    if (!this.get('timedOut')) {
      // If we had a timeout timer scheduled, invalidate it now.
      var timer = this.get('timeoutTimer');
      if (timer) { timer.invalidate(); }
      this.set('timedOut', NO);
    }

    var req = this.get('request');
    var source = req ? req.get('source') : null;

    SC.run(function() {
      // invoke the source, giving a chance to fixup the response or (more
      // likely) cancel the request.
      if (source && source.willReceive) { source.willReceive(req, this); }

      // invoke the callback.  note if the response was cancelled or not
      callback.call(context, !this.get('isCancelled'));

      // if we weren't cancelled, then give the source first crack at handling
      // the response.  if the source doesn't want listeners to be notified,
      // it will cancel the response.
      if (!this.get('isCancelled') && source && source.didReceive) {
        source.didReceive(req, this);
      }

      // notify listeners if we weren't cancelled.
      if (!this.get('isCancelled')) { this.notify(); }
    }, this);

    // no matter what, remove from inflight queue
    SC.Request.manager.transportDidClose(this);
    return this;
  },

  /**
    Default method just closes the connection. It will also mark the request
    as cancelled, which will not call any listeners.
  */
  cancel: function() {
    if (!this.get('isCancelled')) {
      this.set('isCancelled', YES);
      this.cancelTransport();
      SC.Request.manager.transportDidClose(this);
    }
  },

  /**
    Default method just closes the connection.

    @returns {Boolean} YES if this response has not timed out yet, NO otherwise
  */
  timeoutReached: function() {
    // If we already received a response yet the timer still fired for some
    // reason, do nothing.
    if (this.get('timedOut') === null) {
      this.set('timedOut', YES);
      this.cancelTransport();

      // Invokes any relevant callbacks and notifies registered listeners, if
      // any. In the event of a timeout, we set the status to 0 since we
      // didn't actually get a response from the server.
      this.receive(function(proceed) {
        if (!proceed) { return; }

        // Set our value to an error.
        var error = SC.$error("HTTP Request timed out", "Request", 0);
        error.set("errorValue", this);
        this.set('isError', YES);
        this.set('errorObject', error);
        this.set('status', 0);
      }, this);

      return YES;
    }

    return NO;
  },

  /**
    Override with concrete implementation to actually cancel the transport.
  */
  cancelTransport: function() {},

  /**
    @private

    Will notify each listener. Returns true if any of the listeners handle.
  */
  _notifyListeners: function(listeners, status) {
    var notifiers = listeners[status], args, target, action;
    if (!notifiers) { return NO; }

    var handled = NO;
    var len = notifiers.length;

    for (var i = 0; i < len; i++) {
      var notifier = notifiers[i];
      args = (notifier.args || []).copy();
      args.unshift(this);

      target = notifier.target;
      action = notifier.action;
      if (SC.typeOf(action) === SC.T_STRING) { action = target[action]; }

      handled = action.apply(target, args);
    }

    return handled;
  },

  /**
    Notifies any saved target/action. Call whenever you cancel, or end.

    @returns {SC.Response} receiver
  */
  notify: function() {
    var listeners = this.get('listeners'),
        status = this.get('status'),
        baseStat = Math.floor(status / 100) * 100,
        handled = NO;

    if (!listeners) { return this; }

    handled = this._notifyListeners(listeners, status);
    if (!handled && baseStat !== status) { handled = this._notifyListeners(listeners, baseStat); }
    if (!handled && status !== 0) { handled = this._notifyListeners(listeners, 0); }

    return this;
  },

  /**
    String representation of the response object

    @returns {String}
  */
  toString: function() {
    var ret = arguments.callee.base.apply(this,arguments);
    return "%@<%@ %@, status=%@".fmt(ret, this.get('type'), this.get('address'), this.get('status'));
  }

});

/**
  @class

  Concrete implementation of `SC.Response` that implements support for using XHR requests. This is
  the default response class that `SC.Request` uses and it is able to create cross-browser
  compatible XHR requests to the address defined on a request and to notify according to the status
  code fallbacks registered on the request.

  You will not typically deal with this class other than to receive an instance of it when handling
  `SC.Request` responses. For more information on how to create a request and handle an XHR response,
  please @see SC.Request.

  @extends SC.Response
  @since SproutCore 1.0
*/
SC.XHRResponse = SC.Response.extend(
/** @scope SC.XHRResponse.prototype */{

  /**
    Implement transport-specific support for fetching all headers
  */
  headers: function() {
    var xhr = this.get('rawRequest'),
        str = xhr ? xhr.getAllResponseHeaders() : null,
        ret = {};

    if (!str) { return ret; }

    str.split("\n").forEach(function(header) {
      var idx = header.indexOf(':'),
          key, value;

      if (idx >= 0) {
        key = header.slice(0,idx);
        value = header.slice(idx + 1).trim();
        ret[key] = value;
      }
    }, this);

    return ret;
  }.property('status').cacheable(),

  /**
    Returns a header value if found.

    @param {String} key The header key
    @returns {String}
  */
  header: function(key) {
    var xhr = this.get('rawRequest');
    return xhr ? xhr.getResponseHeader(key) : null;
  },

  /**
    Implement transport-specific support for fetching tasks

    @field
    @type String
    @default #rawRequest
  */
  encodedBody: function() {
    var xhr = this.get('rawRequest');

    if (!xhr) { return null; }
    if (this.get('isXML')) { return xhr.responseXML; }

    return xhr.responseText;
  }.property('status').cacheable(),

  /**
    Cancels the request.
  */
  cancelTransport: function() {
    var rawRequest = this.get('rawRequest');
    if (rawRequest) { rawRequest.abort(); }
    this.set('rawRequest', null);
  },


  /**
    Starts the transport of the request

    @returns {XMLHttpRequest|ActiveXObject}
  */
  invokeTransport: function() {
    var listener, listeners, listenersForKey,
      rawRequest,
      request = this.get('request'),
      transport, handleReadyStateChange, async, headers;

    rawRequest = this.createRequest();
    this.set('rawRequest', rawRequest);

    // configure async callback - differs per browser...
    async = !!request.get('isAsynchronous');

    if (async) {
      if (SC.platform.get('supportsXHR2ProgressEvent')) {
        // XMLHttpRequest Level 2

        // Add progress event listeners that were specified on the request.
        listeners = request.get("listeners");
        if (listeners) {
          for (var key in listeners) {

            // Make sure the key is not an HTTP numeric status code.
            if (isNaN(parseInt(key, 10))) {
              // We still allow multiple notifiers on progress events, but we
              // don't try to optimize this by using a single listener, because
              // it is highly unlikely that the developer will add duplicate
              // progress event notifiers and if they did, it is also unlikely
              // that they would expect them to cascade in the way that the
              // status code notifiers do.
              listenersForKey = listeners[key];
              for (var i = 0, len = listenersForKey.length; i < len; i++) {
                listener = listenersForKey[i];

                var keyTarget = key.split('.');
                if (SC.none(keyTarget[1])) {
                  SC.Event.add(rawRequest, keyTarget[0], listener.target, listener.action, listener.args);
                } else {
                  SC.Event.add(rawRequest[keyTarget[0]], keyTarget[1], listener.target, listener.action, listener.args);
                }
              }
            }
          }
        }

        if (SC.platform.get('supportsXHR2LoadEndEvent')) {
          SC.Event.add(rawRequest, 'loadend', this, this.finishRequest);
        } else {
          SC.Event.add(rawRequest, 'load', this, this.finishRequest);
          SC.Event.add(rawRequest, 'error', this, this.finishRequest);
          SC.Event.add(rawRequest, 'abort', this, this.finishRequest);
        }
      } else if (window.XMLHttpRequest && rawRequest.addEventListener) {
        // XMLHttpRequest Level 1 + support for addEventListener (IE prior to version 9.0 lacks support for addEventListener)
        SC.Event.add(rawRequest, 'readystatechange', this, this.finishRequest);
      } else {
        transport = this;
        handleReadyStateChange = function() {
          if (!transport) { return null; }
          var ret = transport.finishRequest();
          if (ret) { transport = null; }
          return ret;
        };
        rawRequest.onreadystatechange = handleReadyStateChange;
      }
    }

    // initiate request.
    rawRequest.open(this.get('type'), this.get('address'), async);

    // headers need to be set *after* the open call.
    headers = this.getPath('request.headers');
    for (var headerKey in headers) {
      rawRequest.setRequestHeader(headerKey, headers[headerKey]);
    }

    // Do we need to allow Cookies for x-domain requests?
    if (!this.getPath('request.isSameDomain') && this.getPath('request.allowCredentials')) {
      rawRequest.withCredentials = true;
    }

    // now send the actual request body - for sync requests browser will
    // block here
    rawRequest.send(this.getPath('request.encodedBody'));
    if (!async) { this.finishRequest(); }

    return rawRequest;
  },

  /**
    Creates the correct XMLHttpRequest object for this browser.

    You can override this if you need to, for example, create an XHR on a
    different domain name from an iframe.

    @returns {XMLHttpRequest|ActiveXObject}
  */
  createRequest: function() {
    var rawRequest;

    // check native support first
    if (window.XMLHttpRequest) {
      rawRequest = new XMLHttpRequest();
    } else {
      // There are two relevant Microsoft MSXML object types.
      // See here for more information:
      // http://www.snook.ca/archives/javascript/xmlhttprequest_activex_ie/
      // http://blogs.msdn.com/b/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
      // http://msdn.microsoft.com/en-us/library/windows/desktop/ms763742(v=vs.85).aspx
      try { rawRequest = new ActiveXObject("MSXML2.XMLHTTP.6.0");  } catch(e) {}
      try { if (!rawRequest) rawRequest = new ActiveXObject("MSXML2.XMLHTTP");  } catch(e) {}
    }

    return rawRequest;
  },

  /**
    @private

    Called by the XHR when it responds with some final results.

    @param {XMLHttpRequest} rawRequest the actual request
    @returns {Boolean} YES if completed, NO otherwise
  */
  finishRequest: function(evt) {
    var listener, listeners, listenersForKey,
      rawRequest = this.get('rawRequest'),
      readyState = rawRequest.readyState,
      request,
      error, status, msg;

    if (readyState === 4 && !this.get('timedOut')) {
      this.receive(function(proceed) {
        if (!proceed) { return; }

        // collect the status and decide if we're in an error state or not
        status = -1;
        try {
          status = rawRequest.status || 0;
          // IE mangles 204 to 1223. See http://bugs.jquery.com/ticket/1450 and many others
          status = status === 1223 ? 204 : status;
        } catch (e) {}

        // if there was an error - setup error and save it
        if ((status < 200) || (status >= 300)) {

          try {
            msg = rawRequest.statusText || '';
          } catch(e2) {
            msg = '';
          }

          error = SC.$error(msg || "HTTP Request failed", "Request", status);
          error.set("errorValue", this);
          this.set('isError', YES);
          this.set('errorObject', error);
        }

        // set the status - this will trigger changes on related properties
        this.set('status', status);
      }, this);

      // Avoid memory leaks
      if (SC.platform.get('supportsXHR2ProgressEvent')) {
        // XMLHttpRequest Level 2

        if (SC.platform.get('supportsXHR2LoadEndEvent')) {
          SC.Event.remove(rawRequest, 'loadend', this, this.finishRequest);
        } else {
          SC.Event.remove(rawRequest, 'load', this, this.finishRequest);
          SC.Event.remove(rawRequest, 'error', this, this.finishRequest);
          SC.Event.remove(rawRequest, 'abort', this, this.finishRequest);
        }

        request = this.get('request');
        listeners = request.get("listeners");
        if (listeners) {
          for (var key in listeners) {

            // Make sure the key is not an HTTP numeric status code.
            if (isNaN(parseInt(key, 10))) {
              listenersForKey = listeners[key];
              for (var i = 0, len = listenersForKey.length; i < len; i++) {
                listener = listenersForKey[i];

                var keyTarget = key.split('.');
                if (SC.none(keyTarget[1])) {
                  SC.Event.remove(rawRequest, keyTarget[0], listener.target, listener.action, listener.args);
                } else {
                  SC.Event.remove(rawRequest[keyTarget[0]], keyTarget[1], listener.target, listener.action, listener.args);
                }
              }
            }
          }
        }
      } else if (window.XMLHttpRequest && rawRequest.addEventListener) {
        // XMLHttpRequest Level 1 + support for addEventListener (IE prior to version 9.0 lacks support for addEventListener)
        SC.Event.remove(rawRequest, 'readystatechange', this, this.finishRequest);
      } else {
        rawRequest.onreadystatechange = null;
      }

      return YES;
    }
    return NO;
  }

});

/* >>>>>>>>>> BEGIN source/system/request.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/response');

/**
  @class

  Implements support for AJAX requests using XHR, XHR2 and other protocols.

  SC.Request is essentially a client version of the request/response objects you receive when
  implementing HTTP servers.

  To send a request, you just need to create your request object, configure your options, and call
  `send()` to initiate the request. The request will be added to the pending request queue managed
  by `SC.Request.manager`.

  For example,

      // Create a simple XHR request.
      var request = SC.Request.create();
      request.set('address', resourceAddress);
      request.set('type', 'GET');
      request.send();

  The previous example will create an XHR GET request to `resourceAddress`. Because the `address`
  and `type` of the request must be set on every request, there are helper methods on `SC.Request`
  that you will likely use in every situation.

  For example, the previous example can be written more concisely as,

      // Create a simple XHR request.
      var request = SC.Request.getUrl(resourceAddress);

  There are four other helper methods to cover the other common HTTP method types: `POST`, `DELETE`,
  `PUT` and `PATCH`, which are `postUrl`, `deleteUrl`, `putUrl` and `patchUrl` respectively. Since
  you may also send a body with `POST`, `PUT` and `PATCH` requests, those helper methods also take a
  second argument `body` (which is analogous to calling `request.set('body', body)`).

  ## Responses

  ### XHR Requests & Custom Communication Protocols

  By default, the request will create an instance of `SC.XHRResponse` in order to complete the
  request. As the name implies, the `SC.XHRResponse` class will make an XHR request to the server,
  which is the typical method that the SproutCore client will communicate with remote endpoints.

  In order to use a custom response type handler, you should extend `SC.Response` and set the
  `responseClass` of the request to your custom response type.

  For example,

      var request = SC.Request.getUrl(resourceAddress).set('responseClass', MyApp.CustomProtocolResponse);


  ### Handling Responses

  `SC.Request` supports multiple response handlers based on the status code of the response. This
  system is quite intelligent and allows for specific callbacks to handle specific status codes
  (e.g. 404) or general status codes (e.g. 400) or combinations of both. Callbacks are registered
  using the `notify` method, which accepts a `target` and a `method` which will be called when the
  request completes. The most basic example of registering a general response handler would be like
  so,

      // The response handler target (typically a state or controller or some such SC.Object instance).
      var targetObject;

      targetObject = SC.Object.create({

        handleResponse: function (response) {
          // Handle the various possible status codes.
          var status = response.get('status');
          if (status === 200) { // 200 OK
            // Do something.
          } else if (status < 400) { // i.e. 3xx
            // Do something.
          } else ...
        }

      });


      // Create a simple XHR request.
      var request;

      request = SC.Request.getUrl(resourceAddress)
                          .notify(targetObject, 'handleResponse')
                          .send();

  However, this approach requires that every response handler be able to handle all of the possible
  error codes that we may be able to handle in a more general manner. It's also more code for us
  to write to write all of the multiple condition statements. For this reason, the `notify` method
  accepts an optional status code argument *before* the target and method. You can use a generic
  status code (i.e. 400) or a specific status code (i.e. 404). If you use a generic status code, all
  statuses within that range will result in that callback being used.

  For example, here is a more specific example,

      // The response handler target (typically a data source or state or some such SC.Object instance).
      var targetObject;

      targetObject = SC.Object.create({

        gotOK: function (response) { // 2xx Successful
          // Do something.

          return true; // Return true to ensure that any following generic handlers don't run!
        },

        gotForbidden: function (response) { // 403 Forbidden
          // Do something.

          return true; // Return true to ensure that any following generic handlers don't run!
        },

        gotUnknownError: function (response) { // 3xx, 4xx (except 403), 5xx
          // Do something.
        }

      });


      // Create a simple XHR request.
      var request;

      request = SC.Request.getUrl(resourceAddress)
                          .notify(200, targetObject, 'gotOK')
                          .notify(403, targetObject, 'gotForbidden')
                          .notify(targetObject, 'gotUnknownError')
                          .send();

  Please note that the notifications will fall through in the order they are added if not handled.
  This means that the generic handler `gotUnknownError` will be called for any responses not caught
  by the other handlers. In this example, to ensure that `gotUnknownError` doesn't get called when a
  2xx or 403 response comes in, those handlers *return `true`*.

  Please also note that this design allows us to easily re-use handler methods. For example, we may
  choose to have `gotUnknownError` be the standard last resort fallback handler for all requests.

  For more examples, including handling of XHR2 progress events, please @see SC.Request.prototype.notify.

  ### Response Bodies & JSON Decoding

  The body of the response is the `body` property on the response object which is passed to the
  notify target method. For example,

      gotOK: function (response) { // 2xx Successful
        var body = response.get('body');

        // Do something.

        return true; // Return true to ensure that any following generic handlers don't run!
      },

  The type of the body will depend on what the server returns, but since it will typically be JSON,
  we have a built-in option to have the body be decoded into a JavaScript object automatically by
  setting `isJSON` to true on the request.

  For example,

      // Create a simple XHR request.
      var request;

      request = SC.Request.getUrl(resourceAddress)
                          .set('isJSON', true)
                          .notify(200, targetObject, 'gotOK')
                          .send();

  There is a helper method to achieve this as well, `json()`,

      // Create a simple XHR request.
      var request;

      request = SC.Request.getUrl(resourceAddress)
                          .json() // Set `isJSON` to true.
                          .notify(200, targetObject, 'gotOK')
                          .send();

  @extends SC.Object
  @extends SC.Copyable
  @extends SC.Freezable
  @since SproutCore 1.0
*/
SC.Request = SC.Object.extend(SC.Copyable, SC.Freezable,
/** @scope SC.Request.prototype */ {

  // ..........................................................
  // PROPERTIES
  //

  /**
    Whether to allow credentials, such as Cookies, in the request. While this has no effect on
    requests to the same domain, cross-domain requests require that the transport be configured to
    allow the inclusion of credentials such as Cookies.

    You can change this property using the chainable `credentials()` helper method (or set it directly).

    @type Boolean
    @default YES
  */
  allowCredentials: YES,

  /**
    Sends the request asynchronously instead of blocking the browser. You
    should almost always make requests asynchronous. You can change this
    options with the async() helper option (or simply set it directly).

    @type Boolean
    @default YES
  */
  isAsynchronous: YES,

  /**
    Processes the request and response as JSON if possible. You can change
    this option with the json() helper method.

    @type Boolean
    @default NO
  */
  isJSON: NO,

  /**
    Process the request and response as XML if possible. You can change this
    option with the xml() helper method.

    @type Boolean
    @default NO
  */
  isXML: NO,

  /**
    Specifies whether or not the request will have custom headers attached
    to it. By default, SC.Request attaches X-Requested-With and
    X-SproutCore-Version headers to all outgoing requests. This allows
    you to override that behavior.

    You may want to set this to NO if you are making simple CORS requests
    in compatible browsers. See <a href="http://www.w3.org/TR/cors/">CORS
    Spec for more information.</a>

    TODO: Add unit tests for this feature

    @type Boolean
    @default YES
  */
  attachIdentifyingHeaders: YES,

  /**
    Current set of headers for the request

    @field
    @type Hash
    @default {}
  */
  headers: function() {
    var ret = this._headers;
    if (!ret) { ret = this._headers = {}; }
    return ret;
  }.property().cacheable(),

  /**
    Whether the request is within the same domain or not. The response class may use this property
    to determine specific cross domain configurations.

    @field
    @type Boolean
  */
  isSameDomain: function () {
    var address = this.get('address'),
      urlRegex = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
      location = window.location,
      parts, originParts;

      // This pattern matching strategy was taken from jQuery.
      parts = urlRegex.exec( address.toLowerCase()  );
      originParts = urlRegex.exec( location.href.toLowerCase() );

      return SC.none(parts) ||
        (parts[1] === originParts[1] &&  // protocol
         parts[2] === originParts[2] &&  // domain
         (parts[3] || (parts[1] === "http:" ? 80 : 443 ) ) === (originParts[3] || (originParts[1] === "http:" ? 80 : 443))); // port
  }.property('address').cacheable(),

  /**
    Underlying response class to actually handle this request. Currently the
    only supported option is SC.XHRResponse which uses a traditional
    XHR transport.

    @type SC.Response
    @default SC.XHRResponse
  */
  responseClass: SC.XHRResponse,

  /**
    The original request for copied requests.

    @property SC.Request
    @default null
  */
  source: null,

  /**
    The URL this request to go to.

    @type String
    @default null
  */
  address: null,

  /**
    The HTTP method to use.

    @type String
    @default 'GET'
  */
  type: 'GET',

  /**
    An optional timeout value of the request, in milliseconds. The timer
    begins when SC.Response#fire is actually invoked by the request manager
    and not necessarily when SC.Request#send is invoked. If this timeout is
    reached before a response is received, the equivalent of
    SC.Request.manager#cancel() will be invoked on the SC.Response instance
    and the didReceive() callback will be called.

    An exception will be thrown if you try to invoke send() on a request that
    has both a timeout and isAsyncronous set to NO.

    @type Number
    @default null
  */
  timeout: null,

  /**
    The body of the request.  May be an object if isJSON or isXML is set,
    otherwise should be a string.

    @type Object|String
    @default null
  */
  body: null,

  /**
    The body, encoded as JSON or XML if needed.

    @field
    @type Object|String
    @default #body
  */
  encodedBody: function() {
    // TODO: support XML
    var ret = this.get('body');
    if (ret && this.get('isJSON')) { ret = SC.json.encode(ret); }
    return ret;
  }.property('isJSON', 'isXML', 'body').cacheable(),


  // ..........................................................
  // CALLBACKS
  //

  /**
    Invoked on the original request object just before a copied request is
    frozen and then sent to the server. This gives you one last change to
    fixup the request; possibly adding headers and other options.

    If you do not want the request to actually send, call cancel().

    @param {SC.Request} request A copy of the request object, not frozen
    @param {SC.Response} response The object that will wrap the response
  */
  willSend: function(request, response) {},

  /**
    Invoked on the original request object just after the request is sent to
    the server. You might use this callback to update some state in your
    application.

    The passed request is a frozen copy of the request, indicating the
    options set at the time of the request.

    @param {SC.Request} request A copy of the request object, frozen
    @param {SC.Response} response The object that will wrap the response
    @returns {Boolean} YES on success, NO on failure
  */
  didSend: function(request, response) {},

  /**
    Invoked when a response has been received but not yet processed. This is
    your chance to fix up the response based on the results. If you don't
    want to continue processing the response call response.cancel().

    @param {SC.Request} request A copy of the request object, frozen
    @param {SC.Response} response The object that will wrap the response
  */
  willReceive: function(request, response) {},

  /**
    Invoked after a response has been processed but before any listeners are
    notified. You can do any standard processing on the request at this
    point. If you don't want to allow notifications to continue, call
    response.cancel()

    @param {SC.Request} request A copy of the request object, frozen
    @param {SC.Response} response The object that will wrap the response
  */
  didReceive: function(request, response) {},


  // ..........................................................
  // HELPER METHODS
  //

  /** @private */
  concatenatedProperties: 'COPY_KEYS',

  /** @private */
  COPY_KEYS: ['attachIdentifyingHeaders', 'allowCredentials', 'isAsynchronous', 'isJSON', 'isXML', 'address', 'type', 'timeout', 'body', 'responseClass', 'willSend', 'didSend', 'willReceive', 'didReceive'],

  /**
    Returns a copy of the current request. This will only copy certain
    properties so if you want to add additional properties to the copy you
    will need to override copy() in a subclass.

    @returns {SC.Request} new request
  */
  copy: function() {
    var ret = {},
        keys = this.COPY_KEYS,
        loc = keys.length,
        key;

    while(--loc >= 0) {
      key = keys[loc];
      if (this.hasOwnProperty(key)) {
        ret[key] = this.get(key);
      }
    }

    if (this.hasOwnProperty('listeners')) {
      ret.listeners = SC.copy(this.get('listeners'));
    }

    if (this.hasOwnProperty('_headers')) {
      ret._headers = SC.copy(this._headers);
    }

    ret.source = this.get('source') || this;

    return this.constructor.create(ret);
  },

  /**
    To set headers on the request object. Pass either a single key/value
    pair or a hash of key/value pairs. If you pass only a header name, this
    will return the current value of the header.

    @param {String|Hash} key
    @param {String} value
    @returns {SC.Request|Object} receiver
  */
  header: function(key, value) {
    var header, headers;

    if (SC.typeOf(key) === SC.T_STRING) {
      headers = this._headers;
      if (arguments.length === 1) {
        return headers ? headers[key] : null;
      } else {
        this.propertyWillChange('headers');
        if (!headers) { headers = this._headers = {}; }
        headers[key] = value;
        this.propertyDidChange('headers');
        return this;
      }

    // handle parsing hash of parameters
    } else if (value === undefined) {
      headers = key;
      this.beginPropertyChanges();
      for(header in headers) {
        if (!headers.hasOwnProperty(header)) { continue; }
        this.header(header, headers[header]);
      }
      this.endPropertyChanges();
      return this;
    }

    return this;
  },

  /**
    Clears the list of headers that were set on this request.
    This could be used by a subclass to blow-away any custom
    headers that were added by the super class.
  */
  clearHeaders: function() {
    this.propertyWillChange('headers');
    this._headers = {};
    this.propertyDidChange('headers');
  },

  /**
    Converts the current request to be asynchronous.

    @param {Boolean} flag YES to make asynchronous, NO or undefined. Default YES.
    @returns {SC.Request} receiver
  */
  async: function(flag) {
    if (flag === undefined) { flag = YES; }
    return this.set('isAsynchronous', flag);
  },

  /**
    Converts the current request to request allowing credentials or not.

    @param {Boolean} flag YES to request allowing credentials, NO to disallow credentials. Default YES.
    @returns {SC.Request} receiver
  */
  credentials: function(flag) {
    if (flag === undefined) { flag = YES; }
    return this.set('allowCredentials', flag);
  },

  /**
    Sets the maximum amount of time the request will wait for a response.

    @param {Number} timeout The timeout in milliseconds.
    @returns {SC.Request} receiver
  */
  timeoutAfter: function(timeout) {
    return this.set('timeout', timeout);
  },

  /**
    Converts the current request to use JSON.

    @param {Boolean} flag YES to make JSON, NO or undefined. Default YES.
    @returns {SC.Request} receiver
  */
  json: function(flag) {
    if (flag === undefined) { flag = YES; }
    if (flag) { this.set('isXML', NO); }
    return this.set('isJSON', flag);
  },

  /**
    Converts the current request to use XML.

    @param {Boolean} flag YES to make XML, NO or undefined. Default YES.
    @returns {SC.Request} recevier
  */
  xml: function(flag) {
    if (flag === undefined) { flag = YES; }
    if (flag) { this.set('isJSON', NO); }
    return this.set('isXML', flag);
  },

  /**
    Called just before a request is enqueued.  This will encode the body
    into JSON if it is not already encoded, and set identifying headers
  */
  _prep: function() {
    var hasContentType = !!this.header('Content-Type');

    if (this.get('attachIdentifyingHeaders')) {
      this.header('X-Requested-With', 'XMLHttpRequest');
      this.header('X-SproutCore-Version', SC.VERSION);
    }

    // Set the Content-Type header only if not specified and the request
    // includes a body.
    if (!hasContentType && !!this.get('body')) {
      if (this.get('isJSON')) {
        this.header('Content-Type', 'application/json');
      } else if (this.get('isXML')) {
        this.header('Content-Type', 'text/xml');
      }
    }
    return this;
  },

  /**
    Will fire the actual request. If you have set the request to use JSON
    mode then you can pass any object that can be converted to JSON as the
    body. Otherwise you should pass a string body.

    @param {String|Object} [body]
    @returns {SC.Response} New response object
  */
  send: function(body) {
    // Sanity-check: Be sure a timeout value was not specified if the request
    // is synchronous (because it wouldn't work).
    var timeout = this.get('timeout');
    if (timeout && !this.get('isAsynchronous')) {
      throw new Error("Timeout values cannot be used with synchronous requests");
    } else if (timeout === 0) {
      throw new Error("The timeout value must either not be specified or must be greater than 0");
    }

    if (body) { this.set('body', body); }
    return SC.Request.manager.sendRequest(this.copy()._prep());
  },

  /**
    Resends the current request. This is more efficient than calling send()
    for requests that have already been used in a send. Otherwise acts just
    like send(). Does not take a body argument.

    @returns {SC.Response} new response object
  */
  resend: function() {
    var req = this.get('source') ? this : this.copy()._prep();
    return SC.Request.manager.sendRequest(req);
  },

  /**
    Configures a callback to execute as a request progresses or completes. You
    must pass at least a target and action/method to this and optionally an
    event name or status code.

    You may also pass additional arguments which will then be passed along to
    your callback.

    ## Scoping With Status Codes

    If you pass a status code as the first argument to this method, the
    accompanying notification callback will only be called if the response
    status matches the status code. For example, if you pass 201 (or
    SC.Request.CREATED), the accompanying method will only be called if the
    response status from the server is also 201.

    You can also pass "generic" status codes such as 200, 300, or 400, which
    will be invoked anytime the status code is in the same range and if a more
    specific notifier was not registered first and returned YES.

    Finally, passing a status code of 0 or no status at all will cause your
    method to be executed no matter what the resulting status is unless a
    more specific notifier was registered first and returned YES.

    For example,

        var req = SC.Request.create({type: 'POST'});
        req.notify(201, this, this.reqWasCreated);  // Handle a specific status code
        req.notify(401, this, this.reqWasUnauthorized);  // Handle a specific status code
        req.notify(400, this, this.reqDidRedirect);  // Handle any 4xx status
        req.notify(this, function(response, arg1, arg2) {
          // do something
        }, arg1, arg2);  // Handle any status.  Also, passing additional arguments to the callback handler

    ## Notifying on Progress Events

    If you pass a progress event name your callback will be called each time
    the event fires on the response.  For example, the XMLHttpRequest Level 2
    specification defines several progress events: loadstart, progress, abort,
    error, load, timeout and loadend.  Therefore, when using the default
    SC.Request responseClass, SC.XHRResponse, you can be notified of each of
    these events by simply providing the matching event name.

    Note that many older browsers do not support XMLHttpRequest Level 2.  See
    http://caniuse.com/xhr2 for a list of supported browsers.

    For example,

      var req = SC.Request.create({type: 'GET'});
      req.notify('progress', this, this.reqDidProgress); // Handle 'progress' events
      req.notify('abort', this, this.reqDidAbort); // Handle 'abort' events
      req.notify('upload.progress', this, this.reqUploadDidProgress); // Handle 'progress' events on the XMLHttpRequestUpload
      req.send();

    ## Callback Format

    Your notification callback should expect to receive the Response object as
    the first parameter for status code notifications and the Event object for
    progress notifications; plus any additional parameters that you pass. If
    your callback handles the notification and to prevent further handling, it
    should return YES.

    @param [statusOrEvent] {Number|String} A Number status code or String Event name.
    @param target {Object} The target object for the callback action.
    @param action {String|Function} The method name or function to call on the target.
    @returns {SC.Request} The SC.Request object.
  */
  notify: function(statusOrEvent, target, action) {
    var args,
      i, len;

    
    if (statusOrEvent === 'loadend' && SC.Request.WARN_ON_LOADEND) {
      SC.warn("Developer Warning: You have called SC.Request#notify for the 'loadend' event. Note that on certain platforms, like older iPads, loadend is not supported and this notification will fail silently. You can protect against this by checking SC.platform.get('supportsXHR2LoadEndEvent'), and attaching listeners for load, error and abort instead. (This is not done automatically because your code may need to handle event type and fire order considerations.) To suppress this warning, set SC.Request.WARN_ON_LOADEND to NO.");
    }
    

    // Normalize arguments
    if (SC.typeOf(statusOrEvent) !== SC.T_NUMBER && SC.typeOf(statusOrEvent) !== SC.T_STRING) {
      // Accept multiple additional arguments (Do so before shifting the arguments!)

      // Fast arguments access.
      // Accessing `arguments.length` is just a Number and doesn't materialize the `arguments` object, which is costly.
      args = new Array(arguments.length - 2); //  SC.A(arguments).slice(2)
      for (i = 0, len = args.length; i < len; i++) { args[i] = arguments[i + 2]; }

      // Shift the arguments
      action = target;
      target = statusOrEvent;
      statusOrEvent = 0;
    } else {
      // Accept multiple additional arguments.

      if (arguments.length > 3) {
        // Fast arguments access.
        // Accessing `arguments.length` is just a Number and doesn't materialize the `arguments` object, which is costly.
        args = new Array(arguments.length - 3); //  SC.A(arguments).slice(3)
        for (i = 0, len = args.length; i < len; i++) { args[i] = arguments[i + 3]; }
      } else {
        args = [];
      }
    }

    // Prepare listeners for this object and notification target.
    var listeners = this.get('listeners');
    if (!listeners) { this.set('listeners', listeners = {}); }
    if(!listeners[statusOrEvent]) { listeners[statusOrEvent] = []; }

    // Add another listener for the given status code or event name.
    listeners[statusOrEvent].push({target: target, action: action, args: args});

    return this;
  }

});

SC.Request.mixin(
/** @scope SC.Request */ {

  /**
    Helper method for quickly setting up a GET request.

    @param {String} address url of request
    @returns {SC.Request} receiver
  */
  getUrl: function(address) {
    return this.create().set('address', address).set('type', 'GET');
  },

  /**
    Helper method for quickly setting up a POST request.

    @param {String} address url of request
    @param {String} body
    @returns {SC.Request} receiver
  */
  postUrl: function(address, body) {
    var req = this.create().set('address', address).set('type', 'POST');
    if(body) { req.set('body', body) ; }
    return req ;
  },

  /**
    Helper method for quickly setting up a DELETE request.

    @param {String} address url of request
    @returns {SC.Request} receiver
  */
  deleteUrl: function(address) {
    return this.create().set('address', address).set('type', 'DELETE');
  },

  /**
    Helper method for quickly setting up a PUT request.

    @param {String} address url of request
    @param {String} body
    @returns {SC.Request} receiver
  */
  putUrl: function(address, body) {
    var req = this.create().set('address', address).set('type', 'PUT');
    if(body) { req.set('body', body) ; }
    return req ;
  },

  /**
    Helper method for quickly setting up a PATCH request.

    @param {String} address url of request
    @param {String} body
    @returns {SC.Request} receiver
  */
  patchUrl: function(address, body) {
    var req = this.create().set('address', address).set('type', 'PATCH');
    if(body) { req.set('body', body) ; }
    return req ;
  }

});

/* @private Gates loadend warning. */
SC.Request.WARN_ON_LOADEND = YES;

/**
  @class

  The request manager coordinates all of the active XHR requests. It will
  only allow a certain number of requests to be active at a time; queuing
  any others. This allows you more precise control over which requests load
  in which order.

  @since SproutCore 1.0
*/
SC.Request.manager = SC.Object.create(
/** @scope SC.Request.manager */{

  /**
    Maximum number of concurrent requests allowed. 6 for all browsers.

    @type Number
    @default 6
  */
  maxRequests: 6,

  /**
    Current requests that are inflight.

    @type Array
    @default []
  */
  inflight: [],

  /**
    Requests that are pending and have not been started yet.

    @type Array
    @default []
  */
  pending: [],


  // ..........................................................
  // METHODS
  //

  /**
    Invoked by the send() method on a request. This will create a new low-
    level transport object and queue it if needed.

    @param {SC.Request} request the request to send
    @returns {SC.Object} response object
  */
  sendRequest: function(request) {
    if (!request) { return null; }

    // create low-level transport.  copy all critical data for request over
    // so that if the request has been reconfigured the transport will still
    // work.
    var response = request.get('responseClass').create({ request: request });

    // add to pending queue
    this.get('pending').pushObject(response);
    this.fireRequestIfNeeded();

    return response;
  },

  /**
    Cancels a specific request. If the request is pending it will simply
    be removed. Otherwise it will actually be cancelled.

    @param {SC.Response} response a response object
    @returns {Boolean} YES if cancelled
  */
  cancel: function(response) {
    var pending = this.get('pending'),
        inflight = this.get('inflight');

    if (pending.indexOf(response) >= 0) {
      this.propertyWillChange('pending');
      pending.removeObject(response);
      this.propertyDidChange('pending');
      return YES;
    } else if (inflight.indexOf(response) >= 0) {
      response.cancel();

      inflight.removeObject(response);
      this.fireRequestIfNeeded();
      return YES;
    }

    return NO;
  },

  /**
    Cancels all inflight and pending requests.

    @returns {Boolean} YES if any items were cancelled.
  */
  cancelAll: function() {
    var pendingLen = this.getPath('pending.length'),
      inflightLen = this.getPath('inflight.length'),
      inflight = this.get('inflight'),
      pending = this.get('pending');

    if(pendingLen || inflightLen) {
      // Iterate backwards.
      for( var i = inflightLen - 1; i >= 0; i--) {
        // This will 'eventually' try to remove the request from
        // inflight, but it's not fast enough for us.
        var r = inflight.objectAt(i);
        r.cancel();
      }

      // Manually scrub the arrays without screwing up memory pointers.
      pending.replace(0, pendingLen);
      inflight.replace(0, inflightLen);

      return YES;

    }
    return NO;
  },

  /**
    Checks the inflight queue. If there is an open slot, this will move a
    request from pending to inflight.

    @returns {Object} receiver
  */
  fireRequestIfNeeded: function() {
    var pending = this.get('pending'),
        inflight = this.get('inflight'),
        max = this.get('maxRequests'),
        next;

    if ((pending.length>0) && (inflight.length<max)) {
      next = pending.shiftObject();
      inflight.pushObject(next);
      next.fire();
    }
  },

  /**
    Called by a response/transport object when finishes running. Removes
    the transport from the queue and kicks off the next one.
  */
  transportDidClose: function(response) {
    this.get('pending').removeObject(response);
    this.get('inflight').removeObject(response);
    this.fireRequestIfNeeded();
  },

  /**
    Checks if the response is in the pending queue.

    @param {SC.Response} response a response object
    @return {Boolean} is response in pending queue
  */
  isPending: function(response) {
    return this.get('pending').contains(response);
  },

  /**
    Checks if the response is in the inflight queue.

    @param {SC.Response} response a response object
    @return {Boolean} is response in inflight queue
  */
  isInFlight: function(response) {
    return this.get('inflight').contains(response);
  }

});

/* >>>>>>>>>> BEGIN source/system/websocket.js */
// ==========================================================================
// Project:   SC.WebSocket
// Copyright: ©2013 Nicolas BADIA and contributors
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/websocket_delegate');

/**
  @class

  Implements support for WebSocket.

  Example Usage:

    var ws = SC.WebSocket.create({
      server: 'ws://server',
    }).connect();

    ws.notify(this, 'wsReceivedMessage');

    ws.send('message');

  @since SproutCore 1.11
  @extends SC.Object
  @extends SC.DelegateSupport
  @author Nicolas BADIA
*/
SC.WebSocket = SC.Object.extend(SC.DelegateSupport, SC.WebSocketDelegate, {

  /**
    URL of the WebSocket server.

    @type String
    @default null
  */
  server: null,

  /**
    Determines if the browser support the WebSocket protocol.

    @type Boolean
    @default null
    @readOnly
  */
  isSupported: null,

  /**
    Determines if the connection is open or not.

    @type Boolean
    @readOnly
  */
  isConnected: false,

  /**
    In order to handle authentification, set `isAuth` to NO in the
    `webSocketDidOpen` delegate method just after sending a request to
    authentificate the connection. This way, any futher message will be put in
    queue until the server tels you the connection is authentified. Once it
    did, you should set `isAuth` to YES to resume the queue.

    If you don't need authentification, leave `isAuth` to null.

    @type Boolean
    @default null
  */
  isAuth: null,

  /**
    Processes the messages as JSON if possible.

    @type Boolean
    @default true
  */
  isJSON: true,

  /**
    A WebSocket delegate.

    @see SC.WebSocketDelegate
    @type {SC.WebSocketDelegate}
    @default null
  */
  delegate: null,

  /**
    Determines if we should attempt to try an automatic reconnection
    if the connection is close.

    @type {SC.WebSocketDelegate}
    @default null
  */
  autoReconnect: true,

  /**
    The interval in milliseconds to waits before trying a reconnection.

    @type {SC.WebSocketDelegate}
    @default null
  */
  reconnectInterval: 10000, // 10 secondes


  // ..........................................................
  // PUBLIC METHODS
  //

  /**
    Call this method to open a connection.

    @returns {SC.WebSocket}
  */
  connect: function() {
    var that = this;

    if (this.isSupported === null) this.set('isSupported', !!window.WebSocket);

    if (!this.isSupported || this.socket) return this;

    try {
      var socket = this.socket = new WebSocket(this.get('server'));

      socket.onopen = function() {
        SC.RunLoop.begin();
        that.onOpen.apply(that, arguments);
        SC.RunLoop.end();
      };

      socket.onmessage = function() {
        SC.RunLoop.begin();
        that.onMessage.apply(that, arguments);
        SC.RunLoop.end();
      };

      socket.onclose = function() {
        SC.RunLoop.begin();
        that.onClose.apply(that, arguments);
        SC.RunLoop.end();
      };

      socket.onerror = function() {
        SC.RunLoop.begin();
        that.onError.apply(that, arguments);
        SC.RunLoop.end();
      };
    } catch(e) {
      SC.error('An error has occurred while connnecting to the websocket server: '+e);
    }

    return this;
  },

  /**
    Call this method to close a connection.

    @param code {Number} A numeric value indicating the status code explaining why the connection is being closed. If this parameter is not specified, a default value of 1000 (indicating a normal "transaction complete" closure) is assumed.
    @param reason {String} A human-readable string explaining why the connection is closing. This string must be no longer than 123 bytes of UTF-8 text (not characters).
    @returns {SC.WebSocket}
  */
  close: function(code, reason) {
    var socket = this.socket;

    if (socket && socket.readyState === SC.WebSocket.OPEN) {
      this.socket.close(code, reason);
    }

    return this;
  },

  /**
    Configures a callback to execute when an event happen. You must pass
    at least a target and action/method to this and optionally an event name.

    You may also pass additional arguments which will then be passed along to
    your callback.

    Example:

        var websocket = SC.WebSocket.create({ server: 'ws://server' }).connect();

        webSocket.notify('onopen', this, 'wsWasOpen');
        webSocket.notify('onmessage', this, 'wsReceivedMessage'); // You can ommit onmessage here
        webSocket.notify('onclose', this, 'wsWasClose');
        webSocket.notify('onerror', this, 'wsDidError');

    ## Callback Format

    Your notification callback should expect to receive the WebSocket object as
    the first parameter and the event or message; plus any additional parameters that you pass. If your callback handles the notification and to prevent further handling, it
    should return YES.

    @param target {String} String Event name.
    @param target {Object} The target object for the callback action.
    @param action {String|Function} The method name or function to call on the target.
    @returns {SC.WebSocket} The SC.WebSocket object.
  */
  notify: function(event, target, action) {
    var args,
      i, len;

    if (SC.typeOf(event) !== SC.T_STRING) {
      // Fast arguments access.
      // Accessing `arguments.length` is just a Number and doesn't materialize the `arguments` object, which is costly.
      args = new Array(arguments.length - 2); //  SC.A(arguments).slice(2)
      for (i = 0, len = args.length; i < len; i++) { args[i] = arguments[i + 2]; }

      // Shift the arguments
      action = target;
      target = event;
      event = 'onmessage';
    } else {
      if (arguments.length > 3) {
        // Fast arguments access.
        // Accessing `arguments.length` is just a Number and doesn't materialize the `arguments` object, which is costly.
        args = new Array(arguments.length - 3); //  SC.A(arguments).slice(3)
        for (i = 0, len = args.length; i < len; i++) { args[i] = arguments[i + 3]; }
      } else {
        args = [];
      }
    }

    var listeners = this.get('listeners');
    if (!listeners) { this.set('listeners', listeners = {}); }
    if(!listeners[event]) { listeners[event] = []; }

    
    for (i = listeners[event].length - 1; i >= 0; i--) {
      var listener = listeners[event][i];
      if (listener.event === event && listener.target === target && listener.action === action) {
        SC.warn("Developer Warning: This listener is already defined.");
      }
    }
    

    // Add another listener for the given event name.
    listeners[event].push({target: target, action: action, args: args});

    return this;
  },

  /**
    Send the passed message. If the connection is not yet open or anthentified,
    the message will be put in the queue.

    @param message {String|Object} The message to send.
    @returns {SC.WebSocket}
  */
  send: function(message) {
    if (this.isConnected === true && this.isAuth !== false) {
      if (this.isJSON) {
        message = JSON.stringify(message);
      }

      this.socket.send(message);
    }
    else {
      this.addToQueue(message);
    }
    return this;
  },

  // ..........................................................
  // PRIVATE METHODS
  //

  /**
     @private
  */
  onOpen: function(event) {
    var del = this.get('objectDelegate');

    this.set('isConnected', true);

    var ret = del.webSocketDidOpen(this, event);
    if (ret !== true) this._notifyListeners('onopen', event);

    this.fireQueue();
  },

  /**
     @private
  */
  onMessage: function(messageEvent) {
    if (messageEvent) {
      var del = this.get('objectDelegate'),
        message,
        data,
        ret;

      message = data = messageEvent.data;
      ret = del.webSocketDidReceiveMessage(this, data);

      if (ret !== true) {
        if (this.isJSON) {
          message = JSON.parse(data);
        }
        this._notifyListeners('onmessage', message);
      }
    }

    // If there is message in the queue, we fire them
    this.fireQueue();
  },

  /**
     @private
  */
  onClose: function(closeEvent) {
    var del = this.get('objectDelegate');

    this.set('isConnected', false);
    this.set('isAuth', null);
    this.socket = null;

    var ret = del.webSocketDidClose(this, closeEvent);

    if (ret !== true) {
      this._notifyListeners('onclose', closeEvent);
      this.tryReconnect();
    }
  },

  /**
     @private
  */
  onError: function(event) {
    var del = this.get('objectDelegate'),
      ret = del.webSocketDidError(this, event);

    if (ret !== true) this._notifyListeners('onerror', event);
  },

  /**
     @private

     Add the message to the queue
  */
  addToQueue: function(message) {
    var queue = this.queue;
    if (!queue) { this.queue = queue = []; }

    queue.push(message);
  },

  /**
     @private

     Send the messages from the queue.
  */
  fireQueue: function() {
    var queue = this.queue;
    if (!queue || queue.length === 0) return;

    queue = SC.A(queue);
    this.queue = null;

    for (var i = 0, len = queue.length; i < len; i++) {
      var message = queue[i];
      this.send(message);
    }
  },

  /**
    @private
  */
  tryReconnect: function() {
    if (!this.get('autoReconnect')) return;

    var that = this;
    setTimeout(function() { that.connect(); }, this.get('reconnectInterval'));
  },

  /**
    @private

    Will notify each listener. Returns true if any of the listeners handle.
  */
  _notifyListeners: function(event, message) {
    var listeners = (this.listeners || {})[event], notifier, target, action, args;
    if (!listeners) { return NO; }

    var handled = NO,
      len = listeners.length;

    for (var i = 0; i < len; i++) {
      notifier = listeners[i];
      args = (notifier.args || []).copy();
      args.unshift(message);
      args.unshift(this);

      target = notifier.target;
      action = notifier.action;
      if (SC.typeOf(action) === SC.T_STRING) { action = target[action]; }

      handled = action.apply(target, args);
      if (handled === true) return handled;
    }

    return handled;
  },

  /**
    @private
  */
  objectDelegate: function () {
    var del = this.get('delegate');
    return this.delegateFor('isWebSocketDelegate', del, this);
  }.property('delegate').cacheable(),

  // ..........................................................
  // PRIVATE PROPERTIES
  //

  /**
    @private

    @type WebSocket
    @default null
  */
  socket: null,

  /**
    @private

    @type Object
    @default null
  */
  listeners: null,

  /**
    @private

    Messages that needs to be send once the connection is open.

    @type Array
    @default null
  */
  queue: null,

});

// Class Methods
SC.WebSocket.mixin( /** @scope SC.WebSocket */ {

  // ..........................................................
  // CONSTANTS
  //

  /**
    The connection is not yet open.

    @static
    @constant
    @type Number
    @default 0
  */
  CONNECTING: 0,

  /**
    The connection is open and ready to communicate.

    @static
    @constant
    @type Number
    @default 1
  */
  OPEN: 1,

  /**
    The connection is in the process of closing.

    @static
    @constant
    @type Number
    @default 2
  */
  CLOSING: 2,

  /**
    The connection is closed or couldn't be opened.

    @static
    @constant
    @type Number
    @default 3
  */
  CLOSED: 3,

});

