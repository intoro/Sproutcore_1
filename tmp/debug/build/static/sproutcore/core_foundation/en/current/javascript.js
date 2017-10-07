/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Indicates that the collection view expects to accept a drop ON the specified
  item.

  @type Number
*/
SC.DROP_ON = 0x01 ;

/**
  Indicates that the collection view expects to accept a drop BEFORE the
  specified item.

  @type Number
*/
SC.DROP_BEFORE = 0x02 ;

/**
  Indicates that the collection view expects to accept a drop AFTER the
  specified item.  This is treated just like SC.DROP_BEFORE is most views
  except for tree lists.

  @type Number
*/
SC.DROP_AFTER = 0x04 ;

/**
  Indicates that the collection view want's to know which operations would
  be allowed for either drop operation.

  @type Number
*/
SC.DROP_ANY = 0x07 ;

/**
  Indicates that the content should be aligned to the left.
*/
SC.ALIGN_LEFT = 'left';

/**
  Indicates that the content should be aligned to the right.
*/
SC.ALIGN_RIGHT = 'right';

/**
  Indicates that the content should be aligned to the center.
*/
SC.ALIGN_CENTER = 'center';

/**
  Indicates that the content should be aligned to the top.
*/
SC.ALIGN_TOP = 'top';

/**
  Indicates that the content should be aligned to the middle.
*/
SC.ALIGN_MIDDLE = 'middle';

/**
  Indicates that the content should be aligned to the bottom.
*/
SC.ALIGN_BOTTOM = 'bottom';

/**
  Indicates that the content should be aligned to the top and left.
*/
SC.ALIGN_TOP_LEFT = 'top-left';

/**
  Indicates that the content should be aligned to the top and right.
*/
SC.ALIGN_TOP_RIGHT = 'top-right';

/**
  Indicates that the content should be aligned to the bottom and left.
*/
SC.ALIGN_BOTTOM_LEFT = 'bottom-left';

/**
  Indicates that the content should be aligned to the bottom and right.
*/
SC.ALIGN_BOTTOM_RIGHT = 'bottom-right';

/**
  Indicates that the content does not specify its own alignment.
*/
SC.ALIGN_DEFAULT = 'default';

/**
  Indicates that the content should be positioned to the right.
*/
SC.POSITION_RIGHT = 0;

/**
  Indicates that the content should be positioned to the left.
*/
SC.POSITION_LEFT = 1;

/**
  Indicates that the content should be positioned above.
*/
SC.POSITION_TOP = 2;

/**
  Indicates that the content should be positioned below.
*/
SC.POSITION_BOTTOM = 3;


SC.mixin(/** @lends SC */ {

  /**
    Reads or writes data from a global cache.  You can use this facility to
    store information about an object without actually adding properties to
    the object itself.  This is needed especially when working with DOM,
    which can leak easily in IE.

    To read data, simply pass in the reference element (used as a key) and
    the name of the value to read.  To write, also include the data.

    You can also just pass an object to retrieve the entire cache.

    @param elem {Object} An object or Element to use as scope
    @param name {String} Optional name of the value to read/write
    @param data {Object} Optional data.  If passed, write.
    @returns {Object} the value of the named data
  */
  data: $.data,

  /**
    Removes data from the global cache.  This is used throughout the
    framework to hold data without creating memory leaks.

    You can remove either a single item on the cache or all of the cached
    data for an object.

    @param elem {Object} An object or Element to use as scope
    @param name {String} optional name to remove.
    @returns {Object} the value or cache that was removed
  */
  removeData: $.removeData,

  // ..........................................................
  // LOCALIZATION SUPPORT
  //

  /**
    Known loc strings

    @type Hash
  */
  STRINGS: {},

  /**
    This is a simplified handler for installing a bunch of strings.  This
    ignores the language name and simply applies the passed strings hash.

    @param {String} lang the language the strings are for
    @param {Hash} strings hash of strings
    @returns {SC} The receiver, useful for chaining calls to the same object.
  */
  stringsFor: function(lang, strings) {
    SC.mixin(SC.STRINGS, strings);
    return this ;
  },

  /**
    Returns the SC.View instance managing the given element.

    If no instance is found, returns `null`.

    @param {DOMElement} element The element to check.
    @returns {SC.View} The view managing the element or null if none found.
  */
  viewFor: function (element) {
    
    // Debug mode only arrgument validation.
    // Ensure that every argument is correct and that the proper number of arguments is given.
    if (!(element instanceof Element)) {
      SC.error("Developer Error: Attempt to retrieve the SC.View instance for a non-element in SC.viewFor(): %@".fmt(element));
    }

    if (arguments.length > 1) {
      SC.warn("Developer Warning: SC.viewFor() is meant to be used with only one argument: element");
    }
    

    // Search for the view for the given element.
    var viewCache = SC.View.views,
      view = viewCache[element.getAttribute('id')];

    // If the element itself is not managed by an SC.View, walk up its element chain searching for an
    // element that is.
    if (!view) {
      var parentNode;

      while (!view && (parentNode = element.parentNode) && (parentNode !== document)) {
        var id;

        // Ensure that the parent node is an Element and not some other type of Node.
        // Note: while `instanceOf Element` is the most accurate determiner, performance tests show
        // that it's much quicker to check for the existence of either the `nodeType` property or
        // the `querySelector` method.
        // See http://jsperf.com/nodetype-1-vs-instanceof-htmlelement/4
        // if (parentNode.querySelector && (id = parentNode.getAttribute('id'))) {
        if ((id = parentNode.getAttribute('id'))) {
          view = viewCache[id];
        }

        // Check the parent node.
        element = parentNode;
      }

      // Avoid memory leaks (i.e. IE).
      element = parentNode = null;
    }

    // If view isn't found, return null rather than undefined.
    return view || null;
  }

});

/* >>>>>>>>>> BEGIN source/system/browser.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


SC.mixin(SC.browser,
/** @scope SC.browser */ {

  /* @private Internal property for the cache of pre-determined experimental names. */
  _cachedNames: null,

  /* @private Internal property for the test element used for style testing. */
  _testEl: null,

  /** @private */
  _testSupportFor: function (target, propertyName, testValue) {
    /*jshint eqnull:true*/
    var ret = target[propertyName] != null,
      originalValue;

    if (testValue != null) {
      originalValue = target[propertyName];
      target[propertyName] = testValue;
      ret = target[propertyName] === testValue;
      target[propertyName] = originalValue;
    }

    return ret;
  },

  /**
    Version Strings should not be compared against Numbers.  For example,
    the version "1.20" is greater than "1.2" and less than "1.200", but as
    Numbers, they are all 1.2.

    Pass in one of the browser versions: SC.browser.version,
    SC.browser.engineVersion or SC.browser.osVersion and a String to compare
    against.  The function will split each version on the decimals and compare
    the parts numerically.

    Examples:

      SC.browser.compare('1.20', '1.2') == 18
      SC.browser.compare('1.08', '1.8') == 0
      SC.browser.compare('1.1.1', '1.1.004') == -3

    @param {String} version One of SC.browser.version, SC.browser.engineVersion or SC.browser.osVersion
    @param {String} other The version to compare against.
    @returns {Number} The difference between the versions at the first difference.
  */
  compare: function (version, other) {
    var coerce,
        parts,
        tests;

    // Ensure that the versions are Strings.
    if (typeof version === 'number' || typeof other === 'number') {
      
      SC.warn('Developer Warning: SC.browser.compare(): Versions compared against Numbers may not provide accurate results.  Use a String of decimal separated Numbers instead.');
      
      version = String(version);
      other = String(other);
    }

    // This function transforms the String to a Number or NaN
    coerce = function (part) {
      return Number(part.match(/^[0-9]+/));
    };

    parts = SC.A(version.split('.')).map(coerce);
    tests = SC.A(other.split('.')).map(coerce);

    // Test each part stopping when there is a difference.
    for (var i = 0; i < tests.length; i++) {
      var check = parts[i] - tests[i];
      if (isNaN(check)) return 0;
      if (check !== 0) return check;
    }

    return 0;
  },

  /**
    This simple method allows you to more safely use experimental properties and
    methods in current and future browsers.

    Using browser specific methods and properties is a risky coding practice.
    With sufficient testing, you may be able to match prefixes to today's
    browsers, but this is prone to error and not future proof.  For instance,
    if a property becomes standard and the browser drops the prefix, your code
    could suddenly stop working.

    Instead, use SC.browser.experimentalNameFor(target, standardName), which
    will check the existence of the standard name on the target and if not found
    will try different camel-cased versions of the name with the current
    browser's prefix appended.

    If it is still not found, SC.UNSUPPORTED will be returned, allowing
    you a chance to recover from the lack of browser support.

    Note that `experimentalNameFor` is not really meant for determining browser
    support, only to ensure that using browser prefixed properties and methods
    is safe.  Instead, SC.platform provides several properties that can be used
    to determine support for a certain platform feature, which should be
    used before calling `experimentalNameFor` to safely use the feature.

    For example,

        // Checks for IndexedDB support first on the current platform.
        if (SC.platform.supportsIndexedDB) {
          var db = window.indexedDB,
            // Example return values: 'getDatabaseNames', 'webkitGetDatabaseNames', 'MozGetDatabaseNames', SC.UNSUPPORTED.
            getNamesMethod = SC.browser.experimentalNameFor(db, 'getDatabaseNames'),
            names;

            if (getNamesMethod === SC.UNSUPPORTED) {
              // Work without it.
            } else {
              names = db[getNamesMethod](...);
            }
        } else {
          // Work without it.
        }

    ## Improving deduction
    Occasionally a target will appear to support a property, but will fail to
    actually accept a value.  In order to ensure that the property doesn't just
    exist but is also usable, you can provide an optional `testValue` that will
    be temporarily assigned to the target to verify that the detected property
    is usable.

    @param {Object} target The target for the method.
    @param {String} standardName The standard name of the property or method we wish to check on the target.
    @param {String} [testValue] A value to temporarily assign to the property.
    @returns {string} The name of the property or method on the target or SC.UNSUPPORTED if no method found.
  */
  experimentalNameFor: function (target, standardName, testValue) {
    // Test the property name.
    var ret = standardName;

    // ex. window.indexedDB.getDatabaseNames
    if (!this._testSupportFor(target, ret, testValue)) {
      // ex. window.WebKitCSSMatrix
      ret = SC.browser.classPrefix + standardName.capitalize();
      if (!this._testSupportFor(target, ret, testValue)) {
        // No need to check if the prefix is the same for properties and classes
        if (SC.browser.domPrefix === SC.browser.classPrefix) {
          // Always show a warning so that production usage information has a
          // better chance of filtering back to the developer(s).
          SC.warn("SC.browser.experimentalNameFor(): target, %@, does not have property `%@` or `%@`.".fmt(target, standardName, ret));
          ret = SC.UNSUPPORTED;
        } else {
          // ex. window.indexedDB.webkitGetDatabaseNames
          ret = SC.browser.domPrefix + standardName.capitalize();
          if (!this._testSupportFor(target, ret, testValue)) {
            // Always show a warning so that production usage information has a
            // better chance of filtering back to the developer(s).
            SC.warn("SC.browser.experimentalNameFor(): target, %@, does not have property `%@`, '%@' or `%@`.".fmt(target, standardName, SC.browser.classPrefix + standardName.capitalize(), ret));
            ret = SC.UNSUPPORTED;
          }
        }
      }
    }

    return ret;
  },

  /**
    This method returns safe style names for current and future browsers.

    Using browser specific style prefixes is a risky coding practice.  With
    sufficient testing, you may be able to match styles across today's most
    popular browsers, but this is a lot of work and not future proof.  For
    instance, if a browser drops the prefix and supports the standard style
    name, your code will suddenly stop working.  This happens ALL the time!

    Instead, use SC.browser.experimentalStyleNameFor(standardStyleName), which
    will test support for the standard style name and if not found will try the
    prefixed version with the current browser's prefix appended.

    Note: the proper style name is only determined once per standard style
    name tested and then cached.  Therefore, calling experimentalStyleNameFor
    repeatedly has no performance detriment.

    For example,

        var boxShadowName = SC.browser.experimentalStyleNameFor('boxShadow'),
          el = document.createElement('div');

        // `boxShadowName` may be "boxShadow", "WebkitBoxShadow", "msBoxShadow", etc. depending on the browser support.
        el.style[boxShadowName] = "rgb(0,0,0) 0px 3px 5px";

    ## Improving deduction
    Occasionally a browser will appear to support a style, but will fail to
    actually accept a value.  In order to ensure that the style doesn't just
    exist but is also usable, you can provide an optional `testValue` that will
    be used to verify that the detected style is usable.

    @param {string} standardStyleName The standard name of the experimental style as it should be un-prefixed.  This is the DOM property name, which is camel-cased (ex. boxShadow)
    @param {String} [testValue] A value to temporarily assign to the style to ensure support.
    @returns {string} Future-proof style name for use in the current browser or SC.UNSUPPORTED if no style support found.
  */
  experimentalStyleNameFor: function (standardStyleName, testValue) {
    var cachedNames = this._sc_experimentalStyleNames,
        ret;

    // Fast path & cache initialization.
    if (!cachedNames) {
      cachedNames = this._sc_experimentalStyleNames = {};
    }

    if (cachedNames[standardStyleName]) {
      ret = cachedNames[standardStyleName];
    } else {
      // Test the style name.
      var el = this._testEl;

      // Create a test element and cache it for repeated use.
      if (!el) { el = this._testEl = document.createElement("div"); }

      // Cache the experimental style name (even SC.UNSUPPORTED) for quick repeat access.
      ret = cachedNames[standardStyleName] = this.experimentalNameFor(el.style, standardStyleName, testValue);
    }

    return ret;
  },

  /**
    This method returns safe CSS attribute names for current and future browsers.

    Using browser specific CSS prefixes is a risky coding practice.  With
    sufficient testing, you may be able to match attributes across today's most
    popular browsers, but this is a lot of work and not future proof.  For
    instance, if a browser drops the prefix and supports the standard CSS
    name, your code will suddenly stop working.  This happens ALL the time!

    Instead, use SC.browser.experimentalCSSNameFor(standardCSSName), which
    will test support for the standard CSS name and if not found will try the
    prefixed version with the current browser's prefix appended.

    Note: the proper CSS name is only determined once per standard CSS
    name tested and then cached.  Therefore, calling experimentalCSSNameFor
    repeatedly has no performance detriment.

    For example,

        var boxShadowCSS = SC.browser.experimentalCSSNameFor('box-shadow'),
          el = document.createElement('div');

        // `boxShadowCSS` may be "box-shadow", "-webkit-box-shadow", "-ms-box-shadow", etc. depending on the current browser.
        el.style.cssText = boxShadowCSS + " rgb(0,0,0) 0px 3px 5px";

    ## Improving deduction
    Occasionally a browser will appear to support a style, but will fail to
    actually accept a value.  In order to ensure that the style doesn't just
    exist but is also usable, you can provide an optional `testValue` that will
    be used to verify that the detected style is usable.

    @param {string} standardCSSName The standard name of the experimental CSS attribute as it should be un-prefixed (ex. box-shadow).
    @param {String} [testValue] A value to temporarily assign to the style to ensure support.
    @returns {string} Future-proof CSS name for use in the current browser or SC.UNSUPPORTED if no style support found.
  */
  experimentalCSSNameFor: function (standardCSSName, testValue) {
    var ret = standardCSSName,
      standardStyleName = standardCSSName.camelize(),
      styleName = this.experimentalStyleNameFor(standardStyleName, testValue);

    if (styleName === SC.UNSUPPORTED) {
      ret = SC.UNSUPPORTED;
    } else if (styleName !== standardStyleName) {
      // If the DOM property is prefixed, then the CSS name should be prefixed.
      ret = SC.browser.cssPrefix + standardCSSName;
    }

    return ret;
  }

});

/* >>>>>>>>>> BEGIN source/system/builder.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  The Builder class makes it easy to create new chained-builder API's such as
  those provided by CoreQuery or jQuery.  Usually you will not create a new
  builder yourself, but you will often use instances of the Builder object to
  configure parts of the UI such as menus and views.
  
  # Anatomy of a Builder
  
  You can create a new Builder much like you would any other class in 
  SproutCore.  For example, you could create a new CoreQuery-type object with
  the following:
  
      SC.$ = SC.Builder.create({
        // methods you can call go here.
      });
  
  Unlike most classes in SproutCore, Builder objects are actually functions 
  that you can call to create new instances.  In the example above, to use 
  the builder, you must call it like a function:
  
      buildit = SC.$();
  
  If you define an init() method on a builder, it will be invoked wheneve the
  builder is called as a function, including any passed params.  Your init()
  method MUST return this, unlike regular SC objects.  i.e.
  
      SC.$ = SC.Builder.create({
        init: function(args) { 
          this.args = SC.A(args);
          return this;
        }
      });
      
      buildit = SC.$('a', 'b');
      buildit.args => ['a','b']
  
  In addition to defining a function like this, all builder objects also have
  an 'fn' property that contains a hash of all of the helper methods defined
  on the builder function.  Once a builder has been created, you can add 
  addition "plugins" for the builder by simply adding new methods to the
  fn property.
  
  # Writing Builder Functions
  
  All builders share a few things in common:
  
   * when a new builder is created, it's init() method will be called.  The default version of this method simply copies the passed parameters into the builder as content, but you can override this with anything you want.
   * the content the builder works on is stored as indexed properties (i.e. 0,1,2,3, like an array).  The builder should also have a length property if you want it treated like an array.
   *- Builders also maintain a stack of previous builder instances which you can pop off at any time.
  
  To get content back out of a builder once you are ready with it, you can
  call the method done().  This will return an array or a single object, if 
  the builder only works on a single item.
  
  You should write your methods using the getEach() iterator to work on your
  member objects.  All builders implement SC.Enumerable in the fn() method.

      CoreQuery = SC.Builder.create({
        ...
      }) ;
      
      CoreQuery = new SC.Builder(properties) {
        ...
      } ;
      
      CoreQuery2 = CoreQuery.extend() {
      }
  
  @constructor
*/
SC.Builder = function (props) { return SC.Builder.create(props); };

/** 
  Create a new builder object, applying the passed properties to the 
  builder's fn property hash.
  
  @param {Hash} properties
  @returns {SC.Builder}
*/
SC.Builder.create = function create(props) { 
  
  // generate new fn with built-in properties and copy props
  var fn = SC.mixin(SC.beget(this.fn), props||{}) ;
  if (props.hasOwnProperty('toString')) fn.toString = props.toString;
  
  // generate new constructor and hook in the fn
  var construct = function() {
    var ret = SC.beget(fn); // NOTE: using closure here...
    
    // the defaultClass is usually this for this constructor. 
    // e.g. SC.View.build() -> this = SC.View
    ret.defaultClass = this ;
    ret.constructor = construct ;

    // now init the builder object.
    return ret.init.apply(ret, arguments) ;
  } ;
  construct.fn = construct.prototype = fn ;

  // the create() method can be used to extend a new builder.
  // eg. SC.View.buildCustom = SC.View.build.extend({ ...props... })
  construct.extend = SC.Builder.create ;
  construct.mixin = SC.Builder.mixin ;
  
  return construct; // return new constructor
} ;

SC.Builder.mixin = function() {
  var len = arguments.length, idx;
  for(idx=0;idx<len;idx++) SC.mixin(this, arguments[idx]);
  return this ;
};

/** This is the default set of helper methods defined for new builders. */
SC.Builder.fn = {

  /** 
    Default init method for builders.  This method accepts either a single
    content object or an array of content objects and copies them onto the 
    receiver.  You can override this to provide any kind of init behavior 
    that you want.  Any parameters passed to the builder method will be 
    forwarded to your init method.
    
    @returns {SC.Builder} receiver
  */
  init: function(content) {
    if (content !== undefined) {
      if (SC.typeOf(content) === SC.T_ARRAY) {
        var loc=content.length;
        while(--loc >= 0) {
          this[loc] = content.objectAt ? content.objectAt(loc) : content[loc];
        }
        this.length = content.length ;
      } else {
        this[0] = content; this.length=1;
      }
    }
    return this ;
  },
  
  /** Return the number of elements in the matched set. */
  size: function() { return this.length; },
  
  /** 
    Take an array of elements and push it onto the stack (making it the
    new matched set.)  The receiver will be saved so it can be popped later.
    
    @param {Object|Array} content
    @returns {SC.Builder} new instance
  */
  pushStack: function() {
    // Build a new CoreQuery matched element set
    var ret = this.constructor.apply(this,arguments);

    // Add the old object onto the stack (as a reference)
    ret.prevObject = this;

    // Return the newly-formed element set
    return ret;
  },

  /**
    Returns the previous object on the stack so you can continue with that
    transform.  If there is no previous item on the stack, an empty set will
    be returned.
  */
  end: function() { 
    return this.prevObject || this.constructor(); 
  },
  
  // toString describes the builder
  toString: function() { 
    return "%@$(%@)".fmt(this.defaultClass.toString(), 
      SC.A(this).invoke('toString').join(',')); 
  },
  
  /** You can enhance the fn using this mixin method. */
  mixin: SC.Builder.mixin
  
};

// Apply SC.Enumerable.  Whenever possible we want to use the Array version
// because it might be native code.
(function() {
  var enumerable = SC.Enumerable, fn = SC.Builder.fn, key, value ;
  for(key in enumerable) {
    if (!enumerable.hasOwnProperty(key)) continue ;
    value = Array.prototype[key] || enumerable[key];
    fn[key] = value ;
  }
})();




/* >>>>>>>>>> BEGIN source/system/core_query.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global jQuery*/
sc_require('system/builder');

// Alias jQuery as SC.$ and SC.CoreQuery for compatibility
SC.$ = SC.CoreQuery = jQuery;

// Add some plugins to SC.$. jQuery will get these also. -- test in system/core_query/additions
SC.mixin(SC.$.fn,
  /** @scope SC.$.prototype */ {

  isCoreQuery: YES, // walk like a duck

  /** @private - better loggin */
  toString: function () {
    var values = [],
      len = this.length,
      idx = 0;

    for (idx = 0; idx < len; idx++) {
      values[idx] = '%@: %@'.fmt(idx, this[idx] ? this[idx].toString() : '(null)');
    }
    return "<$:%@>(%@)".fmt(SC.guidFor(this), values.join(' , '));
  },

  /**
    Returns YES if all member elements are visible.  This is provided as a
    common test since CoreQuery does not support filtering by
    psuedo-selector.

    @deprecated Version 1.10
  */
  isVisible: function () {
    return Array.prototype.every.call(this, function (elem) {
      return SC.$.isVisible(elem);
    });
  },

  /**
    Attempts to find the views managing the passed DOM elements and returns
    them.   This will start with the matched element and walk up the DOM until
    it finds an element managed by a view.

    @returns {Array} array of views or null.
    @deprecated Version 1.10
  */
  view: function () {
    
    // Deprecation warning.
    SC.warn("Developer Warning: SC.$.view() has been deprecated and will be removed in the future. Please use SC.viewFor(element) instead.");
    

    return SC.viewFor(this[0]);
  },

  /**
    Returns YES if any of the matched elements have the passed element or CQ object as a child element.
  */
  within: function (el) {
    if (this.filter(el).length) { return true; }
    return !!this.has(el).length;
  }

});

/**
  Make CoreQuery enumerable.  Since some methods need to be disambiguated,
  we will implement some wrapper functions here.

  Note that SC.Enumerable is implemented on SC.Builder, which means the
  CoreQuery object inherits this automatically.  jQuery does not extend from
  SC.Builder though, so we reapply SC.Enumerable just to be safe.
*/
(function () {
  var original = {},
      wrappers = {

    // if you call find with a selector, then use the jQuery way.  If you
    // call with a function/target, use Enumerable way
    find: function (callback, target) {
      return (target !== undefined) ? SC.Enumerable.find.call(this, callback, target) : original.find.call(this, callback);
    },

    // ditto for filter - execute SC.Enumerable style if a target is passed.
    filter: function (callback, target) {
      return (target !== undefined) ?
        this.pushStack(SC.Enumerable.filter.call(this, callback, target)) :
        original.filter.call(this, callback);
    },

    // filterProperty is an SC.Enumerable thing, but it needs to be wrapped
    // in a CoreQuery object.
    filterProperty: function (key, value) {
      return this.pushStack(
        SC.Enumerable.filterProperty.call(this, key, value));
    },

    // indexOf() is best implemented using the jQuery index()
    indexOf: SC.$.index,

    // map() is a little tricky because jQuery is non-standard.  If you pass
    // a context object, we will treat it like SC.Enumerable.  Otherwise use
    // jQuery.
    map: function (callback, target) {
      return (target !== undefined) ?
        SC.Enumerable.map.call(this, callback, target) :
        original.map.call(this, callback);
    }
  };

  // loop through an update some enumerable methods.
  var fn = SC.$.fn,
    enumerable = SC.Enumerable,
    value;

  for (var key in enumerable) {
    if (enumerable.hasOwnProperty(key)) {
      value = enumerable[key];

      if (key in wrappers) {
        original[key] = fn[key];
        value = wrappers[key];
      }

      fn[key] = value;
    }
  }
})();

// Add some global helper methods.
SC.mixin(SC.$, {

  /** @private helper method to determine if an element is visible.  Exposed
   for use in testing.

    @deprecated Version 1.10
  */
  isVisible: function (elem) {
    
    SC.warn("Developer Warning: The isVisible() helper has been deprecated and will be removed in the future.");
    
    var CQ = SC.$;
    return ("hidden" != elem.type) && (CQ.css(elem, "display") != "none") && (CQ.css(elem, "visibility") != "hidden");
  }

});



/* >>>>>>>>>> BEGIN source/system/event.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/core_query') ;

/**
  The event class provides a simple cross-platform library for capturing and
  delivering events on DOM elements and other objects.  While this library
  is based on code from both jQuery and Prototype.js, it includes a number of
  additional features including support for handler objects and event
  delegation.

  Since native events are implemented very unevenly across browsers,
  SproutCore will convert all native events into a standardized instance of
  this special event class.

  SproutCore events implement the standard W3C event API as well as some
  additional helper methods.

  @constructor
  @param {Event} originalEvent
  @returns {SC.Event} event instance

  @since SproutCore 1.0
*/
SC.Event = function(originalEvent) {
  this._sc_updateNormalizedEvent(originalEvent);

  return this;
};

SC.mixin(SC.Event, /** @scope SC.Event */ {

  /**
    We need this because some browsers deliver different values
    for mouse wheel deltas. Once the first mouse wheel event has
    been run, this value will get set.

    @field
    @type Number
    @default 1
  */
  MOUSE_WHEEL_MULTIPLIER: function() {
    var deltaMultiplier = 1,
        version = SC.browser.engineVersion;

    if (SC.browser.name === SC.BROWSER.safari) {
      deltaMultiplier = 0.4;
      // Safari 5.0.1 and up
      if (SC.browser.compare(version, '533.17') > 0 && SC.browser.compare(version, '534') < 0) {
        deltaMultiplier = 0.004;
      } else if (SC.browser.compare(version, '533') < 0) {
        // Scrolling in Safari 5.0
        deltaMultiplier = 40;
      }
    }else if(SC.browser.name === SC.BROWSER.ie){
      deltaMultiplier = 0.3;
    }else if(SC.browser.name === SC.BROWSER.chrome){
      deltaMultiplier = 0.4;
    }
    return deltaMultiplier;
  }(),

  /**
    This represents the limit in the delta before a different multiplier
    will be applied. Because we can't generated an accurate mouse
    wheel event ahead of time, and browsers deliver differing values
    for mouse wheel deltas, this is necessary to ensure that
    browsers that scale their values largely are dealt with correctly
    in the future.

    @type Number
    @default 1000
  */
  MOUSE_WHEEL_DELTA_LIMIT: 1000,

  /** @private
    We only want to invalidate once
  */
  _MOUSE_WHEEL_LIMIT_INVALIDATED: NO,

  /**
    Standard method to create a new event.  Pass the native browser event you
    wish to wrap if needed.
  */
  create: function(e) { return new SC.Event(e); },

  // the code below was borrowed from jQuery, Dean Edwards, and Prototype.js

  /**
    Bind an event to an element.

    This method will cause the passed handler to be executed whenever a
    relevant event occurs on the named element.  This method supports a
    variety of handler types, depending on the kind of support you need.

    ## Simple Function Handlers

        SC.Event.add(anElement, "click", myClickHandler) ;

    The most basic type of handler you can pass is a function.  This function
    will be executed every time an event of the type you specify occurs on the
    named element.  You can optionally pass an additional context object which
    will be included on the event in the event.data property.

    When your handler function is called, the function's "this" property
    will point to the element the event occurred on.

    The click handler for this method must have a method signature like:

        function(event) { return YES|NO; }

    ## Method Invocations

        SC.Event.add(anElement, "click", myObject, myObject.aMethod) ;

    Optionally you can specify a target object and a method on the object to
    be invoked when the event occurs.  This will invoke the method function
    with the target object you pass as "this".  The method should have a
    signature like:

        function(event, targetElement) { return YES|NO; }

    Like function handlers, you can pass an additional context data paramater
    that will be included on the event in the event.data property.

    ## Handler Return Values

    Both handler functions should return YES if you want the event to
    continue to propagate and NO if you want it to stop.  Returning NO will
    both stop bubbling of the event and will prevent any default action
    taken by the browser.  You can also control these two behaviors separately
    by calling the stopPropagation() or preventDefault() methods on the event
    itself, returning YES from your method.

    ## Limitations

    Although SproutCore's event implementation is based on jQuery, it is
    much simpler in design.  Notably, it does not support namespaced events
    and you can only pass a single type at a time.

    If you need more advanced event handling, consider the SC.ClassicResponder
    functionality provided by SproutCore or use your favorite DOM library.

    @param {Element} elem a DOM element, window, or document object
    @param {String} eventType the event type you want to respond to
    @param {Object} target The target object for a method call or a function.
    @param {Object} method optional method or method name if target passed
    @param {Object} context optional context to pass to the handler as event.data
    @returns {Object} receiver
  */
  add: function(elem, eventType, target, method, context, useCapture) {

    // if a CQ object is passed in, either call add on each item in the
    // matched set, or simply get the first element and use that.
    if (elem && elem.isCoreQuery) {
      if (elem.length > 0) {
        elem.forEach(function(e) {
          this.add(e, eventType, target, method, context);
        }, this);
        return this;
      } else elem = elem[0];
    }
    if (!elem) return this; // nothing to do

		if (!useCapture) {
			useCapture = NO;
		}

    // cannot register events on text nodes, etc.
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) return SC.Event;

    // For whatever reason, IE has trouble passing the window object
    // around, causing it to be cloned in the process
    if (SC.browser.name === SC.BROWSER.ie && elem.setInterval) elem = window;

    // if target is a function, treat it as the method, with optional context
    if (SC.typeOf(target) === SC.T_FUNCTION) {
      context = method;
      method = target;
      target = null;

    // handle case where passed method is a key on the target.
    } else if (target && SC.typeOf(method) === SC.T_STRING) {
      method = target[method];
    }

    // Get the handlers queue for this element/eventType.  If the queue does
    // not exist yet, create it and also setup the shared listener for this
    // eventType.
    var events = SC.data(elem, "sc_events") || SC.data(elem, "sc_events", {}),
        handlers = events[eventType];

    if (!handlers) {
      handlers = events[eventType] = {};
      this._addEventListener(elem, eventType, useCapture);
    }

    // Build the handler array and add to queue
    handlers[SC.hashFor(target, method)] = [target, method, context];
    SC.Event._global[eventType] = YES ; // optimization for global triggers

    // Nullify elem to prevent memory leaks in IE
    elem = events = handlers = null ;
    return this ;
  },

  /**
    Removes a specific handler or all handlers for an event or event+type.

    To remove a specific handler, you must pass in the same function or the
    same target and method as you passed into SC.Event.add().  See that method
    for full documentation on the parameters you can pass in.

    If you omit a specific handler but provide both an element and eventType,
    then all handlers for that element will be removed.  If you provide only
    and element, then all handlers for all events on that element will be
    removed.

    ## Limitations

    Although SproutCore's event implementation is based on jQuery, it is
    much simpler in design.  Notably, it does not support namespaced events
    and you can only pass a single type at a time.

    If you need more advanced event handling, consider the SC.ClassicResponder
    functionality provided by SproutCore or use your favorite DOM library.

    @param {Element} elem a DOM element, window, or document object
    @param {String} eventType the event type to remove
    @param {Object} target The target object for a method call.  Or a function.
    @param {Object} method optional name of method
    @returns {Object} receiver
  */
  remove: function(elem, eventType, target, method) {

    // if a CQ object is passed in, either call add on each item in the
    // matched set, or simply get the first element and use that.
    if (elem && elem.isCoreQuery) {
      if (elem.length > 0) {
        elem.forEach(function(e) {
          this.remove(e, eventType, target, method);
        }, this);
        return this;
      } else elem = elem[0];
    }
    if (!elem) return this; // nothing to do

    // don't do events on text and comment nodes
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) return SC.Event;

    var handlers, key, events = SC.data(elem, "sc_events") ;
    if (!events) return this ; // nothing to do if no events are registered

    // if no type is provided, remove all types for this element.
    if (eventType === undefined) {
      for (var anEventType in events) this.remove(elem, anEventType) ;

    // otherwise, remove the handler for this specific eventType if found
    } else if ((handlers = events[eventType])) {

      var cleanupHandlers = NO ;

      // if a target/method is provided, remove only that one
      if (target || method) {

        // normalize the target/method
        if (SC.typeOf(target) === SC.T_FUNCTION) {
          method = target; target = null ;
        } else if (SC.typeOf(method) === SC.T_STRING) {
          method = target[method] ;
        }

        delete handlers[SC.hashFor(target, method)];

        // check to see if there are handlers left on this event/eventType.
        // if not, then cleanup the handlers.
        key = null ;
        for(key in handlers) break ;
        if (key===null) cleanupHandlers = YES ;

      // otherwise, just cleanup all handlers
      } else cleanupHandlers = YES ;

      // If there are no more handlers left on this event type, remove
      // eventType hash from queue.
      if (cleanupHandlers) {
        delete events[eventType] ;
        this._removeEventListener(elem, eventType) ;
      }

      // verify that there are still events registered on this element.  If
      // there aren't, cleanup the element completely to avoid memory leaks.
      key = null ;
      for (key in events) break;
      if (!key) {
        SC.removeData(elem, "sc_events") ;
        delete this._elements[SC.guidFor(elem)]; // important to avoid leaks

        // Clean up the cached listener to prevent a memory leak.
        SC.removeData(elem, 'listener');
      }

    }

    elem = events = handlers = null ; // avoid memory leaks
    return this ;
  },

  NO_BUBBLE: ['blur', 'focus', 'change'],

  /**
    Generates a simulated event object.  This is mostly useful for unit
    testing.  You can pass the return value of this property into the
    trigger() method to actually send the event.

    @param {Element} elem the element the event targets
    @param {String} eventType event type.  mousedown, mouseup, etc
    @param {Hash} attrs optional additional attributes to apply to event.
    @returns {Hash} simulated event object
  */
  simulateEvent: function(elem, eventType, attrs) {
    var ret = SC.Event.create({
      type: eventType,
      target: elem,
      preventDefault: function(){ this.cancelled = YES; },
      stopPropagation: function(){ this.bubbles = NO; },
      allowDefault: function() { this.hasCustomEventHandling = YES; },
      timeStamp: Date.now(),
      bubbles: (this.NO_BUBBLE.indexOf(eventType)<0),
      cancelled: NO,
      normalized: YES,
      simulated: true
    });
    if (attrs) SC.mixin(ret, attrs) ;
    return ret ;
  },

  /**
    Trigger an event execution immediately.  You can use this method to
    simulate arbitrary events on arbitrary elements.

    ## Limitations

    Note that although this is based on the jQuery implementation, it is
    much simpler.  Notably namespaced events are not supported and you cannot
    trigger events globally.

    If you need more advanced event handling, consider the SC.Responder
    functionality provided by SproutCore or use your favorite DOM library.

    ## Example

        SC.Event.trigger(view.get('layer'), 'mousedown');

    @param elem {Element} the target element
    @param eventType {String} the event type
    @param event {SC.Event} [event] pre-normalized event to pass to handler
    @param donative ??
    @returns {Boolean} Return value of trigger or undefined if not fired
  */
  trigger: function(elem, eventType, event, donative) {

    // if a CQ object is passed in, either call add on each item in the
    // matched set, or simply get the first element and use that.
    if (elem && elem.isCoreQuery) {
      if (elem.length > 0) {
        elem.forEach(function(e) {
          this.trigger(e, eventType, event, donative);
        }, this);
        return this;
      } else elem = elem[0];
    }
    if (!elem) return this; // nothing to do

    // don't do events on text and comment nodes
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) return undefined;

    // Backwards-compatibility. Normalize from an Array.
    if (SC.typeOf(event) === SC.T_ARRAY) { event = event[0]; }

    var ret, fn = SC.typeOf(elem[eventType] || null) === SC.T_FUNCTION ,
        current, onfoo, isClick;

    // Get the event to pass, creating a fake one if necessary
    if (!event || !event.preventDefault) {
      event = this.simulateEvent(elem, eventType);
    }

    event.type = eventType;

    // Trigger the event - bubble if enabled
    current = elem;
    do {
      ret = SC.Event.handle.call(current, event);
      current = (current===document) ? null : (current.parentNode || document);
    } while(!ret && event.bubbles && current);
    current = null ;

    // Handle triggering native .onfoo handlers
    onfoo = elem["on" + eventType] ;
    isClick = SC.$.nodeName(elem, 'a') && eventType === 'click';
    if ((!fn || isClick) && onfoo && onfoo.call(elem, event) === NO) ret = NO;

    // Trigger the native events (except for clicks on links)
    if (fn && donative !== NO && ret !== NO && !isClick) {
      this.triggered = YES;
      try {
        elem[ eventType ]();
      // prevent IE from throwing an error for some hidden elements
      } catch (e) {}
    }

    this.triggered = NO;

    return ret;
  },

  /**
    This method will handle the passed event, finding any registered listeners
    and executing them.  If you have an event you want handled, you can
    manually invoke this method.  This function expects it's "this" value to
    be the element the event occurred on, so you should always call this
    method like:

        SC.Event.handle.call(element, event) ;

    Note that like other parts of this library, the handle function does not
    support namespaces.

    @param event {DOMEvent} the event to handle
    @returns {Boolean}
  */
  handle: function (event) {

    // ignore events triggered after window is unloaded or if double-called
    // from within a trigger.
    if ((typeof SC === "undefined") || SC.Event.triggered) return true;

    // returned undefined or false
    var val, ret, handlers, method, target;

    // get the handlers for this event type
    handlers = (SC.data(this, "sc_events") || {})[event.type];

    // no handlers for the event
    if (!handlers) {
      val = false; // nothing to do

    } else {
      // normalize event across browsers.  The new event will actually wrap the real event with a normalized API.
      event = SC.Event.normalizeEvent(event || window.event);

      // invoke all handlers
      for (var key in handlers) {
        var handler = handlers[key];

        method = handler[1];

        // Pass in a reference to the handler function itself so that we can remove it later.
        event.handler = method;
        event.data = event.context = handler[2];

        target = handler[0] || this;
        ret = method.call(target, event);

        if (val !== false) val = ret;

        // if method returned NO, do not continue.  Stop propagation and
        // return default.  Note that we test explicitly for NO since
        // if the handler returns no specific value, we do not want to stop.
        if ( ret === false ) {
          event.preventDefault();
          event.stopPropagation();
        }
      }

      // Clean up the cached normalized SC.Event so that it's not holding onto extra memory.
      if (event.originalEvent && !event.originalEvent.simulated) { event._sc_clearNormalizedEvent(); }
    }

    return val;
  },

  /**
    This method is called just before the window unloads to unhook all
    registered events.
  */
  unload: function() {
    var key, elements = this._elements ;
    for(key in elements) this.remove(elements[key]) ;

    // just in case some book-keeping was screwed up.  avoid memory leaks
    for(key in elements) delete elements[key] ;
    delete this._elements ;
  },

  /**
    This hash contains handlers for special or custom events.  You can add
    your own handlers for custom events here by simply naming the event and
    including a hash with the following properties:

     - setup: this function should setup the handler or return NO
     - teardown: this function should remove the event listener

  */
  special: {

    ready: {
      setup: function() {
        // Make sure the ready event is setup
        SC._bindReady() ;
        return;
      },

      teardown: function() { return; }

    },

    /** @private
        Implement support for mouseenter on browsers other than IE */
    mouseenter: {
      setup: function() {
        if ( SC.browser.name === SC.BROWSER.ie ) return NO;
        SC.Event.add(this, 'mouseover', SC.Event.special.mouseenter.handler);
        return YES;
      },

      teardown: function() {
        if ( SC.browser.name === SC.BROWSER.ie ) return NO;
        SC.Event.remove(this, 'mouseover', SC.Event.special.mouseenter.handler);
        return YES;
      },

      handler: function (event) {
        // If we actually just moused on to a sub-element, ignore it
        if ( SC.Event._withinElement(event, this) ) return YES;
        // Execute the right handlers by setting the event type to mouseenter
        event.type = "mouseenter";

        return SC.Event.handle.call(this, event);
      }
    },

    /** @private
        Implement support for mouseleave on browsers other than IE */
    mouseleave: {
      setup: function() {
        if ( SC.browser.name === SC.BROWSER.ie ) return NO;
        SC.Event.add(this, "mouseout", SC.Event.special.mouseleave.handler);
        return YES;
      },

      teardown: function() {
        if ( SC.browser.name === SC.BROWSER.ie ) return NO;
        SC.Event.remove(this, "mouseout", SC.Event.special.mouseleave.handler);
        return YES;
      },

      handler: function (event) {
        // If we actually just moused on to a sub-element, ignore it
        if ( SC.Event._withinElement(event, this) ) return YES;
        // Execute the right handlers by setting the event type to mouseleave
        event.type = "mouseleave";
        return SC.Event.handle.call(this, event);
      }
    }
  },

  KEY_BACKSPACE: 8,
  KEY_TAB:       9,
  KEY_RETURN:   13,
  KEY_ESC:      27,
  KEY_SPACE:    32,
  KEY_LEFT:     37,
  KEY_UP:       38,
  KEY_RIGHT:    39,
  KEY_DOWN:     40,
  KEY_DELETE:   46,
  KEY_HOME:     36,
  KEY_END:      35,
  KEY_PAGEUP:   33,
  KEY_PAGEDOWN: 34,
  KEY_INSERT:   45,

  _withinElement: function(event, elem) {
    // Check if mouse(over|out) are still within the same parent element
    var parent = event.relatedTarget;

    // Traverse up the tree
    while ( parent && parent !== elem ) {
      try { parent = parent.parentNode; } catch(error) { parent = elem; }
    }

    // Return YES if we actually just moused on to a sub-element
    return parent === elem;
  },

  /** @private
    Adds the primary event listener for the named type on the element.

    If the event type has a special handler defined in SC.Event.special,
    then that handler will be used.  Otherwise the normal browser method will
    be used.

    @param elem {Element} the target element
    @param eventType {String} the event type
  */
  _addEventListener: function(elem, eventType, useCapture) {
    var listener,
        special = this.special[eventType] ;

		if (!useCapture) {
			useCapture = false;
		}

    // Check for a special event handler
    // Only use addEventListener/attachEvent if the special
    // events handler returns false
    if ( !special || special.setup.call(elem) === false) {

      // Save element in cache.  This must be removed later to avoid
      // memory leaks.
      var guid = SC.guidFor(elem) ;
      this._elements[guid] = elem;

      // Either retrieve the previously cached listener or cache a new one.
      listener = SC.data(elem, "listener") || SC.data(elem, "listener",
        function handle_event (event) {
          return SC.Event.handle.call(SC.Event._elements[guid], event);
        });

      // Bind the global event handler to the element
      if (elem.addEventListener) {
        elem.addEventListener(eventType, listener, useCapture);
      } else if (elem.attachEvent) {
        // attachEvent is not working for IE8 and xhr objects
        // there is currently a hack in request , but it needs to fixed here.
        elem.attachEvent("on" + eventType, listener);
      }
    }

    elem = special = listener = null; // avoid memory leak
  },

  /** @private
    Removes the primary event listener for the named type on the element.

    If the event type has a special handler defined in SC.Event.special,
    then that handler will be used.  Otherwise the normal browser method will
    be used.

    Note that this will not clear the _elements hash from the element.  You
    must call SC.Event.unload() on unload to make sure that is cleared.

    @param elem {Element} the target element
    @param eventType {String} the event type
  */
  _removeEventListener: function(elem, eventType) {
    var listener, special = SC.Event.special[eventType] ;
    if (!special || (special.teardown.call(elem)===NO)) {
      // Retrieve the cached listener.
      listener = SC.data(elem, "listener") ;
      if (listener) {
        if (elem.removeEventListener) {
          elem.removeEventListener(eventType, listener, NO);
        } else if (elem.detachEvent) {
          elem.detachEvent("on" + eventType, listener);
        }
      }
    }

    elem = special = listener = null ;
  },

  _elements: {},

  _sc_normalizedEvents: null,

  // implement preventDefault() in a cross platform way

  /** @private Take an incoming event and convert it to a normalized event. */
  normalizeEvent: function (event) {
    var ret;

    // Create the cache the first time.
    if (!this._sc_normalizedEvents) { this._sc_normalizedEvents = {}; }
    ret = this._sc_normalizedEvents[event.type];

    // Create a new normalized SC.Event.
    if (!ret) {
      if (event === window.event) {
        // IE can't do event.normalized on an Event object
        ret = SC.Event.create(event) ;
      } else {
        ret = event.normalized ? event : SC.Event.create(event) ;
      }

    // When passed an SC.Event, don't re-normalize it.
    // TODO: This is hacky nonsense left over from a whole pile of bad decisions in SC.Event—
    } else if (event.normalized) {
      ret = event;

    // Update the cached normalized SC.Event with the new DOM event.
    } else {
      ret._sc_updateNormalizedEvent(event);
    }

    // Cache the normalized event object for this type of event. This allows us to avoid recreating
    // SC.Event objects constantly for noisy events such as 'mousemove' or 'mousewheel'.
    this._sc_normalizedEvents[event.type] = ret;

    return ret;
  },

  _global: {},

  /** @private properties to copy from native event onto the event */
  // TODO: Remove this needless copy.
  _props: ['altKey', 'attrChange', 'attrName', 'bubbles', 'button', 'cancelable', 'charCode', 'clientX', 'clientY', 'ctrlKey', 'currentTarget', 'data', 'detail', 'fromElement', 'handler', 'keyCode', 'metaKey', 'newValue', 'originalTarget', 'pageX', 'pageY', 'prevValue', 'relatedNode', 'relatedTarget', 'screenX', 'screenY', 'shiftKey', 'srcElement', 'target', 'timeStamp', 'toElement', 'type', 'view', 'which', 'touches', 'targetTouches', 'changedTouches', 'animationName', 'elapsedTime', 'dataTransfer']

});

SC.Event.prototype = {

  /**
    Set to YES if you have called either preventDefault() or stopPropagation().
    This allows a generic event handler to notice if you want to provide
    detailed control over how the browser handles the real event.

    @type Boolean
  */
  hasCustomEventHandling: false,

  /** @private Clear out the originalEvent from the SC.Event instance. */
  _sc_clearNormalizedEvent: function () {
    // Remove the original event.
    this.originalEvent = null;

    // Reset the custom event handling and normalized flag.
    this.hasCustomEventHandling = false;
    this.normalized = false;

    // Remove non-primitive properties copied over from the original event. While these will
    // be overwritten, it's best to quickly null them out to avoid any issues.
    var props = SC.Event._props,
      idx;

    idx = props.length;
    while(--idx >= 0) {
      var key = props[idx];
      this[key] = null;
    }

    // Remove the custom properties associated with the previous original event. While these will
    // be overwritten, it's best to quickly null them out to avoid any issues.
    this.timeStamp = null;
    this.target = null;
    this.relatedTarget = null;
    this.pageX = null;
    this.pageY = null;
    this.which = null;
    this.metaKey = null;
    this.wheelDelta = null;
    this.wheelDeltaY = null;
    this.wheelDeltaX = null;
  },

  /** @private Update the SC.Event instance with the new originalEvent. */
  _sc_updateNormalizedEvent: function (originalEvent) {
    var idx, len;

    // Flag.
    this.normalized = true;

    // copy properties from original event, if passed in.
    if (originalEvent) {
      this.originalEvent = originalEvent ;
      var props = SC.Event._props,
        key;

      len = props.length;
      idx = len;
      while(--idx >= 0) {
        key = props[idx] ;
        this[key] = originalEvent[key] ;
      }
    }

    // Fix timeStamp
    this.timeStamp = this.timeStamp || Date.now();

    // Fix target property, if necessary
    // Fixes #1925 where srcElement might not be defined either
    if (!this.target) this.target = this.srcElement || document;

    // check if target is a textnode (safari)
    if (this.target.nodeType === 3 ) this.target = this.target.parentNode;

    // Add relatedTarget, if necessary
    if (!this.relatedTarget && this.fromElement) {
      this.relatedTarget = (this.fromElement === this.target) ? this.toElement : this.fromElement;
    }

    // Calculate pageX/Y if missing and clientX/Y available
    if (SC.none(this.pageX) && !SC.none(this.clientX)) {
      var doc = document.documentElement, body = document.body;
      this.pageX = this.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
      this.pageY = this.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
    }

    // Add which for key events
    if (!this.which && ((this.charCode || originalEvent.charCode === 0) ? this.charCode : this.keyCode)) {
      this.which = this.charCode || this.keyCode;
    }

    // Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
    if (!this.metaKey && this.ctrlKey) this.metaKey = this.ctrlKey;

    // Add which for click: 1 == left; 2 == middle; 3 == right
    // Note: button is not normalized, so don't use it
    if (!this.which && this.button) {
      this.which = ((this.button & 1) ? 1 : ((this.button & 2) ? 3 : ( (this.button & 4) ? 2 : 0 ) ));
    }

    // Normalize wheel delta values for mousewheel events.
    /*
      Taken from https://developer.mozilla.org/en-US/docs/Web/Events/mousewheel
      IE and Opera (Presto) only support wheelDelta attribute and do not support horizontal scroll.

      The wheelDeltaX attribute value indicates the wheelDelta attribute value along the horizontal axis. When a user operates the device for scrolling to right, the value is negative. Otherwise, i.e., if it's to left, the value is positive.

      The wheelDeltaY attribute value indicates the wheelDelta attribute value along the vertical axis. The sign of the value is the same as the wheelDelta attribute value.

      IE

      The value is the same as the delta value of WM_MOUSEWHEEL or WM_MOUSEHWHEEL. It means that if the mouse wheel doesn't support high resolution scroll, the value is 120 per notch. The value isn't changed even if the scroll amount of system settings is page scroll.

      ## Chrome

      On Windows, the value is the same as the delta value of WM_MOUSEWHEEL or WM_MOUSEHWHEEL. And also, the value isn't changed even if the scroll amount of system settings is page scroll, i.e., the value is the same as IE on Windows.

      On Linux, the value is 120 or -120 per native wheel event. This makes the same behavior as IE and Chrome for Windows.

      On Mac, the value is complicated. The value is changed if the device that causes the native wheel event supports continuous scroll.

      If the device supports continuous scroll (e.g., trackpad of MacBook or mouse wheel which can be turned smoothly), the value is computed from accelerated scroll amount. In this case, the value is the same as Safari.

      If the device does not support continuous scroll (typically, old mouse wheel which cannot be turned smoothly), the value is computed from non-accelerated scroll amount (120 per notch). In this case, the value is different from Safari.

      This difference makes a serious issue for web application developers. That is, web developers cannot know if mousewheel event is caused by which device.

      See WebInputEventFactory::mouseWheelEvent of the Chromium's source code for the detail.

      ## Safari

      The value is always computed from accelerated scroll amount. This is really different from other browsers except Chrome with continuous scroll supported device.

      Note: tested with the Windows package, the earliest available version was Safari 3.0 from 2007. It could be that earlier versions (on Mac) support the properties too.

      ## Opera (Presto)

      The value is always the detail attribute value ✕ 40.

      On Windows, since the detail attribute value is computed from actual scroll amount, the value is different from other browsers except the scroll amount per notch is 3 lines in system settings or a page.

      On Linux, the value is 80 or -80 per native wheel event. This is different from other browsers.

      On Mac, the detail attribute value is computed from accelerated scroll amout of native event. The value is usually much bigger than Safari's or Chrome's value.
    */
    if (this.type === 'mousewheel' || this.type === 'DOMMouseScroll' || this.type === 'MozMousePixelScroll') {
      var deltaMultiplier = SC.Event.MOUSE_WHEEL_MULTIPLIER;

      // normalize wheelDelta, wheelDeltaX, & wheelDeltaY for Safari
      if (SC.browser.isWebkit && originalEvent.wheelDelta !== undefined) {
        this.wheelDelta = 0 - (originalEvent.wheelDeltaY || originalEvent.wheelDeltaX);
        this.wheelDeltaY = 0 - (originalEvent.wheelDeltaY || 0);
        this.wheelDeltaX = 0 - (originalEvent.wheelDeltaX || 0);

      // normalize wheelDelta for Firefox (all Mozilla browsers)
      // note that we multiple the delta on FF to make it's acceleration more natural.
      } else if (!SC.none(originalEvent.detail) && SC.browser.isMozilla) {
        if (originalEvent.axis && (originalEvent.axis === originalEvent.HORIZONTAL_AXIS)) {
          this.wheelDeltaX = originalEvent.detail;
          this.wheelDelta = this.wheelDeltaY = 0;
        } else {
          this.wheelDelta = this.wheelDeltaY = originalEvent.detail;
          this.wheelDeltaX = 0;
        }

      // handle all other legacy browser
      } else {
        this.wheelDelta = this.wheelDeltaY = SC.browser.isIE || SC.browser.isOpera ? 0 - originalEvent.wheelDelta : originalEvent.wheelDelta;
        this.wheelDeltaX = 0;
      }

      this.wheelDelta *= deltaMultiplier;
      this.wheelDeltaX *= deltaMultiplier;
      this.wheelDeltaY *= deltaMultiplier;
    }
  },

  /**
    Returns the touches owned by the supplied view.

    @param {SC.View}
    @returns {Array} touches an array of SC.Touch objects
  */
  touchesForView: function(view) {
    if (this.touchContext) return this.touchContext.touchesForView(view);
  },

  /**
    Same as touchesForView, but sounds better for responders.

    @param {SC.RootResponder}
    @returns {Array} touches an array of SC.Touch objects
  */
  touchesForResponder: function(responder) {
    if (this.touchContext) return this.touchContext.touchesForView(responder);
  },

  /**
    Returns average data--x, y, and d (distance)--for the touches owned by the
    supplied view.

    @param {SC.View}
    @returns {Array} touches an array of SC.Touch objects
  */
  averagedTouchesForView: function(view) {
    if (this.touchContext) return this.touchContext.averagedTouchesForView(view);
    return null;
  },

  /**
    Indicates that you want to allow the normal default behavior.  Sets
    the hasCustomEventHandling property to YES but does not cancel the event.

    @returns {SC.Event} receiver
  */
  allowDefault: function() {
    this.hasCustomEventHandling = YES ;
    return this ;
  },

  /**
    Implements W3C standard.  Will prevent the browser from performing its
    default action on this event.

    @returns {SC.Event} receiver
  */
  preventDefault: function() {
    var evt = this.originalEvent ;
    if (evt) {
      if (evt.preventDefault) evt.preventDefault() ;
      else evt.returnValue = NO ; // IE8
    }
    this.hasCustomEventHandling = YES ;
    return this ;
  },

  /**
    Implements W3C standard.  Prevents further bubbling of the event.

    @returns {SC.Event} receiver
  */
  stopPropagation: function() {
    var evt = this.originalEvent ;
    if (evt) {
      if (evt.stopPropagation) evt.stopPropagation() ;
      evt.cancelBubble = YES ; // IE
    }
    this.hasCustomEventHandling = YES ;
    return this ;
  },

  /**
    Stops both the default action and further propagation.  This is more
    convenient than calling both.

    @returns {SC.Event} receiver
  */
  stop: function() {
    return this.preventDefault().stopPropagation();
  },

  /**
    Always YES to indicate the event was normalized.

    @type Boolean
  */
  normalized: YES,

  /**
    Returns the pressed character as a String.

    @returns {String}
  */
  // Warning.
  // Older versions of IE don't support charCode, but on keypress return the
  // ASCII value in keyCode instead of the key code.  Therefore, if this code is
  // used on keyDown in IE versions prior to 9.0, it will fail.
  // Since SproutCore passes the keydown and keypress events as a keyDown
  // method, it's most likely that this code will cause unexpected problems
  // in IE 7 & IE 8.
  //
  // Reference: http://unixpapa.com/js/key.html
  getCharString: function() {
    if(SC.browser.name === SC.BROWSER.ie &&
        SC.browser.compare(SC.browser.version, '9.0') < 0) {
      // Return an empty String for backspace, tab, left, right, up or down.
      if(this.keyCode === 8 || this.keyCode === 9 ||
          (this.keyCode >= 37 && this.keyCode <= 40)) {
        return String.fromCharCode(0);
      } else {
        // This will only be accurate if the event is a keypress event.
        return (this.keyCode>0) ? String.fromCharCode(this.keyCode) : null;
      }
    } else {
      return (this.charCode>0) ? String.fromCharCode(this.charCode) : null;
    }
  },

  /**
    Returns characters with command codes for the event.

    The first value is a normalized command code identifying the modifier keys that are pressed in
    combination with a character key. Command codes can be used to map key combinations to an action
    in the application. A basic example of a normalized command code would be `ctrl_x`, which
    corresponds to the combination of the `command` key with the `x` key being pressed on OS X or
    the `ctrl` key with the `x` key in Windows.

    The second value is the character string by itself. So for `ctrl_x`, this would be simply `x`. However,
    for `alt_x` it would be `≈` and for `alt_shift_x`, it would be `˛`.

    ## Considerations for Different OS's

    At this time, the meta (command) key in OS X is mapped to the `ctrl_` command code prefix. This
    means that on OS X, command + s, and on Windows, ctrl + s, both become the same command code, `ctrl_s`.

    Note that the order of command code prefixes is important and goes in the order: `ctrl_`, `alt_`,
    `shift_`. The following are examples of command codes:

    * ctrl_x
    * alt_x
    * ctrl_shift_x
    * ctrl_alt_shift_x
    * alt_shift_x

    @returns {Array}
  */
  commandCodes: function () {
    var charCode = this.charCode,
      keyCode = this.keyCode,
      charString = null,
      commandCode = null,
      baseKeyName;

    // WebKit browsers have equal values for `keyCode` and `charCode` on the keypress event. For example,
    // the letter `r` and the function `f3` both have a `keyCode` of 114. But the `r` also has a `charCode`
    // of 114.
    // If there is a keyCode and no matching charCode it is a function key.
    if (keyCode && keyCode !== charCode) {
      commandCode = SC.FUNCTION_KEYS[keyCode];
    }

    // Use the function name as the key name in the command code (ex. `down` could become `shift_down`).
    if (commandCode) {
      baseKeyName = commandCode;

    // Find the base character for the key (i.e. `alt` + `a` becomes `å`, but we really want the key name, `a`).
    } else {
      baseKeyName = SC.PRINTABLE_KEYS[keyCode];
    }

    // If there is a base key name, append any modifiers to generate the command code.
    if (baseKeyName) {
      var modifiers = '';

      // Append the pressed modifier keys into a name used to identify command codes.
      // For example, holding the keys: shift, command & x, will map to the name "ctrl_shift_x".
      if (this.ctrlKey || this.metaKey) modifiers += 'ctrl_';
      // UNUSED. In a future version we should scrap ctrl vs. meta for the proper intent depending on the current OS.
      // if (this.ctrlKey) modifiers += 'ctrl_';
      // In OS X at least, when the ctrl key is pressed, both ctrlKey & metaKey are true. This makes it impossible to identify
      // ctrl + meta vs. just ctrl. We can identify just meta though.
      // else if (this.metaKey) modifiers += 'meta_';

      if (this.altKey) modifiers += 'alt_';
      if (this.shiftKey) modifiers += 'shift_';

      commandCode = modifiers + baseKeyName;
    }

    charString = this.getCharString();  // A character string or null.

    return [commandCode, charString];
  }

};

// Also provide a Prototype-like API so that people can use either one.

/** Alias for add() method.  This provides a Prototype-like API. */
SC.Event.observe = SC.Event.add ;

/** Alias for remove() method.  This provides a Prototype-like API */
SC.Event.stopObserving = SC.Event.remove ;

/** Alias for trigger() method.  This provides a Prototype-like API */
SC.Event.fire = SC.Event.trigger;

// Register unload handler to eliminate any registered handlers
// This avoids leaks in IE and issues with mouseout or other handlers on
// other browsers.

if(SC.browser.name === SC.BROWSER.ie) SC.Event.add(window, 'unload', SC.Event.prototype, SC.Event.unload) ;

SC.MODIFIER_KEYS = {
  16:'shift', 17:'ctrl', 18: 'alt'
};

SC.FUNCTION_KEYS = {
  8: 'backspace',  9: 'tab',  13: 'return',  19: 'pause',  27: 'escape',
  33: 'pageup', 34: 'pagedown', 35: 'end', 36: 'home',
  37: 'left', 38: 'up', 39: 'right', 40: 'down', 44: 'printscreen',
  45: 'insert', 46: 'delete', 112: 'f1', 113: 'f2', 114: 'f3', 115: 'f4',
  116: 'f5', 117: 'f7', 119: 'f8', 120: 'f9', 121: 'f10', 122: 'f11',
  123: 'f12', 144: 'numlock', 145: 'scrolllock'
} ;

SC.PRINTABLE_KEYS = {
  32: ' ', 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7",
  56:"8", 57:"9", 59:";", 61:"=", 65:"a", 66:"b", 67:"c", 68:"d", 69:"e",
  70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n",
  79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w",
  88:"x", 89:"y", 90:"z", 107:"+", 109:"-", 110:".", 188:",", 190:".",
  191:"/", 192:"`", 219:"[", 220:"\\", 221:"]", 222:"\""
} ;

/* >>>>>>>>>> BEGIN source/system/cursor.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// standard browser cursor definitions
// TODO: remove extra constants in next version
// TODO: consider adding theme cursors for custom behaviors like drag & drop
SC.SYSTEM_CURSOR = SC.DEFAULT_CURSOR = 'default';
SC.AUTO_CURSOR = 'auto';
SC.CROSSHAIR_CURSOR = 'crosshair';
SC.HAND_CURSOR = SC.POINTER_CURSOR = 'pointer';
SC.MOVE_CURSOR = 'move';
SC.E_RESIZE_CURSOR = 'e-resize';
SC.NE_RESIZE_CURSOR = 'ne-resize';
SC.NW_RESIZE_CURSOR = 'nw-resize';
SC.N_RESIZE_CURSOR = 'n-resize';
SC.SE_RESIZE_CURSOR = 'se-resize';
SC.SW_RESIZE_CURSOR = 'sw-resize';
SC.S_RESIZE_CURSOR = 's-resize';
SC.W_RESIZE_CURSOR = 'w-resize';
SC.IBEAM_CURSOR = SC.TEXT_CURSOR = 'text';
SC.WAIT_CURSOR = 'wait';
SC.HELP_CURSOR = 'help';

/**
  @class SC.Cursor

  A Cursor object is used to synchronize the cursor used by multiple views at
  the same time. For example, thumb views within a split view acquire a cursor
  instance from the split view and set it as their cursor. The split view is
  able to update its cursor object to reflect the state of the split view.
  Because cursor objects are implemented internally with CSS, this is a very
  efficient way to update the same cursor for a group of view objects.

  Note: This object creates an anonymous CSS class to represent the cursor.
  The anonymous CSS class is automatically added by SproutCore to views that
  have the cursor object set as "their" cursor. Thus, all objects attached to
  the same cursor object will have their cursors updated simultaneously with a
  single DOM call.

  @extends SC.Object
*/
SC.Cursor = SC.Object.extend(
/** @scope SC.Cursor.prototype */ {

  /** @private */
  init: function () {
    arguments.callee.base.apply(this,arguments);

    // create a unique style rule and add it to the shared cursor style sheet
    var cursorStyle = this.get('cursorStyle') || SC.DEFAULT_CURSOR,
      ss = this.constructor.sharedStyleSheet(),
      guid = SC.guidFor(this);

    if (ss.insertRule) { // WC3
      ss.insertRule(
        '.' + guid + ' {cursor: ' + cursorStyle + ';}',
        ss.cssRules ? ss.cssRules.length : 0
      );
    } else if (ss.addRule) { // IE
      ss.addRule('.' + guid, 'cursor: ' + cursorStyle);
    }

    this.cursorStyle = cursorStyle;
    this.className = guid; // used by cursor clients...
    return this;
  },

  /**
    This property is the connection between cursors and views. The default
    SC.View behavior is to add this className to a view's layer if it has
    its cursor property defined.

    @readOnly
    @type String the css class name updated by this cursor
  */
  className: null,

  /**
    @type String the cursor value, can be 'url("path/to/cursor")'
  */
  cursorStyle: SC.DEFAULT_CURSOR,

  /** @private */
  cursorStyleDidChange: function () {
    var cursorStyle, rule, selector, ss, rules, idx, len;
    cursorStyle = this.get('cursorStyle') || SC.DEFAULT_CURSOR;
    rule = this._rule;
    if (rule) {
      rule.style.cursor = cursorStyle; // fast path
      return;
    }

    // slow path, taken only once
    selector = '.' + this.get('className');
    ss = this.constructor.sharedStyleSheet();
    rules = (ss.cssRules ? ss.cssRules : ss.rules) || [];

    // find our rule, cache it, and update the cursor style property
    for (idx = 0, len = rules.length; idx < len; ++idx) {
      rule = rules[idx];
      if (rule.selectorText === selector) {
        this._rule = rule; // cache for next time
        rule.style.cursor = cursorStyle; // update the cursor
        break;
      }
    }
  }.observes('cursorStyle')

  // TODO implement destroy

});


/** @private */
SC.Cursor.sharedStyleSheet = function () {
  var ssEl,
    head,
    ss = this._styleSheet;

  if (!ss) {
    // create the stylesheet object the hard way (works everywhere)
    ssEl = document.createElement('style');
    head = document.getElementsByTagName('head')[0];
    if (!head) head = document.documentElement; // fix for Opera
    head.appendChild(ssEl);

    // Get the actual stylesheet object, not the DOM element.  We expect it to
    // be the last stylesheet in the document, but test to make sure no other
    // stylesheet has appeared.
    for (var i = document.styleSheets.length - 1; i >= 0; i--) {
      ss = document.styleSheets[i];

      if (ss.ownerNode === ssEl) {
        // We've found the proper stylesheet.
        this._styleSheet = ss;
        break;
      }
    }
  }

  return ss;
};

/* >>>>>>>>>> BEGIN source/system/responder.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  Provides common methods for sending events down a responder chain.
  Responder chains are used most often to deliver events to user interface
  elements in your application, but you can also use them to deliver generic
  events to any part of your application, including controllers.

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Responder = SC.Object.extend( /** @scope SC.Responder.prototype */ {

  isResponder: YES,

  /** @property
    The pane this responder belongs to.  This is used to determine where you
    belong to in the responder chain.  Normally you should leave this property
    set to null.
  */
  pane: null,

  /** @property
    The app this responder belongs to.  For non-user-interface responder
    chains, this is used to determine the context.  Usually this
    is the property you will want to work with.
  */
  responderContext: null,

  /** @property
    This is the nextResponder in the responder chain.  If the receiver does
    not implement a particular event handler, it will bubble to the next
    responder.

    This can point to an object directly or it can be a string, in which case
    the path will be resolved from the responderContext root.
  */
  nextResponder: null,

  /** @property
    YES if the view is currently first responder.  This property is always
    edited by the pane during its makeFirstResponder() method.
  */
  isFirstResponder: NO,

  /** @property

    YES the responder is somewhere in the responder chain.  This currently
    only works when used with a ResponderContext.

    @type {Boolean}
  */
  hasFirstResponder: NO,

  /** @property
    Set to YES if your view is willing to accept first responder status.  This is used when calculating key responder loop.
  */
  acceptsFirstResponder: YES,

  becomingFirstResponder: NO,

  /**
    Call this method on your view or responder to make it become first
    responder.

    @returns {SC.Responder} receiver
  */
  becomeFirstResponder: function () {
    var pane = this.get('pane') || this.get('responderContext') ||
              this.pane();
    if (pane && this.get('acceptsFirstResponder')) {
      if (pane.get('firstResponder') !== this) pane.makeFirstResponder(this);
    }
    return this;
  },

  /**
    Call this method on your view or responder to resign your first responder
    status. Normally this is not necessary since you will lose first responder
    status automatically when another view becomes first responder.

    @param {Event} the original event that caused this method to be called
    @returns {SC.Responder} receiver
  */
  resignFirstResponder: function (evt) {
    var pane = this.get('pane') || this.get('responderContext');
    if (pane && (pane.get('firstResponder') === this)) {
      pane.makeFirstResponder(null, evt);
    }
    return YES;
  },

  /**
    Called just before the responder or any of its subresponder's are about to
    lose their first responder status.  The passed responder is the responder
    that is about to lose its status.

    Override this method to provide any standard teardown when the first
    responder changes.

    @param {SC.Responder} responder the responder that is about to change
    @returns {void}
  */
  willLoseFirstResponder: function (responder) {},

  /**
    Called just after the responder or any of its subresponder's becomes a
    first responder.

    Override this method to provide any standard setup when the first
    responder changes.

    @param {SC.Responder} responder the responder that changed
    @returns {void}
  */
  didBecomeFirstResponder: function (responder) {},

  /** SC.Object.prototype.destroy */
  destroy: function () {
    this.resignFirstResponder();

    arguments.callee.base.apply(this,arguments);
  }

});

/* >>>>>>>>>> BEGIN source/system/theme.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  Represents a theme, and is also the core theme in which SC looks for
  other themes.

  If an SC.View has a theme of "ace", it will look in its parent's theme
  for the theme "ace". If there is no parent--that is, if the view is a
  frame--it will look in SC.Theme for the named theme. To find a theme,
  it calls find(themeName) on the theme.

  To be located, themes must be registered either as a root theme (by
  calling SC.Theme.addTheme) or as a child theme of another theme (by
  calling theTheme.addTheme).

  All themes are instances. However, new instances based on the current
  instance can always be created: just call .create(). This method is used
  by SC.View when you name a theme that doesn't actually exist: it creates
  a theme based on the parent theme.

  Locating Child Themes
  ----------------------------
  Locating child themes is relatively simple for the most part: it looks in
  its own "themes" property, which is an object inheriting from its parent's
  "themes" set, so it includes all parent themes.

  However, it does _not_ include global themes. This is because, when find()
  is called, it wants to ensure any child theme is specialized. That is, the
  child theme should include all class names of the base class theme. This only
  makes sense if the theme really is a child theme of the theme or one of its
  base classes; if the theme is a global theme, those class names should not
  be included.

  This makes sense logically as well, because when searching for a render delegate,
  it will locate it in any base theme that has it, but that doesn't mean
  class names from the derived theme shouldn't be included.

  @extends SC.Object
  @since SproutCore 1.1
  @author Alex Iskander
*/
SC.Theme = {
  /**
    Walks like a duck.
  */
  isTheme: YES,

  /**
    Class names for the theme.

    These class names include the name of the theme and the names
    of all parent themes. You can also add your own.
   */
  classNames: [],

  /**
    @private
    A helper to extend class names with another set of classnames. The
    other set of class names can be a hash, an array, a Set, or a space-
    delimited string.
  */
  _extend_class_names: function(classNames) {
    // class names may be a CoreSet, array, string, or hash
    if (classNames) {
      if (SC.typeOf(classNames) === SC.T_HASH && !classNames.isSet) {
        for (var className in classNames) {
          var index = this.classNames.indexOf(className);
          if (classNames[className] && index < 0) {
            this.classNames.push(className)
          } else if (index >= 0) {
            this.classNames.removeAt(index);
          }
        }
      } else {
        if (typeof classNames === "string") {
          
          // There is no reason to support classNames as a String, it's just extra cases to have to support and makes for inconsistent code style.
          SC.warn("Developer Warning: The classNames of a Theme should be an Array.");
          
          classNames = classNames.split(' ');
        }

        
        // There is no reason to support classNames as a Set, it's just extra cases to have to support and makes for inconsistent code style.
        if (classNames.isSet) {
          SC.warn("Developer Warning: The classNames of a Theme should be an Array.");
        }
        

        // it must be an array or a CoreSet...
        classNames.forEach(function (className) {
          if (!this.classNames.contains(className)) {
            this.classNames.push(className)
          }
        }, this);
      }
    }
  },

  /**
    @private
    Helper method that extends this theme with some extra properties.

    Used during Theme.create();
   */
  _extend_self: function(ext) {
    if (ext.classNames) this._extend_class_names(ext.classNames);

    // mixin while enabling arguments.callee.base.apply(this,arguments);
    var key, value, cur;
    for (key in ext) {
      if (key === 'classNames') continue; // already handled.
      if (!ext.hasOwnProperty(key)) continue;

      value = ext[key];
      if (value instanceof Function && !value.base && (value !== (cur=this[key]))) {
        value.base = cur;
      }

      this[key] = value;
    }
  },

  /**
    Creates a new theme based on this one. The name of the new theme will
    be added to the classNames set.
  */
  create: function() {
    var result = SC.beget(this);
    result.baseTheme = this;

    // if we don't beget themes, the same instance would be shared between
    // all themes. this would be bad: imagine that we have two themes:
    // "Ace" and "Other." Each one has a "capsule" child theme. If they
    // didn't have their own child themes hash, the two capsule themes
    // would conflict.
    if (this.themes === SC.Theme.themes) {
      result.themes = {};
    } else {
      result.themes = SC.beget(this.themes);
    }

    // we also have private ("invisible") child themes; look at invisibleSubtheme
    // method.
    result._privateThemes = {};

    // also, the theme specializes all child themes as they are created
    // to ensure that all of the class names on this theme are included.
    result._specializedThemes = {};

    // we could put this in _extend_self, but we don't want to clone
    // it for each and every argument passed to create().
    result.classNames = SC.clone(this.classNames);

    var args = arguments, len = args.length, idx, mixin;
    for (idx = 0; idx < len; idx++) {
      result._extend_self(args[idx]);
    }

    if (result.name && !result.classNames.contains(result.name)) result.classNames.push(result.name);

    return result;
  },

  /**
    Creates a child theme based on this theme, with the given name,
    and automatically registers it as a child theme.
  */
  subtheme: function(name) {
    // extend the theme
    var t = this.create({ name: name });

    // add to our set of themes
    this.addTheme(t);

    // and return the theme class
    return t;
  },

  /**
    Semi-private, only used by SC.View to create "invisible" subthemes. You
    should never need to call this directly, nor even worry about.

    Invisible subthemes are only available when find is called _on this theme_;
    if find() is called on a child theme, it will _not_ locate this theme.

    The reason for "invisible" subthemes is that SC.View will create a subtheme
    when it finds a theme name that doesn't exist. For example, imagine that you
    have a parent view with theme "base", and a child view with theme "popup".
    If no "popup" theme can be found inside "base", SC.View will call
    base.subtheme. This will create a new theme with the name "popup",
    derived from "base". Everyone is happy.

    But what happens if you then change the parent theme to "ace"? The view
    will try again to find "popup", and it will find it-- but it will still be
    a child theme of "base"; SC.View _needs_ to re-subtheme it, but it won't
    know it needs to, because it has been found.
  */
  invisibleSubtheme: function(name) {
    // extend the theme
    var t = this.create({ name: name });

    // add to our set of themes
    this._privateThemes[name] = t;

    // and return the theme class
    return t;
  },

  //
  // THEME MANAGEMENT
  //

  themes: {},

  /**
    Finds a theme by name within this theme (the theme must have
    previously been added to this theme or a base theme by using addTheme, or
    been registered as a root theme).

    If the theme found is not a root theme, this will specialize the theme so
    that it includes all class names for this theme.
  */
  find: function(themeName) {
    if (this === SC.Theme) return this.themes[themeName];
    var theme;

    // if there is a private theme (invisible subtheme) by that name, use it
    theme = this._privateThemes[themeName];
    if (theme) return theme;

    // if there is a specialized version (the theme extended with our class names)
    // return that one
    theme = this._specializedThemes[themeName];
    if (theme) return theme;

    // otherwise, we may need to specialize one.
    theme = this.themes[themeName];
    if (theme && !this._specializedThemes[themeName]) {
      return (this._specializedThemes[themeName] = theme.create({ classNames: this.classNames }));
    }

    // and finally, if it is a root theme, we do nothing to it.
    theme = SC.Theme.themes[themeName];
    if (theme) return theme;

    return null;
  },

  /**
    Adds a child theme to the theme. This allows the theme to be located
    by SproutCore views and such later.

    Each theme is registered in the "themes" property by name. Calling
    find(name) will return the theme with the given name.

    Because the themes property is an object begetted from (based on) any
    parent theme's "themes" property, if the theme cannot be found in this
    theme, it will be found in any parent themes.
  */
  addTheme: function(theme) {
    this.themes[theme.name] = theme;
  }
};

// SproutCore _always_ has its base theme. This is not quite
// optimal, but the reasoning is because of test running: the
// test runner, when running foundation unit tests, cannot load
// the theme. As such, foundation must include default versions of
// all of its render delegates, and it does so in BaseTheme. All SproutCore
// controls have render delegates in BaseTheme.
SC.BaseTheme = SC.Theme.create({
  name: '' // it is a base class, and doesn't need a class name or such
});

// however, SproutCore does need a default theme, even if no
// actual theme is loaded.
SC.Theme.themes['sc-base'] = SC.BaseTheme;
SC.defaultTheme = 'sc-base';

/* >>>>>>>>>> BEGIN source/system/locale.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  The Locale defined information about a specific locale, including date and
  number formatting conventions, and localization strings.  You can define
  various locales by adding them to the SC.locales hash, keyed by language
  and/or country code.

  On page load, the default locale will be chosen based on the current
  languages and saved at SC.Locale.current.  This locale is used for
  localization, etc.

  ## Creating a new locale

  You can create a locale by simply extending the SC.Locale class and adding
  it to the locales hash:

      SC.Locale.locales['en'] = SC.Locale.extend({ .. config .. }) ;

  Alternatively, you could choose to base your locale on another locale by
  extending that locale:

      SC.Locale.locales['en-US'] = SC.Locale.locales['en'].extend({ ... }) ;

  Note that if you do not define your own strings property, then your locale
  will inherit any strings added to the parent locale.  Otherwise you must
  implement your own strings instead.

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Locale = SC.Object.extend({

  init: function() {
    // make sure we know the name of our own locale.
    if (!this.language) SC.Locale._assignLocales();

    // Make sure we have strings that were set using the new API.  To do this
    // we check to a bool that is set by one of the string helpers.  This
    // indicates that the new API was used. If the new API was not used, we
    // check to see if the old API was used (which places strings on the
    // String class).
    if (!this.hasStrings) {
      var langs = this._deprecatedLanguageCodes || [] ;
      langs.push(this.language);
      var idx = langs.length ;
      var strings = null ;
      while(!strings && --idx >= 0) {
        strings = String[langs[idx]];
      }
      if (strings) {
        this.hasStrings = YES;
        this.strings = strings ;
      }
    }
  },

  /** Set to YES when strings have been added to this locale. */
  hasStrings: NO,

  /** The strings hash for this locale. */
  strings: {},

  /**
    The metrics for this locale.  A metric is a singular value that is usually
    used in a user interface layout, such as "width of the OK button".
  */
  metrics: {},

  /**
    The inflection constants for this locale.
  */
  inflectionConstants: null,

  /**
    The method used to compute the ordinal of a number for this locale.
  */
  ordinalForNumber: function(number) { 
    return '';
  },


  toString: function() {
    if (!this.language) SC.Locale._assignLocales() ;
    return "SC.Locale["+this.language+"]"+SC.guidFor(this) ;
  },

  /**
    Returns the localized version of the string or the string if no match
    was found.

    @param {String} string
    @param {String} optional default string to return instead
    @returns {String}
  */
  locWithDefault: function(string, def) {
    var ret = this.strings[string];

    // strings may be blank, so test with typeOf.
    if (SC.typeOf(ret) === SC.T_STRING) return ret;
    else if (SC.typeOf(def) === SC.T_STRING) return def;
    return string;
  },

  /**
    Returns the localized value of the metric for the specified key, or
    undefined if no match is found.

    @param {String} key
    @returns {Number} ret
  */
  locMetric: function(key) {
    var ret = this.metrics[key];
    if (SC.typeOf(ret) === SC.T_NUMBER) {
      return ret;
    }
    else if (ret === undefined) {
      SC.warn("No localized metric found for key \"" + key + "\"");
      return undefined;
    }
    else {
      SC.warn("Unexpected metric type for key \"" + key + "\"");
      return undefined;
    }
  },

  /**
    Creates and returns a new hash suitable for use as an SC.View’s 'layout'
    hash.  This hash will be created by looking for localized metrics following
    a pattern based on the “base key” you specify.

    For example, if you specify "Button.Confirm", the following metrics will be
    used if they are defined:

      Button.Confirm.left
      Button.Confirm.top
      Button.Confirm.right
      Button.Confirm.bottom
      Button.Confirm.width
      Button.Confirm.height
      Button.Confirm.midWidth
      Button.Confirm.minHeight
      Button.Confirm.centerX
      Button.Confirm.centerY

    Additionally, you can optionally specify a hash which will be merged on top
    of the returned hash.  For example, if you wish to allow a button’s width
    to be configurable per-locale, but always wish for it to be centered
    vertically and horizontally, you can call:

      locLayout("Button.Confirm", {centerX:0, centerY:0})

    …so that you can combine both localized and non-localized elements in the
    returned hash.  (An exception will be thrown if there is a locale-specific
    key that matches a key specific in this hash.)

    @param {String} baseKey
    @param {String} (optional) additionalHash
    @returns {Hash}
  */
  locLayout: function(baseKey, additionalHash) {
    // Note:  In this method we'll directly access this.metrics rather than
    //        going through locMetric() for performance and to avoid
    //        locMetric()'s sanity checks.

    var i, len, layoutKey, key, value,
        layoutKeys = SC.Locale.layoutKeys,
        metrics    = this.metrics,

        // Cache, to avoid repeated lookups
        typeOfFunc = SC.typeOf,
        numberType = SC.T_NUMBER,

        ret        = {};


    // Start off by mixing in the additionalHash; we'll look for collisions with
    // the localized values in the loop below.
    if (additionalHash) SC.mixin(ret, additionalHash);


    // For each possible key that can be included in a layout hash, see whether
    // we have a localized value.
    for (i = 0, len = layoutKeys.length;  i < len;  ++i) {
      layoutKey = layoutKeys[i];
      key       = baseKey + "." + layoutKey;
      value     = metrics[key];

      if (typeOfFunc(value) === numberType) {
        // We have a localized value!  As a sanity check, if the caller
        // specified an additional hash and it has the same key, we'll throw an
        // error.
        if (additionalHash  &&  additionalHash[layoutKey]) {
          throw new Error("locLayout():  There is a localized value for the key '" + key + "' but a value for '" + layoutKey + "' was also specified in the non-localized hash");
        }

        ret[layoutKey] = value;
      }
    }

    return ret;
  }

}) ;

SC.Locale.mixin(/** @scope SC.Locale */ {

  /**
    If YES, localization will favor the detected language instead of the
    preferred one.
  */
  useAutodetectedLanguage: NO,

  /**
    This property is set by the build tools to the current build language.
  */
  preferredLanguage: null,

  /**
    This property holds all attributes name which can be used for a layout hash
    (for an SC.View).  These are what we support inside the layoutFor() method.
  */
  layoutKeys: ['left', 'top', 'right', 'bottom', 'width', 'height',
               'minWidth', 'minHeight', 'centerX', 'centerY'],

  /**
    Invoked at the start of SproutCore's document onready handler to setup
    the currentLocale.  This will use the language properties you have set on
    the locale to make a decision.
  */
  createCurrentLocale: function() {
    // get values from String if defined for compatibility with < 1.0 build
    // tools.
    var autodetect = (String.useAutodetectedLanguage !== undefined) ? String.useAutodetectedLanguage : this.useAutodetectedLanguage;
    var preferred = (String.preferredLanguage !== undefined) ? String.preferredLanguage : this.preferredLanguage ;


    // determine the language
    var lang = ((autodetect) ? SC.browser.language : null) || preferred || SC.browser.language || 'en';
    lang = SC.Locale.normalizeLanguage(lang) ;
    // get the locale class.  If a class cannot be found, fall back to generic
    // language then to english.
    var klass = this.localeClassFor(lang) ;

    // if the detected language does not match the current language (or there
    // is none) then set it up.
    if (lang != this.currentLanguage) {
      this.currentLanguage = lang ; // save language
      this.currentLocale = klass.create(); // setup locale
    }
    return this.currentLocale ;
  },

  /**
    Finds the locale class for the names language code or creates on based on
    its most likely parent.
  */
  localeClassFor: function(lang) {
    lang = SC.Locale.normalizeLanguage(lang) ;
    var parent, klass = this.locales[lang];

    // if locale class was not found and there is a broader-based locale
    // present, create a new locale based on that.
    if (!klass && ((parent = lang.split('-')[0]) !== lang) && (klass = this.locales[parent])) {
      klass = this.locales[lang] = klass.extend() ;
    }

    // otherwise, try to create a new locale based on english.
    if (!klass) klass = this.locales[lang] = this.locales.en.extend();

    return klass;
  },

  /**
    Shorthand method to define the settings for a particular locale.
    The settings you pass here will be applied directly to the locale you
    designate.

    If you are already holding a reference to a locale definition, you can
    also use this method to operate on the receiver.

    If the locale you name does not exist yet, this method will create the
    locale for you, based on the most closely related locale or english.  For
    example, if you name the locale 'fr-CA', you will be creating a locale for
    French as it is used in Canada.  This will be based on the general French
    locale (fr), since that is more generic.  On the other hand, if you create
    a locale for mandarin (cn), it will be based on generic english (en)
    since there is no broader language code to match against.

    @param {String} localeName
    @param {Hash} options
    @returns {SC.Locale} the defined locale
  */
  define: function(localeName, options) {
    var locale ;
    if (options===undefined && (SC.typeOf(localeName) !== SC.T_STRING)) {
      locale = this; options = localeName ;
    } else locale = SC.Locale.localeClassFor(localeName) ;
    SC.mixin(locale.prototype, options) ;
    return locale ;
  },

  /**
    Gets the current options for the receiver locale.  This is useful for
    inspecting registered locales that have not been instantiated.

    @returns {Hash} options + instance methods
  */
  options: function() { return this.prototype; },

  /**
    Adds the passed hash to the locale's given property name.  Note that
    if the receiver locale inherits its hashes from its parent, then the
    property table will be cloned first.

    @param {String} name
    @param {Hash} hash
    @returns {Object} receiver
  */
  addHashes: function(name, hash) {
    // make sure the target hash exists and belongs to the locale
    var currentHash = this.prototype[name];
    if (currentHash) {
      if (!this.prototype.hasOwnProperty(currentHash)) {
        currentHash = this.prototype[name] = SC.clone(currentHash);
      }
    }
    else {
      currentHash = this.prototype[name] = {};
    }

    // add hash
    if (hash) this.prototype[name] = SC.mixin(currentHash, hash);

    return this;
  },

  /**
    Adds the passed method to the locale's given property name. 

    @param {String} name
    @param {Function} method
    @returns {Object} receiver
  */
  addMethod: function(name, method) {
    this.prototype[name] = method;
    return this;
  },

  /**
    Adds the passed hash of strings to the locale's strings table.  Note that
    if the receiver locale inherits its strings from its parent, then the
    strings table will be cloned first.

    @returns {Object} receiver
  */
  addStrings: function(stringsHash) {
    var ret = this.addHashes('strings', stringsHash);

    // Note:  We don't need the equivalent of this.hasStrings here, because we
    //        are not burdened by an older API to look for like the strings
    //        support is.
    this.prototype.hasStrings = YES;

    return ret;
  },

  /**
    Adds the passed hash of metrics to the locale's metrics table, much as
    addStrings() is used to add in strings.   Note that if the receiver locale
    inherits its metrics from its parent, then the metrics table will be cloned
    first.

    @returns {Object} receiver
  */
  addMetrics: function(metricsHash) {
    return this.addHashes('metrics', metricsHash);
  },

  _map: { english: 'en', french: 'fr', german: 'de', japanese: 'ja', jp: 'ja', spanish: 'es' },

  /**
    Normalizes the passed language into a two-character language code.
    This method allows you to specify common languages in their full english
    name (i.e. English, French, etc). and it will be treated like their two
    letter code equivalent.

    @param {String} languageCode
    @returns {String} normalized code
  */
  normalizeLanguage: function(languageCode) {
    if (!languageCode) return 'en' ;
    return SC.Locale._map[languageCode.toLowerCase()] || languageCode ;
  },

  // this method is called once during init to walk the installed locales
  // and make sure they know their own names.
  _assignLocales: function() {
    for(var key in this.locales) this.locales[key].prototype.language = key;
  },

  toString: function() {
    if (!this.prototype.language) SC.Locale._assignLocales() ;
    return "SC.Locale["+this.prototype.language+"]" ;
  },

  // make sure important properties are copied to new class.
  extend: function() {
    var ret= SC.Object.extend.apply(this, arguments) ;
    ret.addStrings= SC.Locale.addStrings;
    ret.define = SC.Locale.define ;
    ret.options = SC.Locale.options ;
    ret.toString = SC.Locale.toString ;
    return ret ;
  }

}) ;

/**
  This locales hash contains all of the locales defined by SproutCore and
  by your own application.  See the SC.Locale class definition for the
  various properties you can set on your own locales.

  @type Hash
*/
SC.Locale.locales = {
  en: SC.Locale.extend({ _deprecatedLanguageCodes: ['English'] }),
  fr: SC.Locale.extend({ _deprecatedLanguageCodes: ['French'] }),
  de: SC.Locale.extend({ _deprecatedLanguageCodes: ['German'] }),
  ja: SC.Locale.extend({ _deprecatedLanguageCodes: ['Japanese', 'jp'] }),
  es: SC.Locale.extend({ _deprecatedLanguageCodes: ['Spanish'] })
};

/**
  This special helper will store the propertyName / hashes pair you pass 
  in the locale matching the language code.  If a locale is not defined 
  from the language code you specify, then one will be created for you 
  with the english locale as the parent.

  @param {String} languageCode
  @param {String} propertyName
  @param {Hash} hashes
  @returns {void}
*/
SC.hashesForLocale = function(languageCode, propertyName, hashes) {
  var locale = SC.Locale.localeClassFor(languageCode);
  locale.addHashes(propertyName, hashes);
};

/**
  Just like SC.hashesForLocale, but for methods.

  @param {String} languageCode
  @param {String} propertyName
  @param {Function} method
  @returns {void}
*/
SC.methodForLocale = function(languageCode, propertyName, method) {
  var locale = SC.Locale.localeClassFor(languageCode);
  locale.addMethod(propertyName, method);
};

/**
  This special helper will store the strings you pass in the locale matching
  the language code.  If a locale is not defined from the language code you
  specify, then one will be created for you with the english locale as the
  parent.

  @param {String} languageCode
  @param {Hash} strings
  @returns {Object} receiver
*/
SC.stringsFor = function(languageCode, strings) {
  // get the locale, creating one if needed.
  var locale = SC.Locale.localeClassFor(languageCode);
  locale.addStrings(strings);
  return this ;
};

/**
  Just like SC.stringsFor, but for metrics.

  @param {String} languageCode
  @param {Hash} metrics
  @returns {Object} receiver
*/
SC.metricsFor = function(languageCode, metrics) {
  var locale = SC.Locale.localeClassFor(languageCode);
  locale.addMetrics(metrics);
  return this;
};

/* >>>>>>>>>> BEGIN source/system/string.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/locale');

// These are basic enhancements to the string class used throughout
// SproutCore.
/** @private */
SC.STRING_TITLEIZE_REGEXP = (/([\s|\-|\_|\n])([^\s|\-|\_|\n]?)/g);
SC.STRING_DECAMELIZE_REGEXP = (/([a-z])([A-Z])/g);
SC.STRING_DASHERIZE_REGEXP = (/[ _]/g);
SC.STRING_DASHERIZE_CACHE = {};
SC.STRING_TRIM_LEFT_REGEXP = (/^\s+/g);
SC.STRING_TRIM_RIGHT_REGEXP = (/\s+$/g);
SC.STRING_CSS_ESCAPED_REGEXP = (/(:|\.|\[|\])/g);

/**
  @namespace

  SproutCore implements a variety of enhancements to the built-in String
  object that make it easy to perform common substitutions and conversions.

  Most of the utility methods defined here mirror those found in Prototype
  1.6.

  @since SproutCore 1.0
  @lends String.prototype
*/
SC.mixin(SC.String, {

  /**
    Capitalizes a string.

    ## Examples

        capitalize('my favorite items') // 'My favorite items'
        capitalize('css-class-name')    // 'Css-class-name'
        capitalize('action_name')       // 'Action_name'
        capitalize('innerHTML')         // 'InnerHTML'

    @return {String} capitalized string
  */
  capitalize: function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
    Camelizes a string.  This will take any words separated by spaces, dashes
    or underscores and convert them into camelCase.

    ## Examples

        camelize('my favorite items') // 'myFavoriteItems'
        camelize('css-class-name')    // 'cssClassName'
        camelize('action_name')       // 'actionName'
        camelize('innerHTML')         // 'innerHTML'

    @returns {String} camelized string
  */
  camelize: function(str) {
    var ret = str.replace(SC.STRING_TITLEIZE_REGEXP, function(str, separater, character) {
      return character ? character.toUpperCase() : '';
    });

    var first = ret.charAt(0),
        lower = first.toLowerCase();

    return first !== lower ? lower + ret.slice(1) : ret;
  },

  /**
    Converts a camelized string into all lower case separated by underscores.

    ## Examples

    decamelize('my favorite items') // 'my favorite items'
    decamelize('css-class-name')    // 'css-class-name'
    decamelize('action_name')       // 'action_name'
    decamelize('innerHTML')         // 'inner_html'

    @returns {String} the decamelized string.
  */
  decamelize: function(str) {
    return str.replace(SC.STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase();
  },

  /**
    Converts a camelized string or a string with spaces or underscores into
    a string with components separated by dashes.

    ## Examples

    | *Input String* | *Output String* |
    dasherize('my favorite items') // 'my-favorite-items'
    dasherize('css-class-name')    // 'css-class-name'
    dasherize('action_name')       // 'action-name'
    dasherize('innerHTML')         // 'inner-html'

    @returns {String} the dasherized string.
  */
  dasherize: function(str) {
    var cache = SC.STRING_DASHERIZE_CACHE,
        ret   = cache[str];

    if (ret) {
      return ret;
    } else {
      ret = SC.String.decamelize(str).replace(SC.STRING_DASHERIZE_REGEXP,'-');
      cache[str] = ret;
    }

    return ret;
  },

  /**
    Escapes the given string to make it safe to use as a jQuery selector.
    jQuery will interpret '.' and ':' as class and pseudo-class indicators.

    @see http://learn.jquery.com/using-jquery-core/faq/how-do-i-select-an-element-by-an-id-that-has-characters-used-in-css-notation/

    @param {String} str the string to escape
    @returns {String} the escaped string
  */
  escapeCssIdForSelector: function (str) {
    return str.replace(SC.STRING_CSS_ESCAPED_REGEXP, '\\$1');
  },

  /**
    Localizes the string.  This will look up the receiver string as a key
    in the current Strings hash.  If the key matches, the loc'd value will be
    used.  The resulting string will also be passed through fmt() to insert
    any variables.

    @param str {String} String to localize
    @param args {Object...} optional arguments to interpolate also
    @returns {String} the localized and formatted string.
  */
  loc: function(str) {
    // NB: This could be implemented as a wrapper to locWithDefault() but
    // it would add some overhead to deal with the arguments and adds stack
    // frames, so we are keeping the implementation separate.
    if (!SC.Locale.currentLocale) { SC.Locale.createCurrentLocale(); }

    var localized = SC.Locale.currentLocale.locWithDefault(str);
    if (SC.typeOf(localized) !== SC.T_STRING) { localized = str; }

    var args = SC.$A(arguments);
    args.shift(); // remove str param
    //to extend String.prototype
    if (args.length > 0 && args[0] && args[0].isSCArray) { args = args[0]; }

    // I looked up the performance of try/catch. IE and FF do not care so
    // long as the catch never happens. Safari and Chrome are affected rather
    // severely (10x), but this is a one-time cost per loc (the code being
    // executed is likely as expensive as this try/catch cost).
    //
    // Also, .loc() is not called SO much to begin with. So, the error handling
    // that this gives us is worth it.
    try {
      return SC.String.fmt(localized, args);      
    } catch (e) {
      SC.error("Error processing string with key: " + str);
      SC.error("Localized String: " + localized);
      SC.error("Error: " + e);
    }

  },

  /**
    Returns the localized metric value for the specified key.  A metric is a
    single value intended to be used in your interface’s layout, such as
    "Button.Confirm.Width" = 100.

    If you would like to return a set of metrics for use in a layout hash, you
    may prefer to use the locLayout() method instead.

    @param str {String} key
    @returns {Number} the localized metric
  */
  locMetric: function(key) {
    var K             = SC.Locale,
        currentLocale = K.currentLocale;

    if (!currentLocale) {
      K.createCurrentLocale();
      currentLocale = K.currentLocale;
    }
    return currentLocale.locMetric(key);
  },

  /**
    Creates and returns a new hash suitable for use as an SC.View’s 'layout'
    hash.  This hash will be created by looking for localized metrics following
    a pattern based on the “base key” you specify.

    For example, if you specify "Button.Confirm", the following metrics will be
    used if they are defined:

      Button.Confirm.left
      Button.Confirm.top
      Button.Confirm.right
      Button.Confirm.bottom
      Button.Confirm.width
      Button.Confirm.height
      Button.Confirm.midWidth
      Button.Confirm.minHeight
      Button.Confirm.centerX
      Button.Confirm.centerY

    Additionally, you can optionally specify a hash which will be merged on top
    of the returned hash.  For example, if you wish to allow a button’s width
    to be configurable per-locale, but always wish for it to be centered
    vertically and horizontally, you can call:

      locLayout("Button.Confirm", {centerX:0, centerY:0})

    …so that you can combine both localized and non-localized elements in the
    returned hash.  (An exception will be thrown if there is a locale-specific
    key that matches a key specific in this hash.)


    For example, if your locale defines:

      Button.Confirm.left
      Button.Confirm.top
      Button.Confirm.right
      Button.Confirm.bottom


    …then these two code snippets will produce the same result:

      layout: {
        left:   "Button.Confirm.left".locMetric(),
        top:    "Button.Confirm.top".locMetric(),
        right:  "Button.Confirm.right".locMetric(),
        bottom: "Button.Confirm.bottom".locMetric()
      }

      layout: "Button.Confirm".locLayout()

    The former is slightly more efficient because it doesn’t have to iterate
    through the possible localized layout keys, but in virtually all situations
    you will likely wish to use the latter.

    @param str {String} key
    @param {str} (optional) additionalHash
    @param {String} (optional) additionalHash
    @returns {Number} the localized metric
  */
  locLayout: function(key, additionalHash) {
    var K             = SC.Locale,
        currentLocale = K.currentLocale;

    if (!currentLocale) {
      K.createCurrentLocale();
      currentLocale = K.currentLocale;
    }
    return currentLocale.locLayout(key, additionalHash);
  },

  /**
    Works just like loc() except that it will return the passed default
    string if a matching key is not found.

    @param {String} str the string to localize
    @param {String} def the default to return
    @param {Object...} args optional formatting arguments
    @returns {String} localized and formatted string
  */
  locWithDefault: function(str, def) {
    if (!SC.Locale.currentLocale) { SC.Locale.createCurrentLocale(); }

    var localized = SC.Locale.currentLocale.locWithDefault(str, def);
    if (SC.typeOf(localized) !== SC.T_STRING) { localized = str; }

    var args = SC.$A(arguments);
    args.shift(); // remove str param
    args.shift(); // remove def param

    return SC.String.fmt(localized, args);
  },

  /**
   Removes any extra whitespace from the edges of the string. This method is
   also aliased as strip().

   @returns {String} the trimmed string
  */
  trim: jQuery.trim,

  /**
   Removes any extra whitespace from the left edge of the string.

   @returns {String} the trimmed string
  */
  trimLeft: function (str) {
    return str.replace(SC.STRING_TRIM_LEFT_REGEXP,"");
  },

  /**
   Removes any extra whitespace from the right edge of the string.

   @returns {String} the trimmed string
  */
  trimRight: function (str) {
    return str.replace(SC.STRING_TRIM_RIGHT_REGEXP,"");
  },
  
  /**
    Mulitplies a given string. For instance if you have a string "xyz"
    and multiply it by 2 the result is "xyzxyz".
    
    @param {String} str the string to multiply
    @param {Number} value the number of times to multiply the string
    @returns {String} the mulitiplied string
  */
  mult: function(str, value) {
    if (SC.typeOf(value) !== SC.T_NUMBER || value < 1) return null;
    
    var ret = "";
    for (var i = 0; i < value; i += 1) {
      ret += str;
    }
    
    return ret;
  }
  
});


// IE doesn't support string trimming
if(String.prototype.trim) {
  SC.supplement(String.prototype,
  /** @scope String.prototype */ {

    trim: function() {
      return SC.String.trim(this, arguments);
    },

    trimLeft: function() {
      return SC.String.trimLeft(this, arguments);
    },

    trimRight: function() {
      return SC.String.trimRight(this, arguments);
    }
  });
}

// We want the version defined here, not in Runtime
SC.mixin(String.prototype,
/** @scope String.prototype */ {

  loc: function() {
    return SC.String.loc(this.toString(), SC.$A(arguments));
  },

  locMetric: function() {
    return SC.String.locMetric(this.toString());
  },

  locLayout: function(additionalHash) {
    return SC.String.locLayout(this.toString(), additionalHash);
  }

});


/* >>>>>>>>>> BEGIN source/mixins/delegate_support.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace

  Support methods for the Delegate design pattern.

  The Delegate design pattern makes it easy to delegate a portion of your
  application logic to another object.  This is most often used in views to
  delegate various application-logic decisions to controllers in order to
  avoid having to bake application-logic directly into the view itself.

  The methods provided by this mixin make it easier to implement this pattern
  but they are not required to support delegates.

  ## The Pattern

  The delegate design pattern typically means that you provide a property,
  usually ending in "delegate", that can be set to another object in the
  system.

  When events occur or logic decisions need to be made that you would prefer
  to delegate, you can call methods on the delegate if it is set.  If the
  delegate is not set, you should provide some default functionality instead.

  Note that typically delegates are not observable, hence it is not necessary
  to use get() to retrieve the value of the delegate.

  @since SproutCore 1.0

*/
SC.DelegateSupport = {

  /**
    Selects the delegate that implements the specified method name.  Pass one
    or more delegates.  The receiver is automatically included as a default.

    This can be more efficient than using invokeDelegateMethod() which has
    to marshall arguments into a delegate call.

    @param {String} methodName
    @param {Object...} delegate one or more delegate arguments
    @returns {Object} delegate or null
  */
  delegateFor: function(methodName) {
    var idx = 1,
        len = arguments.length,
        ret ;

    while(idx<len) {
      ret = arguments[idx];
      if (ret && ret[methodName] !== undefined) return ret ;
      idx++;
    }

    return (this[methodName] !== undefined) ? this : null;
  },

  /**
    Invokes the named method on the delegate that you pass.  If no delegate
    is defined or if the delegate does not implement the method, then a
    method of the same name on the receiver will be called instead.

    You can pass any arguments you want to pass onto the delegate after the
    delegate and methodName.

    @param {Object} delegate a delegate object.  May be null.
    @param {String} methodName a method name
    @param {Object...} [args...] any additional arguments

    @returns {Object} value returned by delegate
  */
  invokeDelegateMethod: function(delegate, methodName) {
    // Fast arguments access.
    // Accessing `arguments.length` is just a Number and doesn't materialize the `arguments` object, which is costly.
    var args = new Array(arguments.length - 2); //  SC.A(arguments).slice(2)
    for (var i = 0, len = args.length; i < len; i++) { args[i] = arguments[i + 2]; }

    if (!delegate || !delegate[methodName]) delegate = this ;

    var method = delegate[methodName];
    return method ? method.apply(delegate, args) : null;
  },

  /**
    Search the named delegates for the passed property.  If one is found,
    gets the property value and returns it.  If none of the passed delegates
    implement the property, search the receiver for the property as well.

    @param {String} key the property to get.
    @param {Object} delegate one or more delegate
    @returns {Object} property value or undefined
  */
  getDelegateProperty: function(key, delegate) {
    var idx = 1,
        len = arguments.length,
        ret ;

    while(idx<len) {
      ret = arguments[idx++];
      if (ret && ret[key] != undefined) {
        return ret.get ? ret.get(key) : ret[key] ;
      }
    }

    return (this[key] != undefined) ? this.get(key) : undefined ;
  }

};

/* >>>>>>>>>> BEGIN source/views/view/base.js */
sc_require('mixins/delegate_support');

/** @class */
SC.CoreView = SC.Responder.extend(SC.DelegateSupport);

/* >>>>>>>>>> BEGIN source/views/view/statechart.js */
sc_require("views/view/base");

// When in debug mode, core developers can log the view state.

SC.LOG_VIEW_STATES = false;
SC.LOG_VIEW_STATES_STYLE = {
  0x0200: 'color: #67b7db; font-style: italic;', // UNRENDERED
  0x0300: 'color: #67b7db; font-style: italic;', // UNATTACHED
  0x0380: 'color: #67b7db; font-style: italic;', // ATTACHED_PARTIAL
  0x03C0: 'color: #23abf5; font-style: italic;', // ATTACHED_SHOWN
  0x03C4: 'color: #1fe7a8; font-style: italic;', // ATTACHED_SHOWN_ANIMATING
  0x03A0: 'color: #67b7db; font-style: italic;', // ATTACHED_HIDDEN
  0x03A1: 'color: #67b7db; font-style: italic;', // ATTACHED_HIDDEN_BY_PARENT
  0x03C1: 'color: #b800db; font-style: italic;', // ATTACHED_BUILDING_IN
  0x0381: 'color: #b800db; font-style: italic;', // ATTACHED_BUILDING_OUT
  0x0382: 'color: #b800db; font-style: italic;', // ATTACHED_BUILDING_OUT_BY_PARENT
  0x03C2: 'color: #b800db; font-style: italic;', // ATTACHED_SHOWING
  0x03C3: 'color: #b800db; font-style: italic;'  // ATTACHED_HIDING
};



SC.CoreView.mixin(
  /** @scope SC.CoreView */ {

  // State bit masks

  // Logically always present, so not necessary, but here for logical ordering.
  // IS_CREATED: 0x0200, // 10 0000 0000, 512

  /**
    The view has been rendered.

    Use a logical AND (single `&`) to test rendered status.  For example,

        view.get('viewState') & SC.CoreView.IS_RENDERED

    @static
    @constant
  */
  IS_RENDERED: 0x0100, // 01 0000 0000, 256

  /**
    The view has been attached.

    Use a logical AND (single `&`) to test attached status.  For example,

        view.get('viewState') & SC.CoreView.IS_ATTACHED

    @static
    @constant
  */
  IS_ATTACHED: 0x0080, // 00 1000 0000, 128

  /**
    The view is visible in the display.

    Use a logical AND (single `&`) to test shown status.  For example,

        view.get('viewState') & SC.CoreView.IS_SHOWN

    @static
    @constant
  */
  IS_SHOWN: 0x0040, // 00 0100 0000, 64

  /**
    The view is invisible in the display.

    Use a logical AND (single `&`) to test hidden status.  For example,

        view.get('viewState') & SC.CoreView.IS_HIDDEN

    @static
    @constant
  */
  IS_HIDDEN: 0x0020, // 00 0010 0000, 32

  // Main states

  /**
    The view has been created, but has not been rendered or attached.

    @static
    @constant
  */
  UNRENDERED: 0x0200, // 10 0000 0000, 512 (IS_CREATED)

  /**
    The view has been created and rendered, but has not been attached
    (i.e. appended to the document).

    @static
    @constant
  */
  UNATTACHED: 0x0300, // 11 0000 0000, 768 (IS_CREATED + IS_RENDERED)

  /**
    The view has been created and rendered and attached to a parent, but an ancestor is not
    attached.

    @static
    @constant
  */
  ATTACHED_PARTIAL: 0x0380, // 11 1000 0000, 896 (IS_CREATED + IS_RENDERED + IS_ATTACHED)

  /**
    The view has been created, rendered and attached, but is not visible in the
    display.

    Test with & SC.CoreView.IS_HIDDEN
    @static
    @constant
  */
  ATTACHED_HIDDEN: 0x03A0, // 11 1010 0000, 928 (IS_CREATED + IS_RENDERED + IS_ATTACHED + IS_HIDDEN)

  /**
    The view has been created, rendered and attached and is visible in the
    display.

    @static
    @constant
  */
  ATTACHED_SHOWN: 0x03C0, // 11 1100 0000, 960 (IS_CREATED + IS_RENDERED + IS_ATTACHED + IS_SHOWN)

  // Minor states

  /**
    The view has been created, rendered and attached, but is not visible in the
    display due to being hidden by a parent view.

    @static
    @constant
  */
  ATTACHED_HIDDEN_BY_PARENT: 0x03A1, // 929  (IS_CREATED + IS_RENDERED + IS_ATTACHED + IS_HIDDEN +)

  /**
    The view has been created, rendered and attached and is visible in the
    display.  It is currently transitioning according to the transitionIn
    property before being fully shown (i.e ATTACHED_SHOWN).

    @static
    @constant
  */
  ATTACHED_BUILDING_IN: 0x03C1, // 961 (IS_CREATED + IS_RENDERED + IS_ATTACHED + IS_SHOWN +)

  /**
    The view has been created, rendered and attached.  It is currently
    transitioning according to the transitionOut property before being
    detached (i.e. removed from the document).

    @static
    @constant
  */
  ATTACHED_BUILDING_OUT: 0x03C4, // 964 (IS_CREATED + IS_RENDERED + IS_ATTACHED + IS_SHOWN +)

  /**
    The view has been created, rendered and attached.  It is currently
    transitioning according to the transitionOut property before being
    detached (i.e. removed from the document) because a parent view is
    being detached.

    @static
    @constant
  */
  ATTACHED_BUILDING_OUT_BY_PARENT: 0x03C5, // 965 (IS_CREATED + IS_RENDERED + IS_ATTACHED + IS_SHOWN +)

  /**
    The view has been created, rendered and attached and is visible in the
    display.  It is currently transitioning according to the transitionShow
    property before being fully shown (i.e ATTACHED_SHOWN).

    @static
    @constant
  */
  ATTACHED_SHOWING: 0x03C2, // 962 (IS_CREATED + IS_RENDERED + IS_ATTACHED + IS_SHOWN +)

  /**
    The view has been created, rendered and attached.  It is currently
    transitioning according to the transitionHide property before being fully
    hidden.

    @static
    @constant
  */
  ATTACHED_HIDING: 0x03C3, // 963 (IS_CREATED + IS_RENDERED + IS_ATTACHED + IS_SHOWN +)

  /**
    The view has been created, rendered and attached, is visible in the
    display and is being animated via a call to `animate()`.

    @static
    @constant
  */
  ATTACHED_SHOWN_ANIMATING: 0x03C6 // 966 (IS_CREATED + IS_RENDERED + IS_ATTACHED + IS_SHOWN +)

});


SC.CoreView.reopen(
  /** @scope SC.CoreView.prototype */ {

  
  /* BEGIN DEBUG ONLY PROPERTIES AND METHODS */

  /** @private Creates string representation of view, with view state. */
  toString: function () {
    return "%@ (%@)".fmt(arguments.callee.base.apply(this,arguments), this._viewStateString());
  },

  /** @private Creates string representation of view state.  */
  _viewStateString: function () {
    var ret = [], state = this.get('viewState');

    for (var prop in SC.CoreView) {
      if (prop.match(/[A-Z_]$/) && SC.CoreView[prop] === state) {
        ret.push(prop);
      }
    }

    return ret.join(" ");
  },

  /* END DEBUG ONLY PROPERTIES AND METHODS */
  

  // ------------------------------------------------------------------------
  // Properties
  //

  /* @private Internal variable used to store the number of children building out while we wait to be detached. */
  _sc_buildOutCount: null,

  /* @private Internal variable used to track the original view being detached that we are delaying so that we can build out. */
  _owningView: null,

  /* @private Internal variable used to store the original layout before running an automatic transition. */
  _preTransitionLayout: null,

  /* @private Internal variable used to store the original frame before running an automatic transition. */
  _preTransitionFrame: null,

  /* @private Internal variable used to cache layout properties which must be reset after the transition. */
  _transitionLayoutCache: null,

  /**
    The current state of the view as managed by its internal statechart.

    In order to optimize the behavior of SC.View, such as only observing display
    properties when in a rendered state or queueing updates when in a non-shown
    state, SC.View includes a simple internal statechart that maintains the
    current state of the view.

    Views have several possible states:

    * SC.CoreView.UNRENDERED
    * SC.CoreView.UNATTACHED
    * SC.CoreView.ATTACHED_PARTIAL
    * SC.CoreView.ATTACHED_SHOWING
    * SC.CoreView.ATTACHED_SHOWN
    * SC.CoreView.ATTACHED_SHOWN_ANIMATING
    * SC.CoreView.ATTACHED_HIDING
    * SC.CoreView.ATTACHED_HIDDEN
    * SC.CoreView.ATTACHED_HIDDEN_BY_PARENT
    * SC.CoreView.ATTACHED_BUILDING_IN
    * SC.CoreView.ATTACHED_BUILDING_OUT
    * SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT

    @type String
    @default SC.CoreView.UNRENDERED
    @readonly
  */
  viewState: SC.CoreView.UNRENDERED,

  /**
    Whether the view's layer is attached to a parent or not.

    When the view's layer is attached to a parent view, this value will be true.

    @field
    @type Boolean
    @default false
    @readonly
  */
  isAttached: function () {
    return (this.get('viewState') & SC.CoreView.IS_ATTACHED) > 0;
  }.property('viewState').cacheable(),

  /** @private
    Whether the view's layer exists or not.

    When the view's layer is created, this value will be true.  This includes
    the unattached view state and all of the attached states.

    @field
    @type Boolean
    @default false
    @readonly
  */
  // NOTE: This property is of little value, so it's private in case we decide to toss it.
  _isRendered: function () {
    return (this.get('viewState') & SC.CoreView.IS_RENDERED) > 0;
  }.property('viewState').cacheable(),

  /**
    Whether the view is fully or becoming shown or not.

    When the view is shown in the window, this value will be true.  Note that
    if the view is transitioning out or hiding, this value will still be true.

    This is not necessarily the same as `isVisible` although the two properties
    are related.  For instance, it's possible to set `isVisible` to `true` and
    still have `isVisibleInWindow` be `false` or vice versa due to the
    `isVisibleInWindow` state of the view's parent view.  Therefore,
    `isVisibleInWindow` represents the actual visible state of the view and
    `isVisible` is used to attempt to alter that state.

    @field
    @type Boolean
    @default false
    @readonly
  */
  isVisibleInWindow: function () {
    return( this.get('viewState') & SC.CoreView.IS_SHOWN) > 0;
  }.property('viewState').cacheable(),


  // ------------------------------------------------------------------------
  // Actions (Locked down to the proper state)
  //

  /** @private Adopt this view action. */
  _doAdopt: function (parentView, beforeView) {
    var curParentView = this.get('parentView'),
      handled = true,
      state = this.get('viewState');

    
    if (SC.LOG_VIEW_STATES || this.SC_LOG_VIEW_STATE) {
      SC.Logger.log('%c%@ — _doAdopt(%@, %@): curParentView: %@'.fmt(this, parentView, beforeView, curParentView), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
    }
    

    if (curParentView && curParentView !== parentView) {
      
      // This should be avoided, because using the same view instance without explicitly orphaning it first is a dangerous practice.
      SC.warn("Developer Warning: You should not adopt the view, %@, to a new parent without removing it from its old parent first.".fmt(this));
      

      // Force orphaning the view.
      this._doOrphan();
      curParentView = false;
    }

    // You can adopt childViews that have you set as their parent (i.e. created
    // with createChildView()), but have not yet been fully adopted.
    var siblings = parentView.get('childViews');
    if (!curParentView || siblings.indexOf(this) < 0) {
      var idx,
        parentViewState = parentView.get('viewState'),
        parentNode, nextNode, nextView;

      // Notify that the child view will be added to the parent view.
      if (parentView.willAddChild) { parentView.willAddChild(this, beforeView); }
      if (this.willAddToParent) { this.willAddToParent(parentView, beforeView); }

      // Set the parentView.
      this.set('parentView', parentView);

      // Add to the new parent's childViews array.
      if (siblings.needsClone) { parentView.set('childViews', []); }
      idx = (beforeView) ? siblings.indexOf(beforeView) : siblings.length;
      if (idx < 0) { idx = siblings.length; }
      siblings.insertAt(idx, this);

      // Pass the current designMode to the view (and its children).
      this.updateDesignMode(this.get('designMode'), parentView.get('designMode'));

      // Notify adopted.
      this._adopted(beforeView);

      // When a view is adopted, it should go to the same state as its new parent.
      switch (state) {
      case SC.CoreView.UNRENDERED:
        switch (parentViewState) {
        case SC.CoreView.UNRENDERED:
          break;
        default:
          // Bypass the unrendered state for adopted views.
          this._doRender();
        }
        break;
      case SC.CoreView.UNATTACHED:
        switch (parentViewState) {
        case SC.CoreView.UNRENDERED:
          // Bring the child view down to the state of the parent.
          this._doDestroyLayer();
          break;
        default:
          parentNode = parentView.get('containerLayer');
          nextView = siblings.objectAt(siblings.indexOf(this) + 1);
          nextNode = (nextView) ? nextView.get('layer') : null;

          this._doAttach(parentNode, nextNode);
        }
        break;
      default: // ATTACHED_X
        switch (parentViewState) {
        case SC.CoreView.UNRENDERED:
          // Bring the child view down to the state of the parent.
          this._doDestroyLayer();
          break;
        default:
          parentNode = parentView.get('containerLayer');
          nextView = siblings.objectAt(siblings.indexOf(this) + 1);
          nextNode = (nextView) ? nextView.get('layer') : null;

          this._doAttach(parentNode, nextNode);
        }
      }

    // Adopting a view that is building out.
    } else if (state === SC.CoreView.ATTACHED_BUILDING_OUT) {
      this._doAttach();

    // Can't do anything.
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Attach this view action. */
  _doAttach: function (parentNode, nextNode) {
    var state = this.get('viewState'),
      transitionIn = this.get('transitionIn'),
      parentView,
      isHandled = false;

    
    if (SC.LOG_VIEW_STATES || this.SC_LOG_VIEW_STATE) {
      SC.Logger.log('%c%@ — _doAttach(%@, %@)'.fmt(this, parentNode, nextNode), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
    }
    

    switch (state) {

    // Normal case: view is not attached and is being attached.
    case SC.CoreView.UNATTACHED:
      var node = this.get('layer');

      this._executeQueuedUpdates();

      // Attach to parentNode.
      // IE doesn't support insertBefore(blah, undefined) in version IE9.
      parentNode.insertBefore(node, nextNode || null);

      parentView = this.get('parentView');
      if (!parentView || (parentView && parentView.get('isAttached'))) {
        // Attach the view.
        this._executeDoAttach();

        // If there is a transition in, run it.
        if (transitionIn) {
          this._transitionIn(false);
        }
      } else {
        // Attaching an unattached view to an unattached view, simply moves it to unattached by
        // parent state. Don't do any notifications.
        this._gotoAttachedPartialState();
      }

      isHandled = true;
      break;

    // Special case: view switched from building out to building in.
    case SC.CoreView.ATTACHED_BUILDING_OUT:
      // If already building out, we need to cancel and possibly build in. Top-down so that any
      // children that are hidden or building out on their own allow us to bail out early.
      this._callOnChildViews('_parentDidCancelBuildOut');

      // Remove the shared building out count if it exists.
      this._sc_buildOutCount = null;

      // Note: We can be in ATTACHED_BUILDING_OUT state without a transition out while we wait for child views.
      if (this.get('transitionOut')) {
        // Cancel the building out transition (in place if we are going to switch to transitioning back in).
        // this.cancelAnimation(transitionIn ? SC.LayoutState.CURRENT : undefined);
        this.cancelAnimation();

        
        if (SC.LOG_VIEW_STATES || this.SC_LOG_VIEW_STATE) {
          SC.Logger.log('%c       — cancelling build out outright'.fmt(this), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
        }
        

        // Set the proper state.
        this._gotoAttachedShownState();

        if (transitionIn) {
          this._transitionIn(true);
        }

      // Waiting for child view transition outs.
      } else {

        // Set the proper state.
        this._gotoAttachedShownState();
      }

      isHandled = true;
      break;

    // Invalid states that have no effect.
    case SC.CoreView.ATTACHED_HIDING:
    case SC.CoreView.ATTACHED_HIDDEN:
    case SC.CoreView.ATTACHED_HIDDEN_BY_PARENT:
    case SC.CoreView.ATTACHED_BUILDING_IN:
    case SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT:
    case SC.CoreView.ATTACHED_SHOWING:
    case SC.CoreView.UNRENDERED:
      break;

    // Improper states that have no effect, but should be discouraged.
    case SC.CoreView.ATTACHED_SHOWN:
    case SC.CoreView.ATTACHED_SHOWN_ANIMATING:
      
      if (parentNode !== this.getPath('parentView.layer')) {
        // This should be avoided, because moving the view layer without explicitly removing it first is a dangerous practice.
        SC.warn("Developer Warning: You can not attach the view, %@, to a new node without properly detaching it first.".fmt(this));
      }
      
      break;
    case SC.CoreView.ATTACHED_PARTIAL:
      
      SC.warn("Developer Warning: You can not attach the child view, %@, directly.".fmt(this));
      
      break;
    }

    return isHandled;
  },

  /** @private Destroy the layer of this view action. */
  _doDestroyLayer: function () {
    var state = this.get('viewState'),
      isHandled = false;

    
    if (SC.LOG_VIEW_STATES || this.SC_LOG_VIEW_STATE) {
      SC.Logger.log('%c%@ — _doDestroyLayer()'.fmt(this), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
    }
    

    switch (state) {

    // Invalid states that have no effect.
    case SC.CoreView.UNRENDERED:
    case SC.CoreView.ATTACHED_HIDING:
    case SC.CoreView.ATTACHED_HIDDEN:
    case SC.CoreView.ATTACHED_HIDDEN_BY_PARENT:
    case SC.CoreView.ATTACHED_BUILDING_IN:
    case SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT:
    case SC.CoreView.ATTACHED_SHOWING:
    case SC.CoreView.ATTACHED_SHOWN:
    case SC.CoreView.ATTACHED_SHOWN_ANIMATING:
    case SC.CoreView.ATTACHED_BUILDING_OUT:
    case SC.CoreView.ATTACHED_PARTIAL:
      break;

    // Normal case (SC.CoreView.UNATTACHED): view is rendered and its layer is being destroyed.
    default:
      // Notify that the layer will be destroyed. Bottom-up so that each child is in the proper
      // state before its parent potentially alters its state. For example, a parent could modify
      // children in `willDestroyLayer`.
      this._callOnChildViews('_teardownLayer', false);
      this._teardownLayer();

      isHandled = true;
    }

    return isHandled;
  },

  /** @private Detach this view action. */
  _doDetach: function (immediately) {
    var state = this.get('viewState'),
      transitionOut = this.get('transitionOut'),
      shouldHandle = true;

    
    if (SC.LOG_VIEW_STATES || this.SC_LOG_VIEW_STATE) {
      SC.Logger.log('%c%@ — _doDetach()'.fmt(this), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
    }
    

    // Handle all 12 possible view states.
    switch (state) {

    // Scenario: The view is shown.
    // Result: Allow the view and/or any of its child views to build out or else execute the detach.
    case SC.CoreView.ATTACHED_SHOWN:
      this._executeDoBuildOut(immediately);

      break;

    // Scenario: The view is attached but isn't visible (possibly because an ancestor is detached or hidden).
    // Result: Detach the view immediately.
    case SC.CoreView.ATTACHED_PARTIAL:
    case SC.CoreView.ATTACHED_HIDDEN:
    case SC.CoreView.ATTACHED_HIDDEN_BY_PARENT:
      // Detach immediately.
      this._executeDoDetach();

      break;

    // Scenario: The view is in the middle of a hiding transition.
    // Result: Cancel the animation and then run as normal.
    case SC.CoreView.ATTACHED_HIDING:
      // Cancel the animation (in the future we will be able to let it run out while building out).
      this.cancelAnimation();

      // Set the proper state.
      this._gotoAttachedHiddenState();

      // Detach immediately.
      this._executeDoDetach();

      break;

    // Scenario: The view is in the middle of an animation or showing transition.
    // Result: Cancel the animation and then run as normal.
    case SC.CoreView.ATTACHED_SHOWING:
    case SC.CoreView.ATTACHED_SHOWN_ANIMATING: // TODO: We need concurrent states!
      // Cancel the animation (in the future we will be able to let it run out while building out).
      this.cancelAnimation();

      // Set the proper state.
      this._gotoAttachedShownState();

      this._executeDoBuildOut(immediately);

      break;

    // Scenario: The view is building in.
    // Result: If it has a build out transition, swap to it. Otherwise, cancel.
    case SC.CoreView.ATTACHED_BUILDING_IN:
      // Cancel the build in transition.
      // if (transitionOut) {
      //   
      //   if (SC.LOG_VIEW_STATES || this.SC_LOG_VIEW_STATE) {
      //     SC.Logger.log('%c       — cancelling build in in place'.fmt(this), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
      //   }
      //   

      //   this.cancelAnimation(SC.LayoutState.CURRENT);
      // } else {
        
        if (SC.LOG_VIEW_STATES || this.SC_LOG_VIEW_STATE) {
          SC.Logger.log('%c       — cancelling build in outright'.fmt(this), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
        }
        

        this.cancelAnimation();
      // }

      // Set the proper state.
      this._gotoAttachedShownState();

      // Build out in place.
      this._executeDoBuildOut(immediately, true);
      break;

    // Scenario: View is already building out because of an ancestor.
    // Result: Stop the transition so that it can continue in place on its own.
    case SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT:
      // Cancel the build out transition.
      this.cancelAnimation(SC.LayoutState.CURRENT); // Fires didTransitionOut callback (necessary to clean up parent view build out wait)

      // Set the proper state. (the view should only have been able to get to ATTACHED_BUILDING_OUT_BY_PARENT from ATTACHED_SHOWN).
      this._gotoAttachedShownState();

      // TODO: Grab the build out count for all child views of this view. What a nightmare for an edge case!

      // Build out in place.
      this._executeDoBuildOut(immediately, true);

      break;

    // Scenario: View is already building out.
    // Result: Stop if forced to.
    case SC.CoreView.ATTACHED_BUILDING_OUT:
      // If immediately is passed, cancel the build out prematurely.
      if (immediately) {
        // Note: *will* detach notice already sent.
        this.cancelAnimation(); // Fires didTransitionOut callback (state changes to UNATTACHED/notifications sent).

        // Detach immediately.
        this._executeDoDetach();
      }

      break;

    // Invalid states.
    default:
      
      // Add some debugging only warnings for if the view statechart code is being improperly used.
      // Telling the view to detach when it is already detached isn't correct: UNRENDERED, UNATTACHED
      SC.warn("Core Developer Warning: Found invalid state for view, %@, in _doDetach".fmt(this));
      

      shouldHandle = false;
    }

    return shouldHandle;
  },

  /** @private Hide this view action. */
  _doHide: function () {
    var state = this.get('viewState'),
      transitionHide = this.get('transitionHide'),
      shouldHandle = true;

    
    if (SC.LOG_VIEW_STATES || this.SC_LOG_VIEW_STATE) {
      SC.Logger.log('%c%@ — _doHide()'.fmt(this), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
    }
    

    // Handle all 12 possible view states.
    switch (state) {

    // Scenario: The view is shown.
    // Result: Notify that the view will hide and then either hide or run hide transition.
    case SC.CoreView.ATTACHED_SHOWN:
    case SC.CoreView.ATTACHED_BUILDING_IN:
    case SC.CoreView.ATTACHED_BUILDING_OUT:
    case SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT:
    case SC.CoreView.ATTACHED_SHOWN_ANIMATING:
    // ATTACHED_HIDDEN_BY_PARENT, ATTACHED_BUILDING_IN, ATTACHED_BUILDING_OUT_BY_PARENT, ATTACHED_BUILDING_OUT

      // TODO: How do we check for conflicts in the hide transition against other concurrent transitions/animations?
      if (transitionHide) {
        // this.invokeNext(function () {
        this._transitionHide();
        // });
      } else {
        // Hide the view.
        this._executeDoHide();
      }

      break;

    // Scenario: The view was showing at the time it was told to hide.
    // Result: Cancel the animation.
    case SC.CoreView.ATTACHED_SHOWING:
      // Cancel the showing transition.
      if (transitionHide) {
        this.cancelAnimation(SC.LayoutState.CURRENT);
      } else {
        this.cancelAnimation();
      }

      // Set the proper state.
      this._gotoAttachedShownState();

      // Hide the view.
      if (transitionHide) {
        this._transitionHide(true);
      } else {
        this._executeDoHide();
      }

      break;

    // Scenario: The view is rendered but is not attached.
    // Result: Queue an update to the visibility style.
    case SC.CoreView.UNATTACHED:
    case SC.CoreView.ATTACHED_PARTIAL:
      // Queue the visibility update for the next time we display.
      this._visibleStyleNeedsUpdate = true;

      break;

    // Scenario: The view is not even rendered.
    // Result: Nothing is required.
    case SC.CoreView.UNRENDERED:
      shouldHandle = false;
      break;

    case SC.CoreView.ATTACHED_HIDDEN: // FAST PATH!
    case SC.CoreView.ATTACHED_HIDING: // FAST PATH!
      return false;
    case SC.CoreView.ATTACHED_HIDDEN_BY_PARENT: // FAST PATH!
      // Note that visibility update is NOT conditional for this state.
      this._doUpdateVisibleStyle();

      // Update states after *will* and before *did* notifications!
      this._gotoAttachedHiddenState();

      return true;

    // Invalid states.
    default:
      
      // Add some debugging only warnings for if the view statechart code is being improperly used.
      // Telling the view to hide when it is already hidden isn't correct:
      //
      SC.warn("Core Developer Warning: Found invalid state for view, %@, in _doHide".fmt(this));
      

      shouldHandle = false;
    }

    return shouldHandle;
  },

  /** @private Orphan this view action. */
  _doOrphan: function () {
    var parentView = this.get('parentView'),
      handled = true;

    
    if (SC.LOG_VIEW_STATES || this.SC_LOG_VIEW_STATE) {
      SC.Logger.log('%c%@ — _doOrphan()'.fmt(this), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
    }
    

    if (parentView) {
      var childViews = parentView.get('childViews'),
        idx = childViews.indexOf(this);

      // Completely remove the view from its parent.
      this.set('parentView', null);

      // Remove view from old parent's childViews array.
      if (idx >= 0) { childViews.removeAt(idx); }

      // Notify orphaned.
      this._orphaned(parentView);
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Render this view action. */
  _doRender: function () {
    var state = this.get('viewState'),
        shouldHandle = true;

    
    if (SC.LOG_VIEW_STATES || this.SC_LOG_VIEW_STATE) {
      SC.Logger.log('%c%@ — _doRender()'.fmt(this), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
    }
    

    // Handle all 12 possible view states.
    switch (state) {

    // Scenario: The view is not rendered.
    // Result: Render the layer and then notify.
    case SC.CoreView.UNRENDERED:
      // Render the view.
      this._executeDoRender();

      // Bypass the unattached state for adopted views.
      var parentView = this.get('parentView');
      if (parentView && parentView.get('_isRendered')) {
        var parentNode = parentView.get('containerLayer'),
          siblings = parentView.get('childViews'),
          nextView = siblings.objectAt(siblings.indexOf(this) + 1),
          nextNode = (nextView) ? nextView.get('layer') : null;

        // Attach to parentNode
        // IE doesn't support insertBefore(blah, undefined) in version IE9.
        // parentNode.insertBefore(node, nextNode || null);
        this._doAttach(parentNode, nextNode);
      }

      break;

    // Invalid states.
    default:
      
      // Add some debugging only warnings for if the view statechart code is being improperly used.
      // All other states should be impossible if parent was UNATTACHED:
      // ATTACHED_SHOWING, ATTACHED_SHOWN, ATTACHED_SHOWN_ANIMATING, ATTACHED_HIDING, ATTACHED_HIDDEN, ATTACHED_HIDDEN_BY_PARENT, ATTACHED_BUILDING_IN, ATTACHED_BUILDING_OUT, ATTACHED_BUILDING_OUT_BY_PARENT, UNATTACHED, ATTACHED_PARTIAL
      SC.warn("Core Developer Warning: Found invalid state for view, %@, in _doRender".fmt(this));
      
      shouldHandle = false;
    }

    return shouldHandle;
  },

  /** @private Show this view action. */
  _doShow: function () {
    var state = this.get('viewState'),
        transitionShow = this.get('transitionShow'),
        shouldHandle = true;

    
    if (SC.LOG_VIEW_STATES || this.SC_LOG_VIEW_STATE) {
      SC.Logger.log('%c%@ — _doShow()'.fmt(this), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
    }
    

    // Handle all 12 possible view states.
    switch (state) {

    // Scenario: The view is hidden.
    // Result: Depends on whether the parent view is shown or hidden by an ancestor.
    case SC.CoreView.ATTACHED_HIDDEN:
      var parentView = this.get('parentView'),
          // Views without a parent are not limited by a parent's current state.
          isParentShown = parentView ? parentView.get('viewState') & SC.CoreView.IS_SHOWN : true;

      // Scenario: The view is hidden and its ancestors are all visible.
      // Result: Notify that the view and relevant child views will be shown.
      if (isParentShown) {
        var notifyStack = []; // Only those views that changed state get added to the stack.

        // Run any queued updates.
        this._executeQueuedUpdates();

        // The children are updated top-down so that hidden or unattached children allow us to bail out early.
        this._callOnChildViews('_parentWillShowInDocument', true, notifyStack);

        // Notify for each child (that will change state) in reverse so that each child is in the proper
        // state before its parent potentially alters its state. For example, a parent could modify
        // children in `willShowInDocument`.
        for (var i = notifyStack.length - 1; i >= 0; i--) {
          var childView = notifyStack[i];

          childView._notifyWillShowInDocument();
        }
        this._notifyWillShowInDocument();

        // Show the view.
        this._executeDoShow();
        if (transitionShow) {
          this._transitionShow(false);
        }

      // Scenario: The view is hidden, but one of its ancestors is also hidden.
      // Result: Track that the visible style needs update and go to hidden by parent state.
      } else {
        // Queue the visibility update for the next time we display.
        this._visibleStyleNeedsUpdate = true;

        // Set the proper state.
        this._gotoAttachedHiddenByParentState();
      }

      break;

    // Scenario: The view was hiding at the time it was told to show.
    // Result: Revert or reverse the hiding transition.
    case SC.CoreView.ATTACHED_HIDING:
      // Cancel the hiding transition (in place if we are going to switch to transitioning back in).
      this.cancelAnimation(transitionShow ? SC.LayoutState.CURRENT : SC.LayoutState.START);

      // Set the proper state.
      this._gotoAttachedShownState();

      if (transitionShow) {
        this._transitionShow(true);
      }

      break;

    // Scenario: The view is rendered but is not attached.
    // Result: Queue an update to the visibility style.
    case SC.CoreView.UNATTACHED:
    case SC.CoreView.ATTACHED_PARTIAL:
      // Queue the visibility update for the next time we display.
      this._visibleStyleNeedsUpdate = true;

      break;

    // Scenario: The view is not even rendered.
    // Result: Nothing is required.
    case SC.CoreView.UNRENDERED:
      shouldHandle = false;
      break;

    // Invalid states.
    default:
      
      // Add some debugging only warnings for if the view statechart code is being improperly used.
      // Telling the view to show when it is already visible isn't correct:
      // ATTACHED_SHOWN, ATTACHED_SHOWN_ANIMATING, ATTACHED_SHOWING, ATTACHED_HIDDEN_BY_PARENT, ATTACHED_BUILDING_IN, ATTACHED_BUILDING_OUT_BY_PARENT, ATTACHED_BUILDING_OUT
      SC.warn("Core Developer Warning: Found invalid state for view, %@, in _doShow".fmt(this));
      

      shouldHandle = false;
    }

    return shouldHandle;
  },

  /** @private Update this view's contents action. */
  _doUpdateContent: function (force) {
    var isVisibleInWindow = this.get('isVisibleInWindow'),
      handled = true;

    
    if (SC.LOG_VIEW_STATES || this.SC_LOG_VIEW_STATE) {
      SC.Logger.log('%c%@ — _doUpdateContent(%@)'.fmt(this, force), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
    }
    

    if (this.get('_isRendered')) {
      if (isVisibleInWindow || force) {
        // Only in the visible states do we allow updates without being forced.
        this._executeDoUpdateContent();
      } else {
        // Otherwise mark the view as needing an update when we enter a shown state again.
        this._contentNeedsUpdate = true;
      }
    } else {
      handled = false;
    }

    return handled;
  },

  // ------------------------------------------------------------------------
  // Events
  //

  /**
    This method is called by transition plugins when the incoming or showing
    transition completes.  You should only use this method if implementing a
    custom transition plugin.

    @param {SC.ViewTransitionProtocol} transition The transition plugin used.
    @param {Object} options The original options used.  One of transitionShowOptions or transitionInOptions.
  */
  didTransitionIn: function () {
    var state = this.get('viewState');

    
    if (SC.LOG_VIEW_STATES || this.SC_LOG_VIEW_STATE) {
      SC.Logger.log('%c%@ — didTransitionIn()'.fmt(this), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
    }
    

    if (state === SC.CoreView.ATTACHED_SHOWING ||
      state === SC.CoreView.ATTACHED_BUILDING_IN) {
      this._teardownTransition();

      // Set the proper state.
      this._gotoAttachedShownState();
    }
  },

  /**
    This method is called by transition plugins when the outgoing or hiding
    transition completes.  You should only use this method if implementing a
    custom transition plugin.

    @param {SC.ViewTransitionProtocol} transition The transition plugin used.
    @param {Object} options The original options used.  One of transitionHideOptions or transitionOutOptions.
  */
  didTransitionOut: function () {
    var state = this.get('viewState');

    
    if (SC.LOG_VIEW_STATES || this.SC_LOG_VIEW_STATE) {
      SC.Logger.log('%c%@ — didTransitionOut()'.fmt(this), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
    }
    

    if (state === SC.CoreView.ATTACHED_BUILDING_OUT) {
      this._teardownTransition();

      this._executeDoDetach();
    } else if (state === SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT) {
      var owningView = this._owningView;
      // We can't clean up the transition until the parent is done.  For
      // example, a fast child build out inside of a slow parent build out.
      owningView._sc_buildOutCount--;

      if (owningView._sc_buildOutCount === 0) {
        owningView._executeDoDetach();

        // Clean up.
        this._owningView = null;
      }
    } else if (state === SC.CoreView.ATTACHED_HIDING) {
      this._teardownTransition();

      // Hide immediately.
      this._executeDoHide();
    }
  },

  /** @private The 'adopted' event. */
  _adopted: function (beforeView) {
    // Notify all of our descendents that our parent has changed. They will update their `pane` value
    // for one. Bottom-up in case a parent view modifies children when its pane changes for any
    // reason.
    this._callOnChildViews('_ancestorDidChangeParent', false);

    // Notify that the child view has been added to the parent view.
    var parentView = this.get('parentView');
    if (this.didAddToParent) { this.didAddToParent(parentView, beforeView); }
    if (parentView.didAddChild) { parentView.didAddChild(this, beforeView); }
  },

  /** @private The 'orphaned' event. */
  _orphaned: function (oldParentView) {
    // It's not necessary to send notice to destroyed views.
    if (!this.isDestroyed) {
      // Notify all of our descendents that our parent has changed. They will update their `pane` value
      // for one. Bottom-up in case a parent view modifies children when its pane changes for any
      // reason.
      this._callOnChildViews('_ancestorDidChangeParent', false);

      if (oldParentView.didRemoveChild) { oldParentView.didRemoveChild(this); }
      if (this.didRemoveFromParent) { this.didRemoveFromParent(oldParentView); }
    }
  },

  // ------------------------------------------------------------------------
  // States
  //

  /** @private */
  _gotoAttachedBuildingInState: function () {
    this.set('viewState', SC.CoreView.ATTACHED_BUILDING_IN);
  },

  /** @private */
  _gotoAttachedBuildingOutState: function () {
    this.set('viewState', SC.CoreView.ATTACHED_BUILDING_OUT);
  },

  /** @private */
  _gotoAttachedBuildingOutByParentState: function () {
    this.set('viewState', SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT);
  },

  /** @private */
  _gotoAttachedHiddenState: function () {
    this.set('viewState', SC.CoreView.ATTACHED_HIDDEN);
  },

  /** @private */
  _gotoAttachedHiddenByParentState: function () {
    this.set('viewState', SC.CoreView.ATTACHED_HIDDEN_BY_PARENT);
  },

  /** @private */
  _gotoAttachedHidingState: function () {
    this.set('viewState', SC.CoreView.ATTACHED_HIDING);
  },

  /** @private */
  _gotoAttachedShowingState: function () {
    this.set('viewState', SC.CoreView.ATTACHED_SHOWING);
  },

  /** @private */
  _gotoAttachedShownState: function () {
    this.set('viewState', SC.CoreView.ATTACHED_SHOWN);
  },

  /** @private */
  _gotoUnattachedState: function () {
    this.set('viewState', SC.CoreView.UNATTACHED);
  },

  /** @private */
  _gotoAttachedPartialState: function () {
    this.set('viewState', SC.CoreView.ATTACHED_PARTIAL);
  },

  /** @private */
  _gotoUnrenderedState: function () {
    this.set('viewState', SC.CoreView.UNRENDERED);
  },

  // ------------------------------------------------------------------------
  // Methods
  //

  /** @private Adds observers once a view has a layer. */
  _sc_addRenderedStateObservers: function () {
    var displayProperties,
      len, idx;

    // Register display property observers.
    displayProperties = this.get('displayProperties');
    for (idx = 0, len = displayProperties.length; idx < len; idx++) {
      this.addObserver(displayProperties[idx], this, this.displayDidChange);
    }

    // Begin observing isVisible & isFirstResponder.
    this.addObserver('isVisible', this, this._isVisibleDidChange);
    this.addObserver('isFirstResponder', this, this._isFirstResponderDidChange);
  },

  /** @private Called when an ancestor's parent changed. */
  _ancestorDidChangeParent: function () {
    // When an ancestor changes, the pane may have changed.
    this.notifyPropertyChange('pane');
  },

  /** @private Clear building in transition. */
  _cancelTransition: function () {
    // Cancel conflicting transitions. This causes the animation callback to fire.
    this.cancelAnimation();
    // this._teardownTransition();
  },

  /** @private */
  _doUpdateVisibleStyle: function () {
    var isVisible = this.get('isVisible');

    this.$().toggleClass('sc-hidden', !isVisible);
    this.$().attr('aria-hidden', isVisible ? null : true);

    // Reset that an update is required.
    this._visibleStyleNeedsUpdate = false;
  },

  /** @private Destroys the layer and updates the state. */
  _teardownLayer: function () {
    this._notifyWillDestroyLayer();

    var displayProperties,
      idx, len;

    // Unregister display property observers.
    displayProperties = this.get('displayProperties');
    for (idx = 0, len = displayProperties.length; idx < len; idx++) {
      this.removeObserver(displayProperties[idx], this, this.displayDidChange);
    }

    // Stop observing isVisible & isFirstResponder.
    this.removeObserver('isVisible', this, this._isVisibleDidChange);
    this.removeObserver('isFirstResponder', this, this._isFirstResponderDidChange);

    // Remove the layer reference.
    this.set('layer', null);

    // Update states after *will* and before *did* notifications!
    this._gotoUnrenderedState();
  },

  /** @private Attaches the view. */
  _executeDoAttach: function () {
    var notifyStack = []; // Only those views that changed state get added to the stack.

    // Run any queued updates.
    this._executeQueuedUpdates();

    // Update the state and children state. The children are updated top-down so that hidden or
    // unattached children allow us to bail out early.
    this._gotoSomeAttachedState();
    this._callOnChildViews('_parentDidAttach', true, notifyStack);

    // Notify for each child (that changed state) in reverse so that each child is in the proper
    // state before its parent potentially alters its state. For example, a parent could modify
    // children in `didAppendToDocument`.
    for (var i = notifyStack.length - 1; i >= 0; i--) {
      var childView = notifyStack[i];

      childView._notifyDidAttach();
    }
    this._notifyDidAttach();
  },

  /** @private Builds out the view. */
  _executeDoBuildOut: function (immediately, inPlace) {
    if (immediately) {
      // Detach immediately.
      this._executeDoDetach();
    } else {
      // In order to allow the removal of a parent to be delayed by its children's transitions, we
      // track which views are building out and finish only when they're all done.
      this._sc_buildOutCount = 0;

      // Tell all the child views so that any with a transitionOut may run it. Top-down so that
      // any hidden or already building out child views allow us to bail out early.
      this._callOnChildViews('_parentWillBuildOutFromDocument', true, this);

      var transitionOut = this.get('transitionOut');
      if (transitionOut) {
        inPlace = inPlace || false;
        this._transitionOut(inPlace, this);

      } else if (this._sc_buildOutCount > 0) {
        // Some children are building out, we will have to wait for them.
        this._gotoAttachedBuildingOutState();
      } else {
        this._sc_buildOutCount = null;

        // Detach immediately.
        this._executeDoDetach();
      }
    }
  },

  /** @private Detaches the view and updates the state. */
  _executeDoDetach: function () {
    var notifyStack = []; // Only those views that changed state get added to the stack.

    // The children are updated top-down so that hidden or unattached children allow us to bail out early.
    this._callOnChildViews('_parentWillDetach', true, notifyStack);

    // Notify for each child (that will change state) in reverse so that each child is in the proper
    // state before its parent potentially alters its state. For example, a parent could modify
    // children in `willRemoveFromDocument`.
    for (var i = notifyStack.length - 1; i >= 0; i--) {
      var childView = notifyStack[i];

      childView._notifyWillDetach();
    }
    this._notifyWillDetach();

    // Cancel any remaining animations (e.g. a concurrent hide).
    var viewState = this.get('viewState');
    switch (viewState) {
    case SC.CoreView.ATTACHED_HIDING:
    case SC.CoreView.ATTACHED_SHOWN_ANIMATING:
      this.cancelAnimation();
      break;
    }

    // Detach the layer.
    var node = this.get('layer');
    node.parentNode.removeChild(node);

    // Update the state and children state. The children are updated top-down so that unattached
    // children allow us to bail out early.
    this._gotoUnattachedState();
    this._callOnChildViews('_parentDidDetach', true);
  },

  /** @private Hides the view. */
  _executeDoHide: function () {
    var notifyStack = []; // Only those views that changed state get added to the stack.

    // The children are updated top-down so that hidden or unattached children allow us to bail out early.
    this._callOnChildViews('_parentWillHideInDocument', true, notifyStack);

    // Notify for each child (that will change state) in reverse so that each child is in the proper
    // state before its parent potentially alters its state. For example, a parent could modify
    // children in `willHideInDocument`.
    for (var i = notifyStack.length - 1; i >= 0; i--) {
      var childView = notifyStack[i];

      childView._notifyWillHideInDocument();
    }
    this._notifyWillHideInDocument();

    // Cancel any remaining animations (e.g. a concurrent build in or build out).
    var viewState = this.get('viewState');
    switch (viewState) {
    case SC.CoreView.ATTACHED_BUILDING_IN:
    case SC.CoreView.ATTACHED_BUILDING_OUT:
    case SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT:
    case SC.CoreView.ATTACHED_SHOWN_ANIMATING:
      this.cancelAnimation();
      break;
    }

    // Update the visible style.
    this._doUpdateVisibleStyle();

    // Update the state and children state. The children are updated top-down so that hidden or
    // unattached children allow us to bail out early.
    this._gotoAttachedHiddenState();
    this._callOnChildViews('_parentDidHideInDocument', true); // , notifyStack

    // Notify for each child (that changed state) in reverse so that each child is in the proper
    // state before its parent potentially alters its state. For example, a parent could modify
    // children in `didHideInDocument`.
    // for (var i = notifyStack.length - 1; i >= 0; i--) {
    //   var childView = notifyStack[i];

    //   childView._notifyDidHideInDocument();
    // }
    this._notifyDidHideInDocument();
  },

  /** @private Render the view's layer. */
  _executeDoRender: function () {
    var notifyStack = []; // Only those views that changed state get added to the stack.

    // Render the layer.
    var context = this.renderContext(this.get('tagName'));

    this.renderToContext(context);
    this.set('layer', context.element());

    // Update the state and children state. The children are updated top-down so that invalid state
    // children allow us to bail out early.
    // if (this.get('parentView')) {
    //   this._gotoAttachedPartialState();
      this._gotoUnattachedState();
    // }

    this._callOnChildViews('_parentDidRender', true, notifyStack);

    this._sc_addRenderedStateObservers();

    // Notify for each child (that changed state) in reverse so that each child is in the proper
    // state before its parent potentially alters its state. For example, a parent could modify
    // children in `didCreateLayer`.
    for (var i = notifyStack.length - 1; i >= 0; i--) {
      var childView = notifyStack[i];

      childView._notifyDidRender();
    }
    this._notifyDidRender();
  },

  /** @private Shows the view. */
  _executeDoShow: function () {
    // var notifyStack = []; // Only those views that changed state get added to the stack.

    // Update the visible style.
    this._doUpdateVisibleStyle();

    // Update the state and children state. The children are updated top-down so that hidden or
    // unattached children allow us to bail out early. This view's state is going to be transitioning,
    // but all child views are now considered shown.
    this._gotoAttachedShownState();
    this._callOnChildViews('_parentDidShowInDocument', true); // , notifyStack

    // Notify for each child (that changed state) in reverse so that each child is in the proper
    // state before its parent potentially alters its state. For example, a parent could modify
    // children in `didShowInDocument`.
    // for (var i = notifyStack.length - 1; i >= 0; i--) {
    //   var childView = notifyStack[i];

    //   childView._notifyDidShowInDocument();
    // }
    this._notifyDidShowInDocument();
  },

  /** @private Updates the layer. */
  _executeDoUpdateContent: function () {
    var mixins = this.renderMixin,
      context = this.renderContext(this.get('layer'));

    // If there is no update method, fallback to calling render with extra
    // firstTime argument set to false.
    if (!this.update) {
      this.render(context, false);
    } else {
      this.update(context.$());
    }

    // Call renderMixin methods.
    if (mixins) {
      var len = mixins.length;
      for (var idx = 0; idx < len; ++idx) {
        mixins[idx].call(this, context, false);
      }
    }

    // Call applyAttributesToContext so that subclasses that override it can
    // insert further attributes.
    this.applyAttributesToContext(context);

    context.update();

    // Legacy.
    this.set('layerNeedsUpdate', false);

    // Reset that an update is required.
    this._contentNeedsUpdate = false;

    // Notify.
    this.notifyPropertyChange('layer');
    if (this.didUpdateLayer) { this.didUpdateLayer(); }

    if (this.designer && this.designer.viewDidUpdateLayer) {
      this.designer.viewDidUpdateLayer(); //let the designer know
    }
  },

  /** @private */
  _executeQueuedUpdates: function () {

    // Update visibility style if necessary.
    if (this._visibleStyleNeedsUpdate) {
      this._doUpdateVisibleStyle();
    }

    // Update the content of the layer if necessary.
    if (this._contentNeedsUpdate) {
      this._executeDoUpdateContent();
    }
  },

  /** @private
    Marks the view as needing a visibility update if the isVisible property
    changes.

    This observer is connected when the view is attached and is disconnected
    when the view is detached.
  */
  _isVisibleDidChange: function () {
    if (this.get('isVisible')) {
      this._doShow();
    } else {
      this._doHide();
    }
  },

  /** @private
    Adds the 'focus' class to the view.

    This observer is connected when the view is attached and is disconnected
    when the view is detached.
  */
  _isFirstResponderDidChange: function () {
    var isFirstResponder = this.get('isFirstResponder');

    this.$().toggleClass('focus', isFirstResponder);
  },

  /** @private Attempts to call `didAppendToDocument` on the view. */
  _notifyDidAttach: function () {
    // If we don't have the layout module then we don't know the frame until appended to the document.
    this.notifyPropertyChange('frame');

    // Notify.
    if (this.didAppendToDocument) { this.didAppendToDocument(); }
  },

  /** @private Attempts to call `didHideInDocument` on the view. */
  _notifyDidHideInDocument: function () {
    if (this.didHideInDocument) { this.didHideInDocument(); }
  },

  /** @private Attempts to call `didCreateLayer` on the view. */
  _notifyDidRender: function () {
    var mixins = this.didCreateLayerMixin,
      idx, len;

    // Send notice that the layer was created.
    if (this.didCreateLayer) { this.didCreateLayer(); }
    if (mixins) {
      len = mixins.length;
      for (idx = 0; idx < len; ++idx) {
        mixins[idx].call(this);
      }
    }
  },

  /** @private Attempts to call `didShowInDocument` on the view. */
  _notifyDidShowInDocument: function () {
    if (this.didShowInDocument) { this.didShowInDocument(); }
  },

  /** @private Attempts to call `willDestroyLayer` on the view. */
  _notifyWillDestroyLayer: function () {
    var idx, len,
      mixins;

    mixins = this.willDestroyLayerMixin;
    if (mixins) {
      len = mixins.length;
      for (idx = 0; idx < len; ++idx) {
        mixins[idx].call(this);
      }
    }

    if (this.willDestroyLayer) { this.willDestroyLayer(); }
  },

  /** @private Attempts to call `willRemoveFromDocument` on the view. */
  _notifyWillDetach: function () {
    if (this.willRemoveFromDocument) { this.willRemoveFromDocument(); }
  },

  /** @private Attempts to call `willHideInDocument` on the view. */
  _notifyWillHideInDocument: function () {
    if (this.willHideInDocument) { this.willHideInDocument(); }
  },

  /** @private Attempts to call `willShowInDocument` on the view. */
  _notifyWillShowInDocument: function () {
    if (this.willShowInDocument) { this.willShowInDocument(); }
  },

  /** @private Routes according to parent did append. */
  _parentDidAttach: function (notifyStack) {
    var state = this.get('viewState'),
        shouldContinue = true;

    // Handle all 12 possible view states.
    switch (state) {

    // Scenario: The child view was attached to the parent, which was unattached.
    // Result: Update the child and then move it to the proper attached state.
    case SC.CoreView.ATTACHED_PARTIAL:
      // Run any queued updates.
      this._executeQueuedUpdates();

      // Go to the proper state.
      this._gotoSomeAttachedState();

      // If there is a transition in, run it. TODO: Check state here?
      var transitionIn = this.get('transitionIn');
      if (transitionIn) {
        this._transitionIn(false);
      }

      break;

    // Scenario: The child is unrendered or unattached.
    // Result: The child would need to be forced into this state by its parent (otherwise it should
    //         be in an ATTACHED_PARTIAL state), so just leave it alone and don't notify.
    case SC.CoreView.UNRENDERED: // Render + attach?
    case SC.CoreView.UNATTACHED: // Attach?
      // There's no need to continue to further child views.
      shouldContinue = false;
      break;

    // Invalid states.
    default:
      
      // Add some debugging only warnings for if the view statechart is breaking assumptions.
      // All other states should be impossible if parent was UNATTACHED:
      // ATTACHED_BUILDING_IN, ATTACHED_SHOWING, ATTACHED_SHOWN, ATTACHED_SHOWN_ANIMATING, ATTACHED_BUILDING_OUT, ATTACHED_BUILDING_OUT_BY_PARENT, ATTACHED_HIDING, ATTACHED_HIDDEN, ATTACHED_HIDDEN_BY_PARENT
      SC.warn("Core Developer Warning: Found invalid state for view, %@, in _parentDidAttach".fmt(this));
      

      // There's no need to continue to further child views.
      shouldContinue = false;
    }

    if (shouldContinue) {
      // Allow children that have changed state to notify that they have been attached.
      notifyStack.push(this);
    }

    return shouldContinue;
  },

  /** @private Updates according to parent did cancel build out. */
  _parentDidCancelBuildOut: function () {
    var state = this.get('viewState');

    // If the view was building out because its parent was building out, attempt to reverse or
    // revert the transition.
    if (state === SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT) {
      var transitionIn = this.get('transitionIn');

      // Cancel the building out transition (in place if we are going to switch to transitioning back in).
      this.cancelAnimation(transitionIn ? SC.LayoutState.CURRENT : undefined);

      // Set the proper state.
      this._gotoAttachedShownState();

      if (transitionIn) {
        this._transitionIn(true);
      }

    // If the view was building out on its own or is hidden we can ignore it.
    } else if (state === SC.CoreView.ATTACHED_BUILDING_OUT || state &
      SC.CoreView.IS_HIDDEN) {
      // There's no need to continue to further child views.
      return false;
    }
  },

  /** @private Update child view states when the parent hides. Top-down! */
  _parentDidHideInDocument: function () { // notifyStack
    var state = this.get('viewState'),
        shouldContinue = false;

    // Handle all 12 possible view states.
    switch (state) {

    // Scenario: The child view was shown.
    // Result: Go to hidden by parent state.
    case SC.CoreView.ATTACHED_SHOWN:
      // Go to the proper state.
      this._gotoAttachedHiddenByParentState();

      shouldContinue = true;
      break;

    // Scenario: The child view was hidden or forced to unrendered or unattached state.
    // Result: Do nothing.
    case SC.CoreView.UNRENDERED:
    case SC.CoreView.UNATTACHED:
    case SC.CoreView.ATTACHED_HIDDEN:
      break;

    // Invalid states.
    default:
      
      // Add some debugging only warnings for if the view statechart is breaking assumptions.
      // All animating states should have been canceled when parent will hide is called.
      // ATTACHED_HIDING, ATTACHED_BUILDING_IN, ATTACHED_SHOWING, ATTACHED_BUILDING_OUT, ATTACHED_BUILDING_OUT_BY_PARENT, ATTACHED_PARTIAL, ATTACHED_HIDDEN_BY_PARENT, ATTACHED_SHOWN_ANIMATING
      SC.warn("Core Developer Warning: Found invalid state for view %@ in _parentDidHideInDocument".fmt(this));
      
    }

    // if (shouldContinue) {
    //   // Allow children that have changed state to notify that they have been hidden.
    //   notifyStack.push(this);
    // }

    return shouldContinue;
  },

  /** @private Routes according to parent did detach. */
  _parentDidDetach: function () {
    var state = this.get('viewState');

    if (state & SC.CoreView.IS_ATTACHED) {
      // Update states after *will* and before *did* notifications!
      this._gotoAttachedPartialState();
    } else {
      // There's no need to continue to further child views.
      return false;
    }
  },

  /** @private Configure child views when parent did render. */
  _parentDidRender: function (notifyStack) {
    var state = this.get('viewState'),
        shouldContinue = true;

    // Handle all 12 possible view states.
    switch (state) {

    // Scenario: The child view was unrendered and now is rendered.
    // Result: Add rendered state observers and move it to the proper rendered state.
    case SC.CoreView.UNRENDERED:
      this._sc_addRenderedStateObservers();

      // Go to the proper state.
      this._gotoAttachedPartialState();
      break;

    // Invalid states.
    default:
      
      // Add some debugging only warnings for if the view statechart is breaking assumptions.
      // All other states should be impossible if parent was UNRENDERED:
      // ATTACHED_BUILDING_IN, ATTACHED_SHOWING, ATTACHED_SHOWN, ATTACHED_SHOWN_ANIMATING, ATTACHED_BUILDING_OUT, ATTACHED_BUILDING_OUT_BY_PARENT, ATTACHED_HIDING, ATTACHED_HIDDEN, ATTACHED_HIDDEN_BY_PARENT, ATTACHED_PARTIAL, UNATTACHED
      SC.warn("Core Developer Warning: Found invalid state for view %@ in _parentDidRender".fmt(this));
      

      // There's no need to continue to further child views.
      shouldContinue = false;
    }

    if (shouldContinue) {
      // Allow children that have changed state to notify that they have been rendered.
      notifyStack.push(this);
    }

    return shouldContinue;
  },

  /** @private Update child view states when the parent shows. Top-down! */
  _parentDidShowInDocument: function () { // notifyStack
    var state = this.get('viewState'),
        shouldContinue = true;

    // Handle all 12 possible view states.
    switch (state) {

    // Scenario: The child view is only hidden because of the parent.
    // Result: Go to shown state. This will notify.
    case SC.CoreView.ATTACHED_HIDDEN_BY_PARENT:
      this._gotoAttachedShownState();

      break;

    // Scenario: The child view is hidden on its own or has been forced to an unrendered or unattached state.
    // Result: Do nothing and don't notify.
    case SC.CoreView.UNRENDERED:
    case SC.CoreView.UNATTACHED:
    case SC.CoreView.ATTACHED_HIDDEN:
      // There's no need to continue to further child views.
      shouldContinue = false;
      break;

    // Invalid states.
    default:
      
      // Add some debugging only warnings for if the view statechart is breaking assumptions.
      // These states should be impossible if the parent was HIDDEN.
      // ATTACHED_SHOWN, ATTACHED_SHOWN_ANIMATING, ATTACHED_SHOWING, ATTACHED_HIDING, ATTACHED_BUILDING_IN, ATTACHED_BUILDING_OUT, ATTACHED_BUILDING_OUT_BY_PARENT
      // This state should be impossible if its parent was UNATTACHED (it should have been trimmed above):
      // ATTACHED_PARTIAL
      SC.warn("Core Developer Warning: Found invalid state for view %@ in _parentDidShowInDocument".fmt(this));
      
      // There's no need to continue to further child views.
      shouldContinue = false;
    }

    // if (shouldContinue) {
    //   // Allow children that have changed state to notify that they have been made visible.
    //   notifyStack.push(this);
    // }

    return shouldContinue;
  },

  /** @private Starts building out view if appropriate. */
  _parentWillBuildOutFromDocument: function (owningView) {
    var state = this.get('viewState'),
      transitionOut = this.get('transitionOut'),
      shouldContinue = true;

    switch (state) {
    case SC.CoreView.UNRENDERED:
    case SC.CoreView.UNATTACHED:
    case SC.CoreView.ATTACHED_BUILDING_OUT:
    case SC.CoreView.ATTACHED_HIDDEN:
      // There's no need to continue to further child views.
      shouldContinue = false;
      break;

    // Scenario: The child view is building in at the same time that its ancestor wants to detach.
    // Result: If the child wants to build out, switch to building out by parent, otherwise let the build in run for as long as it can.
    case SC.CoreView.ATTACHED_BUILDING_IN:

      // Cancel the build in transition.
      if (transitionOut) {
        this.cancelAnimation(SC.LayoutState.CURRENT);
      } else {
        this.cancelAnimation();
      }

      // Set the proper state.
      this._gotoAttachedShownState();

      // Build out the view by parent.
      if (transitionOut) {
        this._transitionOut(true, owningView);
      }

      break;

    // Scenario: The view is shown and possibly transitioning.
    // Result: Allow any transitions to continue concurrent with build out transition (may be conflicts).
    case SC.CoreView.ATTACHED_HIDING:
    case SC.CoreView.ATTACHED_SHOWN_ANIMATING:
    case SC.CoreView.ATTACHED_SHOWING:
    case SC.CoreView.ATTACHED_SHOWN:

      // Build out the view by parent.
      if (transitionOut) {
        this._transitionOut(false, owningView);
      }
      break;

    // Invalid states.
    default:
      
      // Add some debugging only warnings for if the view statechart is breaking assumptions.
      // These states should not be reachable here: ATTACHED_PARTIAL, ATTACHED_HIDDEN_BY_PARENT, ATTACHED_BUILDING_OUT_BY_PARENT
      SC.warn("Core Developer Warning: Found invalid state for view %@ in _parentWillBuildOutFromDocument".fmt(this));
      
      // There's no need to continue to further child views.
      shouldContinue = false;
    }

    return shouldContinue;
  },

  /** @private Prepares according to parent will hide. This is called before the parent view hides
    completely, which may be after a hide transition completes. */
  _parentWillHideInDocument: function () { // notifyStack
    var state = this.get('viewState'),
        shouldContinue = true;

    // Handle all 12 possible view states.
    switch (state) {

    // Scenario: The child view is visible.
    // Result: Do nothing and continue.
    case SC.CoreView.ATTACHED_SHOWN:
      break;

    // Scenario: The child view is animating.
    // Result: Complete its animation immediately and continue.
    case SC.CoreView.ATTACHED_SHOWN_ANIMATING:
    case SC.CoreView.ATTACHED_SHOWING:
    case SC.CoreView.ATTACHED_BUILDING_IN:
    case SC.CoreView.ATTACHED_BUILDING_OUT:
    case SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT:
    case SC.CoreView.ATTACHED_HIDING:
      this.cancelAnimation();
      break;

    // Scenario: The child view is hidden or has been forced to an unrendered or unattached state.
    // Result: Do nothing and don't notify.
    case SC.CoreView.UNRENDERED:
    case SC.CoreView.UNATTACHED:
    case SC.CoreView.ATTACHED_HIDDEN:
      // There's no need to continue to further child views.
      break;

    // Invalid states.
    default:
      
      // Add some debugging only warnings for if the view statechart is breaking assumptions.
      // This state should be impossible if its parent was UNATTACHED or HIDDEN/HIDING (it should have been trimmed above):
      // ATTACHED_PARTIAL, ATTACHED_HIDDEN_BY_PARENT
      SC.warn("Core Developer Warning: Found invalid state for view %@ in _parentWillHideInDocument".fmt(this));
      
      // There's no need to continue to further child views.
      shouldContinue = false;
    }

    // if (shouldContinue) {
    //   // Allow children that have changed state to notify that they will be shown.
    //   notifyStack.push(this);
    // }

    return shouldContinue;
  },

  /** @private Clean up before parent is detached. */
  _parentWillDetach: function (notifyStack) {
    var state = this.get('viewState'),
        shouldContinue = true;

    // Handle all 12 possible view states.
    switch (state) {

    // Scenario: The child view is visible.
    // Result: Do nothing and continue.
    case SC.CoreView.ATTACHED_SHOWN:
      break;

    // Scenario: The child view is animating.
    // Result: Complete its animation immediately and continue.
    case SC.CoreView.ATTACHED_SHOWN_ANIMATING: // TODO: We need concurrent states!
    case SC.CoreView.ATTACHED_SHOWING:
    case SC.CoreView.ATTACHED_BUILDING_IN: // Was building in and didn't have a build out.
    case SC.CoreView.ATTACHED_BUILDING_OUT: // Was building out on its own at the same time.
    case SC.CoreView.ATTACHED_HIDING:
      this.cancelAnimation();
      break;

    // Scenario: The child view has forced to unattached or unrendered state, or it's hidden.
    // Result: Don't continue.
    case SC.CoreView.UNRENDERED:
    case SC.CoreView.UNATTACHED:
    case SC.CoreView.ATTACHED_HIDDEN:
      shouldContinue = false;
      break;

    // Invalid states.
    default:
      
      // Add some debugging only warnings for if the view statechart is breaking assumptions.
      // These states should not be reachable here: ATTACHED_PARTIAL, ATTACHED_HIDDEN_BY_PARENT, ATTACHED_BUILDING_OUT_BY_PARENT
      SC.warn("Core Developer Warning: Found invalid state for view %@ in _parentWillDetach".fmt(this));
      
      // There's no need to continue to further child views.
      shouldContinue = false;
    }

    if (shouldContinue) {
      // Allow children that have changed state to notify that they will be shown.
      notifyStack.push(this);
    }

    return shouldContinue;
  },

  /** @private Prepares according to parent will show. */
  _parentWillShowInDocument: function (notifyStack) {
    var state = this.get('viewState'),
        shouldContinue = true;

    // Handle all 12 possible view states.
    switch (state) {

    // Scenario: The child view is only hidden because of the parent.
    // Result: Run queued updates. This will notify.
    case SC.CoreView.ATTACHED_HIDDEN_BY_PARENT:
      this._executeQueuedUpdates();

      break;

    // Scenario: The child view is hidden on its own or has been forced to an unrendered or unattached state.
    // Result: Do nothing and don't notify.
    case SC.CoreView.UNRENDERED:
    case SC.CoreView.UNATTACHED:
    case SC.CoreView.ATTACHED_HIDDEN:
      // There's no need to continue to further child views.
      shouldContinue = false;
      break;

    // Invalid states.
    default:
      
      // Add some debugging only warnings for if the view statechart is breaking assumptions.
      // These states should be impossible if the parent was HIDDEN.
      // ATTACHED_SHOWN, ATTACHED_SHOWN_ANIMATING, ATTACHED_SHOWING, ATTACHED_HIDING, ATTACHED_BUILDING_IN, ATTACHED_BUILDING_OUT, ATTACHED_BUILDING_OUT_BY_PARENT
      // This state should be impossible if its parent was UNATTACHED (it should have been trimmed above):
      // ATTACHED_PARTIAL
      SC.warn("Core Developer Warning: Found invalid state for view %@ in _parentWillShowInDocument".fmt(this));
      
      // There's no need to continue to further child views.
      shouldContinue = false;
    }

    if (shouldContinue) {
      // Allow children that have changed state to notify that they will be shown.
      notifyStack.push(this);
    }

    return shouldContinue;
  },

  /** @private */
  _setupTransition: function (transition) {
    // Get a copy of the layout.
    var layout = SC.clone(this.get('layout'));
    // Prepare for a transition.
    this._preTransitionLayout = layout;
    this._preTransitionFrame = this.get('borderFrame');
    // Cache appropriate layout values.
    var layoutProperties = SC.get(transition, 'layoutProperties');
    // If the transition specifies any layouts, cache them.
    if (layoutProperties && layoutProperties.length) {
      this._transitionLayoutCache = {};
      var i, prop, len = layoutProperties.length;
      for (i = 0; i < len; i++) {
        prop = layoutProperties[i];
        this._transitionLayoutCache[prop] = layout[prop] === undefined ? null : layout[prop];
      }
    }
  },

  /** @private */
  _teardownTransition: function () {
    // Make sure this isn't being called twice for the same transition. For example,
    // some transition plugins will send a didTransitionIn/Out event even if the
    // transition was cancelled.

    // If we have a hash of cached layout properties, adjust back to it.
    if (this._transitionLayoutCache) {
      this.adjust(this._transitionLayoutCache);
    }
    // Otherwise, just set the layout back to what it was.
    else if (this._preTransitionLayout) {
      this.set('layout', this._preTransitionLayout);
    }
    // Clean up.
    this._preTransitionLayout = null;
    this._preTransitionFrame = null;
    this._transitionLayoutCache = null;
  },

  /** @private Attempts to run a transition hide, ensuring any incoming transitions are stopped in place. */
  _transitionHide: function (inPlace) {
    var transitionHide = this.get('transitionHide'),
      options = this.get('transitionHideOptions') || {};

    
    if (SC.LOG_VIEW_STATES || this.SC_LOG_VIEW_STATE) {
      SC.Logger.log('%c%@ — _transitionHide()'.fmt(this), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
    }
    

    // switch (state) {
    // case SC.CoreView.ATTACHED_SHOWING:
    // case SC.CoreView.ATTACHED_BUILDING_IN:
    //   this.cancelAnimation(SC.LayoutState.CURRENT);
    //   inPlace = true;
    //   break;
    // default:
    if (!inPlace) {
      this._setupTransition(transitionHide);
    }
    // }

    // Set up the hiding transition.
    if (transitionHide.setup) {
      transitionHide.setup(this, options, inPlace);
    }

    // Execute the hiding transition.
    transitionHide.run(this, options, this._preTransitionLayout, this._preTransitionFrame);

    // Set the proper state.
    this._gotoAttachedHidingState();
  },

  /** @private Attempts to run a transition in, ensuring any outgoing transitions are stopped in place. */
  _transitionIn: function (inPlace) {
    var transitionIn = this.get('transitionIn'),
      options = this.get('transitionInOptions') || {};

    
    if (SC.LOG_VIEW_STATES || this.SC_LOG_VIEW_STATE) {
      SC.Logger.log('%c%@ — _transitionIn()'.fmt(this), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
    }
    

    if (!inPlace) {
      this._setupTransition(transitionIn);
    }

    // Set up the incoming transition.
    if (transitionIn.setup) {
      transitionIn.setup(this, options, inPlace);
    }

    // Execute the incoming transition.
    transitionIn.run(this, options, this._preTransitionLayout, this._preTransitionFrame);

    // Set the proper state.
    this._gotoAttachedBuildingInState();
  },

  /** @private Attempts to run a transition out, ensuring any incoming transitions are stopped in place. */
  _transitionOut: function (inPlace, owningView) {
    var transitionOut = this.get('transitionOut'),
      options = this.get('transitionOutOptions') || {};

    if (!inPlace) {
      this._setupTransition(transitionOut);
    }

    // Increment the shared building out count.
    owningView._sc_buildOutCount++;

    // Set up the outgoing transition.
    if (transitionOut.setup) {
      transitionOut.setup(this, options, inPlace);
    }

    // Execute the outgoing transition.
    transitionOut.run(this, options, this._preTransitionLayout, this._preTransitionFrame);

    // Set the proper state.
    if (owningView === this) {
      this._gotoAttachedBuildingOutState();
    } else {
      this._gotoAttachedBuildingOutByParentState();
    }
  },

  /** @private Attempts to run a transition show, ensuring any hiding transitions are stopped in place. */
  _transitionShow: function (inPlace) {
    var transitionShow = this.get('transitionShow'),
      options = this.get('transitionShowOptions') || {};

    
    if (SC.LOG_VIEW_STATES || this.SC_LOG_VIEW_STATE) {
      SC.Logger.log('%c%@ — _transitionShow()'.fmt(this), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
    }
    

    if (!inPlace) {
      this._setupTransition(transitionShow);
    }

    // Set up the showing transition.
    if (transitionShow.setup) {
      transitionShow.setup(this, options, inPlace);
    }

    // Execute the showing transition.
    transitionShow.run(this, options, this._preTransitionLayout, this._preTransitionFrame);

    // Set the proper state.
    this._gotoAttachedShowingState();
  },

  /** @private Goes to the proper attached state depending on its parents state*/
  _gotoSomeAttachedState: function () {
    var parentView = this.get('parentView'),
      isParentHidden = parentView ? parentView.get('viewState') & SC.CoreView.IS_HIDDEN : false,
      // Views without a parent are not limited by a parent's current state.
      isParentShown = parentView ? parentView.get('viewState') & SC.CoreView.IS_SHOWN : true;

    // Set the proper state.
    if (isParentShown) {
      if (this.get('isVisible')) {
        this._gotoAttachedShownState();
      } else {
        this._gotoAttachedHiddenState();
      }
    } else if (isParentHidden) {
      this._gotoAttachedHiddenByParentState();
    } else {
      this._gotoAttachedPartialState();
    }
  }

});

/* >>>>>>>>>> BEGIN source/views/view.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global jQuery*/

sc_require('system/browser');
sc_require('system/event');
sc_require('system/cursor');
sc_require('system/responder');
sc_require('system/theme');

sc_require('system/string');
sc_require('views/view/statechart');


/**
  Default property to disable or enable by default the contextMenu
*/
SC.CONTEXT_MENU_ENABLED = YES;

/**
  Default property to disable or enable if the focus can jump to the address
  bar or not.
*/
SC.TABBING_ONLY_INSIDE_DOCUMENT = NO;

/**
  Tells the property (when fetched with themed()) to get its value from the renderer (if any).
*/
SC.FROM_THEME = "__FROM_THEME__"; // doesn't really matter what it is, so long as it is unique. Readability is a plus.

/** @private - custom array used for child views */
SC.EMPTY_CHILD_VIEWS_ARRAY = [];
SC.EMPTY_CHILD_VIEWS_ARRAY.needsClone = YES;

/**
  @class

*/
SC.CoreView.reopen(
/** @scope SC.View.prototype */ {

  /**
    An array of the properties of this class that will be concatenated when
    also present on subclasses.

    @type Array
    @default ['outlets', 'displayProperties', 'classNames', 'renderMixin', 'didCreateLayerMixin', 'willDestroyLayerMixin', 'classNameBindings', 'attributeBindings']
  */
  concatenatedProperties: ['outlets', 'displayProperties', 'classNames', 'renderMixin', 'didCreateLayerMixin', 'willDestroyLayerMixin', 'classNameBindings', 'attributeBindings'],

  /**
    The WAI-ARIA role of the control represented by this view. For example, a
    button may have a role of type 'button', or a pane may have a role of
    type 'alertdialog'. This property is used by assistive software to help
    visually challenged users navigate rich web applications.

    The full list of valid WAI-ARIA roles is available at:
    http://www.w3.org/TR/wai-aria/roles#roles_categorization

    @type String
    @default null
  */
  ariaRole: null,

  /**
    The aria-hidden role is managed appropriately by the internal view's
    statechart.  When the view is not currently displayed the aria-hidden
    attribute will be set to true.

    @type String
    @default null
    @deprecated Version 1.10
  */
  ariaHidden: null,

  /**
    Whether this view was created by its parent view or not.

    Several views are given child view classes or instances to automatically
    append and remove.  In the case that the view was provided an instance,
    when it removes the instance and no longer needs it, it should not destroy
    the instance because it was created by someone else.

    On the other hand if the view was given a class that it creates internal
    instances from, then it should destroy those instances properly to avoid
    memory leaks.

    This property should be set by any view that is creating internal child
    views so that it can properly remove them later.  Note that if you use
    `createChildView`, this property is set automatically for you.

    @type Boolean
    @see SC.View#createChildView
    @default false
  */
  createdByParent: false,

  /** @deprecated Version 1.11.0 Please use parentView instead. */
  owner: function () {
    
    SC.warn("Developer Warning: The `owner` property of SC.View has been deprecated in favor of the `parentView`, which is the same value. Please use `parentView`.");
    
    return this.get('parentView');
  }.property('parentView').cacheable(),

  /**
    The current pane.

    @field
    @type SC.Pane
    @default null
  */
  pane: function () {
    var view = this;

    while (view && !view.isPane) { view = view.get('parentView'); }

    return view;
  }.property('parentView').cacheable(),

  /**
    The page this view was instantiated from.  This is set by the page object
    during instantiation.

    @type SC.Page
    @default null
  */
  page: null,

  /**
    If the view is currently inserted into the DOM of a parent view, this
    property will point to the parent of the view.

    @type SC.View
    @default null
  */
  parentView: null,

  /**
    The isVisible property determines if the view should be displayed or not.

    If you also set a transitionShow or transitionHide plugin, then when
    isVisible changes, the appropriate transition will execute as the view's
    visibility changes.

    Note that isVisible can be set to true and the view may still not be
    "visible" in the window.  This can occur if:

      1. the view is not attached to the document.
      2. the view has a view ancestor with isVisible set to false.

    @type Boolean
    @see SC.View#viewState
    @default true
  */
  isVisible: true,
  isVisibleBindingDefault: SC.Binding.bool(),

  // ..........................................................
  // CHILD VIEW SUPPORT
  //

  /**
    Array of child views.  You should never edit this array directly unless
    you are implementing createChildViews().  Most of the time, you should
    use the accessor methods such as appendChild(), insertBefore() and
    removeChild().

    @type Array
    @default []
  */
  childViews: SC.EMPTY_CHILD_VIEWS_ARRAY,

  /**
    Use this property to automatically mix in a collection of mixins into all
    child views created by the view. This collection is applied during createChildView
    @property

    @type Array
    @default null
  */
  autoMixins: null,

  // ..........................................................
  // LAYER SUPPORT
  //

  /**
    Returns the current layer for the view.  The layer for a view is only
    generated when the view first becomes visible in the window and even
    then it will not be computed until you request this layer property.

    If the layer is not actually set on the view itself, then the layer will
    be found by calling this.findLayerInParentLayer().

    You can also set the layer by calling set on this property.

    @type DOMElement the layer
  */
  layer: function (key, value) {
    if (value !== undefined) {
      this._view_layer = value;

    // no layer...attempt to discover it...
    } else {
      value = this._view_layer;
      if (!value) {
        var parent = this.get('parentView');
        if (parent) { parent = parent.get('layer'); }
        this._view_layer = value = this.findLayerInParentLayer(parent);
      }
    }
    return value;
  }.property('isVisibleInWindow').cacheable(),

  /**
    Get a CoreQuery object for this view's layer, or pass in a selector string
    to get a CoreQuery object for a DOM node nested within this layer.

    @param {String} sel a CoreQuery-compatible selector string
    @returns {SC.CoreQuery} the CoreQuery object for the DOM node
  */
  $: function (sel) {
    var layer = this.get('layer');

    if (!layer) { return SC.$(); }
    else if (sel === undefined) { return SC.$(layer); }
    else { return SC.$(sel, layer); }
  },

  /**
    Returns the DOM element that should be used to hold child views when they
    are added/remove via DOM manipulation.  The default implementation simply
    returns the layer itself.  You can override this to return a DOM element
    within the layer.

    @type DOMElement the container layer
  */
  containerLayer: function () {
    return this.get('layer');
  }.property('layer').cacheable(),

  /**
    The ID to use when trying to locate the layer in the DOM.  If you do not
    set the layerId explicitly, then the view's GUID will be used instead.
    This ID must be set at the time the view is created.

    @type String
    @readOnly
  */
  layerId: function (key, value) {
    if (value) { this._layerId = value; }
    if (this._layerId) { return this._layerId; }
    return SC.guidFor(this);
  }.property().cacheable(),

  /**
    Attempts to discover the layer in the parent layer.  The default
    implementation looks for an element with an ID of layerId (or the view's
    guid if layerId is null).  You can override this method to provide your
    own form of lookup.  For example, if you want to discover your layer using
    a CSS class name instead of an ID.

    @param {DOMElement} parentLayer the parent's DOM layer
    @returns {DOMElement} the discovered layer
  */
  findLayerInParentLayer: function (parentLayer) {
    var id = "#" + this.get('layerId').escapeCssIdForSelector();
    return jQuery(id, parentLayer)[0] || jQuery(id)[0];
  },

  /**
    Returns YES if the receiver is a subview of a given view or if it's
    identical to that view. Otherwise, it returns NO.

    @property {SC.View} view
  */
  isDescendantOf: function (view) {
    var parentView = this.get('parentView');

    if (this === view) { return YES; }
    else if (parentView) { return parentView.isDescendantOf(view); }
    else { return NO; }
  },

  /**
    This method is invoked whenever a display property changes and updates
    the view's content once at the end of the run loop before any invokeLast
    functions run.

    To cause the view to be updated you can call this method directly and
    if you need to perform additional setup whenever the display changes, you
    can override this method as well.

    @returns {SC.View} receiver
  */
  displayDidChange: function () {
    
    if (SC.LOG_VIEW_STATES) {
      SC.Logger.log('%c%@:%@ — displayDidChange()'.fmt(this, this.get('viewState')), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
    }
    

    // Don't run _doUpdateContent needlessly, because the view may render
    // before it is invoked, which would result in a needless update.
    if (this.get('_isRendered')) {
      // Legacy.
      this.set('layerNeedsUpdate', true);

      this.invokeOnce(this._doUpdateContent);
    }

    return this;
  },

  /**
    This property has no effect and is deprecated.

    To cause a view to update immediately, you should just call updateLayer or
    updateLayerIfNeeded.  To cause a view to update at the end of the run loop
    before any invokeLast functions run, you should call displayDidChange.

    @deprecated Version 1.10
    @type Boolean
    @test in updateLayer
  */
  layerNeedsUpdate: NO,

  /**
    Updates the view's layer if the view is in a shown state.  Otherwise, the
    view will be updated the next time it enters a shown state.

    This is the same behavior as `displayDidChange` except that calling
    `updateLayerIfNeeded` will attempt to update each time it is called,
    while `displayDidChange` will only attempt to update the layer once per run
    loop.

    @returns {SC.View} receiver
    @test in updateLayer
  */
  updateLayerIfNeeded: function (skipIsVisibleInWindowCheck) {
    
    if (skipIsVisibleInWindowCheck) {
      SC.warn("Developer Warning: The `skipIsVisibleInWindowCheck` argument of updateLayerIfNeeded is not supported and will be ignored.");
    }
    
    this._doUpdateContent(false);

    return this;
  },

  /**
    This is the core method invoked to update a view layer whenever it has
    changed.  This method simply creates a render context focused on the
    layer element and then calls your render() method.

    You will not usually call or override this method directly.  Instead you
    should set the layerNeedsUpdate property to YES to cause this method to
    run at the end of the run loop, or you can call updateLayerIfNeeded()
    to force the layer to update immediately.

    Instead of overriding this method, consider overriding the render() method
    instead, which is called both when creating and updating a layer.  If you
    do not want your render() method called when updating a layer, then you
    should override this method instead.

    @returns {SC.View} receiver
  */
  updateLayer: function () {
    this._doUpdateContent(true);

    return this;
  },

  /** @private */
  parentViewDidResize: function () {
    if (!this.get('hasLayout')) { this.notifyPropertyChange('frame'); }
    this.viewDidResize();
  },

  /**
    Override this in a child class to define behavior that should be invoked
    when a parent's view was resized.
   */
  viewDidResize: function () {},

  /**
    Creates a new renderContext with the passed tagName or element.  You
    can override this method to provide further customization to the context
    if needed.  Normally you will not need to call or override this method.

    @returns {SC.RenderContext}
  */
  renderContext: function (tagNameOrElement) {
    return SC.RenderContext(tagNameOrElement);
  },

  /**
    Creates the layer by creating a renderContext and invoking the view's
    render() method.  This will only create the layer if the layer does not
    already exist.

    When you create a layer, it is expected that your render() method will
    also render the HTML for all child views as well.  This method will
    notify the view along with any of its childViews that its layer has been
    created.

    @returns {SC.View} receiver
  */
  createLayer: function () {
    if (!this.get('_isRendered')) {
      this._doRender();
    }

    return this;
  },

  /**
    Destroys any existing layer along with the layer for any child views as
    well.  If the view does not currently have a layer, then this method will
    do nothing.

    If you implement willDestroyLayer() on your view or if any mixins
    implement willDestroLayerMixin(), then this method will be invoked on your
    view before your layer is destroyed to give you a chance to clean up any
    event handlers, etc.

    If you write a willDestroyLayer() handler, you can assume that your
    didCreateLayer() handler was called earlier for the same layer.

    Normally you will not call or override this method yourself, but you may
    want to implement the above callbacks when it is run.

    @returns {SC.View} receiver
  */
  destroyLayer: function () {
    // We allow you to call destroy layer, but you should really detach first.
    if (this.get('isAttached')) {
      this._doDetach();
    }

    if (this.get('_isRendered')) {
      this._doDestroyLayer();
    }

    return this;
  },

  /**
    Destroys and recreates the current layer.  Doing this on a parent view can
    be more efficient than modifying individual child views independently.

    @returns {SC.View} receiver
  */
  replaceLayer: function () {
    var layer, parentNode;

    // If attached, detach and track our parent node so we can re-attach.
    if (this.get('isAttached')) {
      layer = this.get('layer');
      parentNode = layer.parentNode;

      this._doDetach();
    }

    this.destroyLayer().createLayer();

    // Reattach our layer (if we have a parentView this is done automatically).
    if (parentNode && !this.get('isAttached')) { this._doAttach(parentNode); }

    return this;
  },

  /**
    If the parent view has changed, we need to insert this
    view's layer into the layer of the new parent view.
  */
  parentViewDidChange: function () {
    
    SC.warn("Developer Warning: parentViewDidChange has been deprecated.  Please use the notification methods willAddChild, didAddChild, willRemoveChild or didRemoveChild on the parent or willAddToParent, didAddToParent, willRemoveFromParent or didRemoveFromParent on the child to perform updates when the parent/child status changes.");
    
  },

  /**
    Set to YES when the view's layer location is dirty.  You can call
    updateLayerLocationIfNeeded() to clear this flag if it is set.

    @deprecated Version 1.10
    @type Boolean
  */
  layerLocationNeedsUpdate: NO,

  /**
    Calls updateLayerLocation(), but only if the view's layer location
    currently needs to be updated.

    @deprecated Version 1.10
    @returns {SC.View} receiver
    @test in updateLayerLocation
  */
  updateLayerLocationIfNeeded: function () {
    
    SC.warn("SC.View.prototype.updateLayerLocationIfNeeded is no longer used and has been deprecated.  See the SC.View statechart code for more details on attaching and detaching layers.");
    

    return this;
  },

  /**
    This method is called when a view changes its location in the view
    hierarchy.  This method will update the underlying DOM-location of the
    layer so that it reflects the new location.

    @deprecated Version 1.10
    @returns {SC.View} receiver
  */
  updateLayerLocation: function () {
    
    SC.warn("SC.View.prototype.updateLayerLocation is no longer used and has been deprecated.  See the SC.View statechart code for more details on attaching and detaching layers.");
    

    return this;
  },

  /**
    @private

    Renders to a context.
    Rendering only happens for the initial rendering. Further updates happen in updateLayer,
    and are not done to contexts, but to layers.
    Note: You should not generally override nor directly call this method. This method is only
    called by createLayer to set up the layer initially, and by renderChildViews, to write to
    a context.

    @param {SC.RenderContext} context the render context.
  */
  renderToContext: function (context) {
    var mixins, idx, len;

    this.beginPropertyChanges();

    context.id(this.get('layerId'));
    context.setAttr('role', this.get('ariaRole'));

    // Set up the classNameBindings and attributeBindings observers.
    // TODO: CLEAN UP!!
    this._applyClassNameBindings();
    this._applyAttributeBindings(context);

    context.addClass(this.get('classNames'));

    if (this.get('isTextSelectable')) { context.addClass('allow-select'); }

    if (!this.get('isVisible')) {
      context.addClass('sc-hidden');
      context.setAttr('aria-hidden', 'true');
    }

    // Call applyAttributesToContext so that subclasses that override it can
    // insert further attributes.
    this.applyAttributesToContext(context);

    // We pass true for the second argument to support the old style of render.
    this.render(context, true);

    // If we've made it this far and renderChildViews() was never called,
    // render any child views now.
    if (!this._didRenderChildViews) { this.renderChildViews(context); }
    // Reset the flag so that if the layer is recreated we re-render the child views.
    this._didRenderChildViews = false;

    if (mixins = this.renderMixin) {
      len = mixins.length;
      for (idx = 0; idx < len; ++idx) { mixins[idx].call(this, context, true); }
    }

    this.endPropertyChanges();
  },

  /** Apply the attributes to the context. */
  applyAttributesToContext: function (context) {

  },

  /**
    @private

    Iterates over the view's `classNameBindings` array, inserts the value
    of the specified property into the `classNames` array, then creates an
    observer to update the view's element if the bound property ever changes
    in the future.
  */
  _applyClassNameBindings: function () {
    var classBindings = this.get('classNameBindings'),
        classNames = this.get('classNames'),
        dasherizedClass;

    if (!classBindings) { return; }

    // Loop through all of the configured bindings. These will be either
    // property names ('isUrgent') or property paths relative to the view
    // ('content.isUrgent')
    classBindings.forEach(function (property) {

      // Variable in which the old class value is saved. The observer function
      // closes over this variable, so it knows which string to remove when
      // the property changes.
      var oldClass;

      // Set up an observer on the context. If the property changes, toggle the
      // class name.
      var observer = function () {
        // Get the current value of the property
        var newClass = this._classStringForProperty(property);
        var elem = this.$();

        // If we had previously added a class to the element, remove it.
        if (oldClass) {
          elem.removeClass(oldClass);
          classNames.removeObject(oldClass);
        }

        // If necessary, add a new class. Make sure we keep track of it so
        // it can be removed in the future.
        if (newClass) {
          elem.addClass(newClass);
          classNames.push(newClass);
          oldClass = newClass;
        } else {
          oldClass = null;
        }
      };

      this.addObserver(property.split(':')[0], this, observer);

      // Get the class name for the property at its current value
      dasherizedClass = this._classStringForProperty(property);

      if (dasherizedClass) {
        // Ensure that it gets into the classNames array
        // so it is displayed when we render.
        classNames.push(dasherizedClass);

        // Save a reference to the class name so we can remove it
        // if the observer fires. Remember that this variable has
        // been closed over by the observer.
        oldClass = dasherizedClass;
      }

    }, this);
  },

  /**
    Iterates through the view's attribute bindings, sets up observers for each,
    then applies the current value of the attributes to the passed render buffer.

    @param {SC.RenderBuffer} buffer
  */
  _applyAttributeBindings: function (context) {
    var attributeBindings = this.get('attributeBindings'),
        attributeValue, elem, type;

    if (!attributeBindings) { return; }

    attributeBindings.forEach(function (attribute) {
      // Create an observer to add/remove/change the attribute if the
      // JavaScript property changes.
      var observer = function () {
        elem = this.$();
        var currentValue = elem.attr(attribute);
        attributeValue = this.get(attribute);

        type = typeof attributeValue;

        if ((type === 'string' || type === 'number') && attributeValue !== currentValue) {
          elem.attr(attribute, attributeValue);
        } else if (attributeValue && type === 'boolean') {
          elem.attr(attribute, attribute);
        } else if (attributeValue === NO) {
          elem.removeAttr(attribute);
        }
      };

      this.addObserver(attribute, this, observer);

      // Determine the current value and add it to the render buffer
      // if necessary.
      attributeValue = this.get(attribute);
      type = typeof attributeValue;

      if (type === 'string' || type === 'number') {
        context.setAttr(attribute, attributeValue);
      } else if (attributeValue && type === 'boolean') {
        // Apply boolean attributes in the form attribute="attribute"
        context.setAttr(attribute, attribute);
      }
    }, this);
  },

  /**
    @private

    Given a property name, returns a dasherized version of that
    property name if the property evaluates to a non-falsy value.

    For example, if the view has property `isUrgent` that evaluates to true,
    passing `isUrgent` to this method will return `"is-urgent"`.
  */
  _classStringForProperty: function (property) {
    var split = property.split(':'), className = split[1];
    property = split[0];

    var val = SC.getPath(this, property);

    // If value is a Boolean and true, return the dasherized property
    // name.
    if (val === YES) {
      if (className) { return className; }

      // Normalize property path to be suitable for use
      // as a class name. For exaple, content.foo.barBaz
      // becomes bar-baz.
      return SC.String.dasherize(property.split('.').get('lastObject'));

    // If the value is not NO, undefined, or null, return the current
    // value of the property.
    } else if (val !== NO && val !== undefined && val !== null) {
      return val;

    // Nothing to display. Return null so that the old class is removed
    // but no new class is added.
    } else {
      return null;
    }
  },

  /**
    Your render method should invoke this method to render any child views,
    especially if this is the first time the view will be rendered.  This will
    walk down the childView chain, rendering all of the children in a nested
    way.

    @param {SC.RenderContext} context the context
    @returns {SC.RenderContext} the render context
    @test in render
  */
  renderChildViews: function (context) {
    var cv = this.get('childViews'), len = cv.length, idx, view;
    for (idx = 0; idx < len; ++idx) {
      view = cv[idx];
      if (!view) { continue; }
      context = context.begin(view.get('tagName'));
      view.renderToContext(context);
      context = context.end();
    }

    // Track that renderChildViews was called in case it was called directly
    // in a render method.
    this._didRenderChildViews = true;

    return context;
  },

  /** @private -
    override to add support for theming or in your view
  */
  render: function () { },

  // ..........................................................
  // STANDARD RENDER PROPERTIES
  //

  /**
    A list of properties on the view to translate dynamically into attributes on
    the view's layer (element).

    When the view is rendered, the value of each property listed in
    attributeBindings will be inserted in the element.  If the value is a
    Boolean, the attribute name itself will be inserted.  As well, as the
    value of any of these properties changes, the layer will update itself
    automatically.

    This is an easy way to set custom attributes on the View without
    implementing it through a render or update function.

    For example,

        // ...  MyApp.MyView

        attributeBindings: ['aria-valuenow', 'disabled'],

        'aria-valuenow': function () {
          return this.get('value');
        }.property('value').cacheable(), // adds 'aria-valuenow="{value}"' attribute

        disabled: YES, // adds 'disabled="disabled"' attribute

        // ...

    @type Array
    @default null
  */
  attributeBindings: null,


  /**
    Tag name for the view's outer element.  The tag name is only used when
    a layer is first created.  If you change the tagName for an element, you
    must destroy and recreate the view layer.

    @type String
    @default 'div'
  */
  tagName: 'div',

  /**
    Standard CSS class names to apply to the view's outer element.  These class
    names are used in addition to any defined on the view's superclass.

    @type Array
    @default []
  */
  classNames: [],

  /**
    A list of local property names to translate dynamically into standard
    CSS class names on your view's layer (element).

    Each entry in the array should take the form "propertyName:css-class".
    For example, "isRed:my-red-view" will cause the class "my-red-view" to
    be appended if the property "isRed" is (or becomes) true, and removed
    if it later becomes false (or null/undefined).

    Optionally, you may provide just the property name, in which case it will
    be dasherized and used as the class name.  For example, including
    "isUpsideDown" will cause the view's isUpsideDown property to mediate the
    class "is-upside-down".

    Instead of a boolean value, your property may return a string, which will
    be used as the class name for that entry.  Use caution when returning other
    values; numbers will be appended verbatim and objects will be stringified,
    leading to unintended results such as class="4" or class="Object object".

    Class names mediated by these bindings are used in addition to any that
    you've listed in the classNames property.

    @type Array
  */
  classNameBindings: null,

  /**
    Tool tip property that will be set to the title attribute on the HTML
    rendered element.

    @type String
  */
  toolTip: null,

  /**
    The computed tooltip.  This is generated by localizing the toolTip
    property if necessary.

    @type String
  */
  displayToolTip: function () {
    var ret = this.get('toolTip');
    return (ret && this.get('localize')) ? SC.String.loc(ret) : (ret || '');
  }.property('toolTip', 'localize').cacheable(),

  /**
    Determines if the user can select text within the view.  Normally this is
    set to NO to disable text selection.  You should set this to YES if you
    are creating a view that includes editable text.  Otherwise, settings this
    to YES will probably make your controls harder to use and it is not
    recommended.

    @type Boolean
    @readOnly
  */
  isTextSelectable: NO,

  /**
    You can set this array to include any properties that should immediately
    invalidate the display.  The display will be automatically invalidated
    when one of these properties change.

    These are the properties that will be visible to any Render Delegate.
    When the RenderDelegate asks for a property it needs, the view checks the
    displayProperties array. It first looks for the property name prefixed
    by 'display'; for instance, if the render delegate needs a 'title',
    the view will attempt to find 'displayTitle'. If there is no 'displayTitle'
    in displayProperties, the view will then try 'title'. If 'title' is not
    in displayProperties either, an error will be thrown.

    This allows you to avoid collisions between your view's API and the Render
    Delegate's API.

    Implementation note:  'isVisible' is also effectively a display property,
    but it is not declared as such because it is observed separately in
    order to manage the view's internal state.

    @type Array
    @readOnly
  */
  displayProperties: [],

  // .......................................................
  // SC.RESPONDER SUPPORT
  //

  /** @property
    The nextResponder is usually the parentView.
  */
  nextResponder: function () {
    return this.get('parentView');
  }.property('parentView').cacheable(),


  /** @property
    Set to YES if your view is willing to accept first responder status.  This
    is used when calculating key responder loop.
  */
  acceptsFirstResponder: NO,

  // .......................................................
  // CORE DISPLAY METHODS
  //

  /** @private
    Caches the layerId to detect when it changes.
    */
  _lastLayerId: null,

  /** @private
    Setup a view, but do not finish waking it up.

     - configure childViews
     - Determine the view's theme
     - Fetch a render delegate from the theme, if necessary
     - register the view with the global views hash, which is used for event
       dispatch
  */
  init: function () {
    var childViews, layerId;

    arguments.callee.base.apply(this,arguments);

    layerId = this._lastLayerId = this.get('layerId');

    // Register the view for event handling. This hash is used by
    // SC.RootResponder to dispatch incoming events.
    
    if (SC.View.views[layerId]) {
      throw new Error("Developer Error: A view with layerId, '%@', already exists.  Each view must have a unique layerId.".fmt(this.get('layerId')));
    }
    
    SC.View.views[layerId] = this;

    // setup classNames
    this.classNames = this.get('classNames').slice();

    // setup child views.  be sure to clone the child views array first
    childViews = this.childViews = this.get('childViews').slice();
    this.createChildViews(); // setup child Views
  },

  /**
    Frame describes this view's current bounding rect, relative to its parent view. You
    can use this, for example, to reliably access a width for a view whose layout is
    defined with left and right. (Note that width and height values are calculated in
    the parent view's frame of reference as well, which has consequences for scaled
    views.)

    @type Rect
    @test in layoutStyle
  */
  frame: function () {
    return this.computeFrameWithParentFrame(null);
  }.property('useStaticLayout').cacheable(),    // We depend on the layout, but layoutDidChange will call viewDidResize to check the frame for us

  /**
    Computes the frame of the view by examining the view's DOM representation.
    If no representation exists, returns null.

    If the view has a parent view, the parent's bounds will be taken into account when
    calculating the frame.

    @returns {Rect} the computed frame
  */
  computeFrameWithParentFrame: function () {
    var layer,                            // The view's layer
        pv = this.get('parentView'),      // The view's parent view (if it exists)
        f;                                // The layer's coordinates in the document

    // need layer to be able to compute rect
    if (layer = this.get('layer')) {
      f = SC.offset(layer); // x,y
      if (pv) { f = pv.convertFrameFromView(f, null); }

      /*
        TODO Can probably have some better width/height values - CC
        FIXME This will probably not work right with borders - PW
      */
      f.width = layer.offsetWidth;
      f.height = layer.offsetHeight;

      return f;
    }

    // Unable to compute yet
    if (this.get('hasLayout')) {
      return null;
    } else {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
  },

  /** @private Call the method recursively on all child views. */
  _callOnChildViews: function (methodName, isTopDown, context) {
    var childView,
      childViews = this.get('childViews'),
      method,
      shouldContinue;

    for (var i = childViews.length - 1; i >= 0; i--) {
      childView = childViews[i];

      // We allow missing childViews in the array so ignore them.
      if (!childView) { continue; }

      // Look up the method on the child.
      method = childView[methodName];

      // Call the method on this view *before* its children.
      if (isTopDown === undefined || isTopDown) {
        shouldContinue = method.call(childView, context);
      }

      // Recurse.
      if (shouldContinue === undefined || shouldContinue) {
        childView._callOnChildViews(methodName, isTopDown, context);
      }

      // Call the method on this view *after* its children.
      if (isTopDown === false) {
        method.call(childView, context);
      }
    }
  },

  /**
    The clipping frame returns the visible portion of the view, taking into
    account the clippingFrame of the parent view.  (Note that, in contrast
    to `frame`, `clippingFrame` is in the context of the view itself, not
    its parent view.)

    Normally this will be calculated based on the intersection of your own
    clippingFrame and your parentView's clippingFrame.

    @type Rect
  */
  clippingFrame: function () {
    var f = this.get('frame');

    // FAST PATH: No frame, no clipping frame.
    if (!f) return null;

    /*jshint eqnull:true */
    var scale = (f.scale == null) ? 1 : f.scale,
        pv = this.get('parentView'),
        pcf = pv ? pv.get('clippingFrame') : null,
        ret;

    // FAST PATH: No parent clipping frame, no change. (The origin and scale are reset from parent view's
    // context to our own.)
    if (!pcf) return { x: 0, y: 0, width: f.width / scale, height: f.height / scale};

    // Get the intersection.
    ret = SC.intersectRects(pcf, f);

    // Reorient the top-left from the parent's origin to ours.
    ret.x -= f.x;
    ret.y -= f.y;

    // If we're scaled, we have to scale the intersected rectangle from our parent's frame of reference
    // to our own.
    if (scale !== 1) {
      var scaleX, scaleY;
      // We're scaling from parent space into our space, so the scale is reversed. (Layout scale may be an array.)
      if (SC.typeOf(scale) === SC.T_ARRAY) {
        scaleX = 1 / scale[0];
        scaleY = 1 / scale[1];
      } else {
        scaleX = scaleY = 1 / scale;
      }

      // Convert the entire rectangle into our scale.
      ret.x *= scaleX;
      ret.width *= scaleX;
      ret.y *= scaleY;
      ret.height *= scaleY;
    }

    return ret;
  }.property('parentView', 'frame').cacheable(),

  /** @private
    This method is invoked whenever the clippingFrame changes, notifying
    each child view that its clippingFrame has also changed.
  */
  _sc_clippingFrameDidChange: function () {
    this.notifyPropertyChange('clippingFrame');
  },

  /**
    Removes the child view from the parent view *and* detaches it from the
    document.

    This does *not* remove the child view's layer (i.e. the node still exists,
    but is no longer in the document) and does *not* destroy the child view
    (i.e. it can still be re-attached to the document).

    Note that if the child view uses a transitionOut plugin, it will not be
    fully detached until the transition completes.  To force the view to detach
    immediately you can pass true for the optional `immediately` argument.

    If you wish to remove the child and discard it, use `removeChildAndDestroy`.

    @param {SC.View} view The view to remove as a child view.
    @param {Boolean} [immediately=false] Forces the child view to be removed immediately regardless if it uses a transitionOut plugin.
    @see SC.View#removeChildAndDestroy
    @returns {SC.View} receiver
  */
  removeChild: function (view, immediately) {
    if (view.get('isAttached')) {
      view._doDetach(immediately);
    }

    // If the view will transition out, wait for the transition to complete
    // before orphaning the view entirely.
    if (!immediately && view.get('viewState') === SC.CoreView.ATTACHED_BUILDING_OUT) {
      view.addObserver('isAttached', this, this._orphanChildView);
    } else {
      view._doOrphan();
    }

    return this;
  },

  /**
    Removes the child view from the parent view, detaches it from the document
    *and* destroys the view and its layer.

    Note that if the child view uses a transitionOut plugin, it will not be
    fully detached and destroyed until the transition completes.  To force the
    view to detach immediately you can pass true for the optional `immediately`
    argument.

    If you wish to remove the child and keep it for further re-use, use
    `removeChild`.

    @param {SC.View} view The view to remove as a child view and destroy.
    @param {Boolean} [immediately=false] Forces the child view to be removed and destroyed immediately regardless if it uses a transitionOut plugin.
    @see SC.View#removeChild
    @returns {SC.View} receiver
  */
  removeChildAndDestroy: function (view, immediately) {
    view._doDetach(immediately);

    // If the view will transition out, wait for the transition to complete
    // before destroying the view entirely.
    if (view.get('transitionOut') && !immediately) {
      view.addObserver('isAttached', this, this._destroyChildView);
    } else {
      view.destroy(); // Destroys the layer and the view.
    }

    return this;
  },

  /**
    Removes all children from the parentView *and* destroys them and their
    layers.

    Note that if any child view uses a transitionOut plugin, it will not be
    fully removed until the transition completes.  To force all child views to
    remove immediately you can pass true as the optional `immediately` argument.

    Tip: If you know that there are no transitions for the child views,
    you should pass true to optimize the document removal.

    @param {Boolean} [immediately=false] Forces all child views to be removed immediately regardless if any uses a transitionOut plugin.
    @returns {SC.View} receiver
  */
  removeAllChildren: function (immediately) {
    var childViews = this.get('childViews'),
      len = childViews.get('length'),
      i;

    // OPTIMIZATION!
    // If we know that we're removing all children and we are rendered, lets do the document cleanup in one sweep.
    // if (immediately && this.get('_isRendered')) {
    //   var layer,
    //     parentNode;

    //   // If attached, detach and track our parent node so we can re-attach.
    //   if (this.get('isAttached')) {
    //     layer = this.get('layer');
    //     parentNode = layer.parentNode;

    //     this._doDetach();
    //   }

    //   // Destroy our layer and thus all the children's layers in one move.
    //   this.destroyLayer();

    //   // Remove all the children.
    //   for (i = len - 1; i >= 0; i--) {
    //     this.removeChildAndDestroy(childViews.objectAt(i), immediately);
    //   }

    //   // Recreate our layer (now empty).
    //   this.createLayer();

    //   // Reattach our layer.
    //   if (parentNode && !this.get('isAttached')) { this._doAttach(parentNode); }
    // } else {
      for (i = len - 1; i >= 0; i--) {
        this.removeChildAndDestroy(childViews.objectAt(i), immediately);
      }
    // }

    return this;
  },

  /**
    Removes the view from its parentView, if one is found.  Otherwise
    does nothing.

    @returns {SC.View} receiver
  */
  removeFromParent: function () {
    var parent = this.get('parentView');
    if (parent) { parent.removeChild(this); }

    return this;
  },

  /** @private Observer for child views that are being discarded after transitioning out. */
  _destroyChildView: function (view) {
    // Commence destroying of the view once it is detached.
    if (!view.get('isAttached')) {
      view.removeObserver('isAttached', this, this._destroyChildView);
      view.destroy();
    }
  },

  /** @private Observer for child views that are being orphaned after transitioning out. */
  _orphanChildView: function (view) {
    // Commence orphaning of the view once it is detached.
    if (!view.get('isAttached')) {
      view.removeObserver('isAttached', this, this._orphanChildView);
      view._doOrphan();
    }
  },

  /**
    Completely destroys a view instance so that it may be garbage collected.

    You must call this method on a view to destroy the view (and all of its
    child views). This will remove the view from any parent, detach the
    view's layer from the DOM if it is attached and clear the view's layer
    if it is rendered.

    Once a view is destroyed it can *not* be reused.

    @returns {SC.View} receiver
  */
  destroy: function () {
    // Fast path!
    if (this.get('isDestroyed')) { return this; }

    // Do generic destroy. It takes care of mixins and sets isDestroyed to YES.
    // Do this first, since it cleans up bindings that may apply to parentView
    // (which we will soon null out).
    var ret = arguments.callee.base.apply(this,arguments);

    // If our parent is already destroyed, then we can defer destroying ourself
    // and our own child views momentarily.
    if (this.getPath('parentView.isDestroyed')) {
      // Complete the destroy in a bit.
      this.invokeNext(this._destroy);
    } else {
      // Immediately remove the layer if attached (ignores transitionOut). This
      // will detach the layer for all child views as well.
      if (this.get('isAttached')) {
        this._doDetach(true);
      }

      // Clear the layer if rendered.  This will clear all child views layer
      // references as well.
      if (this.get('_isRendered')) {
        this._doDestroyLayer();
      }

      // Complete the destroy.
      this._destroy();
    }

    // Remove the view from the global hash.
    delete SC.View.views[this.get('layerId')];

    // Destroy any children.  Loop backwards since childViews will shrink.
    var childViews = this.get('childViews');
    for (var i = childViews.length - 1; i >= 0; i--) {
      childViews[i].destroy();
    }

    return ret;
  },

  /** @private */
  _destroy: function () {
    // Orphan the view if adopted.
    this._doOrphan();

    delete this.page;
  },

  /**
    This method is called when your view is first created to setup any  child
    views that are already defined on your class.  If any are found, it will
    instantiate them for you.

    The default implementation of this method simply steps through your
    childViews array, which is expects to either be empty or to contain View
    designs that can be instantiated

    Alternatively, you can implement this method yourself in your own
    subclasses to look for views defined on specific properties and then build
     a childViews array yourself.

    Note that when you implement this method yourself, you should never
    instantiate views directly.  Instead, you should use
    this.createChildView() method instead.  This method can be much faster in
    a production environment than creating views yourself.

    @returns {SC.View} receiver
  */
  createChildViews: function () {
    var childViews = this.get('childViews'),
        len        = childViews.length,
        isNoLongerValid = false,
        idx, key, view;

    this.beginPropertyChanges();

    // swap the array
    for (idx = 0; idx < len; ++idx) {
      key = view = childViews[idx];

      // is this is a key name, lookup view class
      if (typeof key === SC.T_STRING) {
        view = this[key];
      } else {
        key = null;
      }

      if (!view) {
        
        SC.warn("Developer Warning: The child view named '%@' was not found in the view, %@.  This child view will be ignored.".fmt(key, this));
        

        // skip this one.
        isNoLongerValid = true;
        childViews[idx] = null;
        continue;
      }

      // createChildView creates the view if necessary, but also sets
      // important properties, such as parentView
      view = this.createChildView(view);
      if (key) { this[key] = view; } // save on key name if passed

      childViews[idx] = view;
    }

    // Set childViews to be only the valid array.
    if (isNoLongerValid) { this.set('childViews', childViews.compact()); }

    this.endPropertyChanges();
    return this;
  },

  /**
    Instantiates a view to be added to the childViews array during view
    initialization. You generally will not call this method directly unless
    you are overriding createChildViews(). Note that this method will
    automatically configure the correct settings on the new view instance to
    act as a child of the parent.

    If the given view is a class, then createdByParent will be set to true on
    the returned instance.

    @param {Class} view A view class to create or view instance to prepare.
    @param {Object} [attrs={}] attributes to add
    @returns {SC.View} new instance
    @test in createChildViews
  */
  createChildView: function (view, attrs) {
    // Create the view if it is a class.
    if (view.isClass) {
      // attrs should always exist...
      if (!attrs) { attrs = {}; }

      // clone the hash that was given so we do not pollute it if it's being reused
      else { attrs = SC.clone(attrs); }

      // Assign the parentView & page to ourself.
      attrs.parentView = this;
      if (!attrs.page) { attrs.page = this.page; }

      // Track that we created this view.
      attrs.createdByParent = true;

      // Insert the autoMixins if defined
      var applyMixins = this.autoMixins;
      if (!!applyMixins) {
        applyMixins = SC.clone(applyMixins);
        applyMixins.push(attrs);
        view = view.create.apply(view, applyMixins);
      } else {
        view = view.create(attrs);
      }
    // Assign the parentView if the view is an instance.
    // TODO: This should not be accepting view instances, for the purpose of lazy code elsewhere in the framework.
    //       We should ensure users of `createChildViews` are using appendChild and other manipulation methods.
    } else {
      view.set('parentView', this);
      view._adopted();

      if (!view.get('page')) { view.set('page', this.page); }
    }

    return view;
  },

  /** walk like a duck */
  isView: YES,

  /**
    Default method called when a selectstart event is triggered. This event is
    only supported by IE. Used in sproutcore to disable text selection and
    IE8 accelerators. The accelerators will be enabled only in
    text selectable views. In FF and Safari we use the css style 'allow-select'.

    If you want to enable text selection in certain controls is recommended
    to override this function to always return YES , instead of setting
    isTextSelectable to true.

    For example in textfield you do not want to enable textSelection on the text
    hint only on the actual text you are entering. You can achieve that by
    only overriding this method.

    @param evt {SC.Event} the selectstart event
    @returns YES if selectable
  */
  selectStart: function (evt) {
    return this.get('isTextSelectable');
  },

  /**
    Used to block the contextMenu per view.

    @param evt {SC.Event} the contextmenu event
    @returns YES if the contextmenu will be allowed to show up
  */
  contextMenu: function (evt) {
    if (this.get('isContextMenuEnabled')) {
      evt.allowDefault();
      return YES;
    }
  },

  // ------------------------------------------------------------------------
  // Transitions
  //

  /**
    The transition plugin to use when this view is appended to the DOM.

    SC.CoreView uses a pluggable transition architecture where the transition
    setup, execution and cleanup can be handled by a specified transition
    plugin.

    There are a number of pre-built transition plugins available in the
    foundation framework:

      SC.View.BOUNCE_IN
      SC.View.FADE_IN
      SC.View.SLIDE_IN
      SC.View.SCALE_IN
      SC.View.SPRING_IN

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the SC.ViewTransitionProtocol protocol.

    @type Object (SC.ViewTransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionIn: null,

  /**
    The options for the given transition in plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, SC.View.SLIDE_IN accepts options
    like:

        transitionInOptions: {
          direction: 'left',
          duration: 0.25,
          timing: 'ease-in-out'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionInOptions: null,

  /**
    The transition plugin to use when this view is removed from the DOM.

    SC.View uses a pluggable transition architecture where the transition setup,
    execution and cleanup can be handled by a specified transition plugin.

    There are a number of pre-built transition plugins available in the
    foundation framework:

      SC.View.BOUNCE_OUT
      SC.View.FADE_OUT
      SC.View.SLIDE_OUT
      SC.View.SCALE_OUT
      SC.View.SPRING_OUT

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the SC.ViewTransitionProtocol protocol.

    @type Object (SC.ViewTransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionOut: null,

  /**
    The options for the given transition out plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, SC.View.SLIDE accepts options
    like:

        transitionOutOptions: {
          direction: 'right',
          duration: 0.15,
          timing: 'ease-in'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionOutOptions: null,

  /**
    The transition plugin to use when this view is made shown from being
    hidden.

    SC.CoreView uses a pluggable transition architecture where the transition setup,
    execution and cleanup can be handled by a specified transition plugin.

    There are a number of pre-built transition plugins available in the
    foundation framework:

      SC.View.BOUNCE_IN
      SC.View.FADE_IN
      SC.View.SLIDE_IN
      SC.View.SCALE_IN
      SC.View.SPRING_IN

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the SC.ViewTransitionProtocol protocol.

    @type Object (SC.ViewTransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionShow: null,

  /**
    The options for the given transition show plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, SC.View.SLIDE accepts options
    like:

        transitionShowOptions: {
          direction: 'left',
          duration: 0.25,
          timing: 'ease-in-out'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionShowOptions: null,

  /**
    The transition plugin to use when this view is hidden after being shown.

    SC.View uses a pluggable transition architecture where the transition setup,
    execution and cleanup can be handled by a specified transition plugin.

    There are a number of pre-built transition plugins available in the
    foundation framework:

      SC.View.BOUNCE_OUT
      SC.View.FADE_OUT
      SC.View.SLIDE_OUT
      SC.View.SCALE_OUT
      SC.View.SPRING_OUT

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the SC.ViewTransitionProtocol protocol.

    @type Object (SC.ViewTransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionHide: null,

  /**
    The options for the given transition hide plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, SC.View.SLIDE accepts options
    like:

        transitionHideOptions: {
          direction: 'right',
          duration: 0.15,
          timing: 'ease-in'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionHideOptions: null,

  // ............................................
  // Patches
  //

  /** @private
    Override this method to apply design modes to this view and
    its children.
    @see SC.View
  */
  updateDesignMode: function (lastDesignMode, designMode) {}
});

SC.CoreView.mixin(
  /** @scope SC.CoreView */ {

  /** @private walk like a duck -- used by SC.Page */
  isViewClass: YES,

  /**
    This method works just like extend() except that it will also preserve
    the passed attributes in case you want to use a view builder later, if
    needed.

    @param {Hash} attrs Attributes to add to view
    @returns {Class} SC.View subclass to create
    @function
  */
  design: function () {
    if (this.isDesign) {
      
      SC.Logger.warn("Developer Warning: .design() was called twice for %@.".fmt(this));
      
      return this;
    }

    var ret = this.extend.apply(this, arguments);
    ret.isDesign = YES;
    if (SC.ViewDesigner) {
      SC.ViewDesigner.didLoadDesign(ret, this, SC.A(arguments));
    }
    return ret;
  },

  extend: function () {
    var last = arguments[arguments.length - 1];

    if (last && !SC.none(last.theme)) {
      last.themeName = last.theme;
      delete last.theme;
    }

    return SC.Object.extend.apply(this, arguments);
  },

  /**
    Helper applies the layout to the prototype.
  */
  layout: function (layout) {
    this.prototype.layout = layout;
    return this;
  },

  /**
    Helper applies the classNames to the prototype
  */
  classNames: function (sc) {
    sc = (this.prototype.classNames || []).concat(sc);
    this.prototype.classNames = sc;
    return this;
  },

  /**
    Help applies the tagName
  */
  tagName: function (tg) {
    this.prototype.tagName = tg;
    return this;
  },

  /**
    Helper adds the childView
  */
  childView: function (cv) {
    var childViews = this.prototype.childViews || [];
    if (childViews === this.superclass.prototype.childViews) {
      childViews = childViews.slice();
    }
    childViews.push(cv);
    this.prototype.childViews = childViews;
    return this;
  },

  /**
    Helper adds a binding to a design
  */
  bind: function (keyName, path) {
    var p = this.prototype, s = this.superclass.prototype;
    var bindings = p._bindings;
    if (!bindings || bindings === s._bindings) {
      bindings = p._bindings = (bindings || []).slice();
    }

    keyName = keyName + "Binding";
    p[keyName] = path;
    bindings.push(keyName);

    return this;
  },

  /**
    Helper sets a generic property on a design.
  */
  prop: function (keyName, value) {
    this.prototype[keyName] = value;
    return this;
  },

  /**
    Used to construct a localization for a view.  The default implementation
    will simply return the passed attributes.
  */
  localization: function (attrs, rootElement) {
    // add rootElement
    if (rootElement) attrs.rootElement = SC.$(rootElement)[0];
    return attrs;
  },

  /**
    Creates a view instance, first finding the DOM element you name and then
    using that as the root element.  You should not use this method very
    often, but it is sometimes useful if you want to attach to already
    existing HTML.

    @param {String|Element} element
    @param {Hash} attrs
    @returns {SC.View} instance
  */
  viewFor: function (element, attrs) {
    var args = SC.$A(arguments); // prepare to edit
    if (SC.none(element)) {
      args.shift(); // remove if no element passed
    } else args[0] = { rootElement: SC.$(element)[0] };
    var ret = this.create.apply(this, arguments);
    args = args[0] = null;
    return ret;
  },

  /**
    Create a new view with the passed attributes hash.  If you have the
    Designer module loaded, this will also create a peer designer if needed.
  */
  create: function () {
    var last = arguments[arguments.length - 1];

    if (last && last.theme) {
      last.themeName = last.theme;
      delete last.theme;
    }

    var C = this, ret = new C(arguments);
    if (SC.ViewDesigner) {
      SC.ViewDesigner.didCreateView(ret, SC.$A(arguments));
    }
    return ret;
  },

  /**
    Applies the passed localization hash to the component views.  Call this
    method before you call create().  Returns the receiver.  Typically you
    will do something like this:

    view = SC.View.design({...}).loc(localizationHash).create();

    @param {Hash} loc
    @param rootElement {String} optional rootElement with prepped HTML
    @returns {SC.View} receiver
  */
  loc: function (loc) {
    var childLocs = loc.childViews;
    delete loc.childViews; // clear out child views before applying to attrs

    this.applyLocalizedAttributes(loc);
    if (SC.ViewDesigner) {
      SC.ViewDesigner.didLoadLocalization(this, SC.$A(arguments));
    }

    // apply localization recursively to childViews
    var childViews = this.prototype.childViews, idx = childViews.length,
      viewClass;
    while (--idx >= 0) {
      viewClass = childViews[idx];
      loc = childLocs[idx];
      if (loc && viewClass && typeof viewClass === SC.T_STRING) SC.String.loc(viewClass, loc);
    }

    return this; // done!
  },

  /**
    Internal method actually updates the localized attributes on the view
    class.  This is overloaded in design mode to also save the attributes.
  */
  applyLocalizedAttributes: function (loc) {
    SC.mixin(this.prototype, loc);
  },

  views: {}

});

// .......................................................
// OUTLET BUILDER
//

/**
  Generates a computed property that will look up the passed property path
  the first time you try to get the value.  Use this whenever you want to
  define an outlet that points to another view or object.  The root object
  used for the path will be the receiver.
*/
SC.outlet = function (path, root) {
  return function (key) {
    return (this[key] = SC.objectForPropertyPath(path, (root !== undefined) ? root : this));
  }.property();
};

/** @private on unload clear cached divs. */
SC.CoreView.unload = function () {
  // delete view items this way to ensure the views are cleared.  The hash
  // itself may be owned by multiple view subclasses.
  var views = SC.View.views;
  if (views) {
    for (var key in views) {
      if (!views.hasOwnProperty(key)) continue;
      delete views[key];
    }
  }
};

/**
  @class

  Base class for managing a view.  Views provide two functions:

   1. They display – translating your application's state into drawing
     instructions for the web browser, and
   2. They react – acting as responders for incoming keyboard, mouse, and touch
     events.

  View Basics
  ====

  SproutCore's view layer is made up of a tree of SC.View instances, nested
  using the `childViews` list – usually an array of local property names. You
  position each view by specifying a set of layout keys, like 'left', 'right',
  'width', or 'centerX', in a hash on the layout property. (See the 'layout'
  documentation for more.)

  Other than positioning, SproutCore relies on CSS for all your styling needs.
  Set an array of CSS classes on the `classNames` property, then style them with
  standard CSS. (SproutCore's build tools come with Sass support built in, too.)
  If you have a class that you want automatically added and removed as another
  property changes, take a look at `classNameBindings`.

  Different view classes do different things. The so-called "Big Five" view
  classes are SC.LabelView, for displaying (optionally editable, optionally
  localizable) text; SC.ButtonView, for the user to poke; SC.CollectionView
  (most often as its subclass SC.ListView) for displaying an array of content;
  SC.ContainerView, for easily swapping child views in and out; and SC.ScrollView,
  for containing larger views and allowing them to be scrolled.

  All views live in panes (subclasses of SC.Pane, like SC.MainPane and SC.PanelPane),
  which are parentless views that know how to append themselves directly to the document.
  Panes also serve as routers for events, like mouse, touch and keyboard events, that are
  bound for their views. (See "View Events" below for more.)

  For best performance, you should define your view and pane instances with `extend()`
  inside an SC.Page instance, getting them as needed with `get`. As its name suggests,
  SC.Page's only job is to instantiate views once when first requested, deferring the
  expensive view creation process until each view is needed. Correctly using SC.Page is
  considered an important best practice for high-performance applications.

  View Initialization
  ====

  When a view is setup, there are several methods you can override that
  will be called at different times depending on how your view is created.
  Here is a guide to which method you want to override and when:

   - `init` -- override this method for any general object setup (such as
     observers, starting timers and animations, etc) that you need to happen
     every time the view is created, regardless of whether or not its layer
     exists yet.
   - `render` -- override this method to generate or update your HTML to reflect
     the current state of your view.  This method is called both when your view
     is first created and later anytime it needs to be updated.
   - `update` -- Normally, when a view needs to update its content, it will
     re-render the view using the render() method.  If you would like to
     override this behavior with your own custom updating code, you can
     replace update() with your own implementation instead.
   - `didCreateLayer` -- the render() method is used to generate new HTML.
     Override this method to perform any additional setup on the DOM you might
     need to do after creating the view.  For example, if you need to listen
     for events.
   - `willDestroyLayer` -- if you implement didCreateLayer() to setup event
     listeners, you should implement this method as well to remove the same
     just before the DOM for your view is destroyed.
   - `didAppendToDocument` -- in theory all DOM setup could be done
     in didCreateLayer() as you already have a DOM element instantiated.
     However there is cases where the element has to be first appended to the
     Document because there is either a bug on the browser or you are using
     plugins which objects are not instantiated until you actually append the
     element to the DOM. This will allow you to do things like registering
     DOM events on flash or quicktime objects.
   - `willRemoveFromDocument` -- This method is called on the view immediately
     before its layer is removed from the DOM. You can use this to reverse any
     setup that is performed in `didAppendToDocument`.

  View Events
  ====

  One of SproutCore's optimizations is application-wide event delegation: SproutCore
  handles and standardizes events for you before sending them through your view layer's
  chain of responding views. You should never need to attach event listeners to elements;
  instead, just implement methods like `click`, `doubleClick`, `mouseEntered` and
  `dataDragHover` on your views.

  Note that events generally bubble up an event's responder chain, which is made up of the
  targeted view (i.e. the view whose DOM element received the event), and its chain of
  parentViews up to its pane. (In certain rare cases, you may wish to manipulate the responder
  chain to bypass certain views; you can do so by overriding a view's `nextResponder` property.)

  Simple mouse click events
  ----
  In many situations, all you need are clicks - in which case, just implement `click` or
  `doubleClick` on your views. Note that these events bubble up the responder chain until
  they encounter a view which implements the event method. For example, if a view and its
  parent both implement `click`, the parent will not be notified of the click. (If you want a
  view to handle the event AND allow the event to keep bubbling to its parent views, no
  problem: just be sure to return NO from the event method.)
  - `click` -- Called on a view when the user clicks the mouse on a view. (Note that the view
    on which the user lifts the mouse button will receive the `click` event, regardless of
    whether the user depressed the mouse button elsewhere. If you need finer-grained control
    than this, see "Granular mouse click events" below.)
  - `doubleClick` -- Called on a view when a user has double-clicked it. Double-clicks are
    triggered when two clicks of the same button happen within eight pixels and 250ms of each
    other. (If you need finer-grained control than this, see "Granular mouse click events"
    below.) The same view may receive both `click` and `doubleClick` events.

  Note that defining application behavior directly in event handlers is usually a bad idea; you
  should follow the target/action pattern when possible. See SC.ButtonView and SC.ActionSupport.
  Also note that you will not need to implement event handling yourself on most built-in
  SproutCore controls.

  Note that `click` and `doubleClick` event handlers on your views will not be notified of touch
  events; you must also implement touch handling. See "Touch events" below.

  Mouse movement events
  ----
  SproutCore normalizes (and brings sanity to) mouse movement events by calculating when
  the mouse has entered and exited views, and sending the correct event to each view in
  the responder chain. For example, if a mouse moves within a parent view but crosses from
  one child view to another, the parent view will receive a mouseMoved event while the child
  views will receive mouseEntered and mouseExit events.

  In contrast to mouse click events, mouse movement events are called on the entire responder
  chain regardless of how you handle it along the way - a view and its parent, both implementing
  event methods, will both be notified of the event.

  - `mouseEntered` -- Called when the cursor first enters a view. Called on every view that has
    just entered the responder chain.
  - `mouseMoved` -- Called when the cursor moves over a view.
  - `mouseExited` -- Called when the cursor leaves a view. Called on every view that has
    just exited the responder chain.

  Granular mouse click events
  ----
  If you need more granular handling of mouse click events than what is provided by `click`
  and `doubleClick`, you can handle their atomic components `mouseDown`, `mouseDrag` and
  `mouseUp`. Like the compound events, these events bubble up their responder chain towards
  the pane until they find an event which implements the event handler method. (Again, to
  handle an event but allow it to continue bubbling, just return NO.)

  It bears emphasizing that `mouseDrag` and `mouseUp` events for a given mouse click sequence
  are *only ever called* on the view which successfully responded to the `mouseDown` event. This
  gives `mouseDown` control over which view responder-chain is allowed to handle the entire
  click sequence.

  (Note that because of how events bubble up the responder chain, if a child view implements
  `mouseDown` but not `mouseDrag` or `mouseUp`, those events will bubble to its parent. This
  may cause unexpected behavior if similar events are handled at different parts of your view
  hierarchy, for example if you handle `mouseDown` in a child and a parent, and only handle
  `mouseUp` in the parent.)

  - `mouseDown` -- Called on the target view and responder chain when the user depresses a
    button. A view must implement `mouseDown` (and not return NO) in order to be notified
    of the subsequent drag and up events.
  - `mouseDrag` -- Called on the target view if it handled mouseDown. A view must implement
    mouseDown (and not return NO) in order to receive mouseDrag; only the view which handled a
    given click sequence's mouseDown will receive `mouseDrag` events (and will continue to
    receive them even if the user drags the mouse off of it).
  - `mouseUp` -- Called on the target view when the user lifts a mouse button. A view must
    implement mouseDown (and not return NO) in order to receive mouseUp.

  SproutCore implements a higher-level API for handling in-application dragging and dropping.
  See `SC.Drag`, `SC.DragSourceProtocol`, `SC.DragDataSourceProtocol`, and `SC.DropTargetProtocol`
  for more.

  Data-drag events
  ----
  Browsers implement a parallel system of events for drags which bring something with them: for
  example, dragging text, an image, a URL or (in modern browsers) a file. They behave differently,
  and require different responses from the developer, so SproutCore implements them as a separate
  set of "data drag" events. These behave much like mouse events; the data-drag movement events
  bubble indiscriminately, and the data-drag drop event bubbles until it finds a view which handles
  it (and doesn't return NO).

  By default, SproutCore cancels the default behavior of any data drag event which carries URLs
  or files, as by default these would quit the app and open the dragged item in the browser. If
  you wish to implement data drag-and-drop support in your application, you should set the event's
  dataTransfer.dropEffect property to 'copy' in a `dataDragHovered` event handler.

  - `dataDragEntered` -- Triggered when a data drag enters a view. You can use this handler to
    update the view to visually signal that a drop is possible.
  - `dataDragHovered` -- Triggered when the browser sends a dragover event to a view. If you want
    to support dropping data on your view, you must set the event's `dataTransfer.dropEffect`
    property to 'copy' (or related). Note that `dataDragHovered` is given access to dragenter
    events as well, so you do not need to worry about this in your `dataDragEntered` methods.
  - `dataDragDropped` -- If the last hover event's dropEffect was set correctly, this event will
    give the view access to the data that was dropped. This event bubbles up the responder chain
    until it finds a view which handles it (and doesn't return NO).
  - `dataDragExited` -- Triggered when a data drag leaves a view. You can use this handler to
    update the view to remove the visual drop signal. This event is fired regardless of whether
    a drop occurred.


  Touch events
  ----
  Touch events can be much more complicated than mouse events: multiple touches may be in flight
  at once, and views may wish to handle average touches rather than individual touches.

  Basic support for touch events is required to make your application touch-aware. (You will not
  need to implement touch support for built-in SproutCore controls, which are touch-aware out of
  the box.) The basic touch event handlers are `touchStart` and `touchEnd`; if all you need is
  basic support then you can simply proxy these events to their mouse counterparts.

  The counterpart to `mouseDragged` is `touchesDragged`, which is passed two arguments: a special
  multitouch event object which includes methods for accessing information about all currently
  in-flight touches, and a list of touches active on the current view. If you need to check the
  status of touches currently being handled by other views, the special multitouch event object
  exposes the `touchesForView` method. It also exposes the convenient `averagedTouchesForView`
  method, which gives you easy access to an average touch center and distance. Unlike `mouseDragged`,
  `touchesDragged` does not bubble, being only called on views whic handled `touchStart` for touches
  which have moved.

  To facilitate intuitive behavior in situations like scroll views with touch handlers inside them,
  you may capture a touch from part way up its responder chain before it has a chance to bubble
  up from the target. To capture a touch, expose a method on your view called `captureTouch` which
  accepts the touch as its only argument, and which returns YES if you would like to capture that
  touch. A captured touch will not bubble as normal, instead bubbling up from the capture point. Any
  child views will not have the opportunity to handle the captured event unless you implement custom
  responder swapping yourself.

  Touch events bubble differently than mouse and keyboard events. The initial reverse `captureTouch`
  bubbling is followed by regular `touchStart` bubbling; however, once this process has found a view
  that's willing to respond to the touch, further events are applied only to that view. If a view
  wishes to assign respondership for a touch to a different view, it can call one of several methods
  on the touch object. For a fuller discussion of touch events, touch responder behavior, and the touch
  object itself, see the documentation for SC.Touch.

  Keyboard events
  ----
  The basic key events are `keyDown` and `keyUp`. In order to be notified of keyboard events,
  a view must set `acceptsFirstResponder` to `YES`, and be on an active pane with
  `acceptsKeyPane` set to YES. (You may also need to call `becomeFirstResponder` on your view
  on a `mouseDown`, for example, to focus it. You can verify whether your view has successfully
  received first responder status by checking `isFirstResponder`.)

  Note that key events bubble similarly to mouse click events: they will stop bubbling if they
  encounter a view which handles the event and does not return NO.

  SproutCore implements a set of very convenient, higher-level keyboard events for action keys
  such as *tab*, *enter*, and the arrow keys. These are not triggered automatically, but you
  can gain access to them by proxying the keyboard event of your choice to `interpretKeyEvent`.
  For example:

        // Proxy the keyboard event to SC's built-in interpreter.
        keyDown: function(evt) {
          return this.interpretKeyEvents(evt);
        },
        // The interpreter will trigger the view's `cancel` event if the escape key was pressed.
        cancel: function(evt) {
          console.log('The escape key was pressed.'');
        }

  This will analyze the key press and fire an appropriate event. These events include, but are
  not limited to:

  - `moveUp`, `moveDown`, `moveLeft`, `moveRight` -- The arrow keys
  - `insertNewline` -- The enter key (note the lower-case 'line')
  - `cancel` -- The escape key
  - `insertTab` -- The tab key
  - `insertBacktab` -- Shift + the tab key
  - `moveToBeginningOfDocument` -- The *home* key
  - `moveToEndOfDocument` -- The *end* key
  - `pageUp` and `pageDown`
  - `moveLeftAndModifySelection` -- Shift + the left arrow
  - `selectAll` -- Ctrl + A / Cmd + A

  For a full list of available methods, see the key values on SC.BASE_KEY_BINDINGS and
  SC.MODIFIED_KEY_BINDINGS.

  @extends SC.Responder
  @extends SC.DelegateSupport
  @since SproutCore 1.0

*/
SC.View = SC.CoreView.extend(/** @scope SC.View.prototype */{
  classNames: ['sc-view'],

  displayProperties: [],

  /** @private Enhance. */
  _executeQueuedUpdates: function () {
    arguments.callee.base.apply(this,arguments);

    // Enabled
    // Update the layout style of the layer if necessary.
    if (this._enabledStyleNeedsUpdate) {
      this._doUpdateEnabledStyle();
    }

    // Layout
    // Update the layout style of the layer if necessary.
    if (this._layoutStyleNeedsUpdate) {
      this._doUpdateLayoutStyle();
    }
  },

  /** Apply the attributes to the context. */
  applyAttributesToContext: function (context) {
    // Cursor
    var cursor = this.get('cursor');
    if (cursor) { context.addClass(cursor.get('className')); }

    // Enabled
    if (!this.get('isEnabled')) {
      context.addClass('disabled');
      context.setAttr('aria-disabled', 'true');
    }

    // Layout
    // Have to pass 'true' for second argument for legacy.
    this.renderLayout(context, true);

    if (this.get('useStaticLayout')) { context.addClass('sc-static-layout'); }

    // Background color defaults to null; for performance reasons we should ignore it
    // unless it's ever been non-null.
    var backgroundColor = this.get('backgroundColor');
    if (!SC.none(backgroundColor) || this._scv_hasBackgroundColor) {
      this._scv_hasBackgroundColor = YES;
      if (backgroundColor) context.setStyle('backgroundColor', backgroundColor);
      else context.removeStyle('backgroundColor');
    }

    // Theming
    var theme = this.get('theme');
    var themeClassNames = theme.classNames, idx, len = themeClassNames.length;

    for (idx = 0; idx < len; idx++) {
      context.addClass(themeClassNames[idx]);
    }

    arguments.callee.base.apply(this,arguments);

    var renderDelegate = this.get('renderDelegate');
    if (renderDelegate && renderDelegate.className) {
      context.addClass(renderDelegate.className);
    }

    
    if (renderDelegate && renderDelegate.name) {
      SC.Logger.error("Render delegates now use 'className' instead of 'name'.");
      SC.Logger.error("Name '%@' will be ignored.", renderDelegate.name);
    }
    
  },

  /**
    Computes what the frame of this view would be if the parent were resized
    to the passed dimensions.  You can use this method to project the size of
    a frame based on the resize behavior of the parent.

    This method is used especially by the scroll view to automatically
    calculate when scrollviews should be visible.

    Passing null for the parent dimensions will use the actual current
    parent dimensions.  This is the same method used to calculate the current
    frame when it changes.

    @param {Rect} pdim the projected parent dimensions (optional)
    @returns {Rect} the computed frame
  */
  computeFrameWithParentFrame: function (pdim) {
    // Layout.
    var layout = this.get('layout'),
        f;

    // We can't predict the frame for static layout, so just return the view's
    // current frame (see original computeFrameWithParentFrame in views/view.js)
    if (this.get('useStaticLayout')) {
      f = arguments.callee.base.apply(this,arguments);
      f = f ? this._sc_adjustForBorder(f, layout) : null;
      f = f ? this._sc_adjustForScale(f, layout) : null;
      return f;
    }

    f = {};

    var error, layer, AUTO = SC.LAYOUT_AUTO,
        dH, dW, //shortHand for parentDimensions
        lR = layout.right,
        lL = layout.left,
        lT = layout.top,
        lB = layout.bottom,
        lW = layout.width,
        lH = layout.height,
        lcX = layout.centerX,
        lcY = layout.centerY;

    if (lW === AUTO) {
      SC.throw(("%@.layout() cannot use width:auto if staticLayout is disabled").fmt(this), "%@".fmt(this), -1);
    }

    if (lH === AUTO) {
      SC.throw(("%@.layout() cannot use height:auto if staticLayout is disabled").fmt(this), "%@".fmt(this), -1);
    }

    if (!pdim) { pdim = this.computeParentDimensions(layout); }
    dH = pdim.height;
    dW = pdim.width;

    // handle left aligned and left/right
    if (!SC.none(lL)) {
      if (SC.isPercentage(lL)) {
        f.x = dW * lL;
      } else {
        f.x = lL;
      }

      if (lW !== undefined) {
        if (lW === AUTO) { f.width = AUTO; }
        else if (SC.isPercentage(lW)) { f.width = dW * lW; }
        else { f.width = lW; }
      } else { // better have lR!
        f.width = dW - f.x;
        if (lR && SC.isPercentage(lR)) { f.width = f.width - (lR * dW); }
        else { f.width = f.width - (lR || 0); }
      }

    // handle right aligned
    } else if (!SC.none(lR)) {
      if (SC.none(lW)) {
        if (SC.isPercentage(lR)) {
          f.width = dW - (dW * lR);
        }
        else f.width = dW - lR;
        f.x = 0;
      } else {
        if (lW === AUTO) f.width = AUTO;
        else if (SC.isPercentage(lW)) f.width = dW * lW;
        else f.width = (lW || 0);
        if (SC.isPercentage(lW)) f.x = dW - (lR * dW) - f.width;
        else f.x = dW - lR - f.width;
      }

    // handle centered
    } else if (!SC.none(lcX)) {
      if (lW === AUTO) f.width = AUTO;
      else if (SC.isPercentage(lW)) f.width = lW * dW;
      else f.width = (lW || 0);
      if (SC.isPercentage(lcX)) f.x = (dW - f.width) / 2 + (lcX * dW);
      else f.x = (dW - f.width) / 2 + lcX;
    } else {
      f.x = 0; // fallback
      if (SC.none(lW)) {
        f.width = dW;
      } else {
        if (lW === AUTO) f.width = AUTO;
        if (SC.isPercentage(lW)) f.width = lW * dW;
        else f.width = (lW || 0);
      }
    }

    // handle top aligned and top/bottom
    if (!SC.none(lT)) {
      if (SC.isPercentage(lT)) f.y = lT * dH;
      else f.y = lT;
      if (lH !== undefined) {
        if (lH === AUTO) f.height = AUTO;
        else if (SC.isPercentage(lH)) f.height = lH * dH;
        else f.height = lH;
      } else { // better have lB!
        if (lB && SC.isPercentage(lB)) f.height = dH - f.y - (lB * dH);
        else f.height = dH - f.y - (lB || 0);
      }

    // handle bottom aligned
    } else if (!SC.none(lB)) {
      if (SC.none(lH)) {
        if (SC.isPercentage(lB)) f.height = dH - (lB * dH);
        else f.height = dH - lB;
        f.y = 0;
      } else {
        if (lH === AUTO) f.height = AUTO;
        if (lH && SC.isPercentage(lH)) f.height = lH * dH;
        else f.height = (lH || 0);
        if (SC.isPercentage(lB)) f.y = dH - (lB * dH) - f.height;
        else f.y = dH - lB - f.height;
      }

    // handle centered
    } else if (!SC.none(lcY)) {
      if (lH === AUTO) f.height = AUTO;
      if (lH && SC.isPercentage(lH)) f.height = lH * dH;
      else f.height = (lH || 0);
      if (SC.isPercentage(lcY)) f.y = (dH - f.height) / 2 + (lcY * dH);
      else f.y = (dH - f.height) / 2 + lcY;

    // fallback
    } else {
      f.y = 0; // fallback
      if (SC.none(lH)) {
        f.height = dH;
      } else {
        if (lH === AUTO) f.height = AUTO;
        if (SC.isPercentage(lH)) f.height = lH * dH;
        else f.height = lH || 0;
      }
    }

    f.x = Math.floor(f.x);
    f.y = Math.floor(f.y);
    if (f.height !== AUTO) f.height = Math.floor(f.height);
    if (f.width !== AUTO) f.width = Math.floor(f.width);

    // if width or height were set to auto and we have a layer, try lookup
    if (f.height === AUTO || f.width === AUTO) {
      layer = this.get('layer');
      if (f.height === AUTO) f.height = layer ? layer.clientHeight : 0;
      if (f.width === AUTO) f.width = layer ? layer.clientWidth : 0;
    }

    // Okay we have all our numbers. Let's adjust them for things.

    // First, adjust for border.
    f = this._sc_adjustForBorder(f, layout);

    // Make sure the width/height fix their min/max (note the inlining of SC.none for performance)...
    /*jshint eqnull:true */
    if ((layout.maxHeight != null) && (f.height > layout.maxHeight)) f.height = layout.maxHeight;
    if ((layout.minHeight != null) && (f.height < layout.minHeight)) f.height = layout.minHeight;
    if ((layout.maxWidth != null) && (f.width > layout.maxWidth)) f.width = layout.maxWidth;
    if ((layout.minWidth != null) && (f.width < layout.minWidth)) f.width = layout.minWidth;

    // Finally, adjust for scale.
    f = this._sc_adjustForScale(f, layout);

    return f;
  },

  init: function () {
    arguments.callee.base.apply(this,arguments);

    // Enabled.
    // If the view is pre-configured as disabled, then go to the proper initial state.
    if (!this.get('isEnabled')) { this._doDisable(); }

    // Layout
    this._previousLayout = this.get('layout');

    // Apply the automatic child view layout if it is defined.
    var childViewLayout = this.childViewLayout;
    if (childViewLayout) {
      // Layout the child views once.
      this.set('childViewsNeedLayout', true);
      this.layoutChildViewsIfNeeded();

      // If the child view layout is live, start observing affecting properties.
      if (this.get('isChildViewLayoutLive')) {
        this.addObserver('childViews.[]', this, this._cvl_childViewsDidChange);
        // DISABLED. this.addObserver('childViewLayout', this, this._cvl_childViewLayoutDidChange);
        this.addObserver('childViewLayoutOptions', this, this._cvl_childViewLayoutDidChange);

        // Initialize the child views.
        this._cvl_setupChildViewsLiveLayout();

        // Initialize our own frame observer.
        if (!this.get('isFixedSize') && childViewLayout.layoutDependsOnSize && childViewLayout.layoutDependsOnSize(this)) {
          this.addObserver('frame', this, this._cvl_childViewLayoutDidChange);
        }
      }
    }

    // Theming
    this._lastTheme = this.get('theme');

  },

  /** @private */
  destroy: function () {
    // Clean up.
    this._previousLayout = null;

    return arguments.callee.base.apply(this,arguments);
  },

  /** SC.CoreView.prototype. */
  removeChild: function(view) {
    // Manipulation
    if (!view) { return this; } // nothing to do
    if (view.parentView !== this) {
      throw new Error("%@.removeChild(%@) must belong to parent".fmt(this, view));
    }

    // notify views
    // TODO: Deprecate these notifications.
    if (view.willRemoveFromParent) { view.willRemoveFromParent() ; }
    if (this.willRemoveChild) { this.willRemoveChild(view) ; }

    arguments.callee.base.apply(this,arguments);

    return this;
  }

});

//unload views for IE, trying to collect memory.
if (SC.browser.isIE) SC.Event.add(window, 'unload', SC.View, SC.View.unload);



/* >>>>>>>>>> BEGIN source/child_view_layouts/stack_layout.js */
// ==========================================================================
// Project:   SproutCore
// Copyright: @2013 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('views/view');

/** @private Shared stack plugin (may be horizontal or vertical). */
function _SC_VIEW_STACK_PLUGIN (direction) {
  this.direction = direction;
}

/** @private Properties to observe on child views that affect the overall child view layout. */
_SC_VIEW_STACK_PLUGIN.prototype.childLayoutProperties = ['marginBefore', 'marginAfter', 'isVisible'];

/** @private When resizeToFit is false, then we need to know when the view's frame changes. */
_SC_VIEW_STACK_PLUGIN.prototype.layoutDependsOnSize = function (view) {
  var options = view.get('childViewLayoutOptions');

  if (options) {
    return SC.none(options.resizeToFit) ? false : !options.resizeToFit;
  } else {
    return false;
  }
};

/** @private */
_SC_VIEW_STACK_PLUGIN.prototype.layoutChildViews = function (view) {
  var childViews = view.get('childViews'),
    options = view.get('childViewLayoutOptions') || {},
    resizeToFit = SC.none(options.resizeToFit) ? true : options.resizeToFit,
    lastMargin = 0, // Used to avoid adding spacing to the final margin.
    marginAfter = options.paddingBefore || 0,
    paddingAfter = options.paddingAfter || 0,
    firstPosition = 0,
    provisionedSpace = 0,
    autoFillAvailableSpace = 0,
    totalAvailableSpace = 0,
    totalFillAvailableSpaceRatio = 0,
    spacing = options.spacing || 0,
    sizeDimension = this.direction === 'vertical' ? 'height' : 'width',
    minSizeDimension = this.direction === 'vertical' ? 'minHeight' : 'minWidth',
    startDimension =  this.direction === 'vertical' ? 'top' : 'left',
    childView,
    fillRatio,
    layout,
    marginBefore,
    i, len;

  // if the view is not configured to resize to fit content, then we give a chance to the children to fill the available space
  // we make a 1st pass to check the conditions, to evaluate the available space and the proportions between children
  if (!resizeToFit) {

    totalAvailableSpace = view.get('frame')[sizeDimension];

    // if the view is not configured to resize and it doesn't have yet a height/width, it doesn't make sense to layout children
    if (!totalAvailableSpace) {
      return;
    }

    for (i = 0, len = childViews.get('length'); i < len; i++) {
      childView = childViews.objectAt(i);

      // Ignore child views with useAbsoluteLayout true, useStaticLayout true or that are not visible.
      if (!childView.get('isVisible') ||
        childView.get('useAbsoluteLayout') ||
        childView.get('useStaticLayout')) {
        continue;
      }

      layout = childView.get('layout');

      // Determine the top/left margin.
      marginBefore = childView.get('marginBefore') || 0;
      provisionedSpace += Math.max(marginAfter, marginBefore);

      // if the height/width is not set, let's check if is possible to resize the view
      if (SC.none(layout[sizeDimension])) {
        fillRatio = childView.get('fillRatio');

        if (!SC.none(fillRatio)) {
          totalFillAvailableSpaceRatio += fillRatio;
        } else {
          // if none of the child views has fillRatio defined, allow the last one to stretch and fill the available space.
          if (i === len - 1 && totalFillAvailableSpaceRatio === 0) {
            totalFillAvailableSpaceRatio = 1;
          }
          
          // Add some developer support.
          else {
            // even if we don't have a height/width set, as last instance we accept the presence of minHeight/minWidth
            if (SC.none(layout[minSizeDimension]))
            {
              if (this.direction === 'vertical') {
                SC.warn('Developer Warning: The SC.View.VERTICAL_STACK plugin requires that each childView layout contains at least a height or has a configured fillRatio. The layout may also optionally contain left and right, left and width, right and width or centerX and width. The childView %@ has an invalid layout/fillRatio: %@'.fmt(childView, SC.stringFromLayout(layout)));
              } else {
                SC.warn('Developer Warning: The SC.View.HORIZONTAL_STACK plugin requires that each childView layout contains at least a width or has a configured fillRatio. The layout may also optionally contain top and bottom, top and height, bottom and height or centerY and height. The childView %@ has an invalid layout/fillRatio: %@'.fmt(childView, SC.stringFromLayout(layout)));
              }
              return;
            }
          }
          
        }
      } else {
        provisionedSpace += childView.get('borderFrame')[sizeDimension];
      }

      // Determine the bottom/right margin.
      lastMargin = childView.get('marginAfter') || 0;
      marginAfter = lastMargin || spacing;
    }

    // consider the end padding when calculating the provisionedSpace
    if (provisionedSpace !== 0 || totalFillAvailableSpaceRatio !== 0) {
      provisionedSpace += Math.max(lastMargin, paddingAfter);
    }

    autoFillAvailableSpace = Math.max(0, totalAvailableSpace - provisionedSpace);
  }

  // reset the references for the effective layout
  lastMargin = 0;
  marginAfter = options.paddingBefore || 0;
  paddingAfter = options.paddingAfter || 0;

  for (i = 0, len = childViews.get('length'); i < len; i++) {
    var size,
      adjustStart,
      adjustEnd;

    childView = childViews.objectAt(i);

    // Ignore child views with useAbsoluteLayout true, useStaticLayout true or that are not visible.
    if (!childView.get('isVisible') ||
      childView.get('useAbsoluteLayout') ||
      childView.get('useStaticLayout')) {
      continue;
    }

    layout = childView.get('layout');

    
    // Add some developer support. The case of !resizeToFit was already checked above
    if (resizeToFit && SC.none(layout[sizeDimension]) && SC.none(layout[minSizeDimension])) {
      if (this.direction === 'vertical') {
        SC.warn('Developer Warning: The SC.View.VERTICAL_STACK plugin, when configured with resizeToFit, requires that each childView layout contains at least a height/minHeight and optionally also left and right, left and width, right and width or centerX and width.  The childView %@ has an invalid layout: %@'.fmt(childView, SC.stringFromLayout(layout)));
      } else {
        SC.warn('Developer Warning: The SC.View.HORIZONTAL_STACK plugin, when configured with resizeToFit, requires that each childView layout contains at least a width/minWidth and optionally also top and bottom, top and height, bottom and height or centerY and height.  The childView %@ has an invalid layout: %@'.fmt(childView, SC.stringFromLayout(layout)));
      }
      return;
    }
    

    // Determine the top/left margin.
    marginBefore = childView.get('marginBefore') || 0;
    firstPosition += Math.max(marginAfter, marginBefore);

    // Try to avoid useless adjustments to top/left or bottom/right or top/left then bottom/right.
    // The required adjustments will be merged into a single call
    adjustStart = layout[startDimension] !== firstPosition;

    childView.beginPropertyChanges();
    if (!resizeToFit && !layout[sizeDimension]) {
      var endDimension = this.direction === 'vertical' ? 'bottom' : 'right',
          endPosition;

      fillRatio = childView.get('fillRatio');

      // if the last child doesn't define fillRatio, default it to 1 as above during the 1st pass
      if (i === len - 1 && SC.none(fillRatio)) {
        fillRatio = 1;
      }

      // we should get here only in two cases: 1. child defines fillRatio, 2. child defines a minHeight
      // if both defined, we prefer to handle fillRatio, the other case being handled below by the normal adjustment to top/left
      if (!SC.none(fillRatio)) {
        var currentAvailableSpaceRatio = (fillRatio / totalFillAvailableSpaceRatio);

        // calculate the height/width according to fillRatio and totalFillAvailableSpaceRatio
        // but set the bottom/right position so any subsequent layout is not considering the height/width as fixed
        size = Math.ceil(autoFillAvailableSpace * currentAvailableSpaceRatio);

        // INCOMPLETE: We need to flag this view as constrained and re-compute all the auto-fill amounts
        // Constrain the height/width to the maximum height/width allowed.
        // var maxHeight = layout.maxHeight;
        // if (!SC.none(maxHeight)) {
        //   // Constrain the height/width according to maxHeight/maxWidth. Which frees up additional available space for further child views.
        //   if (size > maxSize) {
        //     size = maxSize;
        //   }
        // }

        // Determine the bottom/right position. If the position overflows (i.e. goes negative) because of rounding up, stop at 0.
        endPosition = Math.max(0, totalAvailableSpace - firstPosition - size);
        adjustEnd = layout[endDimension] !== endPosition;

        if (adjustEnd) {
          childView.adjust(endDimension, endPosition);
        }
      }
    }

    if (adjustStart) {
      childView.adjust(startDimension, firstPosition);
    }
    childView.endPropertyChanges();

    firstPosition += childView.get('borderFrame')[sizeDimension];

    // Determine the bottom/right margin.
    lastMargin = childView.get('marginAfter') || 0;
    marginAfter = lastMargin || spacing;
  }

  // If the current size is 0 (all children are hidden), it doesn't make sense to add the padding
  if (firstPosition !== 0) {
    firstPosition += Math.max(lastMargin, paddingAfter);
  }

  // Adjust our frame to fit as well, this ensures that scrolling works.
  if (resizeToFit && view.get('layout')[sizeDimension] !== firstPosition) {
    view.adjust(sizeDimension, firstPosition);
  }
};


SC.mixin(SC.View,
  /** @scope SC.View */ {

  /**
    This child layout plugin automatically positions the view's child views in a
    horizontal stack and optionally adjusts the view's width to fit. It does this
    by checking the width of each child view and positioning the following child
    views accordingly. Afterwards, by default, any time that a child view's
    width or visibility changes, the view will use this plugin to re-adjust all
    following child views' positions and potentially its own width appropriately.

    This allows you to stack absolutely positioned views that dynamically change
    their width and/or visibility without having to resort to using browser
    flow layout.

    For example,

        MyApp.MyView = SC.View.extend({

          // Child views will be stacked in order horizontally.
          childViewLayout: SC.View.HORIZONTAL_STACK,

          // The order of child views is important!
          childViews: ['sectionA', 'sectionB', 'sectionC'],

          // The view will resize itself to fit its children.
          // i.e. We don't need to specify layout.width, this is automatic.
          // The actual layout will become { left: 10, bottom: 20, top: 20, width: 270 } initially.
          layout: { left: 10, bottom: 20, top: 20 },

          sectionA: SC.View.design({

            // We don't need to specify layout.left, this is automatic.
            // The actual layout will become { left: 0, bottom: 0, top: 0, width: 100 } initially.
            layout: { width: 100 }

          }),

          sectionB: SC.View.design({

            // We don't need to specify layout.left, this is automatic.
            // The actual layout will become { border: 1, left: 100, bottom: 0, top: 0, width: 50 } initially.
            layout: { border: 1, width: 50 }

          }),

          sectionC: SC.View.design({

            // We don't need to specify layout.left, this is automatic.
            // The actual layout will become { left: 150, bottom: 10, top: 10, width: 120 } initially.
            layout: { right: 10, top: 10, width: 120 }

          })

        });

    ## Modify the default behavior with `childViewLayoutOptions`

    To modify the plugin behavior for all child view layouts, you can set the
    following child view layout options in `childViewLayoutOptions` on the view:

      - paddingBefore - Adds padding before the first child view.  Default: 0
      - paddingAfter - Adds padding after the last child view.  Default: 0
      - spacing - Adds spacing between each child view.  Default: 0
      - resizeToFit - Whether to resize the view to fit the child views (requires that each child view has a layout width).  Default: true

    For example,

        MyApp.MyView = SC.View.extend({

          // Child views will be stacked in order horizontally.
          childViewLayout: SC.View.HORIZONTAL_STACK,

          // Change the behavior of the HORIZONTAL_STACK plugin
          childViewLayoutOptions: {
            paddingBefore: 10,
            paddingAfter: 20,
            spacing: 5
          },

          // The order of child views is important!
          childViews: ['sectionA', 'sectionB', 'sectionC'],

          // The view will resize itself to fit its children. The actual layout will become { left: 10, bottom: 20, top: 20, width: 310 }
          layout: { left: 10, bottom: 20, top: 20 }, // Don't need to specify layout.width, this is automatic.

          sectionA: SC.View.design({

            // Actual layout will become { left: 10, bottom: 0, top: 0, width: 100 }
            layout: { width: 100 } // Don't need to specify layout.left, this is automatic.

          }),

          sectionB: SC.View.design({

            // Actual layout will become { border: 1, left: 115, bottom: 0, top: 0, width: 50 }
            layout: { border: 1, width: 50 } // Don't need to specify layout.left, this is automatic.

          }),

          sectionC: SC.View.design({

            // Actual layout will become { left: 170, top: 10, bottom: 10, width: 120 }
            layout: { top: 10, bottom: 10, width: 120 } // Don't need to specify layout.left, this is automatic.

          })

        });

    If `resizeToFit` is set to `false`, the view will not adjust itself to fit
    its child views.  This means that when `resizeToFit` is false, the view should
    specify its width component in its layout. A direct effect of this is the
    possibility for the child views to automatically expand or shrink in order to
    fill the empty, unclaimed space of the view.

    This available space is shared between all children that don't specify a fixed width
    such that their final width is calculated proportionally to the value of the
    property `fillRatio`.

    For simplicity, when none of the children specifies `fillRatio`,
    you can ignore the last child view's layout width and the last child view
    will stretch to fill the parent view.

    For example,

        MyApp.MyView = SC.View.extend({

          // Child views will be stacked in order horizontally.
          childViewLayout: SC.View.HORIZONTAL_STACK,

          // Change the behavior of the HORIZONTAL_STACK plugin
          childViewLayoutOptions: {
            paddingBefore: 10,
            paddingAfter: 20,
            spacing: 5,
            resizeToFit: false // Setting this to false, so that the child views stretch/contract to fit the parent's size.
          },

          // The order of child views is important!
          childViews: ['sectionA', 'sectionB', 'sectionC'],

          // The parent view will not resize itself to fit its contents, so we specify the width.
          layout: { left: 10, bottom: 20, top: 20, width: 500 },

          sectionA: SC.View.design({

            // We don't need to specify layout.left, this is automatic. This child will not stretch, its width is set.
            // Actual layout will become { left: 10, bottom: 0, top: 0, width: 100 }
            layout: { width: 100 }

          }),

          sectionB: SC.View.design({

            // The unclaimed space so far is 500 - 10 - 100 - 5 - 5 - 20, or 360px. This space will be shared between
            // the two last sections, because we won't specity a width on them.
            // This view will get 1/3 of the available space, because the other flexibile view has a ratio of 2.
            fillRatio: 1,

            // This section will take 1/3 * 360px = 120px.
            // Actual layout will become { border: 1, left: 115, bottom: 0, top: 0, right: 265 }, in other words, width == 120
            // We don't need to specify layout.left, layout.right or layout.width, this is automatic.
            layout: { border: 1 }

          }),

          sectionC: SC.View.design({

            // This view will get 2/3 of the available space, because the other flexibile view has a ratio of 1.
            fillRatio: 2,

            // This section will take 2/3 * 360px = 240px.
            // Actual layout will become { left: 240, top: 10, bottom: 10, right: 20 }, in other words, width == 240
            // We don't need to specify layout.left, layout.right or layout.width, this is automatic.
            layout: { top: 10, bottom: 10 }

          })

        });

    ## Modify specific child view layouts

    To adjust the child layout on a granular level per child view, you can
    also set the following properties on each child view:

      - marginBefore - Specify the minimum spacing above the child view.
      - marginAfter - Specify the minimum spacing below the child view.
      - useAbsoluteLayout - Don't include this child view in automatic layout, use absolute positioning based on the child view's `layout` property.
      - useStaticLayout - Don't include this child view in automatic layout.  This child view uses relative positioning and is not eligible for automatic layout.
      - isVisible - Non-visible child views are not included in the stack.
      - fillRatio - When the parent view is configured with a fixed dimension, children not specifying a width but specifying fillRatio will be resized to fill the unclaimed space proportionally to this ratio.

      For example,

        MyApp.MyView = SC.View.extend({

          // Child views will be stacked in order horizontally.
          childViewLayout: SC.View.HORIZONTAL_STACK,

          // Actual layout will become { left: 10, right: 10, top: 20, width: 570 }
          layout: { left: 10, right: 10, top: 20 },

          // Keep the child views ordered!
          childViews: ['sectionA', 'float', 'sectionB', 'sectionC'],

          sectionA: SC.View.design({
            // Actual layout will become { left: 0, right: 50, top: 0, width: 100 }
            layout: { right: 50, width: 100 },
            // The following child view will be at least 50px further right.
            marginAfter: 50
          }),

          float: SC.View.design({
            // This view will not be included in automatic layout and will not effect the stack.
            layout: { top: 5, right: 5, height: 50, width: 50 },
            useAbsoluteLayout: true
          }),

          sectionB: SC.View.design({
            // Actual layout will become { left: 1500, right: 0, top: 0, width: 120 }
            layout: { width: 120 }
          }),

          sectionC: SC.View.design({
            // Actual layout will become { left: 470, bottom: 0, top: 0, width: 100 }
            layout: { width: 100 },
            // This child view will be at least 200px to the right of the previous.
            marginBefore: 200
          })

        });

    ### A Note About Spacing

    Note that the spacing attribute in `childViewLayoutOptions` becomes the
    _minimum margin between child views, without explicitly overriding it from
    both sides using `marginAfter` and `marginBefore`_.  For example, if `spacing`
    is 25, setting `marginAfter` to 10 on a child view will not result in the
    next child view being 10px to the right of it, unless the next child view also
    specified `marginBefore` as 10.

    What this means is that it takes less configuration if you set `spacing` to
    be the _smallest margin you wish to exist between child views_ and then use
    the overrides to grow the margin if necessary.  For example, if `spacing`
    is 5, setting `marginAfter` to 10 on a child view will result in the next
    child view being 10px to the right of it, without having to also specify
    `marginBefore` on that next child view.

    @extends SC.ChildViewLayoutProtocol
    @since Version 1.10
  */
  HORIZONTAL_STACK: new _SC_VIEW_STACK_PLUGIN('horizontal'),

  /**
    This child layout plugin automatically positions the view's child views in a
    vertical stack and optionally adjusts the view's height to fit.  It does this
    by checking the height of each child view and positioning the following child
    view accordingly.  Afterwards, by default, any time that a child view's
    height or visibility changes, the view will use this plugin to re-adjust all
    following child views' positions and potentially its own height appropriately.

    This allows you to stack absolutely positioned views that dynamically change
    their height and/or visibility without having to resort to using browser
    flow layout.

    A typical usage scenario is a long "form" made of multiple subsection
    views.  If we want to adjust the height of a subsection, to make space for
    an error label for example, it would be a lot of work to manually
    reposition all the following sections below it.  A much easier to code and
    cleaner solution is to just set the childViewLayout plugin on the wrapper
    view.

    For example,

        MyApp.MyView = SC.View.extend({

          // Child views will be stacked in order vertically.
          childViewLayout: SC.View.VERTICAL_STACK,

          // The order of child views is important!
          childViews: ['sectionA', 'sectionB', 'sectionC'],

          // The view will resize itself to fit its children.
          // i.e. We don't need to specify layout.height, this is automatic.
          // The actual layout will become { left: 10, right: 10, top: 20, height: 270 } initially.
          layout: { left: 10, right: 10, top: 20 },

          sectionA: SC.View.design({

            // We don't need to specify layout.top, this is automatic.
            // The actual layout will become { left: 0, right: 0, top: 0, height: 100 } initially.
            layout: { height: 100 }

          }),

          sectionB: SC.View.design({

            // We don't need to specify layout.top, this is automatic.
            // The actual layout will become { border: 1, left: 0, right: 0, top: 100, height: 50 } initially.
            layout: { border: 1, height: 50 }

          }),

          sectionC: SC.View.design({

            // We don't need to specify layout.top, this is automatic.
            // The actual layout will become { left: 10, right: 10, top: 150, height: 120 } initially.
            layout: { left: 10, right: 10, height: 120 }

          })

        });

    ## Modify the default behavior with `childViewLayoutOptions`

    To modify the plugin behavior for all child view layouts, you can set the
    following child view layout options in `childViewLayoutOptions` on the view:

      - paddingBefore - Adds padding before the first child view.  Default: 0
      - paddingAfter - Adds padding after the last child view.  Default: 0
      - spacing - Adds spacing between each child view.  Default: 0
      - resizeToFit - Whether to resize the view to fit the child views (requires that each child view has a layout height).  Default: true

    For example,

        MyApp.MyView = SC.View.extend({

          // Child views will be stacked in order vertically.
          childViewLayout: SC.View.VERTICAL_STACK,

          // Change the behavior of the VERTICAL_STACK plugin
          childViewLayoutOptions: {
            paddingBefore: 10,
            paddingAfter: 20,
            spacing: 5
          },

          // The order of child views is important!
          childViews: ['sectionA', 'sectionB', 'sectionC'],

          // The actual layout will become { left: 10, right: 10, top: 20, height: 310 } initially.
          layout: { left: 10, right: 10, top: 20 }, // Don't need to specify layout.height, this is automatic.

          sectionA: SC.View.design({

            // We don't need to specify layout.top, this is automatic.
            // The actual layout will become { left: 0, right: 0, top: 10, height: 100 } initially.
            layout: { height: 100 }

          }),

          sectionB: SC.View.design({

            // We don't need to specify layout.top, this is automatic.
            // The actual layout will become { border: 1, left: 0, right: 0, top: 115, height: 50 } initially.
            layout: { border: 1, height: 50 }

          }),

          sectionC: SC.View.design({

            // We don't need to specify layout.top, this is automatic.
            // The actual layout will become { left: 10, right: 10, top: 170, height: 120 } initially.
            layout: { left: 10, right: 10, height: 120 }

          })

        });

    If `resizeToFit` is set to `false`, the view will not adjust itself to fit
    its child views.  This means that when `resizeToFit` is false, the view should
    specify its height component in its layout. A direct effect is the possibility for
    the child views to automatically extend or shrink in order to fill the empty, unclaimed space.
    This available space is shared between the children not specifying a fixed height
    and their final dimension is calculated proportionally to the value of the
    property `fillRatio`.
    For simplicity, when none of the children specifies `fillRatio`,
    you can ignore the last child view's layout height if you want the last child view
    to stretch to fill the parent view.

    For example,

        MyApp.MyView = SC.View.extend({

          // Child views will be stacked in order vertically.
          childViewLayout: SC.View.VERTICAL_STACK,

          // Change the behavior of the VERTICAL_STACK plugin
          childViewLayoutOptions: {
            paddingBefore: 10,
            paddingAfter: 20,
            spacing: 5,
            resizeToFit: false
          },

          // The order of child views is important!
          childViews: ['sectionA', 'sectionB', 'sectionC'],

          // Actual layout will become { left: 10, right: 10, top: 20, height: 500 }
          layout: { left: 10, right: 10, top: 20, height: 500 }, // Need to specify layout.height.

          sectionA: SC.View.design({

            // We don't need to specify layout.top, this is automatic. This child will not stretch, its height is set.
            // The actual layout will become { left: 0, right: 0, top: 10, height: 100 } initially.
            layout: { height: 100 }

          }),

          sectionB: SC.View.design({

            // The unclaimed space so far is 500 - 10 - 100 - 5 - 5 - 20, or 360px. This space will be shared between
            // the two last sections, because we won't specity a height on them.
            // This view will get 1/3 of the available space, because the other flexibile view has a ratio of 2.
            fillRatio: 1,

            // This section will take 1/3 * 360px = 120px.
            // Actual layout will become { border: 1, left: 0, right: 0, top: 115, bottom: 265 }, in other words, height == 120
            // We don't need to specify layout.top, layout.bottom or layout.height, this is automatic.
            layout: { border: 1 }

          }),

          sectionC: SC.View.design({

            // This view will get 2/3 of the available space, because the other flexibile view has a ratio of 1.
            fillRatio: 2,

            // This section will take 2/3 * 360px = 240px.
            // Actual layout will become { left: 10, right: 10, top: 240, bottom: 20 }, in other words, height == 240
            // We don't need to specify layout.top, layout.bottom or layout.height, this is automatic.
            layout: { left: 10, right: 10 }

          })

        });

    ## Modify specific child view layouts

    To adjust the child layout on a granular level per child view, you can
    also set the following properties on each child view:

      - marginBefore - Specify the minimum spacing above the child view.
      - marginAfter - Specify the minimum spacing below the child view.
      - useAbsoluteLayout - Don't include this child view in automatic layout, use absolute positioning based on the child view's `layout` property.
      - useStaticLayout - Don't include this child view in automatic layout.  This child view uses relative positioning and is not eligible for automatic layout.
      - isVisible - Non-visible child views are not included in the stack.
      - fillRatio - When the parent view is configured with a fixed dimension, children not specifying a height but specifying fillRatio will be resized to fill the unclaimed space proportionally to this ratio.

    For example,

        MyApp.MyView = SC.View.extend({

          // Child views will be stacked in order vertically.
          childViewLayout: SC.View.VERTICAL_STACK,

          // Actual layout will become { left: 10, right: 10, top: 20, height: 570 }
          layout: { left: 10, right: 10, top: 20 },

          // Keep the child views ordered!
          childViews: ['sectionA', 'float', 'sectionB', 'sectionC'],

          sectionA: SC.View.design({
            // Actual layout will become { left: 0, right: 50, top: 0, height: 100 }
            layout: { right: 50, height: 100 },
            // The following child view will be at least 50px further down.
            marginAfter: 50
          }),

          float: SC.View.design({
            // This view will not be included in automatic layout and will not effect the stack.
            layout: { top: 5, right: 5, width: 50, height: 50 },
            useAbsoluteLayout: true
          }),

          sectionB: SC.View.design({
            // Actual layout will become { left: 0, right: 0, top: 150, height: 120 }
            layout: { height: 120 }
          }),

          sectionC: SC.View.design({
            // Actual layout will become { left: 0, bottom: 0, top: 470, height: 100 }
            layout: { height: 100 },
            // This child view will be at least 200px below the previous.
            marginBefore: 200
          })

        });

    ### A Note About Spacing

    Note that the spacing attribute in `childViewLayoutOptions` becomes the
    _minimum margin between child views, without explicitly overriding it from
    both sides using `marginAfter` and `marginBefore`_.  For example, if `spacing`
    is 25, setting `marginAfter` to 10 on a child view will not result in the
    next child view being 10px below it, unless the next child view also
    specified `marginBefore` as 10.

    What this means is that it takes less configuration if you set `spacing` to
    be the _smallest margin you wish to exist between child views_ and then use
    the overrides to grow the margin if necessary.  For example, if `spacing`
    is 5, setting `marginAfter` to 10 on a child view will result in the next
    child view being 10px below it, without having to also specify `marginBefore`
    on that next child view.

    @extends SC.ChildViewLayoutProtocol
    @since Version 1.10
  */
  VERTICAL_STACK: new _SC_VIEW_STACK_PLUGIN('vertical')

});

/* >>>>>>>>>> BEGIN source/controllers/controller.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  The controller base class provides some common functions you will need
  for controllers in your applications, especially related to maintaining
  an editing context.

  In general you will not use this class, but you can use a subclass such
  as ObjectController, TreeController, or ArrayController.

  ## EDITING CONTEXTS

  One major function of a controller is to mediate between changes in the
  UI and changes in the model.  In particular, you usually do not want
  changes you make in the UI to be applied to a model object directly.
  Instead, you often will want to collect changes to an object and then
  apply them only when the user is ready to commit their changes.

  The editing contact support in the controller class will help you
  provide this capability.

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Controller = SC.Object.extend(
/** @scope SC.Controller.prototype */ {

  /**
    Makes a controller editable or not editable.  The SC.Controller class
    itself does not do anything with this property but subclasses will
    respect it when modifying content.

    @type Boolean
  */
  isEditable: YES,

  /**
   * Set this to YES if you are setting the controller content to a recordArray
   * or other content that needs to be cleaned up (with `.destroy()`) when
   * new content is set.
   */
  destroyContentOnReplace: NO,

  contentObjectDidChanged: function() {
    var oldContent, newContent;

    if (!this.get('destroyContentOnReplace')) return;

    oldContent = this._oldContent;
    newContent = this.get('content');
    if (oldContent && newContent !== oldContent && oldContent.destroy) {
      oldContent.destroy();
    }
    this._oldContent = newContent;
  }.observes('content')

});

/* >>>>>>>>>> BEGIN source/mixins/selection_support.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/**
  @namespace

  Implements common selection management properties for controllers.

  Selection can be managed by any controller in your applications.  This
  mixin provides some common management features you might want such as
  disabling selection, or restricting empty or multiple selections.

  To use this mixin, simply add it to any controller you want to manage
  selection and call updateSelectionAfterContentChange()
  whenever your source content changes.  You can also override the properties
  defined below to configure how the selection management will treat your
  content.

  This mixin assumes the arrangedObjects property will return an SC.Array of
  content you want the selection to reflect.

  Add this mixin to any controller you want to manage selection.  It is
  already applied to SC.ArrayController.

  @since SproutCore 1.0
*/
SC.SelectionSupport = {

  // ..........................................................
  // PROPERTIES
  //
  /**
    Walk like a duck.

    @type Boolean
  */
  hasSelectionSupport: YES,

  /**
    If YES, selection is allowed. Default is YES.

    @type Boolean
  */
  allowsSelection: YES,

  /**
    If YES, multiple selection is allowed. Default is YES.

    @type Boolean
  */
  allowsMultipleSelection: YES,

  /**
    If YES, allow empty selection Default is YES.

    @type Boolean
  */
  allowsEmptySelection: YES,

  /**
    Override to return the first selectable object.  For example, if you
    have groups or want to otherwise limit the kinds of objects that can be
    selected.

    the default implementation returns firstObject property.

    @returns {Object} first selectable object
  */
  firstSelectableObject: function() {
    return this.get('firstObject');
  }.property(),

  /**
    This is the current selection.  You can make this selection and another
    controller's selection work in concert by binding them together. You
    generally have a master selection that relays changes TO all the others.

    @property {SC.SelectionSet}
  */
  selection: function(key, value) {
    var old = this._scsel_selection,
    oldlen = old ? old.get('length') : 0,
    empty,
    arrangedObjects = this.get('arrangedObjects'),
    len;

    // whenever we have to recompute selection, reapply all the conditions to
    // the selection.  This ensures that changing the conditions immediately
    // updates the selection.
    //
    // Note also if we don't allowSelection, we don't clear the old selection;
    // we just don't allow it to be changed.
    if ((value === undefined) || !this.get('allowsSelection')) { value = old; }

    len = (value && value.isEnumerable) ? value.get('length') : 0;

    // if we don't allow multiple selection
    if ((len > 1) && !this.get('allowsMultipleSelection')) {

      if (oldlen > 1) {
        value = SC.SelectionSet.create().addObject(old.get('firstObject')).freeze();
        len = 1;
      } else {
        value = old;
        len = oldlen;
      }
    }

    // if we don't allow empty selection, block that also, unless we
    // have nothing to select.  select first selectable item if necessary.
    if ((len === 0) && !this.get('allowsEmptySelection') && arrangedObjects && arrangedObjects.get('length') !== 0) {
      if (oldlen === 0) {
        value = this.get('firstSelectableObject');
        if (value) { value = SC.SelectionSet.create().addObject(value).freeze(); }
        else { value = SC.SelectionSet.EMPTY; }
        len = value.get('length');

      } else {
        value = old;
        len = oldlen;
      }
    }

    // if value is empty or is not enumerable, then use empty set
    if (len === 0) { value = SC.SelectionSet.EMPTY; }

    // always use a frozen copy...
    if(value !== old) value = value.frozenCopy();
    this._scsel_selection = value;

    return value;

  }.property('arrangedObjects', 'allowsEmptySelection', 'allowsMultipleSelection', 'allowsSelection').cacheable(),

  /**
    YES if the receiver currently has a non-zero selection.

    @type Boolean
  */
  hasSelection: function() {
    var sel = this.get('selection');
    return !! sel && (sel.get('length') > 0);
  }.property('selection').cacheable(),

  // ..........................................................
  // METHODS
  //
  /**
    Selects the passed objects in your content.  If you set "extend" to YES,
    then this will attempt to extend your selection as well.

    @param {SC.Enumerable} objects objects to select
    @param {Boolean} extend optionally set to YES to extend selection
    @returns {Object} receiver
  */
  selectObjects: function(objects, extend) {

    // handle passing an empty array
    if (!objects || objects.get('length') === 0) {
      if (!extend) { this.set('selection', SC.SelectionSet.EMPTY); }
      return this;
    }

    var sel = this.get('selection');
    if (extend && sel) { sel = sel.copy(); }
    else { sel = SC.SelectionSet.create(); }

    sel.addObjects(objects).freeze();
    this.set('selection', sel);
    return this;
  },

  /**
    Selects a single passed object in your content.  If you set "extend" to
    YES then this will attempt to extend your selection as well.

    @param {Object} object object to select
    @param {Boolean} extend optionally set to YES to extend selection
    @returns {Object} receiver
  */
  selectObject: function(object, extend) {
    if (object === null) {
      if (!extend) { this.set('selection', null); }
      return this;

    } else { return this.selectObjects([object], extend); }
  },

  /**
    Deselects the passed objects in your content.

    @param {SC.Enumerable} objects objects to select
    @returns {Object} receiver
  */
  deselectObjects: function(objects) {

    if (!objects || objects.get('length') === 0) { return this; } // nothing to do
    var sel = this.get('selection');
    if (!sel || sel.get('length') === 0) { return this; } // nothing to do
    // find index for each and remove it
    sel = sel.copy().removeObjects(objects).freeze();
    this.set('selection', sel.freeze());
    return this;
  },

  /**
    Deselects the passed object in your content.

    @param {SC.Object} object single object to select
    @returns {Object} receiver
  */
  deselectObject: function(object) {
    if (!object) { return this; } // nothing to do
    else { return this.deselectObjects([object]); }
  },

  /**
    Call this method whenever your source content changes to ensure the
    selection always remains up-to-date and valid.

    @returns {Object}
  */
  updateSelectionAfterContentChange: function() {
    var arrangedObjects = this.get('arrangedObjects');
    var selectionSet = this.get('selection');
    var allowsEmptySelection = this.get('allowsEmptySelection');
    var indexSet; // Selection index set for arranged objects

    // If we don't have any selection, there's nothing to update
    if (!selectionSet) { return this; }
    // Remove any selection set objects that are no longer in the content
    indexSet = selectionSet.indexSetForSource(arrangedObjects);
    if ((indexSet && (indexSet.get('length') !== selectionSet.get('length'))) || (!indexSet && (selectionSet.get('length') > 0))) { // then the selection content has changed
      if (arrangedObjects) {
        // Constrain the current selection set to matches in arrangedObjects.
        selectionSet = selectionSet.copy().constrain(arrangedObjects).freeze();
      } else {
        // No arrangedObjects, so clear the selection.
        selectionSet = SC.SelectionSet.EMPTY;
      }
      this.set('selection', selectionSet);
    }

    // Reselect an object if required (if content length > 0)
    if ((selectionSet.get('length') === 0) && arrangedObjects && (arrangedObjects.get('length') > 0) && !allowsEmptySelection) {
      this.selectObject(this.get('firstSelectableObject'), NO);
    }

    return this;
  }

};

/* >>>>>>>>>> BEGIN source/controllers/array.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('controllers/controller');
sc_require('mixins/selection_support');

/**
  @class

  An ArrayController provides a way for you to publish an array of objects
  for CollectionView or other controllers to work with.  To work with an
  ArrayController, set the content property to the array you want the
  controller to manage.  Then work directly with the controller object as if
  it were the array itself.

  When you want to display an array of objects in a CollectionView, bind the
  "arrangedObjects" of the array controller to the CollectionView's "content"
  property.  This will automatically display the array in the collection view.

  @extends SC.Controller
  @extends SC.Array
  @extends SC.SelectionSupport
  @author Charles Jolley
  @since SproutCore 1.0
*/
SC.ArrayController = SC.Controller.extend(SC.Array, SC.SelectionSupport,
/** @scope SC.ArrayController.prototype */ {

  
  /* BEGIN DEBUG ONLY PROPERTIES AND METHODS */

  /* @private */
  toString: function () {
    var content = this.get('content'),
      ret = arguments.callee.base.apply(this,arguments);

    return content ? "%@:\n  ↳ %@".fmt(ret, content) : ret;
  },

  /* END DEBUG ONLY PROPERTIES AND METHODS */
  

  // ..........................................................
  // PROPERTIES
  //

  /**
    The content array managed by this controller.

    You can set the content of the ArrayController to any object that
    implements SC.Array or SC.Enumerable.  If you set the content to an object
    that implements SC.Enumerable only, you must also set the orderBy property
    so that the ArrayController can order the enumerable for you.

    If you set the content to a non-enumerable and non-array object, then the
    ArrayController will wrap the item in an array in an attempt to normalize
    the result.

    @type SC.Array
  */
  content: null,

  /**
    Makes the array editable or not.  If this is set to NO, then any attempts
    at changing the array content itself will throw an exception.

    @type Boolean
  */
  isEditable: YES,

  /**
    Used to sort the array.

    If you set this property to a key name, array of key names, or a function,
    then then ArrayController will automatically reorder your content array
    to match the sort order.  When using key names, you may specify the
    direction of the sort by appending ASC or DESC to the key name.  By default
    sorting is done in ascending order.

    For example,

        myController.set('orderBy', 'title DESC');
        myController.set('orderBy', ['lastName ASC', 'firstName DESC']);

    Normally, you should only use this property if you set the content of the
    controller to an unordered enumerable such as SC.Set or SC.SelectionSet.
    In this case the orderBy property is required in order for the controller
    to property order the content for display.

    If you set the content to an array, it is usually best to maintain the
    array in the proper order that you want to display things rather than
    using this method to order the array since it requires an extra processing
    step.  You can use this orderBy property, however, for displaying smaller
    arrays of content.

    Note that you can only use addObject() to insert new objects into an
    array that is ordered.  You cannot manually reorder or insert new objects
    into specific locations because the order is managed by this property
    instead.

    If you pass a function, it should be suitable for use in compare().

    @type String|Array|Function
  */
  orderBy: null,

  /**
    Set to YES if you want the controller to wrap non-enumerable content
    in an array and publish it.  Otherwise, it will treat single content like
    null content.

    @type Boolean
  */
  allowsSingleContent: YES,

  /**
    Set to YES if you want objects removed from the array to also be
    deleted.  This is a convenient way to manage lists of items owned
    by a parent record object.

    Note that even if this is set to NO, calling destroyObject() instead of
    removeObject() will still destroy the object in question as well as
    removing it from the parent array.

    @type Boolean
  */
  destroyOnRemoval: NO,

  /**
    Returns an SC.Array object suitable for use in a CollectionView.
    Depending on how you have your ArrayController configured, this property
    may be one of several different values.

    @type SC.Array
  */
  arrangedObjects: function () {
    return this;
  }.property().cacheable(),

  /**
    Computed property indicates whether or not the array controller can
    remove content.  You can delete content only if the content is not single
    content and isEditable is YES.

    @type Boolean
  */
  canRemoveContent: function () {
    var content = this.get('content'), ret;
    ret = !!content && this.get('isEditable') && this.get('hasContent');
    if (ret) {
      return !content.isEnumerable ||
             (SC.typeOf(content.removeObject) === SC.T_FUNCTION);
    } else return NO;
  }.property('content', 'isEditable', 'hasContent'),

  /**
    Computed property indicates whether you can reorder content.  You can
    reorder content as long a the controller isEditable and the content is a
    real SC.Array-like object.  You cannot reorder content when orderBy is
    non-null.

    @type Boolean
  */
  canReorderContent: function () {
    var content = this.get('content'), ret;
    ret = !!content && this.get('isEditable') && !this.get('orderBy');
    return ret && !!content.isSCArray;
  }.property('content', 'isEditable', 'orderBy'),

  /**
    Computed property insides whether you can add content.  You can add
    content as long as the controller isEditable and the content is not a
    single object.

    Note that the only way to simply add object to an ArrayController is to
    use the addObject() or pushObject() methods.  All other methods imply
    reordering and will fail.

    @type Boolean
  */
  canAddContent: function () {
    var content = this.get('content'), ret;
    ret = content && this.get('isEditable') && content.isEnumerable;
    if (ret) {
      return (SC.typeOf(content.addObject) === SC.T_FUNCTION) ||
             (SC.typeOf(content.pushObject) === SC.T_FUNCTION);
    } else return NO;
  }.property('content', 'isEditable'),

  /**
    Set to YES if the controller has valid content that can be displayed,
    even an empty array.  Returns NO if the content is null or not enumerable
    and allowsSingleContent is NO.

    @type Boolean
  */
  hasContent: function () {
    var content = this.get('content');
    return !!content &&
           (!!content.isEnumerable || !!this.get('allowsSingleContent'));
  }.property('content', 'allowSingleContent'),

  /**
    Returns the current status property for the content.  If the content does
    not have a status property, returns SC.Record.READY.

    @type Number
  */
  status: function () {
    var content = this.get('content'),
        ret = content ? content.get('status') : null;
    return ret ? ret : SC.Record.READY;
  }.property().cacheable(),

  // ..........................................................
  // METHODS
  //

  /**
    Adds an object to the array.  If the content is ordered, this will add the
    object to the end of the content array.  The content is not ordered, the
    location depends on the implementation of the content.

    If the source content does not support adding an object, then this method
    will throw an exception.

    @param {Object} object The object to add to the array.
    @returns {SC.ArrayController} The receiver.
  */
  addObject: function (object) {
    if (!this.get('canAddContent')) { throw new Error("%@ cannot add content".fmt(this)); }

    var content = this.get('content');
    if (content.isSCArray) { content.pushObject(object); }
    else if (content.addObject) { content.addObject(object); }
    else { throw new Error("%@.content does not support addObject".fmt(this)); }

    return this;
  },

  /**
    Removes the passed object from the array.  If the underlying content
    is a single object, then this simply sets the content to null.  Otherwise
    it will call removeObject() on the content.

    Also, if destroyOnRemoval is YES, this will actually destroy the object.

    @param {Object} object the object to remove
    @returns {SC.ArrayController} receiver
  */
  removeObject: function (object) {
    if (!this.get('canRemoveContent')) {
      throw new Error("%@ cannot remove content".fmt(this));
    }

    var content = this.get('content');
    if (content.isEnumerable) {
      content.removeObject(object);
    } else {
      this.set('content', null);
    }

    if (this.get('destroyOnRemoval') && object.destroy) { object.destroy(); }
    return this;
  },

  // ..........................................................
  // SC.ARRAY SUPPORT
  //

  /**
    Compute the length of the array based on the observable content

    @type Number
  */
  length: function () {
    var content = this._scac_observableContent();
    return content ? content.get('length') : 0;
  }.property().cacheable(),

  /** @private
    Returns the object at the specified index based on the observable content
  */
  objectAt: function (idx) {
    var content = this._scac_observableContent();
    return content ? content.objectAt(idx) : undefined;
  },

  /** @private
    Forwards a replace on to the content, but only if reordering is allowed.
  */
  replace: function (start, amt, objects) {
    // check for various conditions before a replace is allowed
    if (!objects || objects.get('length') === 0) {
      if (!this.get('canRemoveContent')) {
        throw new Error("%@ cannot remove objects from the current content".fmt(this));
      }
    } else if (!this.get('canReorderContent')) {
      throw new Error("%@ cannot add or reorder the current content".fmt(this));
    }

    // if we can do this, then just forward the change.  This should fire
    // updates back up the stack, updating rangeObservers, etc.
    var content = this.get('content'); // note: use content, not observable
    var objsToDestroy = [], i, objsLen;

    if (this.get('destroyOnRemoval')) {
      for (i = 0; i < amt; i++) {
        objsToDestroy.push(content.objectAt(i + start));
      }
    }

    if (content) { content.replace(start, amt, objects); }

    for (i = 0, objsLen = objsToDestroy.length; i < objsLen; i++) {

      objsToDestroy[i].destroy();
    }
    objsToDestroy = null;

    return this;
  },

  indexOf: function (object, startAt) {
    var content = this._scac_observableContent();
    return content ? content.indexOf(object, startAt) : -1;
  },

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @private */
  init: function () {
    arguments.callee.base.apply(this,arguments);
    this._scac_contentDidChange();
  },

  /** @private
    Cached observable content property.  Set to NO to indicate cache is
    invalid.
  */
  _scac_cached: NO,

  /**
    @private

    Returns the current array this controller is actually managing.  Usually
    this should be the same as the content property, but sometimes we need to
    generate something different because the content is not a regular array.

    @returns {SC.Array} observable or null
  */
  _scac_observableContent: function () {
    var ret = this._scac_cached;
    if (ret) { return ret; }

    var content = this.get('content'), func, order;

    // empty content
    if (SC.none(content)) { return (this._scac_cached = []); }

    // wrap non-enumerables
    if (!content.isEnumerable) {
      ret = this.get('allowsSingleContent') ? [content] : [];
      return (this._scac_cached = ret);
    }

    // no-wrap
    var orderBy = this.get('orderBy');
    if (!orderBy) {
      if (content.isSCArray) { return (this._scac_cached = content); }
      else { throw new Error("%@.orderBy is required for unordered content".fmt(this)); }
    }

    // all remaining enumerables must be sorted.

    // build array - then sort it
    var type = SC.typeOf(orderBy);

    if (type === SC.T_STRING) {
      orderBy = [orderBy];
    } else if (type === SC.T_FUNCTION) {
      func = orderBy;
    } else if (type !== SC.T_ARRAY) {
      throw new Error("%@.orderBy must be Array, String, or Function".fmt(this));
    }

    // generate comparison function if needed - use orderBy
    func = func || function (a, b) {
      var status, key, match, valueA, valueB;

      for (var i = 0, l = orderBy.get('length'); i < l && !status; i++) {
        key = orderBy.objectAt(i);

        if (key.search(/(ASC|DESC)/) === 0) {
          
          SC.warn("Developer Warning: SC.ArrayController's orderBy direction syntax has been changed to match that of SC.Query and MySQL.  Please change your String to 'key DESC' or 'key ASC'.  Having 'ASC' or 'DESC' precede the key has been deprecated.");
          
          match = key.match(/^(ASC )?(DESC )?(.*)$/);
          key = match[3];
        } else {
          match = key.match(/^(\S*)\s*(DESC)?(?:ASC)?$/);
          key = match[1];
        }
        order = match[2] ? -1 : 1;

        if (a) { valueA = a.isObservable ? a.get(key) : a[key]; }
        if (b) { valueB = b.isObservable ? b.get(key) : b[key]; }

        status = SC.compare(valueA, valueB) * order;
      }

      return status;
    };

    return (this._scac_cached = content.toArray().sort(func));
  },

  propertyWillChange: function (key) {
    if (key === 'content') {
      this.arrayContentWillChange(0, this.get('length'), 0);
    } else {
      return arguments.callee.base.apply(this,arguments);
    }
  },

  _scac_arrayContentWillChange: function (start, removed, added) {
    // Repoint arguments if orderBy is present. (If orderBy is present, we can't be sure how any content change
    // translates into an arrangedObject change without calculating the order, which is a complex, potentially
    // expensive operation, so we simply invalidate everything.)
    if (this.get('orderBy')) {
      var len = this.get('length');
      start = 0;
      added = len + added - removed;
      removed = len;
    }

    // Continue.
    this.arrayContentWillChange(start, removed, added);
    if (this._kvo_enumerable_property_chains) {
      var removedObjects = this.slice(start, start + removed);
      this.teardownEnumerablePropertyChains(removedObjects);
    }
  },

  _scac_arrayContentDidChange: function (start, removed, added) {
    this._scac_cached = NO;

    // Repoint arguments if orderBy is present. (If orderBy is present, we can't be sure how any content change
    // translates into an arrangedObject change without calculating the order, which is a complex, potentially
    // expensive operation, so we simply invalidate everything.)
    if (this.get('orderBy')) {
      var len = this.get('length');
      start = 0;
      added = len + added - removed;
      removed = len;
    }

    // Notify range, firstObject, lastObject and '[]' observers.
    this.arrayContentDidChange(start, removed, added);

    if (this._kvo_enumerable_property_chains) {
      var addedObjects = this.slice(start, start + added);
      this.setupEnumerablePropertyChains(addedObjects);
    }
    this.updateSelectionAfterContentChange();
  },

  /** @private
    Whenever content changes, setup and teardown observers on the content
    as needed.
  */
  _scac_contentDidChange: function () {
    this._scac_cached = NO; // invalidate observable content
    var content     = this.get('content'),
        lastContent = this._scac_content,
        didChange   = this._scac_arrayContentDidChange,
        willChange  = this._scac_arrayContentWillChange,
        sfunc       = this._scac_contentStatusDidChange,
        efunc       = this._scac_enumerableDidChange,
        newlen;

    if (content === lastContent) { return this; } // nothing to do

    // teardown old observer
    if (lastContent) {
      if (lastContent.isSCArray) {
        lastContent.removeArrayObservers({
          target: this,
          didChange: didChange,
          willChange: willChange
        });
      } else if (lastContent.isEnumerable) {
        lastContent.removeObserver('[]', this, efunc);
      }

      lastContent.removeObserver('status', this, sfunc);

      this.teardownEnumerablePropertyChains(lastContent);
    }

    // save new cached values
    this._scac_cached = NO;
    this._scac_content = content;

    // setup new observer
    // also, calculate new length.  do it manually instead of using
    // get(length) because we want to avoid computed an ordered array.
    if (content) {
      // Content is an enumerable, so listen for changes to its
      // content, and get its length.
      if (content.isSCArray) {
        content.addArrayObservers({
          target: this,
          didChange: didChange,
          willChange: willChange
        });

        newlen = content.get('length');
      } else if (content.isEnumerable) {
        content.addObserver('[]', this, efunc);
        newlen = content.get('length');
      } else {
        // Assume that someone has set a non-enumerable as the content, and
        // treat it as the sole member of an array.
        newlen = 1;
      }

      // Observer for changes to the status property, in case this is an
      // SC.Record or SC.RecordArray.
      content.addObserver('status', this, sfunc);

      this.setupEnumerablePropertyChains(content);
    } else {
      newlen = SC.none(content) ? 0 : 1;
    }

    // finally, notify enumerable content has changed.
    this._scac_length = newlen;
    this._scac_contentStatusDidChange();

    this.arrayContentDidChange(0, 0, newlen);
    this.updateSelectionAfterContentChange();
  }.observes('content'),

  /** @private
    Whenever enumerable content changes, need to regenerate the
    observableContent and notify that the range has changed.

    This is called whenever the content enumerable changes or whenever orderBy
    changes.
  */
  _scac_enumerableDidChange: function () {
    var content = this.get('content'), // use content directly
        newlen  = content ? content.get('length') : 0,
        oldlen  = this._scac_length;

    this._scac_length = newlen;
    this._scac_cached = NO; // invalidate
    // If this is an unordered enumerable, we have no way
    // of knowing which indices changed. Instead, we just
    // invalidate the whole array.
    this.arrayContentWillChange(0, oldlen, newlen);
    this.arrayContentDidChange(0, oldlen, newlen);
    this.updateSelectionAfterContentChange();
  }.observes('orderBy'),

  /** @private
    Whenever the content "status" property changes, relay out.
  */
  _scac_contentStatusDidChange: function () {
    this.notifyPropertyChange('status');
  }

});

/* >>>>>>>>>> BEGIN source/controllers/object.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('controllers/controller') ;

/** @class

  An ObjectController gives you a simple way to manage the editing state of
  an object.  You can use an ObjectController instance as a "proxy" for your
  model objects.

  Any properties you get or set on the object controller, will be passed
  through to its content object.  This allows you to setup bindings to your
  object controller one time for all of your views and then swap out the
  content as needed.

  ## Working with Arrays

  An ObjectController can accept both arrays and single objects as content.
  If the content is an array, the ObjectController will do its best to treat
  the array as a single object.  For example, if you set the content of an
  ObjectController to an array of Contact records and then call:

      contactController.get('name');

  The controller will check the name property of each Contact in the array.
  If the value of the property for each Contact is the same, that value will
  be returned.  If the any values are different, then an array will be
  returned with the values from each Contact in them.

  Most SproutCore views can work with both arrays and single content, which
  means that most of the time, you can simply hook up your views and this will
  work.

  If you would prefer to make sure that your ObjectController is always
  working with a single object and you are using bindings, you can always
  setup your bindings so that they will convert the content to a single object
  like so:

      contentBinding: SC.Binding.single('MyApp.listController.selection') ;

  This will ensure that your content property is always a single object
  instead of an array.

  @extends SC.Controller
  @since SproutCore 1.0
*/
SC.ObjectController = SC.Controller.extend(
/** @scope SC.ObjectController.prototype */ {

  
  /* BEGIN DEBUG ONLY PROPERTIES AND METHODS */

  /* @private */
  toString: function () {
    var content = this.get('content'),
      ret = arguments.callee.base.apply(this,arguments);

    return content ? "%@:\n  ↳ %@".fmt(ret, content) : ret;
  },

  /* END DEBUG ONLY PROPERTIES AND METHODS */
  

  // ..........................................................
  // PROPERTIES
  //

  /**
    Set to the object you want this controller to manage.  The object should
    usually be a single value; not an array or enumerable.  If you do supply
    an array or enumerable with a single item in it, the ObjectController
    will manage that single item.

    Usually your content object should implement the SC.Observable mixin, but
    this is not required.  All SC.Object-based objects support SC.Observable

    @type Object
  */
  content: null,

  /**
    If YES, then setting the content to an enumerable or an array with more
    than one item will cause the Controller to attempt to treat the array as
    a single object.  Use of get(), for example, will get every property on
    the enumerable and return it.  set() will set the property on every item
    in the enumerable.

    If NO, then setting content to an enumerable with multiple items will be
    treated like setting a null value.  hasContent will be NO.

    @type Boolean
  */
  allowsMultipleContent: NO,

  /**
    Becomes YES whenever this object is managing content.  Usually this means
    the content property contains a single object or an array or enumerable
    with a single item.  Array's or enumerables with multiple items will
    normally make this property NO unless allowsMultipleContent is YES.

    @type Boolean
  */
  hasContent: function() {
    return !SC.none(this.get('observableContent'));
  }.property('observableContent'),

  /**
    Makes a controller editable or not editable.  The SC.Controller class
    itself does not do anything with this property but subclasses will
    respect it when modifying content.

    @type Boolean
  */
  isEditable: YES,

  /**
    Primarily for internal use.  Normally you should not access this property
    directly.

    Returns the actual observable object proxied by this controller.  Usually
    this property will mirror the content property.  In some cases - notably
    when setting content to an enumerable, this may return a different object.

    Note that if you set the content to an enumerable which itself contains
    enumerables and allowsMultipleContent is NO, this will become null.

    @type Object
  */
  observableContent: function() {
    var content = this.get('content'),
        len, allowsMultiple;

    // if enumerable, extract the first item or possibly become null
    if (content && content.isEnumerable) {
      len = content.get('length');
      allowsMultiple = this.get('allowsMultipleContent');

      if (len === 1) content = content.firstObject();
      else if (len===0 || !allowsMultiple) content = null;

      // if we got some new content, it better not be enum also...
      if (content && !allowsMultiple && content.isEnumerable) content=null;
    }

    return content;
  }.property('content', 'allowsMultipleContent').cacheable(),

  // ..........................................................
  // METHODS
  //

  /**
    Override this method to destroy the selected object.

    The default just passes this call onto the content object if it supports
    it, and then sets the content to null.

    Unlike most calls to destroy() this will not actually destroy the
    controller itself; only the the content.  You continue to use the
    controller by setting the content to a new value.

    @returns {SC.ObjectController} receiver
  */
  destroy: function() {
    var content = this.get('observableContent') ;
    if (content && SC.typeOf(content.destroy) === SC.T_FUNCTION) {
      content.destroy();
    }
    this.set('content', null) ;
    return this;
  },

  /**
    Invoked whenever any property on the content object changes.

    The default implementation will simply notify any observers that the
    property has changed.  You can override this method if you need to do
    some custom work when the content property changes.

    If you have set the content property to an enumerable with multiple
    objects and you set allowsMultipleContent to YES, this method will be
    called anytime any property in the set changes.

    If all properties have changed on the content or if the content itself
    has changed, this method will be called with a key of "*".

    @param {Object} target the content object
    @param {String} key the property that changes
    @returns {void}
  */
  contentPropertyDidChange: function(target, key) {
    if (key === '*') this.allPropertiesDidChange();
    else this.notifyPropertyChange(key);
  },

  /**
    Called whenver you try to get/set an unknown property.  The default
    implementation will pass through to the underlying content object but
    you can override this method to do some other kind of processing if
    needed.

    @param {String} key key being retrieved
    @param {Object} value value to set or undefined if reading only
    @returns {Object} property value
  */
  unknownProperty: function(key,value) {

    // avoid circular references
    if (key==='content') {
      if (value !== undefined) this.content = value;
      return this.content;
    }

    // for all other keys, just pass through to the observable object if
    // there is one.  Use getEach() and setEach() on enumerable objects.
    var content = this.get('observableContent'), loc, cur, isSame;
    if (content===null || content===undefined) return undefined; // empty

    // getter...
    if (value === undefined) {
      if (content.isEnumerable) {
        value = content.getEach(key);

        // iterate over array to see if all values are the same. if so, then
        // just return that value
        loc = value.get('length');
        if (loc>0) {
          isSame = YES;
          cur = value.objectAt(0);
          while((--loc > 0) && isSame) {
            if (cur !== value.objectAt(loc)) isSame = NO ;
          }
          if (isSame) value = cur;
        } else value = undefined; // empty array.

      } else value = (content.isObservable) ? content.get(key) : content[key];

    // setter
    } else {
      if (!this.get('isEditable')) {
        throw new Error("%@.%@ is not editable".fmt(this,key));
      }

      if (content.isEnumerable) content.setEach(key, value);
      else if (content.isObservable) content.set(key, value);
      else content[key] = value;
    }

    return value;
  },

  // ...............................
  // INTERNAL SUPPORT
  //

  /** @private - setup observer on init if needed. */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    if (this.get('content')) this._scoc_contentDidChange();
    if (this.get('observableContent')) this._scoc_observableContentDidChange();
  },

  _scoc_contentDidChange: function () {
    var last = this._scoc_content,
        cur  = this.get('content');

    if (last !== cur) {
      this._scoc_content = cur;
      var func = this._scoc_enumerableContentDidChange;
      if (last && last.isEnumerable) {
        last.removeObserver('[]', this, func);
      }
      if (cur && cur.isEnumerable) {
        cur.addObserver('[]', this, func);
      }
    }
  }.observes("content"),

  /**  @private

    Called whenever the observable content property changes.  This will setup
    observers on the content if needed.
  */
  _scoc_observableContentDidChange: function() {
    var last = this._scoc_observableContent,
        cur  = this.get('observableContent'),
        func = this.contentPropertyDidChange,
        efunc= this._scoc_enumerableContentDidChange;

    if (last === cur) return this; // nothing to do
    //console.log('observableContentDidChange');

    this._scoc_observableContent = cur; // save old content

    // stop observing last item -- if enumerable stop observing set
    if (last) {
      if (last.isEnumerable) last.removeObserver('[]', this, efunc);
      else if (last.isObservable) last.removeObserver('*', this, func);
    }

    if (cur) {
      if (cur.isEnumerable) cur.addObserver('[]', this, efunc);
      else if (cur.isObservable) cur.addObserver('*', this, func);
    }

    // notify!
    if ((last && last.isEnumerable) || (cur && cur.isEnumerable)) {
      this._scoc_enumerableContentDidChange();
    } else {
      this.contentPropertyDidChange(cur, '*');
    }

  }.observes("observableContent"),

  /** @private
    Called when observed enumerable content has changed.  This will teardown
    and setup observers on the enumerable content items and then calls
    contentPropertyDidChange().  This method may be called even if the new
    'cur' is not enumerable but the last content was enumerable.
  */
  _scoc_enumerableContentDidChange: function() {
    var cur  = this.get('observableContent'),
        set  = this._scoc_observableContentItems,
        func = this.contentPropertyDidChange;

    // stop observing each old item
    if (set) {
      set.forEach(function(item) {
        if (item.isObservable) item.removeObserver('*', this, func);
      }, this);
      set.clear();
    }

    // start observing new items if needed
    if (cur && cur.isEnumerable) {
      if (!set) set = SC.Set.create();
      cur.forEach(function(item) {
        if (set.contains(item)) return ; // nothing to do
        set.add(item);
        if (item.isObservable) item.addObserver('*', this, func);
      }, this);
    } else set = null;

    this._scoc_observableContentItems = set; // save for later cleanup

    // notify
    this.contentPropertyDidChange(cur, '*');
    return this ;
  }

}) ;

/* >>>>>>>>>> BEGIN source/ext/function.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.mixin(Function.prototype, /** @scope Function.prototype */ {

  /**
    Creates a timer that will execute the function after a specified 
    period of time.
    
    If you pass an optional set of arguments, the arguments will be passed
    to the function as well.  Otherwise the function should have the 
    signature:
    
        function functionName(timer)

    @param target {Object} optional target object to use as this
    @param interval {Number} the time to wait, in msec
    @returns {SC.Timer} scheduled timer
  */
  invokeLater: function(target, interval) {
    if (interval === undefined) interval = 1 ;
    var f = this;
    if (arguments.length > 2) {
      var args = SC.$A(arguments).slice(2,arguments.length);
      args.unshift(target);
      // f = f.bind.apply(f, args) ;
      var func = f ;
      // Use "this" in inner func because it get its scope by 
      // outer func f (=target). Could replace "this" with target for clarity.
      f = function() { return func.apply(this, args.slice(1)); } ;
    }
    return SC.Timer.schedule({ target: target, action: f, interval: interval });
  }

});

/* >>>>>>>>>> BEGIN source/ext/object.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// Extensions to the core SC.Object class
SC.mixin(SC.Object.prototype, /** @scope SC.Object.prototype */ {

  /**
    Invokes the named method after the specified period of time.  This
    uses SC.Timer, which works properly with the Run Loop.

    Any additional arguments given to invokeOnce will be passed to the
    method.

    For example,

        var obj = SC.Object.create({
          myMethod: function(a, b, c) {
            alert('a: %@, b: %@, c: %@'.fmt(a, b, c));
          }
        });

        obj.invokeLater('myMethod', 200, 'x', 'y', 'z');

        // After 200 ms, alerts "a: x, b: y, c: z"

    @param method {String} method name to perform.
    @param interval {Number} period from current time to schedule.
    @returns {SC.Timer} scheduled timer.
  */
  invokeLater: function(method, interval) {
    var f, args;

    // Normalize the method and interval.
    if (SC.typeOf(method) === SC.T_STRING) { method = this[method]; }
    if (interval === undefined) { interval = 1 ; }

    // If extra arguments were passed - build a function binding.
    if (arguments.length > 2) {
      args = SC.$A(arguments).slice(2);
      f = function() { return method.apply(this, args); } ;
    } else {
      f = method;
    }

    // schedule the timer
    return SC.Timer.schedule({ target: this, action: f, interval: interval });
  },

  /**
    A convenience method which makes it easy to coalesce invocations to ensure
    that the method is only called once after the given period of time. This is
    useful if you need to schedule a call from multiple places, but only want
    it to run at most once.

    Any additional arguments given to invokeOnceLater will be passed to the
    method.

    For example,

        var obj = SC.Object.create({
          myMethod: function(a, b, c) {
            alert('a: %@, b: %@, c: %@'.fmt(a, b, c));
          }
        });

        obj.invokeOnceLater('myMethod', 200, 'x', 'y', 'z');

        // After 200 ms, alerts "a: x, b: y, c: z"

    @param {Function|String} method reference or method name
    @param {Number} interval
  */
  invokeOnceLater: function(method, interval) {
    var args, f,
        methodGuid,
        timers = this._sc_invokeOnceLaterTimers,
        existingTimer, newTimer;

    // Normalize the method, interval and timers cache.
    if (SC.typeOf(method) === SC.T_STRING) { method = this[method]; }
    if (interval === undefined) { interval = 1 ; }
    if (!timers) { timers = this._sc_invokeOnceLaterTimers = {}; }

    // If there's a timer outstanding for this method, invalidate it in favor of
    // the new timer.
    methodGuid = SC.guidFor(method);
    existingTimer = timers[methodGuid];
    if (existingTimer) existingTimer.invalidate();

    // If extra arguments were passed - apply them to the method.
    if (arguments.length > 2) {
      args = SC.$A(arguments).slice(2);
    } else {
      args = arguments;
    }

    // Create a function binding every time, so that the timers cache is properly cleaned out.
    f = function() {
      // GC assistance for IE
      delete timers[methodGuid];
      return method.apply(this, args);
    };

    // Schedule the new timer and track it.
    newTimer = SC.Timer.schedule({ target: this, action: f, interval: interval });
    timers[methodGuid] = newTimer;

    return newTimer;
  },

  /**
    Lookup the named property path and then invoke the passed function,
    passing the resulting value to the function.

    This method is a useful way to handle deferred loading of properties.
    If you want to defer loading a property, you can override this method.
    When the method is called, passing a deferred property, you can load the
    property before invoking the callback method.

    You can even swap out the receiver object.

    The callback method should have the signature:

    function callback(objectAtPath, sourceObject) { ... }

    You may pass either a function itself or a target/method pair.

    @param {String} pathName
    @param {Object} target target or method
    @param {Function|String} method
    @returns {SC.Object} receiver
  */
  invokeWith: function(pathName, target, method) {
    // normalize target/method
    if (method === undefined) {
      method = target; target = this;
    }
    if (!target) { target = this ; }
    if (SC.typeOf(method) === SC.T_STRING) { method = target[method]; }

    // get value
    var v = this.getPath(pathName);

    // invoke method
    method.call(target, v, this);
    return this ;
  }

});

/* >>>>>>>>>> BEGIN source/ext/run_loop.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// Create anonymous subclass of SC.RunLoop to add support for processing
// view queues and Timers.
SC.RunLoop = SC.RunLoop.extend(
/** @scope SC.RunLoop.prototype */ {

  /**
    The time the current run loop began executing.

    All timers scheduled during this run loop will begin executing as if
    they were scheduled at this time.

    @type Number
  */
  startTime: function() {
    if (!this._start) { this._start = Date.now(); }
    return this._start ;
  }.property(),

  /*

    Override to fire and reschedule timers once per run loop.

    Note that timers should fire only once per run loop to avoid the
    situation where a timer might cause an infinite loop by constantly
    rescheduling itself every time it is fired.
  */
  endRunLoop: function() {
    this.fireExpiredTimers(); // fire them timers!
    var ret = arguments.callee.base.apply(this,arguments); // do everything else
    this.scheduleNextTimeout(); // schedule a timeout if timers remain
    return ret;
  },

  // ..........................................................
  // TIMER SUPPORT
  //

  /**
    Schedules a timer to execute at the specified runTime.  You will not
    usually call this method directly.  Instead you should work with SC.Timer,
    which will manage both creating the timer and scheduling it.

    Calling this method on a timer that is already scheduled will remove it
    from the existing schedule and reschedule it.

    @param {SC.Timer} timer the timer to schedule
    @param {Time} runTime the time offset when you want this to run
    @returns {SC.RunLoop} receiver
  */
  scheduleTimer: function(timer, runTime) {
    // if the timer is already in the schedule, remove it.
    this._timerQueue = timer.removeFromTimerQueue(this._timerQueue);

    // now, add the timer ot the timeout queue.  This will walk down the
    // chain of timers to find the right place to insert it.
    this._timerQueue = timer.scheduleInTimerQueue(this._timerQueue, runTime);
    return this ;
  },

  /**
    Removes the named timer from the timeout queue.  If the timer is not
    currently scheduled, this method will have no effect.

    @param {SC.Timer} timer the timer to schedule
    @returns {SC.RunLoop} receiver
  */
  cancelTimer: function(timer) {
    this._timerQueue = timer.removeFromTimerQueue(this._timerQueue) ;
    return this ;
  },

  /** @private - shared array used by fireExpiredTimers to avoid memory */
  TIMER_ARRAY: [],

  /**
    Invokes any timers that have expired since this method was last called.
    Usually you will not call this method directly, but it will be invoked
    automatically at the end of the run loop.

    @returns {Boolean} YES if timers were fired, NO otherwise
  */
  fireExpiredTimers: function() {
    if (!this._timerQueue || this._firing) { return NO; } // nothing to do

    // max time we are allowed to run timers
    var now = this.get('startTime'),
        timers = this.TIMER_ARRAY,
        idx, len, didFire;

    // avoid recursive calls
    this._firing = YES;

    // collect timers to fire.  we do this one time up front to avoid infinite
    // loops where firing a timer causes it to schedule itself again, causing
    // it to fire again, etc.
    this._timerQueue = this._timerQueue.collectExpiredTimers(timers, now);

    // now step through timers and fire them.
    len = timers.length;
    for(idx=0;idx<len;idx++) { timers[idx].fire(); }

    // cleanup
    didFire = timers.length > 0 ;
    timers.length = 0 ; // reset for later use...
    this._firing = NO ;
    return didFire;
  },

  /** @private
    Invoked at the end of a runloop, if there are pending timers, a timeout
    will be scheduled to fire when the next timer expires.  You will not
    usually call this method yourself.  It is invoked automatically at the
    end of a run loop.

    @returns {Boolean} YES if a timeout was scheduled
  */
  scheduleNextTimeout: function() {
    var ret = NO,
      timer = this._timerQueue;

    // if no timer, and there is an existing timeout, attempt to cancel it.
    // NOTE: if this happens to be an invokeNext based timer, it will not be
    // cancelled.
    if (!timer) {
      if (this._timerTimeout) { this.unscheduleRunLoop(); }
      this._timerTimeout = null;

    // otherwise, determine if the timeout needs to be rescheduled.
    } else {
      var nextTimeoutAt = timer._timerQueueRunTime ;
      this._timerTimeout = this.scheduleRunLoop(nextTimeoutAt);
      ret = YES;
    }

    return ret ;
  }

});

// Recreate the currentRunLoop with the new methods
SC.RunLoop.currentRunLoop = SC.RunLoop.create();
SC.RunLoop.runLoopClass = SC.RunLoop;

/* >>>>>>>>>> BEGIN source/ext/string.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/string');

SC.supplement(String.prototype,
/** @scope String.prototype */ {

  /**
    @see SC.String.capitalize
  */
  capitalize: function() {
    return SC.String.capitalize(this, arguments);
  },

  /**
    @see SC.String.camelize
  */
  camelize: function() {
    return SC.String.camelize(this, arguments);
  },

  /**
    @see SC.String.decamelize
  */
  decamelize: function() {
    return SC.String.decamelize(this, arguments);
  },

  /**
    @see SC.String.dasherize
  */
  dasherize: function() {
    return SC.String.dasherize(this, arguments);
  },

  /**
    @see SC.String.escapeCssIdForSelector
  */
  escapeCssIdForSelector: function () {
    return SC.String.escapeCssIdForSelector(this);
  },

  /**
    @see SC.String.loc
  */
  loc: function() {
    var args = SC.$A(arguments);
    args.unshift(this);
    return SC.String.loc.apply(SC.String, args);
  },

  /**
    @see SC.String.locWithDefault
  */
  locWithDefault: function(def) {
    var args = SC.$A(arguments);
    args.unshift(this);
    return SC.String.locWithDefault.apply(SC.String, args);
  },
  
  /**
    @see SC.String.mult
  */
  mult: function(value) {
    return SC.String.mult(this, value);
  }

});


/* >>>>>>>>>> BEGIN source/lproj/ordinal.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
 * Returns the ordinal associated for the current number.
 */
SC.methodForLocale('en', 'ordinalForNumber', function(number) {
  var d = number % 10;
  return (~~ (number % 100 / 10) === 1) ? 'th' :
         (d === 1) ? 'st' :
         (d === 2) ? 'nd' :
         (d === 3) ? 'rd' : 'th';
});
/* >>>>>>>>>> BEGIN source/mixins/action_support.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  Implements basic target + action support for views. To use, simply set the `action` property on
  the view to the name of a method handled by an object in the current responder chain and call
  `fireAction`. If the `target` property is also set, the `action` will only be attempted on that
  target object. If not set, then the responder chain will be searched for an object that implements
  the named action.

  *Note* Because searching the responder chain is slower, it is recommended to specify an actual
  target whenever possible.

  ### Implementing Actions in a Target

  The method signature for target + action implementors is,

      methodName: function (sender, context) {
        return; // Optional: return a value to the sender.
      }

  For views implementing `SC.ActionSupport`, the `sender` will always be `this`, which can be useful
  when an action may be called by multiple views and the target needs to know from which view it was
  triggered. For example, here is an action that will hide the sender's (any sender's) pane,

      // Hides the pane of the current sender.
      hidePane: function (sender) {
        var pane = sender.get('pane');
        pane.set('isVisible', false);
      }

  In order to pass additional information to the target, the target's action method may accept a
  second argument, `context`. This argument will be the value of the same-named `context` argument
  passed to `fireAction()` of the view. Here is a simple example to help illustrate this,

      // Target
      var theTargetObject = SC.Object.create({

        theActionMethod: function (sender, context) {
          console.log("theActionMethod was called at: %@".fmt(context.calledAt))
        }

      });

      // View with SC.ActionSupport
      var view = SC.View.create(SC.ActionSupport, {
        action: 'theActionMethod',
        target: theTargetObject,

        someEvent: function () {
          var addedContext = {
            calledAt: new Date() // Calling specific information to pass to the target.
          };

          this.fireAction(addedContext);
        }

      });

  @since SproutCore 1.7
*/
SC.ActionSupport =
/** @scope SC.ActionSupport.prototype */ {

  
  // Provide some debug-only developer warning support.
  initMixin: function () {
    if (this.actionContext !== null) {
      SC.warn("Developer Warning: The `actionContext` property of `SC.ActionSupport` has been deprecated. Please pass the `context` argument to `fireAction()` directly.");
    }
  },
  

  /**
    The name of the method to call when `fireAction` is called.

    This property is used in conjunction with the `target` property to execute a method when
    `fireAction` is called. If you do not specify a target, then the responder chain will be
    searched for a view that implements the named action. If you do set a target, then the button
    will only try to call the method on that target.

    The action method of the target should implement the following signature:

        methodName: function (sender, context) {
          return; // Optional: return a value to the sender.
        }

    ### Supporting multiple actions

    The most correct way to handle variable properties in SproutCore is to use a computed property.
    For example, imagine if the action depended on a property, `isReady`. While we could set
    `action` accordingly each time prior to calling `fireAction()` like so,

        mouseUp: function () {
          var isReady = this.get('isReady');

          if (isReady) {
            this.set('action', 'doReadyAction');
          } else {
            this.set('action', 'doNotReadyAction');
          }

          this.fireAction();
        }

    This is a bit wasteful (imagine `isReady` doesn't change very often) and leaves `action` in
    an improper state (i.e. what if `isReady` changes without a call to mouseUp, then `action` is
    incorrect for any code that may reference it).

    The better approach is to make `action` a computed property dependent on `isReady`.

    For example, the previous example would be better as,

        action: function () {
          return this.get('isReady') ? 'doReadyAction' : 'doNotReadyAction';
        }.property('isReady'), // .cacheable() - optional to cache the result (consider memory used to cache result vs. computation time to compute result)

        mouseUp: function () {
          this.fireAction(); // Fires with current value of `action`.
        }

    @type String
    @default null
  */
  action: null,

  /** @deprecated Version 1.11.0. Please specify `context` argument when calling fireAction method.
    @type Object
    @default null
  */
  actionContext: null,

  /**
    The target to invoke the action on when `fireAction` is called.

    If you set this target, the action will be called on the target object directly when the button
    is clicked.  If you leave this property set to `null`, then the responder chain will be
    searched for a view that implements the action when the button is pressed.

    The action method of the target should implement the following signature:

        methodName: function (sender, context) {
          return; // Optional: return a value to the sender.
        }

    ### Supporting multiple targets

    The most correct way to handle variable properties in SproutCore is to use a computed property.
    For example, imagine if the target depended on a property, `isReady`. While we could set
    `target` accordingly each time prior to calling `fireAction()` like so,

        mouseUp: function () {
          var isReady = this.get('isReady');

          if (isReady) {
            this.set('target', MyApp.readyTarget);
          } else {
            this.set('target', MyApp.notReadyTarget);
          }

          this.fireAction();
        }

    This is a bit wasteful (imagine `isReady` doesn't change very often) and leaves `target` in
    an improper state (i.e. what if `isReady` changes without a call to mouseUp, then `target` is
    incorrect for any code that may reference it).

    The better approach is to make `target` a computed property dependent on `isReady`.

    For example, the previous example would be better as,

        target: function () {
          return this.get('isReady') ? MyApp.readyTarget : MyApp.notReadyTarget;
        }.property('isReady'), // .cacheable() - optional to cache the result (consider memory used to cache result vs. computation time to compute result)

        mouseUp: function () {
          this.fireAction(); // Fires with current value of `target`.
        }

    @type Object
    @default null
  */
  target: null,

   /**
     Perform the current action on the current target with the given context. If no target is set,
     then the responder chain will be searched for an object that implements the action.

     You can pass the `context` parameter, which is useful in order to provide additional
     information to the target, such as the current state of the sender when the action was
     triggered.

     @param {Object} [context] additional context information to pass to the target
     @returns {Boolean} true if successful; false otherwise
  */
  // TODO: remove backwards compatibility for `action` argument
  fireAction: function (actionOrContext) {
    var pane = this.get('pane'),
      rootResponder = pane.get('rootResponder'),
      action = this.get('action'),
      context;

    // Normalize arguments.
    // TODO: Fully deprecate action argument and actionContext property.

    // No argument, use action (above) and actionContext properties.
    if (actionOrContext === undefined) {
      context = this.get('actionContext');

    // String argument and no action (above) property, assume action method name. Use argument with actionContext property.
    } else if (typeof actionOrContext === SC.T_STRING && action == null) {
      
      // Provide some debug-only developer warning support.
      SC.warn("Developer Warning: The signature of `SC.ActionSupport.prototype.fireAction` has changed. Please set the `action` property on your view and only pass an optional context argument to `fireAction`.");
      
      action = actionOrContext;
      context = this.get('actionContext');

    // Something else, use action property (above) and context argument.
    } else {
      context = actionOrContext;
    }

    if (action && rootResponder) {
      return rootResponder.sendAction(action, this.get('target'), this, pane, context, this);
    }

    return false;
  }

};

/* >>>>>>>>>> BEGIN source/mixins/responder_context.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('system/responder');

/** @namespace

  The root object for a responder chain.  A responder context can dispatch
  actions directly to a first responder; walking up the responder chain until
  it finds a responder that can handle the action.

  If no responder can be found to handle the action, it will attempt to send
  the action to the defaultResponder.

  You can have as many ResponderContext's as you want within your application.
  Every SC.Pane and SC.Application automatically implements this mixin.

  Note that to implement this, you should mix SC.ResponderContext into an
  SC.Responder or SC.Responder subclass.

  @since SproutCore 1.0
*/
SC.ResponderContext = {

  
  /* BEGIN DEBUG ONLY PROPERTIES AND METHODS */

  /** @property

    When set to YES, logs tracing information about all actions sent and
    responder changes.
  */
  trace: NO,

  /* END DEBUG ONLY PROPERTIES AND METHODS */
  

  // ..........................................................
  // PROPERTIES
  //

  isResponderContext: YES,

  /** @property
    The default responder.  Set this to point to a responder object that can
    respond to events when no other view in the hierarchy handles them.

    @type SC.Responder
  */
  defaultResponder: null,

  /** @property
    The next responder for an app is always its defaultResponder.
  */
  nextResponder: function() {
    return this.get('defaultResponder');
  }.property('defaultResponder').cacheable(),

  /** @property
    The first responder.  This is the first responder that should receive
    actions.
  */
  firstResponder: null,

  // ..........................................................
  // METHODS
  //

  /**
    Finds the next responder for the passed responder based on the responder's
    nextResponder property.  If the property is a string, then lookup the path
    in the receiver.
  */
  nextResponderFor: function(responder) {
    var next = responder.get('nextResponder');
    if (typeof next === SC.T_STRING) {
      next = SC.objectForPropertyPath(next, this);
    } else if (!next && (responder !== this)) next = this ;
    return next ;
  },

  /**
    Finds the responder name by searching the responders one time.
  */
  responderNameFor: function(responder) {
    if (!responder) return "(No Responder)";
    else if (responder._scrc_name) return responder._scrc_name;

    // none found, let's go hunting...look three levels deep
    var n = this.NAMESPACE;
    this._findResponderNamesFor(this, 3, n ? [this.NAMESPACE] : []);

    return responder._scrc_name || responder.toString(); // try again
  },

  /** @private */
  _findResponderNamesFor: function(responder, level, path) {
    var key, value;

    for(key in responder) {
      if (key === 'nextResponder') continue ;
      value = responder[key];
      if (value && value.isResponder) {
        if (value._scrc_name) continue ;
        path.push(key);
        value._scrc_name = path.join('.');
        if (level>0) this._findResponderNamesFor(value, level-1, path);
        path.pop();
      }
    }
  },

  /**
    Makes the passed responder into the new firstResponder for this
    responder context.  This will cause the current first responder to lose
    its responder status and possibly keyResponder status as well.

    When you change the first responder, this will send callbacks to
    responders up the chain until you reach a shared responder, at which point
    it will stop notifying.

    @param {SC.Responder} responder
    @param {Event} evt that cause this to become first responder
    @returns {SC.ResponderContext} receiver
  */
  makeFirstResponder: function(responder, evt) {
    var current = this.get('firstResponder'),
        last    = this.get('nextResponder'),
        
        trace   = this.get('trace'),
        
        common ;

    if (this._locked) {
      
      if (trace) {
        SC.Logger.log('%@: AFTER ACTION: makeFirstResponder => %@'.fmt(this, this.responderNameFor(responder)));
      }
      

      this._pendingResponder = responder;
      return ;
    }

    
    if (trace) {
      SC.Logger.log('%@: makeFirstResponder => %@'.fmt(this, this.responderNameFor(responder)));
    }
    

    if (responder) responder.set("becomingFirstResponder", YES);

    this._locked = YES;
    this._pendingResponder = null;

    // Find the nearest common responder in the responder chain for the new
    // responder.  If there are no common responders, use last responder.
    // Note: start at the responder itself: it could be the common responder.
    common = responder ? responder : null;
    while (common) {
      if (common.get('hasFirstResponder')) break;
      common = (common===last) ? null : this.nextResponderFor(common);
    }
    if (!common) common = last;

    // Cleanup old first responder
    this._notifyWillLoseFirstResponder(current, current, common, evt);
    if (current) current.set('isFirstResponder', NO);

    // Set new first responder.  If new firstResponder does not have its
    // responderContext property set, then set it.

    // but, don't tell anyone until we have _also_ updated the hasFirstResponder state.
    this.beginPropertyChanges();

    this.set('firstResponder', responder) ;
    if (responder) responder.set('isFirstResponder', YES);

    this._notifyDidBecomeFirstResponder(responder, responder, common);

    // now, tell everyone the good news!
    this.endPropertyChanges();

    this._locked = NO ;
    if (this._pendingResponder) {
      this.makeFirstResponder(this._pendingResponder);
      this._pendingResponder = null;
    }

    if (responder) responder.set("becomingFirstResponder", NO);

    return this ;
  },

  _notifyWillLoseFirstResponder: function(responder, cur, root, evt) {
    if (!cur || cur === root) return ; // nothing to do

    cur.willLoseFirstResponder(responder, evt);
    cur.set('hasFirstResponder', NO);

    var next = this.nextResponderFor(cur);
    if (next) this._notifyWillLoseFirstResponder(responder, next, root);
  },

  _notifyDidBecomeFirstResponder: function(responder, cur, root) {
    if (!cur || cur === root) return ; // nothing to do

    var next = this.nextResponderFor(cur);
    if (next) this._notifyDidBecomeFirstResponder(responder, next, root);

    cur.set('hasFirstResponder', YES);
    cur.didBecomeFirstResponder(responder);
  },

  /**
    Re-enters the current responder (calling willLoseFirstResponder and didBecomeFirstResponder).
  */
  resetFirstResponder: function() {
    var current = this.get('firstResponder');
    if (!current) return;
    current.willLoseFirstResponder();
    current.didBecomeFirstResponder();
  },

  /**
    Send the passed action down the responder chain, starting with the
    current first responder.  This will look for the first responder that
    actually implements the action method and returns YES or no value when
    called.

    @param {String} action name of action
    @param {Object} sender object sending the action
    @param {Object} [context] additional context info
    @returns {SC.Responder} the responder that handled it or null
  */
  sendAction: function(action, sender, context) {
    var working = this.get('firstResponder'),
        last    = this.get('nextResponder'),
        
        trace   = this.get('trace'),
        
        handled = NO,
        responder;

    this._locked = YES;

    
    if (trace) {
      SC.Logger.log("%@: begin action '%@' (%@, %@)".fmt(this, action, sender, context));
    }
    

    if (!handled && !working && this.tryToPerform) {
      handled = this.tryToPerform(action, sender, context);
    }

    while (!handled && working) {
      if (working.tryToPerform) {
        handled = working.tryToPerform(action, sender, context);
      }

      if (!handled) {
        working = (working===last) ? null : this.nextResponderFor(working);
      }
    }

    
    if (trace) {
      if (!handled) SC.Logger.log("%@:  action '%@' NOT HANDLED".fmt(this,action));
      else SC.Logger.log("%@: action '%@' handled by %@".fmt(this, action, this.responderNameFor(working)));
    }
    

    this._locked = NO ;

    if (responder = this._pendingResponder) {
      this._pendingResponder= null ;
      this.makeFirstResponder(responder);
    }


    return working ;
  }

};

/* >>>>>>>>>> BEGIN source/panes/body_overflow.js */
/**
  SC.bodyOverflowArbitrator is a central object responsible for controlling the overflow on the body element.

  Use it from views that would otherwise set the body overflow style directly; call requestHidden to ask for
  the body to have overflow:hidden, and call requestVisible to ask for the body to be visible.

  Call withdrawRequest to register that you no longer have any interest in the body overflow setting. Don't
  forget to do this, or your object could be affecting the body overflow long after it's no longer relevant.

  When calling requestHidden, requestVisible, and withdrawRequest, pass your object as the first argument so
  that its request can be associated with its GUID.

  When calling requestHidden or requestVisible, you may optionally pass true as a second argument to signify
  that your desire for hidden or visible overflow is important. An important visible-request will override
  any other, but an important hidden-request will override a normal visible-request. A normal visible-request
  will in turn override a normal hidden-request.
*/
SC.bodyOverflowArbitrator = SC.Object.create(/**@scope SC.bodyOverflowArbitrator.prototype */{
  /** Request that the body be given overflow:hidden;. Pass your object, then (optionally) true to confer importance. */
  requestHidden: function (from, important) { this._makeRequest(from, -1 - 9 * !!important); },

  /** Request that the body be given overflow:visible;. Pass your object, then (optionally) true to confer importance. */
  requestVisible: function (from, important) { this._makeRequest(from, 1 + 9 * !!important); },

  /** State that your object no longer cares about the body overflow. */
  withdrawRequest: function (from) {
    // Fast path!
    if (!from) return;

    var guid = SC.guidFor(from),
      currentRequest = this._requests[guid];

    if (currentRequest) {
      delete this._requests[guid];
      this.setOverflow();
    }
  },

  /** Perform the action of setting the overflow depending on what requests are currently registered. Does nothing if there are no requests. */
  setOverflow: function () {
    var overflow = this._decideOverflow();

    if (overflow !== undefined) document.body.style.overflow = overflow ? "auto" : "hidden";
    // console.log("Body Overflow Arbitrator now decides "+(overflow===undefined?"that overflow is unimportant.":"to use overflow:"+(overflow===true?'visible':"hidden")+";")+" Requests are:",this._requests);
  },

  /** @private */
  _makeRequest: function (from, value) {
    // Fast path!
    if (!from) return;

    var guid = SC.guidFor(from),
      currentRequest = this._requests[guid];

    if (currentRequest != value) {
      this._requests[guid] = value;
      this.setOverflow();
    }
  },

  /** @private */
  _requests: {},

  /** @private */
  _decideOverflow: function () {
    var haveHidden, haveVisible, haveImportantHidden, haveImportantVisible,
        reqs = this._requests, req;

    for (var i in reqs) {
      if ((req = reqs[i]) < 0) haveHidden = YES;
      if (req < -1) haveImportantHidden = YES;
      if (req > 0) haveVisible = YES;
      if (req > 1) haveImportantVisible = YES;
    }
    if (haveImportantVisible) return YES;              //important-visible takes all.
    if (haveVisible && haveImportantHidden) return NO; //important-hidden beats regular-visible.
    if (haveVisible) return YES;                       //regular-visible beats regular-hidden
    if (haveHidden) return NO;                         //if there is a hidden, it can win now.

    return undefined;                                  //if nobody cared, return undefined to prevent work.
  }
});

/* >>>>>>>>>> BEGIN source/views/view/animation.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("views/view");

/** @private
  Properties that can be animated
  (Hash for faster lookup)
*/
SC.ANIMATABLE_PROPERTIES = {
  top:     YES,
  left:    YES,
  bottom:  YES,
  right:   YES,
  width:   YES,
  height:  YES,
  centerX: YES,
  centerY: YES,
  opacity: YES,
  scale:   YES,
  rotate:  YES,
  rotateX: YES,
  rotateY: YES,
  rotateZ: YES
};


/**
  States that the view's layout can be set to if its animation is cancelled.

  ### START

  The previous layout of the view before calling animate.

  For example,

      myView.set('layout', { left: 0, top: 0, width: 100, bottom: 0 });
      myView.animate('left', 300, { duration: 1.5 });

      // later..
      myView.cancelAnimation(SC.LayoutState.START);

      myView.get('layout'); // => { left: 0, top: 0, width: 100, bottom: 0 }

  ### CURRENT

  The current layout of the view while it is animating.

  For example,

      myView.set('layout', { left: 0, top: 0, width: 100, bottom: 0 });
      myView.animate('left', 300, { duration: 1.5 });

      // later..
      myView.cancelAnimation(SC.LayoutState.CURRENT);
      myView.get('layout'); // => { left: 150, top: 0, width: 100, bottom: 0 }

  ### END

  The final layout of the view if the animation completed.

  For example,

      myView.set('layout', { left: 0, top: 0, width: 100, bottom: 0 });
      myView.animate('left', 300, { duration: 1.5 });

      // later..
      myView.cancelAnimation(SC.LayoutState.END);
      myView.get('layout'); // => { left: 300, top: 0, width: 100, bottom: 0 }

  @readonly
  @enum {Number}
*/
SC.LayoutState = {
  START: 1,
  CURRENT: 2,
  END: 3
};


SC.View.reopen(
  /** @scope SC.View.prototype */ {

  /** @private Shared object used to avoid continually initializing/destroying objects. */
  _SC_DECOMPOSED_TRANSFORM_MAP: null,

  /* @private Internal variable to store the active (i.e. applied) animations. */
  _activeAnimations: null,

  /* @private Internal variable to store the count of active animations. */
  _activeAnimationsLength: null,

  /* @private Internal variable to store the animation layout until the next run loop when it can be safely applied. */
  _animateLayout: null,

  /* @private Internal variable to store the pending (i.e. not yet applied) animations. */
  _pendingAnimations: null,

  /* @private Internal variable to store the previous layout for in case the animation is cancelled and meant to return to original point. */
  _prevLayout: null,

  /**
    Method protocol.

    The method you provide to SC.View.prototype.animate should accept the
    following parameter(s).

    @name AnimateCallback
    @function
    @param {object} animationResult The result of the animation.
    @param {boolean} animationResult.isCancelled Whether the animation was cancelled or not.
    @param {event} [animationResult.evt] The transitionend event if it exists.
    @param {SC.View} animationResult.view The animated view.
  */

  /**
    Animate a group of layout properties using CSS animations.

    On supported platforms, this will apply the proper CSS transition style
    in order to animate the view to the new layout.  The properties object
    should contain the names of the layout properties to animate with the new
    layout values as values.

    # Options

    To control the transition, you must provide an options object that contains
    at least the duration property and optionally the timing and delay
    properties.  The options properties are as follows:

    - duration: The duration of the transition in seconds.  The default value is 0.25.

    - timing: The transition timing function.  This may be a predefined CSS timing
      function (e.g. 'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out') or
      it may be an array of values to make a cubic bezier (e.g. [0, 0, 0.58, 1.0]).
      The default value is 'ease'.

      ** 'linear' - Specifies a transition effect with the same speed from start to end (equivalent to cubic-bezier(0,0,1,1))
      ** 'ease' -  Specifies a transition effect with a slow start, then fast, then end slowly (equivalent to cubic-bezier(0.25,0.1,0.25,1))
      ** 'ease-in' - Specifies a transition effect with a slow start (equivalent to cubic-bezier(0.42,0,1,1))
      ** 'ease-out' -  Specifies a transition effect with a slow end (equivalent to cubic-bezier(0,0,0.58,1))
      ** 'ease-in-out' - Specifies a transition effect with a slow start and end (equivalent to cubic-bezier(0.42,0,0.58,1))
      ** 'cubic-bezier(n,n,n,n)' - Define your own values in the cubic-bezier function. Possible values are numeric values from 0 to 1

    - delay: The transition delay in seconds.  The default value is 0.

    For example,

        var myView = SC.View.create({
          layout: { top: 10, left: 10, width: 200, height: 400 }
        });

        MyApp.mainPane.appendChild(myView);

        // The view will animate to the new top & left values.
        myView.animate(
          { top: 200, left: 200 },  // properties
          { duration: 0.75, timing: 'ease-out', delay: 0.5 } // options
        );

    # Callbacks

    To execute code when the transition completes, you may provide an optional
    target and/or method.  When the given group of transitions completes,
    the callback function will be called once and passed an animationResult object with
    properties containing the `event`, the `view` and a boolean `isCancelled` which
    indicates if the animation had been cancelled or not.  The format of the
    target and method follows the standard SproutCore format, where if the
    target is not given then the view itself will be the target.  The
    method can be a function or a property path to look up on the target.

    For example,

        // Passing a function for method.
        myView.animate(
          { top: 200, left: 200 },  // properties
          { duration: 0.75 }, // options
          function (animationResult) {  // method
            // `this` will be myView
          }
        );

        // Passing a target and method.
        myView.animate(
          { scale: 0, opacity: 0 },  // properties
          { duration: 1.5 }, // options
          MyApp.statechart, // target
          'myViewDidShrink' // method
        );

    The animate functions are intelligent in how they apply animations and
    calling animate in a manner that would affect an ongoing animation (i.e.
    animating left again while it is still in transition) will result in
    the ongoing animation callback firing immediately with isCancelled set to
    true and adjusting the transition to accomodate the new settings.

    Note: This may not work if you are not using SproutCore for view layout,
    which means you should not use `animate` if the view has `useStaticLayout`
    set to true.

    ## A note about Hardware Acceleration.

    If a view has a fixed layout (i.e. view.get('isFixedLayout') == true) then
    it will be eligible for hardware accelerated position transitions. Having a
    fixed layout, simply means that the view has a fixed size (width and height)
    and a fixed position (left and top).  If the view is eligible for hardware
    acceleration, it must also set wantsAcceleratedLayer to true for animate to
    use hardware accelerated transitions when animating its position.

    Occassionally, you may wish to animate a view with a non-fixed layout.  To
    do so with hardware acceleration, you should convert the view to a fixed
    layout temporarily and then set it back to a flexible layout after the
    transition is complete.

    For example,

        // Flexible layout.
        myView.set('layout', { left: 0, top: 10, right: 0, bottom: 10 });

        // Prepare to animate by converting to a fixed layout.
        frame = myView.get('frame');
        height = frame.height;
        width = frame.width;
        myView.adjust({ right: null, bottom: null, height: height, width: width });

        // Animate (will be hardware accelerated if myView.get('wantsAcceleratedLayout') is true).
        myView.animate('left', width, { duration: 1 }, function () {
          // Revert back to flexible layout.
          myView.adjust({ right: -width, bottom: 10 });
        });

    @param {Object|String} properties Hash of property names with new layout values or a single property name.
    @param {Number} [value] The new layout value for a single property (only provide if the first parameter is a String).
    @param {Number|Object} Duration or hash of transition options.
    @param {Object} [target=this] The target for the method.
    @param {AnimateCallback|String} [method] The method to run when the transition completes.  May be a function or a property path.
    @returns {SC.View} receiver
  */
  animate: function (key, value, options, target, method) {
    var cur, curAnim,
      valueDidChange = NO,
      optionsDidChange = NO,
      hash, layout,
      optionsType,
      pendingAnimations = this._pendingAnimations,
      timing;

    
    // Provide a little developer support if they are doing something that may not work.
    if (this.get('useStaticLayout')) {
      SC.warn("Developer Warning: SC.View:animate() was called on a view with useStaticLayout and may not work.  If you are using CSS to layout the view (i.e. useStaticLayout: YES), then you should manage the animation manually.");
    }
    

    // Normalize arguments
    // TODO: Revisit .animate() arguments re: overloading.
    if (typeof key === SC.T_STRING) {
      hash = {};
      hash[key] = value;
    } else {
      method = target;
      target = options;
      options = value;
      hash = key;
    }

    optionsType = SC.typeOf(options);
    if (optionsType === SC.T_NUMBER) {
      options = { duration: options };
    } else if (optionsType !== SC.T_HASH) {
      throw new Error("Must provide options hash!");
    }

    if (options.callback) {
      method = options.callback;
      delete options.callback;
    }

    // Callback.  We need to keep the callback for each group of animations separate.
    if (method === undefined) {
      method = target;
      target = this;
    }

    // Support `null` being passed in for the target, rather than dropping the argument.
    if (!target) target = this;

    if (method) {
      if (typeof method === "string") method = target[method];
      options.target = target;
      options.method = method;
    }

    // In the case of zero duration, just adjust and call the callback.
    if (options.duration === 0) {
      this.invokeNext(function () {
        this.adjust(hash);
        this.runAnimationCallback(options, null, false);
      });
      return this;
    }

    // In the case that the view is not in the standard visible state, adjust instead of animate.
    if (!this.get('isVisibleInWindow')) {
      this.invokeNext(function () {
        this.adjust(hash);
        this.runAnimationCallback(options, null);
        // Note: we may need to find a way to alert the callback that the animation was successful
        // but instantaneous.
      });
      return this;
    }

    // Timing function
    timing = options.timing;
    if (timing) {
      if (typeof timing !== SC.T_STRING) {
        options.timing = "cubic-bezier(" + timing[0] + ", " + timing[1] + ", " +
                                         timing[2] + ", " + timing[3] + ")";
      } // else leave as is (assume proper CSS timing String)
    } else {
      options.timing = 'ease';
    }

    // Delay
    if (SC.none(options.delay)) { options.delay = 0; }

    // Get the layout (may be a previous layout already animating).
    if (!this._prevLayout) {
      this._prevLayout = SC.clone(this.get('explicitLayout'));
    }

    if (!pendingAnimations) { pendingAnimations = this._pendingAnimations = {}; }

    // Get the layout (may be a partially adjusted one already queued up).
    layout = this._animateLayout || SC.clone(this.get('explicitLayout'));

    // Handle old style rotation.
    if (!SC.none(hash.rotate)) {
      
      SC.Logger.warn('Developer Warning: Please animate rotateZ instead of rotate.');
      
      if (SC.none(hash.rotateZ)) {
        hash.rotateZ = hash.rotate;
      }
      delete hash.rotate;
    }

    // Go through the new animated properties and check for conflicts with
    // previous calls to animate and changes to the current layout.
    for (var property in hash) {
      // Fast path.
      if (!hash.hasOwnProperty(property) || !SC.ANIMATABLE_PROPERTIES[property]) {

        
        if (!SC.ANIMATABLE_PROPERTIES[property]) {
          SC.warn("Developer Warning: The property `%@` is not animatable using SC.View:animate().".fmt(property));
        }
        
        continue;
      }

      value = hash[property];
      cur = layout[property];
      curAnim = pendingAnimations[property];

      if (SC.none(value)) { throw new Error("Can only animate to an actual value!"); }

      // If the new adjustment changes the previous adjustment's options before
      // it has rendered, overwrite the previous adjustment.
      if (curAnim && (curAnim.duration !== options.duration ||
          curAnim.timing !== options.timing ||
          curAnim.delay !== options.delay)) {
        optionsDidChange = YES;
        this.runAnimationCallback(curAnim, null, YES);
      }

      if (cur !== value || optionsDidChange) {
        valueDidChange = YES;
        layout[property] = value;

        // Always update the animate hash to the newest options which may have been altered before this was applied.
        pendingAnimations[property] = options;
      }
    }

    // Only animate to new values.
    if (valueDidChange) {
      // When animating height or width with centerX or centerY, we need to animate the margin property also to get a smooth change.
      if (!SC.none(pendingAnimations.height) && !SC.none(layout.centerY) && SC.none(pendingAnimations.centerY)) {
        // Don't animate less than 2px difference b/c the margin-top value won't differ.
        if (Math.abs(hash.height - this.get('layout').height) >= 2) {
          pendingAnimations.centerY = options;
        }
      }

      if (!SC.none(pendingAnimations.width) && !SC.none(layout.centerX) && SC.none(pendingAnimations.centerX)) {
        // Don't animate less than 2px difference b/c the margin-left value won't differ.
        if (Math.abs(hash.width - this.get('layout').width) >= 2) {
          pendingAnimations.centerX = options;
        }
      }

      this._animateLayout = layout;

      // Always run the animation asynchronously so that the original layout is guaranteed to be applied to the DOM.
      this.invokeNext('_animate');
    } else if (!optionsDidChange) {
      this.invokeNext(function () {
        this.runAnimationCallback(options, null, false);
      });
    }

    return this;
  },

  /** @private */
  _animate: function () {
    // Check for _animateLayout.  If an invokeNext call to animate *this* occurs
    // while flushing the invokeNext queue *before* this method runs, an extra
    // call to _animate will run.  Has unit test.
    var animationLayout = this._animateLayout;
    if (animationLayout) {
      this.willRenderAnimations();

      // Clear the layout cache value first so that it is not present when layout changes next.
      this._animateLayout = null;

      // Apply the animation layout.
      this.set('layout', animationLayout);

      // Route.
      if (this.get('viewState') === SC.CoreView.ATTACHED_SHOWN) {
        this.set('viewState', SC.CoreView.ATTACHED_SHOWN_ANIMATING);
      }
    }
  },

  /** @private
    Animates through the given frames.

    @param {Array} frames The array of frame objects.
    @param {AnimateCallback} callback The callback function to call when the final frame is done animating.
    @param {Number} initialDelay The delay before the first frame begins animating.
    @returns {SC.View} receiver
  */
  // TODO: Do this using CSS animations instead.
  _animateFrames: function (frames, callback, initialDelay, _sc_frameCount) {
    // Normalize the private argument `_sc_frameCount`.
    if (SC.none(_sc_frameCount)) { _sc_frameCount = 0; }

    var frame = frames[_sc_frameCount];

    this.animate(frame.value, {
      delay: initialDelay,
      duration: frame.duration,
      timing: frame.timing
    }, function (data) {
      _sc_frameCount += 1;

      // Keep iterating while frames exist and the animations weren't cancelled.
      if (!data.isCancelled && _sc_frameCount < frames.length) {
        // Only delay on the first animation.  Increase count to the next frame.
        this._animateFrames(frames, callback, 0, _sc_frameCount);
      } else {
        // Done.
        if (callback) callback(data);
      }
    });

    return this;
  },

  /**
    Cancels the animation, adjusting the view's layout immediately to one of
    three values depending on the `layoutState` parameter.

    If no `layoutState` is given or if SC.LayoutState.END is given, the view
    will be adjusted to its final layout.  If SC.LayoutState.START is given,
    the view will be adjusted back to its initial layout and if
    SC.LayoutState.CURRENT is given, the view will stop at its current layout
    value, which will be some transient value between the start and end values.

    Note: The animation callbacks will be called with the animationResult object's
    isCancelled property set to YES.

    @param {SC.LayoutState} [layoutState=SC.LayoutState.END] The layout to immediately adjust the view to.
    @returns {SC.View} this
  */
  cancelAnimation: function (layoutState) {
    var activeAnimations = this._activeAnimations,
      pendingAnimations = this._pendingAnimations,
      animation,
      key,
      layout,
      didCancel = NO;

    switch (layoutState) {
    case SC.LayoutState.START:
      // Revert back to the start layout.
      layout = this._prevLayout;
      break;
    case SC.LayoutState.CURRENT:
      // Stop at the current layout.
      layout = this.get('liveAdjustments');
      break;
    default:
      layout = this._animateLayout;
    }

    // Route.
    if (this.get('viewState') === SC.CoreView.ATTACHED_SHOWN_ANIMATING) {
      this.set('viewState', SC.CoreView.ATTACHED_SHOWN);
    }

    // Immediately remove the pending animations while calling the callbacks.
    for (key in pendingAnimations) {
      animation = pendingAnimations[key];
      didCancel = YES;

      // Update the animation hash.  Do this first, so callbacks can check for active animations.
      delete pendingAnimations[key];

      // Run the callback.
      this.runAnimationCallback(animation, null, YES);
    }

    // Immediately remove the animation styles while calling the callbacks.
    for (key in activeAnimations) {
      animation = activeAnimations[key];
      didCancel = YES;

      // Update the animation hash.  Do this first, so callbacks can check for active animations.
      delete activeAnimations[key];

      // Remove the animation style without triggering a layout change.
      this.removeAnimationFromLayout(key, YES);

      // Run the callback.
      this.runAnimationCallback(animation, null, YES);
    }

    // Adjust to final position.
    if (didCancel && !!layout) {
      this.set('layout', layout);
    }

    // Clean up.
    this._prevLayout = this._activeAnimations = this._pendingAnimations = this._animateLayout = null;

    return this;
  },

  /** @private
    This method is called after the layout style is applied to the layer.  If
    the platform didn't support CSS transitions, the callbacks will be fired
    immediately and the animations removed from the queue.
  */
  didRenderAnimations: function () {
    // Transitions not supported or the document is not visible.
    if (!SC.platform.supportsCSSTransitions || document.hidden) {
      var pendingAnimations = this._pendingAnimations;

      for (var key in pendingAnimations) {
        this.removeAnimationFromLayout(key, NO);
        this.runAnimationCallback(pendingAnimations[key], null, NO);
      }

      // Route.
      if (this.get('viewState') === SC.CoreView.ATTACHED_SHOWN_ANIMATING) {
        this.set('viewState', SC.CoreView.ATTACHED_SHOWN);
      }

      // Reset the placeholder variables now that the layout style has been applied.
      this._activeAnimations = this._pendingAnimations = null;
    }
  },

  /** @private Decompose a transformation matrix. */
  // TODO: Add skew support
  _sc_decompose3DTransformMatrix: function (matrix, expectsScale) {
    var ret = SC.View._SC_DECOMPOSED_TRANSFORM_MAP,  // Shared object used to avoid continually initializing/destroying
      toDegrees = 180 / Math.PI;
      // determinant;

    // Create the decomposition map once. Note: This is a shared object, all properties must be overwritten each time.
    if (!ret) { ret = SC.View._SC_DECOMPOSED_TRANSFORM_MAP = {}; }

    // Calculate the scale.
    if (expectsScale) {
      ret.scaleX = Math.sqrt((matrix.m11 * matrix.m11) + (matrix.m12 * matrix.m12) + (matrix.m13 * matrix.m13));
      // if (matrix.m11 < 0) ret.scaleX = ret.scaleX * -1;
      ret.scaleY = Math.sqrt((matrix.m21 * matrix.m21) + (matrix.m22 * matrix.m22) + (matrix.m23 * matrix.m23));
      ret.scaleZ = Math.sqrt((matrix.m31 * matrix.m31) + (matrix.m32 * matrix.m32) + (matrix.m33 * matrix.m33));

      // Decompose scale from the matrix.
      matrix = matrix.scale(1 / ret.scaleX, 1 / ret.scaleY, 1 / ret.scaleZ);
    } else {
      ret.scaleX = 1;
      ret.scaleY = 1;
      ret.scaleZ = 1;
    }

    // console.log("scales: %@, %@, %@".fmt(ret.scaleX, ret.scaleY, ret.scaleZ));

    // Find the 3 Euler angles. Note the order applied using SC.CSS_TRANSFORM_NAMES in layout_style.js.
    ret.rotateZ = -Math.atan2(matrix.m21, matrix.m11) * toDegrees; // Between -180° and 180°
    // ret.rotateY = Math.atan2(-matrix.m31, Math.sqrt((matrix.m32 * matrix.m32) + (matrix.m33 * matrix.m33))) * toDegrees;  // Between -90° and 90°
    // ret.rotateX = Math.atan2(matrix.m32, matrix.m33) * toDegrees; // Between -180° and 180°

    // console.log("rotations: %@, %@, %@".fmt(ret.rotateX, ret.rotateY, ret.rotateZ));

    // if (ret.rotateX < 0) { ret.rotateX = 360 + ret.rotateX; } // Convert to 0° to 360°
    // if (ret.rotateY < 0) { ret.rotateY = 180 + ret.rotateY; } // Convert to 0° to 180°
    if (ret.rotateZ < 0) { ret.rotateZ = 360 + ret.rotateZ; } // Convert to 0° to 360°

    // Pull out the translate values directly.
    ret.translateX = matrix.m41;
    ret.translateY = matrix.m42;
    ret.translateZ = matrix.m43;

    // console.log("translations: %@, %@, %@".fmt(ret.translateX, ret.translateY, ret.translateZ));

    return ret;
  },

  /** @private Replace scientific E notation values with fixed decimal values. */
  _sc_removeENotationFromMatrixString: function (matrixString) {
    var components,
      numbers,
      ret;

    components = matrixString.split(/\(|\)/);
    numbers = components[1].split(',');
    for (var i = 0, len = numbers.length; i < len; i++) {
      var number = numbers[i];

      // Transform E notation into fixed decimal (20 is maximum allowed).
      if (number.indexOf('e') > 0) {
        numbers[i] = window.parseFloat(number).toFixed(20);
      }
    }

    ret = components[0] + '(' + numbers.join(', ') + ')';

    return ret;
  },

  /** @private
    Returns the live values of the properties being animated on a view while it
    is animating.  Getting the layout of the view after a call to animate will
    include the final values, some of which will not be the same as what they
    are while the animation is in progress.

    Depending on the property being animated, determining the actual value can
    be quite difficult.  For instance, accelerated views will animate certain
    properties using a browser specific CSS transition on a CSS transform and
    the current value may be a CSSMatrix that needs to be mapped back to a
    regular layout format.

    This property is used by cancelAnimation() to stop the animation in its
    current place.

    PRIVATE - because we may want to rename this function and change its output

    @returns {Object}
  */
  liveAdjustments: function () {
    var activeAnimations = this._activeAnimations,
      el = this.get('layer'),
      ret = {},
      transformKey = SC.browser.experimentalCSSNameFor('transform');

    if (activeAnimations) {
      for (var key in activeAnimations) {
        var value = document.defaultView.getComputedStyle(el)[key];

        // If a transform is being transitioned, decompose the matrices.
        if (key === transformKey) {
          var CSSMatrixClass = SC.browser.experimentalNameFor(window, 'CSSMatrix'),
            matrix;

          if (CSSMatrixClass !== SC.UNSUPPORTED) {

            // Convert scientific E number representations to fixed numbers.
            // In WebKit at least, these throw exceptions when used to generate the matrix. To test,
            // paste the following in a browser console:
            //    new WebKitCSSMatrix('matrix(-1, 1.22464679914735e-16, -1.22464679914735e-16, -1, 0, 0)')
            value = this._sc_removeENotationFromMatrixString(value);
            matrix = new window[CSSMatrixClass](value);

            /* jshint eqnull:true */
            var layout = this.get('layout'),
              scaleLayout = layout.scale,
              expectsScale = scaleLayout != null,
              decomposition = this._sc_decompose3DTransformMatrix(matrix, expectsScale);

            // The rotation decompositions aren't working properly, ignore them.
            // Set rotateX.
            // if (layout.rotateX != null) {
            //   ret.rotateX = decomposition.rotateX;
            // }

            // // Set rotateY.
            // if (layout.rotateY != null) {
            //   ret.rotateY = decomposition.rotateY;
            // }

            // Set rotateZ.
            if (layout.rotateZ != null) {
              ret.rotateZ = decomposition.rotateZ;
            }

            // Set scale.
            if (expectsScale) {
              // If the scale was set in the layout as an Array, return it as an Array.
              if (SC.typeOf(scaleLayout) === SC.T_ARRAY) {
                ret.scale = [decomposition.scaleX, decomposition.scaleY];

              // If the scale was set in the layout as an Object, return it as an Object.
              } else if (SC.typeOf(scaleLayout) === SC.T_HASH) {
                ret.scale = { x: decomposition.scaleX, y: decomposition.scaleY };

              // Return it as a single value.
              } else {
                ret.scale = decomposition.scaleX;
              }
            }

            // Set top & left.
            if (this.get('hasAcceleratedLayer')) {
              ret.left = decomposition.translateX;
              ret.top = decomposition.translateY;
            }
          } else {
            matrix = value.match(/^matrix\((.*)\)$/)[1].split(/,\s*/);
            // If the view has translated position, retrieve translateX & translateY.
            if (matrix && this.get('hasAcceleratedLayer')) {
              ret.left = parseInt(matrix[4], 10);
              ret.top = parseInt(matrix[5], 10);
            }
          }

        // Determine the current style.
        } else {
          value = window.parseFloat(value, 10);

          // Account for centerX & centerY animations (margin-left & margin-top).
          if (key === 'centerX') {
            value = value + parseInt(document.defaultView.getComputedStyle(el).width, 10) / 2; // Use the actual width.
          } else if (key === 'centerY') {
            value = value + parseInt(document.defaultView.getComputedStyle(el).height, 10) / 2; // Use the actual height.
          }

          ret[key] = value;
        }
      }
    }

    return ret;
  }.property(),

  /** @private Removes the animation CSS from the layer style. */
  removeAnimationFromLayout: function (propertyName, shouldUpdateStyle) {
    var activeAnimations = this._activeAnimations,
      layer = this.get('layer');

    if (!!layer && shouldUpdateStyle) {
      var updatedCSS = [];

      // Calculate the transition CSS that should remain.
      for (var key in activeAnimations) {
        if (key !== propertyName) {
          updatedCSS.push(activeAnimations[key].css);
        }
      }

      layer.style[SC.browser.experimentalStyleNameFor('transition')] = updatedCSS.join(', ');
    }
  },

  /** @deprecated
    Resets animation, stopping all existing animations.
  */
  resetAnimation: function () {
    
    // Reset gives the connotation that the animation would go back to the start layout, but that is not the case.
    SC.warn('Developer Warning: resetAnimation() has been renamed to cancelAnimation().  Please rename all calls to resetAnimation() with cancelAnimation().');
    

    return this.cancelAnimation();
  },

  /** @private */
  runAnimationCallback: function (animation, evt, cancelled) {
    var method = animation.method,
      target = animation.target;

    if (method) {
      // We're using invokeNext so we don't trigger any layout changes from
      // the callback until the current layout is updated.
      // this.invokeNext(function () {
        method.call(target, { event: evt, view: this, isCancelled: cancelled });
      // }, this);

      // Always clear the method from the hash to prevent it being called
      // multiple times for animations in the group.
      delete animation.method;
      delete animation.target;
    }
  },

  /** @private
    Called when animation ends, should not usually be called manually
  */
  transitionDidEnd: function (evt) {
    var propertyName = evt.originalEvent.propertyName,
      activeAnimations = this._activeAnimations,
      animation;

    // Fix up the centerX & centerY properties.
    if (propertyName === 'margin-left') { propertyName = 'centerX'; }
    if (propertyName === 'margin-top') { propertyName = 'centerY'; }
    animation = activeAnimations ? activeAnimations[propertyName] : null;

    if (animation) {
      // Update the animation hash.  Do this first, so callbacks can check for active animations.
      delete activeAnimations[propertyName];

      // Remove the animation style without triggering a layout change.
      this.removeAnimationFromLayout(propertyName, YES);

      // Clean up the internal hash.
      this._activeAnimationsLength -= 1;
      if (this._activeAnimationsLength === 0) {
        // Route.
        if (this.get('viewState') === SC.CoreView.ATTACHED_SHOWN_ANIMATING) {
          this.set('viewState', SC.CoreView.ATTACHED_SHOWN);
        }

        this._activeAnimations = this._prevLayout = null;
      }

      // Run the callback.
      this.runAnimationCallback(animation, evt, NO);
    }
  },

  /** @private
   This method is called before the layout style is applied to the layer.  If
   animations have been defined for the view, they will be included in
   this._pendingAnimations.  This method will clear out any conflicts between
   pending and active animations.
   */
  willRenderAnimations: function () {
    // Only apply the style if supported by the platform and the document is visible.
    if (SC.platform.supportsCSSTransitions && !document.hidden) {
      var pendingAnimations = this._pendingAnimations;

      if (pendingAnimations) {
        var activeAnimations = this._activeAnimations;

        if (!activeAnimations) {
          this._activeAnimationsLength = 0;
          activeAnimations = {};
        }

        for (var key in pendingAnimations) {
          if (!pendingAnimations.hasOwnProperty(key)) { continue; }

          var activeAnimation = activeAnimations[key],
            pendingAnimation = pendingAnimations[key];

          if (activeAnimation) {
            this.runAnimationCallback(activeAnimation, null, YES);
          }

          activeAnimations[key] = pendingAnimation;
          this._activeAnimationsLength += 1;
        }

        this._activeAnimations = activeAnimations;
        this._pendingAnimations = null;
      }
    }
  }

});

/* >>>>>>>>>> BEGIN source/views/view/layout_style.js */

sc_require('ext/string');
sc_require('views/view');
sc_require('views/view/animation');

/**
  Map to CSS Transforms
*/

// The scale transform must be last in order to decompose the transformation matrix.
SC.CSS_TRANSFORM_NAMES = ['rotateX', 'rotateY', 'rotateZ', 'scale'];

SC.CSS_TRANSFORM_MAP = {

  rotate: function (val) {
    if (SC.typeOf(val) === SC.T_NUMBER) { val += 'deg'; }
    return 'rotate(' + val + ')';
  },

  rotateX: function (val) {
    if (SC.typeOf(val) === SC.T_NUMBER) { val += 'deg'; }
    return 'rotateX(' + val + ')';
  },

  rotateY: function (val) {
    if (SC.typeOf(val) === SC.T_NUMBER) { val += 'deg'; }
    return 'rotateY(' + val + ')';
  },

  rotateZ: function (val) {
    if (SC.typeOf(val) === SC.T_NUMBER) { val += 'deg'; }
    return 'rotateZ(' + val + ')';
  },

  scale: function (val) {
    if (SC.typeOf(val) === SC.T_ARRAY) { val = val.join(', '); }
    return 'scale(' + val + ')';
  }
};


/** @private */
SC.View.LayoutStyleCalculator = {

  /** @private Shared object used to avoid continually initializing/destroying objects. */
  _SC_STATE_MAP: null,

  /** @private Shared object used to avoid continually initializing/destroying objects. */
  _SC_TRANSFORMS_ARRAY: null,

  /** @private Shared object used to avoid continually initializing/destroying objects. */
  _SC_TRANSITIONS_ARRAY: null,

  /** @private If the value is undefined, make it null. */
  _valueOrNull: function (value) {
    return value === undefined ? null : value;
  },

  /** @private */
  _prepareStyle: function (style, layout) {
    /*jshint eqnull:true */
    // It's important to provide null defaults to reset any previous style when
    // this is applied.
    var commonBorder = this._valueOrNull(layout.border);

    // Reset properties that might not be set from style to style.
    style.marginLeft = null;
    style.marginTop = null;

    // Position and size.
    style.bottom = layout.bottom;
    style.right = layout.right;
    style.left = layout.left;
    style.top = layout.top;
    style.centerX = layout.centerX;
    style.centerY = layout.centerY;
    style.height = layout.height;
    style.width = layout.width;

    // Borders.
    style.borderTopWidth = layout.borderTop !== undefined ? layout.borderTop : commonBorder;
    style.borderRightWidth = layout.borderRight !== undefined ? layout.borderRight : commonBorder;
    style.borderBottomWidth = layout.borderBottom !== undefined ? layout.borderBottom : commonBorder;
    style.borderLeftWidth = layout.borderLeft !== undefined ? layout.borderLeft : commonBorder;

    // Minimum and maximum size.
    style.maxHeight = this._valueOrNull(layout.maxHeight);
    style.maxWidth = this._valueOrNull(layout.maxWidth);
    style.minWidth = this._valueOrNull(layout.minWidth);
    style.minHeight = this._valueOrNull(layout.minHeight);

    // the toString here is to ensure that it doesn't get px added to it
    style.zIndex  = (layout.zIndex != null) ? layout.zIndex.toString() : null;
    style.opacity = (layout.opacity != null) ? layout.opacity.toString() : null;

    style.backgroundPosition = this._valueOrNull(layout.backgroundPosition);

    // Handle transforms (including reset).
    if (SC.platform.supportsCSSTransforms) {
      var transformAttribute = SC.browser.experimentalStyleNameFor('transform'),
        transforms = this._SC_TRANSFORMS_ARRAY, // Shared object used to avoid continually initializing/destroying objects.
        transformMap = SC.CSS_TRANSFORM_MAP;

      // Create the array once. Note: This is a shared array; it must be set to 0 length each time.
      if (!transforms) { transforms = this._SC_TRANSFORMS_ARRAY = []; }

      // The order of the transforms is important so that we can decompose them
      // from the transformation matrix later if necessary.
      for (var i = 0, len = SC.CSS_TRANSFORM_NAMES.length; i < len; i++) {
        var transformName = SC.CSS_TRANSFORM_NAMES[i],
          layoutTransform = layout[transformName];

        if (layoutTransform != null) {
          // normalizing transforms like rotateX: 5 to rotateX(5deg)
          transforms.push(transformMap[transformName](layoutTransform));
        }
      }

      // Set or reset the transform style.
      style[transformAttribute] = transforms.length > 0 ? transforms.join(' ') : null;

      // Transform origin.
      var transformOriginAttribute = SC.browser.experimentalStyleNameFor('transformOrigin'),
        originX = layout.transformOriginX,
        originY = layout.transformOriginY;
      if (originX == null && originY == null) {
        style[transformOriginAttribute] = null;
      } else {
        if (originX == null) originX = 0.5;
        if (originY == null) originY = 0.5;
        style[transformOriginAttribute] = (originX * 100) + '% ' + (originY * 100) + '%';
      }
    }

    // Reset any transitions.
    if (SC.platform.supportsCSSTransitions) {
      style[SC.browser.experimentalStyleNameFor('transition')] = null;
    }

    // Reset shared object!
    this._SC_TRANSFORMS_ARRAY.length = 0;
  },

  /** @private */
  _prepareState: function (state, style) {
    /*jshint eqnull:true */
    state.hasBottom = (style.bottom != null);
    state.hasRight = (style.right != null);
    state.hasLeft = (style.left != null);
    state.hasTop = (style.top != null);
    state.hasCenterX = (style.centerX != null);
    state.hasCenterY = (style.centerY != null);
    state.hasHeight = (style.height != null);
    state.hasWidth = (style.width != null);
    state.hasMaxWidth = (style.maxWidth != null);
    state.hasMaxHeight = (style.maxHeight != null);
  },


  // handles the case where you do width:auto or height:auto and are not using "staticLayout"
  _invalidAutoValue: function (view, property) {
    SC.throw("%@.layout() you cannot use %@:auto if staticLayout is disabled".fmt(view, property), "%@".fmt(view), -1);
  },

  /** @private */
  _calculatePosition: function (style, state, direction) {
    var start, finish, size,
      hasStart, hasFinish, hasSize, hasMaxSize,
      startBorder,
      finishBorder;

    if (direction === 'X') {
      start      = 'left';
      finish     = 'right';
      size       = 'width';
      startBorder  = 'borderLeftWidth';
      finishBorder = 'borderRightWidth';
      hasStart   = state.hasLeft;
      hasFinish  = state.hasRight;
      hasSize    = state.hasWidth;
      hasMaxSize = state.hasMaxWidth;
    } else {
      start      = 'top';
      finish     = 'bottom';
      size       = 'height';
      startBorder  = 'borderTopWidth';
      finishBorder = 'borderBottomWidth';
      hasStart   = state.hasTop;
      hasFinish  = state.hasBottom;
      hasSize    = state.hasHeight;
      hasMaxSize = state.hasMaxHeight;
    }

    style[start]  = this._cssNumber(style[start]);
    style[finish] = this._cssNumber(style[finish]);

    var startBorderVal = this._cssNumber(style[startBorder]),
      finishBorderVal = this._cssNumber(style[finishBorder]),
      sizeNum = style[size];

    style[startBorder] = startBorderVal;
    style[finishBorder] = finishBorderVal;

    // This is a normal number
    if (sizeNum >= 1) { sizeNum -= (startBorderVal + finishBorderVal); }
    style[size] = this._cssNumber(sizeNum);

    if (hasStart) {
      // top, bottom, height -> top, bottom
      if (hasFinish && hasSize)  { style[finish] = null; }
    } else {
      // bottom aligned
      if (!hasFinish || (hasFinish && !hasSize && !hasMaxSize)) {
        // no top, no bottom
        style[start] = 0;
      }
    }

    if (!hasSize && !hasFinish) { style[finish] = 0; }
  },


  /** @private */
  _calculateCenter: function (style, direction) {
    var size, center, start, finish, margin,
        startBorder,
        finishBorder;

    if (direction === 'X') {
      size   = 'width';
      center = 'centerX';
      start  = 'left';
      finish = 'right';
      margin = 'marginLeft';
      startBorder  = 'borderLeftWidth';
      finishBorder = 'borderRightWidth';
    } else {
      size   = 'height';
      center = 'centerY';
      start  = 'top';
      finish = 'bottom';
      margin = 'marginTop';
      startBorder  = 'borderTopWidth';
      finishBorder = 'borderBottomWidth';
    }

    style[start] = "50%";

    var startBorderVal = this._cssNumber(style[startBorder]),
      finishBorderVal = this._cssNumber(style[finishBorder]),
      sizeValue   = style[size],
      centerValue = style[center],
      sizeIsPercent = SC.isPercentage(sizeValue),
      value;

    style[startBorder] = startBorderVal;
    style[finishBorder] = finishBorderVal;

    // Calculate the margin offset used to center the value along this axis.
    if (SC.none(sizeValue)) {
      // Invalid!
      style[margin] = "50%";
    } else {
      value = centerValue - sizeValue / 2;
      style[margin] = (sizeIsPercent) ? Math.floor(value * 100) + "%" : Math.floor(value);
    }

    // If > 1 then it's a pixel value, in which case we shrink it to accommodate the borders.
    if (sizeValue > 1) { sizeValue -= (startBorderVal + finishBorderVal); }

    style[size] = this._cssNumber(sizeValue) || 0;
    style[finish] = style[center] = null;
  },

  /** @private */
  // return "auto" for "auto", null for null, converts 0.X into "X%".
  // otherwise returns the original number, rounded down
  _cssNumber: function (val) {
    /*jshint eqnull:true*/
    if (val == null) { return null; }
    else if (val === SC.LAYOUT_AUTO) { return SC.LAYOUT_AUTO; }
    else if (SC.isPercentage(val)) { return (val * 100) + "%"; }
    else { return Math.floor(val); }
  },

  /** @private
    Calculate the layout style for the given view, making adjustments to allow
    for flexible positioning, animation and accelerated transforms.

    @return {Object} Layout style hash.
  */
  calculate: function (view, style) {
    var layout = view.get('layout'),
      animations = view._activeAnimations,
      state = this._SC_STATE_MAP, // Shared object used to avoid continually initializing/destroying objects.
      useStaticLayout = view.get('useStaticLayout');

    // Fast path!
    // If the developer sets useStaticLayout and doesn't provide a unique `layout` property, we
    // should not insert the styles "left: 0px; right: 0px; top: 0px; bottom: 0px" as they could
    // conflict with the developer's intention.  However, if they do provide a unique `layout`,
    // use it.
    if (useStaticLayout && layout === SC.View.prototype.layout) { return {}; }

    // Reset and prep the style object.
    this._prepareStyle(style, layout);

    // Create the object once. Note: This is a shared object; all properties must be overwritten each time.
    if (!state) { state = this._SC_STATE_MAP = {}; }

    // Reset and prep the state object.
    this._prepareState(state, style);

    // handle invalid use of auto in absolute layouts
    if (!useStaticLayout) {
      if (style.width === SC.LAYOUT_AUTO) { this._invalidAutoValue(view, "width"); }
      if (style.height === SC.LAYOUT_AUTO) { this._invalidAutoValue(view, "height"); }
    }

    // X DIRECTION
    if (state.hasLeft || state.hasRight || !state.hasCenterX) {
      this._calculatePosition(style, state, "X");
    } else {
      this._calculateCenter(style, "X");
    }

    // Y DIRECTION
    if (state.hasTop || state.hasBottom || !state.hasCenterY) {
      this._calculatePosition(style, state, "Y");
    } else {
      this._calculateCenter(style, "Y");
    }

    this._calculateAnimations(style, animations, view.get('hasAcceleratedLayer'));

    // convert any numbers into a number + "px".
    for (var key in style) {
      var value = style[key];
      if (typeof value === SC.T_NUMBER) { style[key] = (value + "px"); }
    }

    return style;
  },

  /** @private Calculates animation styles. */
  _calculateAnimations: function (style, animations, hasAcceleratedLayer) {
    /*jshint eqnull:true*/
    var key,
      shouldTranslate;

    // Handle transforms
    if (hasAcceleratedLayer) {
      shouldTranslate = YES;

      // If we're animating other transforms at different speeds, don't use acceleratedLayer
      if (animations && (animations.top || animations.left)) {
        for (key in animations) {
          if (SC.CSS_TRANSFORM_MAP[key] &&
              ((animations.top &&
                animations.top.duration !== animations[key].duration) ||
               (animations.left &&
                animations.left.duration !== animations[key].duration))) {
            shouldTranslate = NO;
          }
        }
      }

      if (shouldTranslate) {
        var transformAttribute = SC.browser.experimentalStyleNameFor('transform'),
          curValue = style[transformAttribute],
          newValue;

        newValue = 'translateX(' + style.left + 'px) translateY(' + style.top + 'px)';

        // double check to make sure this is needed
        if (SC.platform.supportsCSS3DTransforms) { newValue += ' translateZ(0px)'; }

        // Append any current transforms.
        // NOTE: The order of transforms is important. If we scale before translate, our translations
        // will be scaled and incorrect.
        if (curValue) { newValue += ' ' + curValue; }
        style[transformAttribute] = newValue;

        // Set the absolute left & top style to 0,0 (will be translated from there).
        style.left = 0;
        style.top = 0;
      }
    }

    // Handle animations
    if (animations) {
      if (SC.platform.supportsCSSTransitions) {
        var transitions = this._SC_TRANSITIONS_ARRAY; // Shared object used to avoid continually initializing/destroying objects.

        // Create the array once. Note: This is a shared array; it must be set to 0 length each time.
        if (!transitions) { transitions = this._SC_TRANSITIONS_ARRAY = []; }

        for (key in animations) {
          var animation = animations[key],
            isTransformProperty = !!SC.CSS_TRANSFORM_MAP[key],
            isTurboProperty = shouldTranslate && (key === 'top' || key === 'left');

          if (SC.platform.supportsCSSTransforms && (isTurboProperty || isTransformProperty)) {
            // Untrack the un-transformed property name.
            delete animations[key];

            // The key will be either 'transform' or one of '-webkit-transform', '-ms-transform', '-moz-transform', '-o-transform'
            key = SC.browser.experimentalCSSNameFor('transform');

            var curTransformAnimation = animations[key];

            // Because multiple transforms actually share one CSS property, we can't animate multiple transforms
            // at different speeds. So, to handle that case, we just force them to all have the same length.
            if (curTransformAnimation) {
              
              if (curTransformAnimation.duration !== animation.duration || curTransformAnimation.timing !== animation.timing || curTransformAnimation.delay !== animation.delay) {
                SC.Logger.warn("Developer Warning: Can't animate transforms with different durations, timings or delays! Using the first options specified.");
              }
              
              animation = curTransformAnimation;
            } else {
              // Track the transformed property name.
              animations[key] = animation;
            }
          }

          // Fix up the centerX & centerY properties.
          if (key === 'centerX') { key = 'margin-left'; }
          if (key === 'centerY') { key = 'margin-top'; }

          // We're actually storing the css for the animation on layout.animate[key].css
          animation.css = key + " " + animation.duration + "s " + animation.timing + " " + animation.delay + "s";

          // If there are multiple transform properties, we only need to set this key once.
          // We already checked before to make sure they have the same duration.
          // if (!pendingAnimations[key]) {
          if (transitions.indexOf(animation.css) < 0) {
            transitions.push(animation.css);
          }
        }

        style[SC.browser.experimentalStyleNameFor('transition')] = transitions.join(", ");

        // Reset shared object!
        this._SC_TRANSITIONS_ARRAY.length = 0;
      } else {
        // TODO: Do it the JS way
      }
    }
  }

};



SC.View.reopen(
  /** @scope SC.View.prototype */ {

  /** @private Shared object used to avoid continually initializing/destroying objects. */
  _SC_STYLE_MAP: null,

  /**
    layoutStyle describes the current styles to be written to your element
    based on the layout you defined.  Both layoutStyle and frame reset when
    you edit the layout property.  Both are read only.

    Computes the layout style settings needed for the current anchor.

    @type Object
    @readOnly
  */
  layoutStyle: function () {
    var style = this._SC_STYLE_MAP; // Shared object used to avoid continually initializing/destroying objects.

    // Create the object once. Note: This is a shared object; all properties must be overwritten each time.
    if (!style) { style = this._SC_STYLE_MAP = {}; }

    return SC.View.LayoutStyleCalculator.calculate(this, style);

  // 'hasAcceleratedLayer' is dependent on 'layout' so we don't need 'layout' to be a dependency here
  }.property('hasAcceleratedLayer', 'useStaticLayout').cacheable()

});

/* >>>>>>>>>> BEGIN source/views/view/layout.js */
sc_require("views/view");
sc_require('views/view/layout_style');

/** Select a horizontal layout for various views.*/
SC.LAYOUT_HORIZONTAL = 'sc-layout-horizontal';

/** Select a vertical layout for various views.*/
SC.LAYOUT_VERTICAL = 'sc-layout-vertical';

/**
  Layout properties to take up the full width of a parent view.
*/
SC.FULL_WIDTH = { left: 0, right: 0 };

/**
  Layout properties to take up the full height of a parent view.
*/
SC.FULL_HEIGHT = { top: 0, bottom: 0 };

/**
  Layout properties to center.  Note that you must also specify a width and
  height for this to work.
*/
SC.ANCHOR_CENTER = { centerX: 0, centerY: 0 };

/**
  Layout property for width, height
*/

SC.LAYOUT_AUTO = 'auto';

// Regexes representating valid values for rotation and scale layout properties
SC._ROTATION_VALUE_REGEX = /^\-?\d+(\.\d*)?(rad|deg)$/;
SC._SCALE_VALUE_REGEX = /^\d+(,\d+){0,2}$/;

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  // ------------------------------------------------------------------------
  // Properties
  //

  /* @private Internal variable used to check for layout changes that resize. */
  _sc_previousLayout: null,

  /**
    The view's background color. Only recommended for use during prototyping and in views
    where the background color may change arbitrarily, for example in connection with an
    instance of `SC.Color`. Otherwise you should use CSS and `classNames` or
    `classNameBindings`.

    If set at create time, will be added to the view's layer. For dynamic background colors,
    you must add `backgroundColor` to the view's `displayProperties`.

    @type String
    @default null
  */
  backgroundColor: null,

  /**
    The frame of the view including the borders and scale
  */
  borderFrame: function () {
    var frame = this.get('frame'),
        ret = null;

    if (frame) {
      /*jshint eqnull:true */
      var layout = this.get('layout'),
        defaultValue = layout.border == null ? 0 : layout.border,
        borderTop = this._sc_explicitValueFor(layout.borderTop, defaultValue),
        borderRight = this._sc_explicitValueFor(layout.borderRight, defaultValue),
        borderBottom = this._sc_explicitValueFor(layout.borderBottom, defaultValue),
        borderLeft = this._sc_explicitValueFor(layout.borderLeft, defaultValue);

      ret = {
          x: frame.x,
          y: frame.y,
          width: frame.width,
          height: frame.height
        };

      var scale = frame.scale;
      /*jshint eqnull:true*/
      if (scale != null) {
        var scaledBorderTop = borderTop * scale,
            scaledBorderRight = borderRight * scale,
            scaledBorderBottom = borderBottom * scale,
            scaledBorderLeft = borderLeft * scale;

        ret.scale = scale;
        ret.x -= scaledBorderLeft;
        ret.y -= scaledBorderTop;
        ret.width += scaledBorderLeft + scaledBorderRight;
        ret.height += scaledBorderTop + scaledBorderBottom;
      } else {
        ret.x -= borderLeft;
        ret.y -= borderTop;
        ret.width += borderLeft + borderRight;
        ret.height += borderTop + borderBottom;
      }

      if (frame.transformOriginX != null) {
        ret.transformOriginX = frame.transformOriginX;
      }

      if (frame.transformOriginY != null) {
        ret.transformOriginY = frame.transformOriginY;
      }
    }

    return ret;
  }.property('frame').cacheable(),


  /**
    This this property to YES whenever the view needs to layout its child
    views.  Normally this property is set automatically whenever the layout
    property for a child view changes.

    @type Boolean
  */
  childViewsNeedLayout: NO,

  /**
    The child view layout plugin to use when laying out child views.

    You can set this property to a child layout plugin object to
    automatically set and adjust the layouts of this view's child views
    according to some specific layout style.  For instance, SproutCore includes
    two such plugins, SC.View.VERTICAL_STACK and SC.View.HORIZONTAL_STACK.

    SC.View.VERTICAL_STACK will arrange child views in order in a vertical
    stack, which only requires that the height of each child view be specified.
    Likewise, SC.View.HORIZONTAL_STACK does the same in the horizontal
    direction, which requires that the width of each child view be specified.

    Where child layout plugins are extremely useful, besides simplifying
    the amount of layout code you need to write, is that they can update the
    layouts automatically as things change.  For more details and examples,
    please see the documentation for SC.View.VERTICAL_STACK and
    SC.View.HORIZONTAL_STACK.

    To define your own child view layout plugin, simply create an object that
    conforms to the SC.ChildViewLayoutProtocol protocol.

    **Note** This should only be set once and is not bindable.

    @type Object
    @default null
   */
  childViewLayout: null,

  /**
    The options for the given child view layout plugin.

    These options are specific to the current child layout plugin being used and
    are used to modify the applied layouts.  For example, SC.View.VERTICAL_STACK
    accepts options like:

        childViewLayoutOptions: {
          paddingAfter: 20,
          paddingBefore: 20,
          spacing: 10
        }

    To determine what options may be used for a given plugin and to see what the
    default options are, please refer to the documentation for the child layout
    plugin being used.

    @type Object
    @default null
  */
  childViewLayoutOptions: null,

  /** @private The explicit layout of the view, computed from the layout using the explicit position. */
  explicitLayout: function () {
    var layout = this.get('layout'),
        ret = null;

    if (layout) {
      ret = this._sc_computeExplicitLayout(layout);
    }

    return ret;
  }.property('layout').cacheable(),

  /**
    Walks like a duck. Is `true` to indicate that a view has layout support.
  */
  hasLayout: true,

  /**
    Whether the view and its child views should be monitored for changes that
    affect the current child view layout.

    When `true` and using a childViewLayout plugin, the view and its child views
    will be observed for any changes that would affect the layout of all the
    child views.  For example, if `isChildViewLayout` is true and using
    SC.View.VERTICAL_STACK, if any child view's height or visibility changes
    all of the child views will be re-adjusted.

    If you only want to automatically layout the child views once, you can
    set this to `false` to improve performance.

    @type Boolean
    @default true
  */
  isChildViewLayoutLive: true,

  /**
    Returns whether the height is 'fixed' or not. A fixed height is defined on the layout
    as an integer number of pixels.  Fixed widths are therefore unaffected by changes
    to their parent view's height.

    @field
    @returns {Boolean} YES if fixed, NO otherwise
    @test in layout
  */
  isFixedHeight: function() {
    var layout = this.get('layout');

    // Height is fixed if it has a height and it isn't SC.LAYOUT_AUTO or a percent.
    return (layout.height !== undefined) &&
      !SC.isPercentage(layout.height) &&
      (layout.height !== SC.LAYOUT_AUTO);
  }.property('layout').cacheable(),

  /**
    Returns whether the layout is 'fixed' or not.  A fixed layout means a
    fixed left & top position and fixed width & height.  Fixed layouts are
    therefore unaffected by changes to their parent view's layout.

    @returns {Boolean} YES if fixed, NO otherwise
    @test in layoutStyle
  */
  isFixedLayout: function () {
    return this.get('isFixedPosition') && this.get('isFixedSize');
  }.property('isFixedPosition', 'isFixedSize').cacheable(),

  /**
    Returns whether the position is 'fixed' or not.  A fixed position means a
    fixed left & top position within its parent's frame.  Fixed positions are
    therefore unaffected by changes to their parent view's size.

    @field
    @returns {Boolean} YES if fixed, NO otherwise
    @test in layoutStyle
  */
  isFixedPosition: function () {
    var explicitLayout = this.get('explicitLayout'),
      left = explicitLayout.left,
      top = explicitLayout.top,
      hasFixedLeft,
      hasFixedTop;

    // Position is fixed if it has left + top, but not as percentages and not as SC.LAYOUT_AUTO.
    hasFixedLeft = left !== undefined && !SC.isPercentage(left) && left !== SC.LAYOUT_AUTO;
    hasFixedTop = top !== undefined && !SC.isPercentage(top) && top !== SC.LAYOUT_AUTO;

    return hasFixedLeft && hasFixedTop;
  }.property('explicitLayout').cacheable(),

  /**
    Returns whether the size is 'fixed' or not.  A fixed size means a fixed
    width and height.  Fixed sizes are therefore unaffected by changes to their
    parent view's size.

    @field
    @returns {Boolean} YES if fixed, NO otherwise
    @test in layout
  */
  isFixedSize: function () {
    return this.get('isFixedHeight') && this.get('isFixedWidth');
  }.property('isFixedWidth', 'isFixedHeight').cacheable(),

  /**
    Returns whether the width is 'fixed' or not. A fixed width is defined on the layout
    as an integer number of pixels.  Fixed widths are therefore unaffected by changes
    to their parent view's width.

    @field
    @returns {Boolean} YES if fixed, NO otherwise
    @test in layout
  */
  isFixedWidth: function() {
    var layout = this.get('layout');

    // Width is fixed if it has a width and it isn't SC.LAYOUT_AUTO or a percent.
    return (layout.width !== undefined) &&
      !SC.isPercentage(layout.width) &&
      (layout.width !== SC.LAYOUT_AUTO);
  }.property('layout').cacheable(),

  /**
    Set the layout to a hash of layout properties to describe in detail how your view
    should be positioned on screen. Like most application development environments,
    your views are laid out absolutely, relative to their parent view.

    You can define your layout using combinations of the following positional properties:

     - left
     - top
     - right
     - bottom
     - height
     - width
     - centerX: offset from center, horizontally
     - centerY: offset from center, vertically
     - minWidth
     - minHeight
     - maxWidth
     - maxHeight
     - scale: once positioned, scales the view in place.
     - transformOriginX, transformOriginY: defines the point (as a decimal percentage) around which
       your view will scale. (Also impacts rotation; see below.)

    They are processed by SproutCore's layout engine and used to position the view's element onscreen. They are
    also reliably and speedily processed into a scaled rectangle (with x, y, height, width, scale and origin
    values) available on the frame property. See documentation on it and the clippingFrame property for more.

    Most of these properties take integer numbers of pixels, for example { left: 10 }, or fractional
    percentages like { left 0.25 }. Exceptions include scale, which takes a scale factor (e.g. { scale:
    2 } doubles the view's size), and transformOriginX/Y which take a decimal percent, and default to 0.5
    (the center of the view).

    It's possible to define very sophisticated layouts with these properties alone. For example, you
    can define a view which takes up the full screen until it reaches a certain width, and aligns to
    the left thereafter, with { left: 0, right: 0, maxWidth: 400 }. (If you need the flexibility to
    assign entirely different layouts at different screen or window sizes, see the Design Modes
    documentation under SC.Application.)

    Certain layout combinations are nonsensical and of course should be avoided. For example, you
    can use left + right or left + width, but not left + right + width.

    If your view has a CSS border, it's important that you specify its thickness in the layout hash,
    using one or more of the following border properties, as well as in your CSS. This is an unfortunate
    bit of repetition, but it's necessary to allow SproutCore to adjust the layout to compensate. (HTML
    positions borders outside of the body of an element; SproutCore positions them inside their rectangles.)

     - border: border thickness on all sides
     - borderTop: top border thickness
     - borderRight: right border thickness
     - borderBottom: bottom border thickness
     - borderLeft: bottom left thickness

    You can also use the following layout properties, which don't impact your view's frame.

     - opacity: the opacity of the view
     - rotate: once positioned, rotates the view in place.
     - zIndex: position above or below other views (Not recommended. Control sibling view
       overlay with childView order (later views draw above earlier views) where possible.)

    To change a layout property, you should use the adjust method, which handles some particulars for you.

    @type Object
    @default { top: 0, left: 0, bottom: 0, right: 0 }
    @test in layoutStyle
  */
  layout: { top: 0, left: 0, bottom: 0, right: 0 },

  /**
    The view responsible for laying out this view.  The default version
    returns the current parent view.
  */
  layoutView: function () {
    return this.get('parentView');
  }.property('parentView').cacheable(),

  /**
    The transition plugin to use when this view is moved or resized by adjusting
    its layout.

    SC.CoreView uses a pluggable transition architecture where the transition
    setup, execution and cleanup can be handled by a plugin.  This allows you
    to create complex transition animations and share them across all your views
    with only a single line of code.

    There are a number of pre-built transition adjust plugins available in
    the SproutCore foundation framework:

      SC.View.SMOOTH_ADJUST
      SC.View.BOUNCE_ADJUST
      SC.View.SPRING_ADJUST

    To create a custom transition plugin simply create a regular JavaScript
    object that conforms to the SC.ViewTransitionProtocol protocol.

    NOTE: When creating custom transition adjust plugins, be aware that SC.View
    will not call the `setup` method of the plugin, only the `run` method.

    @type Object (SC.ViewTransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionAdjust: null,

  /**
    The options for the given `transitionAdjust` plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, SC.View.BOUNCE_ADJUST accepts options
    like:

        transitionAdjustOptions: {
          bounciness: 0.5, // how much the adjustment should bounce back each time
          bounces: 4, // the number of bounces
          duration: 0.25,
          delay: 1
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionAdjustOptions: null,

  /**
    Activates use of brower's static layout. To activate, set this property to YES.

    @type Boolean
    @default NO
  */
  useStaticLayout: NO,

  // ------------------------------------------------------------------------
  // Methods
  //

  /** @private */
  _sc_adjustForBorder: function (frame, layout) {
    /*jshint eqnull:true */
    var defaultValue = layout.border == null ? 0 : layout.border,
        borderTop = this._sc_explicitValueFor(layout.borderTop, defaultValue),
        borderLeft = this._sc_explicitValueFor(layout.borderLeft, defaultValue),
        borderBottom = this._sc_explicitValueFor(layout.borderBottom, defaultValue),
        borderRight = this._sc_explicitValueFor(layout.borderRight, defaultValue);

    frame.x += borderLeft; // The border on the left pushes the frame to the right
    frame.y += borderTop; // The border on the top pushes the frame down
    frame.width -= (borderLeft + borderRight); // Border takes up space
    frame.height -= (borderTop + borderBottom); // Border takes up space

    return frame;
  },

  /** @private */
  _sc_adjustForScale: function (frame, layout) {

    // Scale not supported on this platform, ignore the layout values.
    if (!SC.platform.supportsCSSTransforms) {
      frame.scale = 1;
      frame.transformOriginX = frame.transformOriginY = 0.5;

    // Use scale.
    } else {

      // Get the scale and transform origins, if not provided. (Note inlining of SC.none for performance)
      /*jshint eqnull:true*/
      var scale = layout.scale,
          oX = layout.transformOriginX,
          oY = layout.transformOriginY;

      // If the scale is set and isn't 1, do some calculations.
      if (scale != null && scale !== 1) {
        // Scale the rect.
        frame = SC.scaleRect(frame, scale, oX, oY);

        // Add the scale and original unscaled height and width.
        frame.scale = scale;
      }

      // If the origin is set and isn't 0.5, include it.
      if (oX != null && oX !== 0.5) {
        frame.transformOriginX = oX;
      }

      // If the origin is set and isn't 0.5, include it.
      if (oY != null && oY !== 0.5) {
        frame.transformOriginY = oY;
      }
    }

    // Make sure width/height are never < 0.
    if (frame.height < 0) frame.height = 0;
    if (frame.width < 0) frame.width = 0;

    return frame;
  },

  /** @private Apply the adjustment to a clone of the layout (cloned unless newLayout is passed in) */
  _sc_applyAdjustment: function (key, newValue, layout, newLayout) {
    var animateLayout = this._animateLayout;

    // If a call to animate occurs in the same run loop, the animation layout
    // would still be applied in the next run loop, potentially overriding this
    // adjustment. So we need to cancel the animation layout.
    if (animateLayout) {
      if (newValue === null) {
        delete animateLayout[key];
      } else {
        animateLayout[key] = newValue;
      }

      if (this._pendingAnimations && this._pendingAnimations[key]) {
        // Adjusting a value that was about to be animated cancels the animation.
        delete this._pendingAnimations[key];
      }

    }

    // Ignore undefined values or values equal to the current value.
    /*jshint eqeqeq:false*/
    if (newValue !== undefined && layout[key] != newValue) { // coerced so '100' == 100
      // Only clone the layout if it is not given.
      if (!newLayout) newLayout = SC.clone(this.get('layout'));

      if (newValue === null) {
        delete newLayout[key];
      } else {
        newLayout[key] = newValue;
      }
    }

    return newLayout;
  },

  /** @private */
  _sc_checkForResize: function (previousLayout, currentLayout) {
    // Did our layout change in a way that could cause us to have changed size?  If
    // not, then there's no need to invalidate the frames of our child views.
    var didResizeHeight = true,
        didResizeWidth = true,
        didResize = true;

    // We test the new layout to see if we believe it will affect the view's frame.
    // Since all the child view frames may depend on the parent's frame, it's
    // best only to notify a frame change when it actually happens.
    /*jshint eqnull:true*/

    // Simple test: Width is defined and hasn't changed.
    // Complex test: No defined width, left or right haven't changed.
    if (previousLayout != null &&
        ((previousLayout.width != null &&
          previousLayout.width === currentLayout.width) ||
         (previousLayout.width == null &&
           currentLayout.width == null &&
           previousLayout.left === currentLayout.left &&
           previousLayout.right === currentLayout.right))) {
      didResizeWidth = false;
    }

    // Simple test: Height is defined and hasn't changed.
    // Complex test: No defined height, top or bottom haven't changed.
    if (!didResizeWidth &&
        ((previousLayout.height != null &&
          previousLayout.height === currentLayout.height) ||
         (previousLayout.height == null &&
           currentLayout.height == null &&
           previousLayout.top === currentLayout.top &&
           previousLayout.bottom === currentLayout.bottom))) {
      didResizeHeight = false;
    }

    // Border test: Even if the width & height haven't changed, a change in a border would be a resize.
    if (!didResizeHeight && !didResizeWidth) {
      didResize = !(previousLayout.border === currentLayout.border &&
              previousLayout.borderTop === currentLayout.borderTop &&
              previousLayout.borderLeft === currentLayout.borderLeft &&
              previousLayout.borderBottom === currentLayout.borderBottom &&
              previousLayout.borderRight === currentLayout.borderRight);
    }

    return didResize;
  },

  /** @private Called when the child view layout plugin or options change. */
  _cvl_childViewLayoutDidChange: function () {
    this.set('childViewsNeedLayout', true);

    // Filter the input channel.
    this.invokeOnce(this.layoutChildViewsIfNeeded);
  },

  /** @private Called when the child views change. */
  _cvl_childViewsDidChange: function () {
    this._cvl_teardownChildViewsLiveLayout();
    this._cvl_setupChildViewsLiveLayout();

    this.set('childViewsNeedLayout', true);

    // Filter the input channel.
    this.invokeOnce(this.layoutChildViewsIfNeeded);
  },

  /** @private Add observers to the child views for automatic child view layout. */
  _cvl_setupChildViewsLiveLayout: function () {
    var childViewLayout = this.childViewLayout,
      childViews,
      childLayoutProperties = childViewLayout.childLayoutProperties || [];

    // Create a reference to the current child views so that we can clean them if they change.
    childViews = this._cvl_childViews = this.get('childViews');
    for (var i = 0, len = childLayoutProperties.length; i < len; i++) {
      var observedProperty = childLayoutProperties[i];

      for (var j = 0, jlen = childViews.get('length'); j < jlen; j++) {
        var childView = childViews.objectAt(j);
        if (!childView.get('useAbsoluteLayout') && !childView.get('useStaticLayout')) {
          childView.addObserver(observedProperty, this, this._cvl_childViewLayoutDidChange);
        }
      }
    }
  },

  /** @private Remove observers from the child views for automatic child view layout. */
  _cvl_teardownChildViewsLiveLayout: function () {
    var childViewLayout = this.childViewLayout,
      childViews = this._cvl_childViews || [],
      childLayoutProperties = childViewLayout.childLayoutProperties || [];

    for (var i = 0, len = childLayoutProperties.length; i < len; i++) {
      var observedProperty = childLayoutProperties[i];

      for (var j = 0, jlen = childViews.get('length'); j < jlen; j++) {
        var childView = childViews.objectAt(j);
        if (!childView.get('useAbsoluteLayout') && !childView.get('useStaticLayout')) {
          childView.removeObserver(observedProperty, this, this._cvl_childViewLayoutDidChange);
        }
      }
    }
  },

  /** @private Computes the explicit layout. */
  _sc_computeExplicitLayout: function (layout) {
    var ret = SC.copy(layout);

    /* jshint eqnull:true */
    var hasBottom = (layout.bottom != null);
    var hasRight = (layout.right != null);
    var hasLeft = (layout.left != null);
    var hasTop = (layout.top != null);
    var hasCenterX = (layout.centerX != null);
    var hasCenterY = (layout.centerY != null);
    var hasHeight = (layout.height != null); //  || (layout.maxHeight != null)
    var hasWidth = (layout.width != null); // || (layout.maxWidth != null)

    /*jshint eqnull:true */
    // Left + Top take precedence (left & right & width becomes left & width).
    delete ret.right; // Right will be set if needed below.
    delete ret.bottom; // Bottom will be set if needed below.

    if (hasLeft) {
      ret.left = layout.left;
    } else if (!hasCenterX && !(hasWidth && hasRight)) {
      ret.left = 0;
    }

    if (hasRight && !(hasLeft && hasWidth)) {
      ret.right = layout.right;
    } else if (!hasCenterX && !hasWidth) {
      ret.right = 0;
    }

    
    // Debug-only warning when layout isn't valid.
    // UNUSED: This is too noisy for certain views that adjust their own layouts based on top of the default layout.
    // if (hasRight && hasLeft && hasWidth) {
    //   SC.warn("Developer Warning: When setting `width` in the layout, you must only set `left` or `right`, but not both: %@".fmt(this));
    // }
    

    if (hasTop) {
      ret.top = layout.top;
    } else if (!hasCenterY && !(hasHeight && hasBottom)) {
      ret.top = 0;
    }

    if (hasBottom && !(hasTop && hasHeight)) {
      ret.bottom = layout.bottom;
    } else if (!hasCenterY && !hasHeight) {
      ret.bottom = 0;
    }

    
    // Debug-only warning when layout isn't valid.
    // UNUSED: This is too noisy for certain views that adjust their own layouts based on top of the default layout.
    // if (hasBottom && hasTop && hasHeight) {
    //   SC.warn("Developer Warning: When setting `height` in the layout, you must only set `top` or `bottom`, but not both: %@".fmt(this));
    // }
    

    // CENTERS
    if (hasCenterX) {
      ret.centerX = layout.centerX;

      
      // Debug-only warning when layout isn't valid.
      if (hasCenterX && !hasWidth) {
        SC.warn("Developer Warning: When setting `centerX` in the layout, you must also define the `width`: %@".fmt(this));
      }
      
    }

    if (hasCenterY) {
      ret.centerY = layout.centerY;

      
      // Debug-only warning when layout isn't valid.
      if (hasCenterY && !hasHeight) {
        SC.warn("Developer Warning: When setting `centerY` in the layout, you must also define the `height`: %@".fmt(this));
      }
      
    }

    // BORDERS
    // Apply border first, so that the more specific borderX values will override it next.
    var border = layout.border;
    if (border != null) {
      ret.borderTop = border;
      ret.borderRight = border;
      ret.borderBottom = border;
      ret.borderLeft = border;
      delete ret.border;
    }

    // Override generic border with more specific borderX.
    if (layout.borderTop != null) {
      ret.borderTop = layout.borderTop;
    }
    if (layout.borderRight != null) {
      ret.borderRight = layout.borderRight;
    }
    if (layout.borderBottom != null) {
      ret.borderBottom = layout.borderBottom;
    }
    if (layout.borderLeft != null) {
      ret.borderLeft = layout.borderLeft;
    }

    return ret;
  },

  /** @private */
  _sc_convertFrameFromViewHelper: function (frame, fromView, targetView) {
    var myX = frame.x, myY = frame.y, myWidth = frame.width, myHeight = frame.height, view, f;

    // first, walk up from the view of the frame, up to the top level
    if (fromView) {
      view = fromView;
      //Note: Intentional assignment of variable f
      while (view && (f = view.get('frame'))) {

        // if scale != 1, then multiple by the scale (going from view to parent)
        if (f.scale && f.scale !== 1) {
          myX *= f.scale;
          myY *= f.scale;
          myWidth *= f.scale;
          myHeight *= f.scale;
        }

        myX += f.x;
        myY += f.y;

        view = view.get('layoutView');
      }
    }

    // now, we'll walk down from the top level to the target view

    // construct an array of view ancestry, from
    // the top level view down to the target view
    if (targetView) {
      var viewAncestors = [];
      view = targetView;

      while (view && view.get('frame')) {
        viewAncestors.unshift(view);
        view = view.get('layoutView');
      }

      // now walk the frame from
      for (var i = 0; i < viewAncestors.length; i++ ) {
        view = viewAncestors[i];
        f = view.get('frame');

        myX -= f.x;
        myY -= f.y;

        if (f.scale && f.scale !== 1) {
          myX /= f.scale;
          myY /= f.scale;
          myWidth /= f.scale;
          myHeight /= f.scale;
        }
      }
    }

    return { x: myX, y: myY, width: myWidth, height: myHeight };
  },

  /** @private */
  _sc_explicitValueFor: function (givenValue, impliedValue) {
    return givenValue === undefined ? impliedValue : givenValue;
  },

  /** @private Attempts to run a transition adjust, ensuring any showing transitions are stopped in place. */
  _sc_transitionAdjust: function (layout) {
    var transitionAdjust = this.get('transitionAdjust'),
      options = this.get('transitionAdjustOptions') || {};

    // Execute the adjusting transition.
    transitionAdjust.run(this, options, layout);
  },

  /** @private
    Invoked by other views to notify this view that its frame has changed.

    This notifies the view that its frame property has changed,
    then notifies its child views that their clipping frames may have changed.
  */
  _sc_viewFrameDidChange: function () {
    this.notifyPropertyChange('frame');

    // Notify the children that their clipping frame may have changed. Top-down, because a child's
    // clippingFrame is dependent on its parent's frame.
    this._callOnChildViews('_sc_clippingFrameDidChange');
  },

  /**
    This convenience method will take the current layout, apply any changes
    you pass and set it again.  It is more convenient than having to do this
    yourself sometimes.

    You can pass just a key/value pair or a hash with several pairs.  You can
    also pass a null value to delete a property.

    This method will avoid actually setting the layout if the value you pass
    does not edit the layout.

    @param {String|Hash} key
    @param {Object} value
    @returns {SC.View} receiver
  */
  adjust: function (key, value) {
    if (key === undefined) { return this; } // FAST PATH! Nothing to do.

    var layout = this.get('layout'),
      newLayout;

    // Normalize arguments.
    if (SC.typeOf(key) === SC.T_STRING) {
      newLayout = this._sc_applyAdjustment(key, value, layout);
    } else {
      for (var aKey in key) {
        if (!key.hasOwnProperty(aKey)) { continue; }

        newLayout = this._sc_applyAdjustment(aKey, key[aKey], layout, newLayout);
      }
    }

    // now set adjusted layout
    if (newLayout) {
      var transitionAdjust = this.get('transitionAdjust');

      if (this.get('viewState') & SC.CoreView.IS_SHOWN && transitionAdjust) {
        // Run the adjust transition.
        this._sc_transitionAdjust(newLayout);
      } else {
        this.set('layout', newLayout);
      }
    }

    return this;
  },

  /** */
  computeParentDimensions: function (frame) {
    var parentView = this.get('parentView'),
        parentFrame = (parentView) ? parentView.get('frame') : null,
        ret;

    if (parentFrame) {
      ret = {
        width: parentFrame.width,
        height: parentFrame.height
      };
    } else if (frame) {
      ret = {
        width: (frame.left || 0) + (frame.width || 0) + (frame.right || 0),
        height: (frame.top || 0) + (frame.height || 0) + (frame.bottom || 0)
      };
    } else {
      ret = {
        width: 0,
        height: 0
      };
    }

    return ret;
  },

  /**
    Converts a frame from the receiver's offset to the target offset.  Both
    the receiver and the target must belong to the same pane.  If you pass
    null, the conversion will be to the pane level.

    Note that the context of a view's frame is the view's parent frame.  In
    other words, if you want to convert the frame of your view to the global
    frame, then you should do:

        var pv = this.get('parentView'), frame = this.get('frame');
        var newFrame = pv ? pv.convertFrameToView(frame, null) : frame;

    @param {Rect} frame the source frame
    @param {SC.View} targetView the target view to convert to
    @returns {Rect} converted frame
    @test in convertFrames
  */
  convertFrameToView: function (frame, targetView) {
    return this._sc_convertFrameFromViewHelper(frame, this, targetView);
  },

  /**
    Converts a frame offset in the coordinates of another view system to the
    receiver's view.

    Note that the convext of a view's frame is relative to the view's
    parentFrame.  For example, if you want to convert the frame of view that
    belongs to another view to the receiver's frame you would do:

        var frame = view.get('frame');
        var newFrame = this.convertFrameFromView(frame, view.get('parentView'));

    @param {Rect} frame the source frame
    @param {SC.View} targetView the target view to convert to
    @returns {Rect} converted frame
    @test in converFrames
  */
  convertFrameFromView: function (frame, targetView) {
    return this._sc_convertFrameFromViewHelper(frame, targetView, this);
  },

  /** @private */
  didTransitionAdjust: function () {},

  /**
    This method is called whenever a property changes that invalidates the
    layout of the view.  Changing the layout will do this automatically, but
    you can add others if you want.

    Implementation Note:  In a traditional setup, we would simply observe
    'layout' here, but as described above in the documentation for our custom
    implementation of propertyDidChange(), this method must always run
    immediately after 'layout' is updated to avoid the potential for stale
    (incorrect) cached 'frame' values.

    @returns {SC.View} receiver
  */
  layoutDidChange: function () {
    var currentLayout = this.get('layout');

    // Handle old style rotation.
    if (!SC.none(currentLayout.rotate)) {
      if (SC.none(currentLayout.rotateZ) && SC.platform.get('supportsCSS3DTransforms')) {
        currentLayout.rotateZ = currentLayout.rotate;
        delete currentLayout.rotate;
      }
    }

    // Optimize notifications depending on if we resized or just moved.
    var didResize = this._sc_checkForResize(this._sc_previousLayout, currentLayout);

    // Cache the last layout to fine-tune notifications when the layout changes.
    // NOTE: Do this before continuing so that any adjustments that occur in viewDidResize or from
    //  _sc_viewFrameDidChange (say to the position after a resize), don't result in _sc_checkForResize
    //  running against the old _sc_previousLayout.
    this._sc_previousLayout = currentLayout;

    if (didResize) {
      this.viewDidResize();
    } else {
      // Even if we didn't resize, our frame sould have changed.
      // TODO: consider checking for position changes by testing the resulting frame against the cached frame. This is difficult to do.
      this._sc_viewFrameDidChange();
    }

    // Notify layoutView/parentView, unless we are transitioning.
    var layoutView = this.get('layoutView');
    if (layoutView) {
      layoutView.set('childViewsNeedLayout', YES);
      layoutView.layoutDidChangeFor(this);

      // Check if childViewsNeedLayout is still true.
      if (layoutView.get('childViewsNeedLayout')) {
        layoutView.invokeOnce(layoutView.layoutChildViewsIfNeeded);
      }
    } else {
      this.invokeOnce(this.updateLayout);
    }

    return this;
  },

  /**
    One of two methods that are invoked whenever one of your childViews
    layout changes.  This method is invoked every time a child view's layout
    changes to give you a chance to record the information about the view.

    Since this method may be called many times during a single run loop, you
    should keep this method pretty short.  The other method called when layout
    changes, layoutChildViews(), is invoked only once at the end of
    the run loop.  You should do any expensive operations (including changing
    a childView's actual layer) in this other method.

    Note that if as a result of running this method you decide that you do not
    need your layoutChildViews() method run later, you can set the
    childViewsNeedsLayout property to NO from this method and the layout
    method will not be called layer.

    @param {SC.View} childView the view whose layout has changed.
    @returns {void}
  */
  layoutDidChangeFor: function (childView) {
    var set = this._needLayoutViews;

    // Track this view.
    if (!set) set = this._needLayoutViews = SC.CoreSet.create();
    set.add(childView);
  },

  /**
    Called your layout method if the view currently needs to layout some
    child views.

    @param {Boolean} force if true assume view is visible even if it is not.
    @returns {SC.View} receiver
    @test in layoutChildViews
  */
  layoutChildViewsIfNeeded: function (force) {
    if (this.get('childViewsNeedLayout')) {
      this.layoutChildViews(force);

      this.set('childViewsNeedLayout', NO);
    }

    return this;
  },

  /**
    Applies the current layout to the layer.  This method is usually only
    called once per runloop.  You can override this method to provide your
    own layout updating method if you want, though usually the better option
    is to override the layout method from the parent view.

    The default implementation of this method simply calls the updateLayout()
    method on the views that need layout.

    @param {Boolean} force Force the update to the layer's layout style immediately even if the view is not in a shown state.  Otherwise the style will be updated when the view returns to a shown state.
    @returns {void}
  */
  layoutChildViews: function (force) {
    var childViewLayout = this.childViewLayout,
      set, len, i;

    // Allow the child view layout plugin to layout all child views.
    if (childViewLayout) {
      // Adjust all other child views right now.
      // Note: this will add the affected child views to the set so they will be updated only once in this run loop
      childViewLayout.layoutChildViews(this);
    }

    // Retreive these values after they may have been updated by adjustments by
    // the childViewLayout plugin.
    set = this._needLayoutViews;
    if (set) {
      for (i = 0, len = set.length; i < len; ++i) {
        set[i].updateLayout(force);
      }

      set.clear(); // reset & reuse
    }
  },

  /**
    This method may be called on your view whenever the parent view resizes.

    The default version of this method will reset the frame and then call
    viewDidResize() if its size may have changed.  You will not usually override
    this method, but you may override the viewDidResize() method.

    @param {Frame} parentFrame the parent view's current frame.
    @returns {void}
    @test in viewDidResize
  */
  parentViewDidResize: function (parentFrame) {
    // Determine if our position may have changed.
    var positionMayHaveChanged = !this.get('isFixedPosition');

    // Figure out if our size may have changed.
    var isStatic = this.get('useStaticLayout'),
        // Figure out whether our height may have changed.
        parentHeight = parentFrame ? parentFrame.height : 0,
        parentHeightDidChange = parentHeight !== this._scv_parentHeight,
        isFixedHeight = this.get('isFixedHeight'),
        heightMayHaveChanged = isStatic || (parentHeightDidChange && !isFixedHeight),
        // Figure out whether our width may have changed.
        parentWidth = parentFrame ? parentFrame.width : 0,
        parentWidthDidChange = parentWidth !== this._scv_parentWidth,
        isFixedWidth = this.get('isFixedWidth'),
        widthMayHaveChanged = isStatic || (parentWidthDidChange && !isFixedWidth);

    // Update the cached parent frame.
    this._scv_parentHeight = parentHeight;
    this._scv_parentWidth = parentWidth;

    // If our height or width changed, our resulting frame change may impact our child views.
    if (heightMayHaveChanged || widthMayHaveChanged) {
      this.viewDidResize();
    }
    // If our size didn't change but our position did, our frame will change, but it won't impact our child
    // views' frames. (Note that the _sc_viewFrameDidChange call is made by viewDidResize above.)
    else if (positionMayHaveChanged) {
      this._sc_viewFrameDidChange();
    }
  },

  /**
    The 'frame' property depends on the 'layout' property as well as the
    parent view's frame.  In order to properly invalidate any cached values,
    we need to invalidate the cache whenever 'layout' changes.  However,
    observing 'layout' does not guarantee that; the observer might not be run
    before all other observers.

    In order to avoid any window of opportunity where the cached frame could
    be invalid, we need to force layoutDidChange() to immediately run
    whenever 'layout' is set.
  */
  propertyDidChange: function (key, value, _keepCache) {
    
    // Debug mode only property validation.
    if (key === 'layout') {
      // If a layout value is accidentally set to NaN, this can result in infinite loops. Help the
      // developer out by failing early so that they can follow the stack trace to the problem.
      for (var property in value) {
        if (!value.hasOwnProperty(property)) { continue; }

        var layoutValue = value[property];
        if (isNaN(layoutValue) && (layoutValue !== SC.LAYOUT_AUTO) &&
            !SC._ROTATION_VALUE_REGEX.exec(layoutValue) && !SC._SCALE_VALUE_REGEX.exec(layoutValue)) {
          throw new Error("SC.View layout property set to invalid value, %@: %@.".fmt(property, layoutValue));
        }
      }
    }
    

    // To allow layout to be a computed property, we check if any property has
    // changed and if layout is dependent on the property.
    var layoutChange = false;
    if (typeof this.layout === "function" && this._kvo_dependents) {
      var dependents = this._kvo_dependents[key];
      if (dependents && dependents.indexOf('layout') !== -1) { layoutChange = true; }
    }

    // If the key is 'layout', we need to call layoutDidChange() immediately
    // so that if the frame has changed any cached values (for both this view
    // and any child views) can be appropriately invalidated.
    if (key === 'layout' || layoutChange) {
      this.layoutDidChange();
    }

    // Resume notification as usual.
    return arguments.callee.base.apply(this,arguments);
  },

  /**
  */
  // propertyWillChange: function (key) {
  //   // To allow layout to be a computed property, we check if any property has
  //   // changed and if layout is dependent on the property.
  //   var layoutChange = false;
  //   if (typeof this.layout === "function" && this._kvo_dependents) {
  //     var dependents = this._kvo_dependents[key];
  //     if (dependents && dependents.indexOf('layout') !== -1) { layoutChange = true; }
  //   }

  //   if (key === 'layout' || layoutChange) {
  //     this._sc_previousLayout = this.get('layout');
  //   }

  //   return arguments.callee.base.apply(this,arguments);
  // },

  /**
    Attempt to scroll the view to visible.  This will walk up the parent
    view hierarchy looking looking for a scrollable view.  It will then
    call scrollToVisible() on it.

    Returns YES if an actual scroll took place, no otherwise.

    @returns {Boolean}
  */
  scrollToVisible: function () {
    var pv = this.get('parentView');
    while (pv && !pv.get('isScrollable')) { pv = pv.get('parentView'); }

    // found view, first make it scroll itself visible then scroll this.
    if (pv) {
      pv.scrollToVisible();
      return pv.scrollToVisible(this);
    } else {
      return NO;
    }
  },

  /**
    This method is invoked on your view when the view resizes due to a layout
    change or potentially due to the parent view resizing (if your view’s size
    depends on the size of your parent view).  You can override this method
    to implement your own layout if you like, such as performing a grid
    layout.

    The default implementation simply notifies about the change to 'frame' and
    then calls parentViewDidResize on all of your children.

    @returns {void}
  */
  viewDidResize: function () {
    this._sc_viewFrameDidChange();

    // Also notify our children.
    var cv = this.childViews,
        frame = this.get('frame'),
        len, idx, view;
    for (idx = 0; idx < (len = cv.length); ++idx) {
      view = cv[idx];
      view.tryToPerform('parentViewDidResize', frame);
    }
  },

  // Implementation note: As a general rule, paired method calls, such as
  // beginLiveResize/endLiveResize that are called recursively on the tree
  // should reverse the order when doing the final half of the call. This
  // ensures that the calls are propertly nested for any cleanup routines.
  //
  // -> View A.beginXXX()
  //   -> View B.beginXXX()
  //     -> View C.beginXXX()
  //   -> View D.beginXXX()
  //
  // ...later on, endXXX methods are called in reverse order of beginXXX...
  //
  //   <- View D.endXXX()
  //     <- View C.endXXX()
  //   <- View B.endXXX()
  // <- View A.endXXX()
  //
  // See the two methods below for an example implementation.

  /**
    Call this method when you plan to begin a live resize.  This will
    notify the receiver view and any of its children that are interested
    that the resize is about to begin.

    @returns {SC.View} receiver
    @test in viewDidResize
  */
  beginLiveResize: function () {
    // call before children have been notified...
    if (this.willBeginLiveResize) this.willBeginLiveResize();

    // notify children in order
    var ary = this.get('childViews'), len = ary.length, idx, view;
    for (idx = 0; idx < len; ++idx) {
      view = ary[idx];
      if (view.beginLiveResize) view.beginLiveResize();
    }
    return this;
  },

  /**
    Call this method when you are finished with a live resize.  This will
    notify the receiver view and any of its children that are interested
    that the live resize has ended.

    @returns {SC.View} receiver
    @test in viewDidResize
  */
  endLiveResize: function () {
    // notify children in *reverse* order
    var ary = this.get('childViews'), len = ary.length, idx, view;
    for (idx = len - 1; idx >= 0; --idx) { // loop backwards
      view = ary[idx];
      if (view.endLiveResize) view.endLiveResize();
    }

    // call *after* all children have been notified...
    if (this.didEndLiveResize) this.didEndLiveResize();
    return this;
  },

  /**
    Invoked by the layoutChildViews method to update the layout on a
    particular view.  This method creates a render context and calls the
    renderLayout() method, which is probably what you want to override instead
    of this.

    You will not usually override this method, but you may call it if you
    implement layoutChildViews() in a view yourself.

    @param {Boolean} force Force the update to the layer's layout style immediately even if the view is not in a shown state.  Otherwise the style will be updated when the view returns to a shown state.
    @returns {SC.View} receiver
    @test in layoutChildViews
  */
  updateLayout: function (force) {
    this._doUpdateLayout(force);

    return this;
  },

  /**
    Default method called by the layout view to actually apply the current
    layout to the layer.  The default implementation simply assigns the
    current layoutStyle to the layer.  This method is also called whenever
    the layer is first created.

    @param {SC.RenderContext} the render context
    @returns {void}
    @test in layoutChildViews
  */
  renderLayout: function (context) {
    context.setStyle(this.get('layoutStyle'));
  },

  // ------------------------------------------------------------------------
  // Statechart
  //

  /** @private Update this view's layout action. */
  _doUpdateLayout: function (force) {
    var isRendered = this.get('_isRendered'),
      isVisibleInWindow = this.get('isVisibleInWindow'),
      handled = true;

    if (isRendered) {
      if (isVisibleInWindow || force) {
        // Only in the visible states do we allow updates without being forced.
        this._doUpdateLayoutStyle();
      } else {
        // Otherwise mark the view as needing an update when we enter a shown state again.
        this._layoutStyleNeedsUpdate = true;
      }
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private */
  _doUpdateLayoutStyle: function () {
    var layer = this.get('layer'),
      layoutStyle = this.get('layoutStyle');

    for (var styleName in layoutStyle) {
      layer.style[styleName] = layoutStyle[styleName];
    }

    // Reset that an update is required.
    this._layoutStyleNeedsUpdate = false;

    // Notify updated.
    this._updatedLayout();
  },

  /** @private Override: Notify on attached (avoids notify of frame changed). */
  _notifyDidAttach: function () {
    // If we are using static layout then we don't know the frame until appended to the document.
    if (this.get('useStaticLayout')) {
      // We call viewDidResize so that it calls parentViewDidResize on all child views.
      this.viewDidResize();
    }

    // Notify.
    if (this.didAppendToDocument) { this.didAppendToDocument(); }
  },

  /** @private Override: The 'adopted' event (uses isFixedSize so our childViews are notified if our frame changes). */
  _adopted: function (beforeView) {
    // If our size depends on our parent, it will have changed on adoption.
    var isFixedSize = this.get('isFixedSize');
    if (isFixedSize) {
      // Even if our size is fixed, our frame may have changed (in particular if the anchor is not top/left)
      this._sc_viewFrameDidChange();
    } else {
      this.viewDidResize();
    }

    arguments.callee.base.apply(this,arguments);
  },

  /** @private Extension: The 'orphaned' event (uses isFixedSize so our childViews are notified if our frame changes). */
  _orphaned: function () {
    arguments.callee.base.apply(this,arguments);

    if (!this.isDestroyed) {
      // If our size depends on our parent, it will have changed on orphaning.
      var isFixedSize = this.get('isFixedSize');
      if (isFixedSize) {
      // Even if our size is fixed, our frame may have changed (in particular if the anchor is not top/left)
      this._sc_viewFrameDidChange();
      } else {
        this.viewDidResize();
      }
    }
  },

  /** @private Extension: The 'updatedContent' event. */
  _updatedContent: function () {
    arguments.callee.base.apply(this,arguments);

    // If this view uses static layout, then notify that the frame (likely)
    // changed.
    if (this.get('useStaticLayout')) { this.viewDidResize(); }
  },

  /** @private The 'updatedLayout' event. */
  _updatedLayout: function () {
    // Notify.
    this.didRenderAnimations();
  }

});

SC.View.mixin(
  /** @scope SC.View */ {

  /**
    Convert any layout to a Top, Left, Width, Height layout
  */
  convertLayoutToAnchoredLayout: function (layout, parentFrame) {
    var ret = {top: 0, left: 0, width: parentFrame.width, height: parentFrame.height},
        pFW = parentFrame.width, pFH = parentFrame.height, //shortHand for parentDimensions
        lR = layout.right,
        lL = layout.left,
        lT = layout.top,
        lB = layout.bottom,
        lW = layout.width,
        lH = layout.height,
        lcX = layout.centerX,
        lcY = layout.centerY;

    // X Conversion
    // handle left aligned and left/right
    if (!SC.none(lL)) {
      if (SC.isPercentage(lL)) ret.left = lL * pFW;
      else ret.left = lL;
      if (lW !== undefined) {
        if (lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO;
        else if (SC.isPercentage(lW)) ret.width = lW * pFW;
        else ret.width = lW;
      } else {
        if (lR && SC.isPercentage(lR)) ret.width = pFW - ret.left - (lR * pFW);
        else ret.width = pFW - ret.left - (lR || 0);
      }

    // handle right aligned
    } else if (!SC.none(lR)) {

      // if no width, calculate it from the parent frame
      if (SC.none(lW)) {
        ret.left = 0;
        if (lR && SC.isPercentage(lR)) ret.width = pFW - (lR * pFW);
        else ret.width = pFW - (lR || 0);

      // If has width, calculate the left anchor from the width and right and parent frame
      } else {
        if (lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO;
        else {
          if (SC.isPercentage(lW)) ret.width = lW * pFW;
          else ret.width = lW;
          if (SC.isPercentage(lR)) ret.left = pFW - (ret.width + lR);
          else ret.left = pFW - (ret.width + lR);
        }
      }

    // handle centered
    } else if (!SC.none(lcX)) {
      if (lW && SC.isPercentage(lW)) ret.width = (lW * pFW);
      else ret.width = (lW || 0);
      ret.left = ((pFW - ret.width) / 2);
      if (SC.isPercentage(lcX)) ret.left = ret.left + lcX * pFW;
      else ret.left = ret.left + lcX;

    // if width defined, assume left of zero
    } else if (!SC.none(lW)) {
      ret.left =  0;
      if (lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO;
      else {
        if (SC.isPercentage(lW)) ret.width = lW * pFW;
        else ret.width = lW;
      }

    // fallback, full width.
    } else {
      ret.left = 0;
      ret.width = 0;
    }

    // handle min/max
    if (layout.minWidth !== undefined) ret.minWidth = layout.minWidth;
    if (layout.maxWidth !== undefined) ret.maxWidth = layout.maxWidth;

    // Y Conversion
    // handle left aligned and top/bottom
    if (!SC.none(lT)) {
      if (SC.isPercentage(lT)) ret.top = lT * pFH;
      else ret.top = lT;
      if (lH !== undefined) {
        if (lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO;
        else if (SC.isPercentage(lH)) ret.height = lH * pFH;
        else ret.height = lH;
      } else {
        ret.height = pFH - ret.top;
        if (lB && SC.isPercentage(lB)) ret.height = ret.height - (lB * pFH);
        else ret.height = ret.height - (lB || 0);
      }

    // handle bottom aligned
    } else if (!SC.none(lB)) {

      // if no height, calculate it from the parent frame
      if (SC.none(lH)) {
        ret.top = 0;
        if (lB && SC.isPercentage(lB)) ret.height = pFH - (lB * pFH);
        else ret.height = pFH - (lB || 0);

      // If has height, calculate the top anchor from the height and bottom and parent frame
      } else {
        if (lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO;
        else {
          if (SC.isPercentage(lH)) ret.height = lH * pFH;
          else ret.height = lH;
          ret.top = pFH - ret.height;
          if (SC.isPercentage(lB)) ret.top = ret.top - (lB * pFH);
          else ret.top = ret.top - lB;
        }
      }

    // handle centered
    } else if (!SC.none(lcY)) {
      if (lH && SC.isPercentage(lH)) ret.height = (lH * pFH);
      else ret.height = (lH || 0);
      ret.top = ((pFH - ret.height) / 2);
      if (SC.isPercentage(lcY)) ret.top = ret.top + lcY * pFH;
      else ret.top = ret.top + lcY;

    // if height defined, assume top of zero
    } else if (!SC.none(lH)) {
      ret.top =  0;
      if (lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO;
      else if (SC.isPercentage(lH)) ret.height = lH * pFH;
      else ret.height = lH;

    // fallback, full height.
    } else {
      ret.top = 0;
      ret.height = 0;
    }

    if (ret.top) ret.top = Math.floor(ret.top);
    if (ret.bottom) ret.bottom = Math.floor(ret.bottom);
    if (ret.left) ret.left = Math.floor(ret.left);
    if (ret.right) ret.right = Math.floor(ret.right);
    if (ret.width !== SC.LAYOUT_AUTO) ret.width = Math.floor(ret.width);
    if (ret.height !== SC.LAYOUT_AUTO) ret.height = Math.floor(ret.height);

    // handle min/max
    if (layout.minHeight !== undefined) ret.minHeight = layout.minHeight;
    if (layout.maxHeight !== undefined) ret.maxHeight = layout.maxHeight;

    return ret;
  },

  /**
    For now can only convert Top/Left/Width/Height to a Custom Layout
  */
  convertLayoutToCustomLayout: function (layout, layoutParams, parentFrame) {
    // TODO: [EG] Create Top/Left/Width/Height to a Custom Layout conversion
  }

});

/* >>>>>>>>>> BEGIN source/views/view/acceleration.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("views/view");
sc_require("views/view/layout");
sc_require("views/view/layout_style");

SC.View.reopen({

  /**
    Setting wantsAcceleratedLayer to YES will use transforms to move the
    layer when available. On some platforms transforms are hardware accelerated.
  */
  wantsAcceleratedLayer: NO,

  /**
    Specifies whether transforms can be used to move the layer.
  */
  hasAcceleratedLayer: function () {
    return (SC.platform.supportsCSSTransforms && this.get('wantsAcceleratedLayer') && this.get('isFixedLayout'));
  }.property('wantsAcceleratedLayer', 'isFixedLayout').cacheable()

});

/* >>>>>>>>>> BEGIN source/views/view/cursor.js */
sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  /**
    You can set this to an SC.Cursor instance; whenever that SC.Cursor's
    'cursorStyle' changes, the cursor for this view will automatically
    be updated to match. This allows you to coordinate the cursors of
    many views by making them all share the same cursor instance.

    For example, SC.SplitView uses this ensure that it and all of its
    children have the same cursor while dragging, so that whether you are
    hovering over the divider or another child of the split view, the
    proper cursor is visible.

    @property {SC.Cursor String}
  */
  cursor: function(key, value) {
    var parent;

    if (value) { this._setCursor = value; }
    if (this._setCursor !== undefined) { return this._setCursor; }

    parent = this.get('parentView');
    if (this.get('shouldInheritCursor') && parent) {
      return parent.get('cursor');
    }

    return null;
  }.property('parentView', 'shouldInheritCursor').cacheable(),

  /**
    A child view without a cursor of its own inherits its parent's cursor by
    default.  Set this to NO to prevent this behavior.

    @type Boolean
  */
  shouldInheritCursor: YES

});

/* >>>>>>>>>> BEGIN source/views/view/enabled.js */
sc_require("views/view");

SC.CoreView.mixin(
  /** @scope SC.CoreView */ {

  /**
    The view is enabled.

    @static
    @constant
  */
  ENABLED: 0x08, // 8

  /**
    The view has been disabled.

    @static
    @constant
  */
  IS_DISABLED: 0x10, // 16

  /**
    The view is disabled.

    @static
    @constant
  */
  DISABLED: 0x11, // 17

  /**
    The view is enabled itself, but is effectively disabled in the pane due to
    a disabled ancestor.

    @static
    @constant
  */
  DISABLED_BY_PARENT: 0x12, // 18

  /**
    The view is disabled itself and is also disabled in the pane due to
    a disabled ancestor.

    @static
    @constant
  */
  DISABLED_AND_BY_PARENT: 0x13 // 19

});


SC.View.reopen(
  /** @scope SC.View.prototype */ {

  // ------------------------------------------------------------------------
  // Properties
  //

  /**
    The current enabled state of the view.

    Views have a few possible enabled states:

    * SC.CoreView.ENABLED
    * SC.CoreView.DISABLED
    * SC.CoreView.DISABLED_BY_PARENT

    @type String
    @default SC.CoreView.ENABLED
    @readonly
  */
  enabledState: SC.CoreView.ENABLED,

  /**
    Set to true when the item is enabled.   Note that changing this value
    will alter the `isEnabledInPane` property for this view and any
    child views as well as to automatically add or remove a 'disabled' CSS
    class name.

    This property is observable and bindable.

    @type Boolean
  */
  isEnabled: YES,
  isEnabledBindingDefault: SC.Binding.oneWay().bool(),

  /**
    Computed property returns YES if the view and all of its parent views
    are enabled in the pane.  You should use this property when deciding
    whether to respond to an incoming event or not.

    @type Boolean
  */
  // The previous version used a lazy upward search method.  This has better
  // performance, but made isEnabledInPane non-bindable.
  // isEnabledInPane: function() {
  //   var ret = this.get('isEnabled'), pv ;
  //   if (ret && (pv = this.get('parentView'))) { ret = pv.get('isEnabledInPane'); }
  //   return ret ;
  // }.property('parentView', 'isEnabled'),
  isEnabledInPane: function () {
    return this.get('enabledState') === SC.CoreView.ENABLED;
  }.property('enabledState').cacheable(),

  /**
    By default, setting isEnabled to false on a view will place all of its
    child views in a disabled state.  To block this from happening to a
    specific child view and its children, you can set `shouldInheritEnabled`
    to false.

    In this way you can set `isEnabled` to false on a main pane to disable all
    buttons, collections and other controls within it, but can still keep a
    section of it editable using `shouldInheritEnabled: false`.

    @type Boolean
  */
  shouldInheritEnabled: true,

  // ------------------------------------------------------------------------
  // Actions & Events
  //

  /** @private */
  _doEnable: function () {
    var handled = true,
      enabledState = this.get('enabledState');

    // If the view itself is disabled, then we can enable it.
    if (enabledState === SC.CoreView.DISABLED) {
      // Update the enabled state of all children. Top-down, because if a child is disabled on its own it
      // won't affect its childrens' state and we can bail out early.
      this._callOnChildViews('_parentDidEnableInPane');
      this._gotoEnabledState();

    // If the view is disabled and has a disabled parent, we can enable it, but it will be disabled by the parent.
    } else if (enabledState === SC.CoreView.DISABLED_AND_BY_PARENT) {
      // The view is no longer disabled itself, but still disabled by an ancestor.
      this._gotoDisabledByParentState();

    // If the view is not disabled, we can't enable it.
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private */
  _doDisable: function () {
    var handled = true,
      enabledState = this.get('enabledState');

    // If the view is not itself disabled, then we can disable it.
    if (enabledState === SC.CoreView.ENABLED) {
      // Update the disabled state of all children. Top-down, because if a child is disabled on its own it
      // won't affect its childrens' state and we can bail out early.
      this._callOnChildViews('_parentDidDisableInPane');
      this._gotoDisabledState();

      // Ensure that first responder status is given up.
      if (this.get('isFirstResponder')) {
        this.resignFirstResponder();
      }

    // If the view is disabled because of a disabled parent, we can disable the view itself too.
    } else if (enabledState === SC.CoreView.DISABLED_BY_PARENT) {
      // The view is now disabled itself and disabled by an ancestor.
      this._gotoDisabledAndByParentState();

    // If the view is not enabled, we can't disable it.
    } else {
      handled = false;
    }

    return handled;
  },

  // ------------------------------------------------------------------------
  // Methods
  //

  /** @private
    Observes the isEnabled property and resigns first responder if set to NO.
    This will avoid cases where, for example, a disabled text field retains
    its focus rings.

    @observes isEnabled
  */
  _sc_view_isEnabledDidChange: function () {
    // Filter the input channel.
    this.invokeOnce(this._doUpdateEnabled);
  }.observes('isEnabled'),

  /** @private */
  _doUpdateEnabled: function () {
    var state = this.get('viewState');

    // Call the proper action.
    if (this.get('isEnabled')) {
      this._doEnable();
    } else {
      this._doDisable();
    }

    // Update the display if in a visible state.
    switch (state) {
    case SC.CoreView.ATTACHED_SHOWN:
    case SC.CoreView.ATTACHED_SHOWING:
    case SC.CoreView.ATTACHED_BUILDING_IN:
      // Update the display.
      this._doUpdateEnabledStyle();
      break;
    default:
      // Indicate that a display update is required the next time we are visible.
      this._enabledStyleNeedsUpdate = true;
    }
  },

  /** @private */
  _doUpdateEnabledStyle: function () {
    var isEnabled = this.get('isEnabled');

    this.$().toggleClass('disabled', !isEnabled);
    this.$().attr('aria-disabled', !isEnabled ? true : null);

    // Reset that an update is required.
    this._enabledStyleNeedsUpdate = false;
  },

  /** @private */
  _parentDidEnableInPane: function () {
    var enabledState = this.get('enabledState');

    if (this.get('shouldInheritEnabled')) {

      if (enabledState === SC.CoreView.DISABLED_BY_PARENT) { // Was enabled before.
        this._gotoEnabledState();
      } else if (enabledState === SC.CoreView.DISABLED_AND_BY_PARENT) { // Was disabled before.
        this._gotoDisabledState();

        // There's no need to continue to further child views.
        return false;
      }
    } else {
      // There's no need to continue to further child views.
      return false;
    }
  },

  /** @private */
  _parentDidDisableInPane: function () {
    var enabledState = this.get('enabledState');

    if (this.get('shouldInheritEnabled')) {

      if (enabledState === SC.CoreView.ENABLED) { // Was enabled.
        this._gotoDisabledByParentState();
      } else if (enabledState === SC.CoreView.DISABLED) { // Was disabled.
        this._gotoDisabledAndByParentState();
      } else { // Was already disabled by ancestor.

        // There's no need to continue to further child views.
        return false;
      }
    } else {
      // There's no need to continue to further child views.
      return false;
    }
  },

  /** @private */
  _gotoEnabledState: function () {
    this.set('enabledState', SC.CoreView.ENABLED);
  },

  /** @private */
  _gotoDisabledState: function () {
    this.set('enabledState', SC.CoreView.DISABLED);
  },

  /** @private */
  _gotoDisabledAndByParentState: function () {
    this.set('enabledState', SC.CoreView.DISABLED_AND_BY_PARENT);
  },

  /** @private */
  _gotoDisabledByParentState: function () {
    this.set('enabledState', SC.CoreView.DISABLED_BY_PARENT);
  }

});

/* >>>>>>>>>> BEGIN source/views/view/keyboard.js */
sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */ {
  // ..........................................................
  // KEY RESPONDER
  //

  /** @property
    YES if the view is currently first responder and the pane the view belongs
    to is also key pane.  While this property is set, you should expect to
    receive keyboard events.
  */
  isKeyResponder: NO,

  /**
    This method is invoked just before you lost the key responder status.
    The passed view is the view that is about to gain keyResponder status.
    This gives you a chance to do any early setup. Remember that you can
    gain/lose key responder status either because another view in the same
    pane is becoming first responder or because another pane is about to
    become key.

    @param {SC.Responder} responder
  */
  willLoseKeyResponderTo: function(responder) {},

  /**
    This method is invoked just before you become the key responder.  The
    passed view is the view that is about to lose keyResponder status.  You
    can use this to do any setup before the view changes.
    Remember that you can gain/lose key responder status either because
    another view in the same pane is becoming first responder or because
    another pane is about to become key.

    @param {SC.Responder} responder
  */
  willBecomeKeyResponderFrom: function(responder) {},

  /**
    Invokved just after the responder loses key responder status.
    @param {SC.Responder} responder
  */
  didLoseKeyResponderTo: function(responder) {},

  /**
    Invoked just after the responder gains key responder status.
    By default, it calls focus on the view root element. For accessibility 
    purposes.
  
    @param {SC.Responder} responder
  */
  didBecomeKeyResponderFrom: function(responder) {},

  /**
    This method will process a key input event, attempting to convert it to
    an appropriate action method and sending it up the responder chain.  The
    event is converted using the key bindings hashes, (SC.BASE_KEY_BINDINGS
    and SC.MODIFIED_KEY_BINDINGS) which map key events to method names. If
    no key binding method is found, then the key event will be passed along
    to any insertText() method found.

    @param {SC.Event} event
    @returns {Object} object that handled event, if any
  */
  interpretKeyEvents: function(event) {
    var codes = event.commandCodes(),
        cmd = codes[0],
        chr = codes[1],
        ret,
        match,
        methodName,
        target,
        pane,
        handler;

    if (!cmd && !chr) { return null ; } //nothing to do.

    // if this is a command key, try to do something about it.
    if (cmd) {
      match = cmd.match(/[^_]+$/);
      methodName = SC.MODIFIED_KEY_BINDINGS[cmd];
      if (!methodName && match && match.length > 0) {
        methodName = SC.BASE_KEY_BINDINGS[match[0]];
      }
      if (methodName) {
        target = this;
        pane = this.get('pane');
        handler = null;
        while(target && !(handler = target.tryToPerform(methodName, event))){
          target = (target===pane)? null: target.get('nextResponder') ;
        }
        return handler ;
      }
    }

    if (chr && this.respondsTo('insertText')) {
      // if we haven't returned yet and there is plain text, then do an insert
      // of the text.  Since this is not an action, do not send it up the
      // responder chain.
      ret = this.insertText(chr, event);
      return ret ? (ret===YES ? this : ret) : null ; // map YES|NO => this|nil
    }

    return null ; //nothing to do.
  },

  /**
    This method is invoked by interpretKeyEvents() when you receive a key
    event matching some plain text.  You can use this to actually insert the
    text into your application, if needed.

    @param {SC.Event} event
    @returns {Object} receiver or object that handled event
  */
  insertText: function(chr) {
    return NO ;
  },

  /**
    Recursively travels down the view hierarchy looking for a view that
    implements the key equivalent (returning to YES to indicate it handled
    the event).  You can override this method to handle specific key
    equivalents yourself.

    The keystring is a string description of the key combination pressed.
    The evt is the event itself. If you handle the equivalent, return YES.
    Otherwise, you should just return sc_super.

    @param {String} keystring
    @param {SC.Event} evt
    @returns {Boolean}
  */
  performKeyEquivalent: function(keystring, evt) {
    var ret = NO,
        childViews = this.get('childViews'),
        len = childViews.length,
        idx = -1, view ;
    while (!ret && (++idx < len)) {
      view = childViews[idx];

      ret = view.tryToPerform('performKeyEquivalent', keystring, evt);
    }

    return ret ;
  },

  /**
    The first child of this view for the purposes of tab ordering. If not
    provided, the first element of childViews is used. Override this if
    your view displays its child views in an order different from that
    given in childViews.

    @type SC.View
    @default null
  */
  firstKeyView: null,

  /**
    @private

    Actually calculates the firstKeyView as described in firstKeyView.

    @returns {SC.View}
  */
  _getFirstKeyView: function() {
    // if first was given, just return it
    var firstKeyView = this.get('firstKeyView');
    if(firstKeyView) return firstKeyView;

    // otherwise return the first childView
    var childViews = this.get('childViews');
    if(childViews) return childViews[0];
  },

  /**
    The last child of this view for the purposes of tab ordering. If not set, can be generated two different ways:
    1. If firstKeyView is provided, it will be generated by starting from firstKeyView and traversing the childViews nextKeyView properties.
    2. If firstKeyView is not provided, it will simply return the last element of childViews.

    The first way is not very efficient, so if you provide firstKeyView you should also provide lastKeyView.

    @type SC.View
    @default null
  */
  lastKeyView: null,

  /**
    @private

    Actually calculates the lastKeyView as described in lastKeyView.

    @returns {SC.View}
  */
  _getLastKeyView: function() {
    // if last was given, just return it
    var lastKeyView = this.get('lastKeyView');
    if(lastKeyView) return lastKeyView;

    var view,
    prev = this.get('firstKeyView');

    // if first was given but not last, build by starting from first and
    // traversing until we hit the end. this is obviously the least efficient
    // way
    if(prev) {
      while(view = prev._getNextKeyView()) {
        prev = view;
      }

      return prev;
    }

    // if neither was given, it's more efficient to just return the last
    // childView
    else {
      var childViews = this.get('childViews');

      if(childViews) return childViews[childViews.length - 1];
    }
  },

  /**
    Optionally points to the next key view that should gain focus when tabbing
    through an interface.  If this is not set, then the next key view will
    be set automatically to the next sibling as defined by its parent's
    childViews property.

    If any views define this, all of their siblings should define it as well,
    otherwise undefined behavior may occur. Their parent view should also define
    a firstKeyView.

    This may also be set to a view that is not a sibling, but once again all
    views in the chain must define it or undefined behavior will occur.

    Likewise, any view that sets nextKeyView should also set previousKeyView.

    @type SC.View
    @default null
  */

  nextKeyView: undefined,

  /**
    @private

    Gets the next key view by checking if the user set it and otherwise just
    getting the next by index in childViews.

    @return {SC.View}
  */
  _getNextKeyView: function() {
    var pv = this.get('parentView'),
    nextKeyView = this.get('nextKeyView');

    // if the parent defines lastKeyView, it takes priority over this views
    // nextKeyView
    if(pv && pv.get('lastKeyView') === this) return null;

    // if this view defines a nextKeyView, use it
    if(nextKeyView !== undefined) return nextKeyView;

    // otherwise generate one based on parent view's childViews
    if(pv) {
      var childViews = pv.get('childViews');
      return childViews[childViews.indexOf(this) + 1];
    }
  },

  /**
    Computes the next valid key view. This is the next key view that
    acceptsFirstResponder. Computed using depth first search. If the current view
    is not valid, it will first traverse its children before trying siblings. If
    the current view is the only valid view, the current view will be returned. Will
    return null if no valid view can be found.

    @property
    @type SC.View
  */
  nextValidKeyView: function() {
    var cur = this, next;
    while(next !== this) {
      next = null;

      // only bother to check children if we are visible
      if(cur.get('isVisibleInWindow')) next = cur._getFirstKeyView();

      // if we have no children, check our sibling
      if(!next) next = cur._getNextKeyView();

      // if we have no children or siblings, unroll up closest parent that has a
      // next sibling
      if(!next) {
        while(cur = cur.get('parentView')) {
          if(next = cur._getNextKeyView()) break;
        }
      }

      // if no parents have a next sibling, start over from the beginning
      if(!next) {
        if(!SC.TABBING_ONLY_INSIDE_DOCUMENT) break;
        else next = this.get('pane');
      }

      // if it's a valid firstResponder, we're done!
      if(next.get('isVisibleInWindow') && next.get('acceptsFirstResponder')) {
        return next;
      }
      // otherwise keep looking
      cur = next;
    }
    // this will only happen if no views are visible and accept first responder
    return null;
  }.property('nextKeyView'),

  /**
    Optionally points to the previous key view that should gain focus when tabbing
    through an interface.  If this is not set, then the previous key view will
    be set automatically to the previous sibling as defined by its parent's
    childViews property.

    If any views define this, all of their siblings should define it as well,
    otherwise undefined behavior may occur. Their parent view should also define
    a lastKeyView.

    This may also be set to a view that is not a sibling, but once again all
    views in the chain must define it or undefined behavior will occur.

    Likewise, any view that sets previousKeyView should also set nextKeyView.

    @type SC.View
    @default null
  */
  previousKeyView: undefined,

  /**
    @private

    Gets the previous key view by checking if the user set it and otherwise just
    getting the previous by index in childViews.

    @return {SC.View}
  */
  _getPreviousKeyView: function() {
    var pv = this.get('parentView'),
    previousKeyView = this.get('previousKeyView');

    // if the parent defines firstKeyView, it takes priority over this views
    // previousKeyView
    if(pv && pv.get('firstKeyView') === this) return null;

    // if this view defines a previousKeyView, use it
    if(previousKeyView !== undefined) return previousKeyView;

    // otherwise generate one based on parent view's childViews
    if(pv) {
      var childViews = pv.get('childViews');
      return childViews[childViews.indexOf(this) - 1];
    }
  },

  /**
    Computes the previous valid key view. This is the previous key view that
    acceptsFirstResponder. Traverse views in the opposite order from
    nextValidKeyView. If the current view is the pane, tries deepest child. If the
    current view has a previous view, tries its last child. If this view is the
    first child, tries the parent. Will return null if no valid view can be
    found.

    @property
    @type SC.View
  */
  // TODO: clean this up
  previousValidKeyView: function() {
    var cur = this, prev;

    while(prev !== this) {
      // normally, just try to get previous view's last child
      if(cur.get('parentView')) prev = cur._getPreviousKeyView();

      // if we are the pane and address bar tabbing is enabled, trigger it now
      else if(!SC.TABBING_ONLY_INSIDE_DOCUMENT) break;

      // if we are the pane, get our own last child
      else prev = cur;

      // loop down to the last valid child
      if(prev) {
        do {
          cur = prev;
          prev = prev._getLastKeyView();
        } while(prev && prev.get('isVisibleInWindow'));

        // if we ended on a null, unroll to the last one
        // we don't unroll if we ended on a hidden view because we need
        // to traverse to its previous view next iteration
        if(!prev) prev = cur;
      }

      // if there is no previous view, traverse to the parent
      else prev = cur.get('parentView');

      // if the view is valid, return it
      if(prev.get('isVisibleInWindow') && prev.get('acceptsFirstResponder')) return prev;

      // otherwise, try to find its previous valid keyview
      cur = prev;
    }

    // if none of the views accept first responder and we make it back to where
    // we started, just return null
    return null;
  }.property('previousKeyView')
});


/* >>>>>>>>>> BEGIN source/views/view/manipulation.js */
sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */{

  /**
    Handles changes in the layer id.
  */
  layerIdDidChange: function() {
    var layer  = this.get('layer'),
        lid    = this.get('layerId'),
        lastId = this._lastLayerId;

    if (lid !== lastId) {
      // if we had an earlier one, remove from view hash.
      if (lastId && SC.View.views[lastId] === this) {
        delete SC.View.views[lastId];
      }

      // set the current one as the new old one
      this._lastLayerId = lid;

      // and add the new one
      SC.View.views[lid] = this;

      // and finally, set the actual layer id.
      if (layer) { layer.id = lid; }
    }
  }.observes("layerId"),

  // ------------------------------------------------------------------------
  // LAYER LOCATION
  //

  /**
    Insert the view into the the receiver's childNodes array.

    The view will be added to the childNodes array before the beforeView.  If
    beforeView is null, then the view will be added to the end of the array.
    This will also add the view's rootElement DOM node to the receivers
    containerElement DOM node as a child.

    If the specified view already belongs to another parent, it will be
    removed from that view first.

    @param {SC.View} view
    @param {SC.View} beforeView
    @returns {SC.View} the receiver
  */
  insertBefore: function(view, beforeView) {
    view.beginPropertyChanges(); // limit notifications

    // Reset any views that are already building in or out.
    if (view.resetBuildState) { view.resetBuildState(); }
    view._doAdopt(this, beforeView);

    view.endPropertyChanges();

    return this ;
  },

  /**
    Replace the oldView with the specified view in the receivers childNodes
    array. This will also replace the DOM node of the oldView with the DOM
    node of the new view in the receivers DOM.

    If the specified view already belongs to another parent, it will be
    removed from that view first.

    @param view {SC.View} the view to insert in the DOM
    @param view {SC.View} the view to remove from the DOM.
    @returns {SC.View} the receiver
  */
  replaceChild: function(view, oldView) {
    // suspend notifications
    view.beginPropertyChanges();
    oldView.beginPropertyChanges();
    this.beginPropertyChanges();

    this.insertBefore(view,oldView).removeChild(oldView) ;

    // resume notifications
    this.endPropertyChanges();
    oldView.endPropertyChanges();
    view.endPropertyChanges();

    return this;
  },

  /**
    Replaces the current array of child views with the new array of child
    views.

    This will remove *and* destroy all of the existing child views and their
    layers.

    Warning: The new array must be made of *child* views (i.e. created using
    this.createChildView() on the parent).

    @param {Array} newChildViews Child views you want to add
    @returns {SC.View} receiver
  */
  replaceAllChildren: function (newChildViews) {
    this.beginPropertyChanges();

    // If rendered, destroy our layer so we can re-render.
    // if (this.get('_isRendered')) {
    //   var layer = this.get('layer');

    //   // If attached, detach and track our parent node so we can re-attach.
    //   if (this.get('isAttached')) {
    //     // We don't allow for transitioning out at this time.
    //     // TODO: support transition out of child views.
    //     this._doDetach(true);
    //   }

    //   // Destroy our layer in one move.
    //   this.destroyLayer();
    // }

    // Remove the current child views.
    // We aren't rendered at this point so it bypasses the optimization in
    // removeAllChildren that would recreate the layer.  We would rather add the
    // new childViews before recreating the layer.
    this.removeAllChildren(true);

    // Add the new children.
    for (var i = 0, len = newChildViews.get('length'); i < len; i++) {
      this.appendChild(newChildViews.objectAt(i));
    }

    // We were rendered previously.
    // if (layer) {
    //   // Recreate our layer (now empty).
    //   this.createLayer();
    // }
    this.endPropertyChanges();

    return this ;
  },

  /**
    Appends the specified view to the end of the receivers childViews array.
    This is equivalent to calling insertBefore(view, null);

    @param view {SC.View} the view to insert
    @returns {SC.View} the receiver
  */
  appendChild: function(view) {
    return this.insertBefore(view, null);
  },

  // ------------------------------------------------------------------------
  // BUILDING IN/OUT
  //

  /**
    Call this to append a child while building it in. If the child is not
    buildable, this is the same as calling appendChild.

    @deprecated Version 1.10
  */
  buildInChild: function(view) {
    view.willBuildInToView(this);
    this.appendChild(view);
    view.buildInToView(this);
  },

  /**
    Call to remove a child after building it out. If the child is not buildable,
    this will simply call removeChild.

    @deprecated Version 1.10
  */
  buildOutChild: function(view) {
    view.buildOutFromView(this);
  },

  /**
    Called by child view when build in finishes. By default, does nothing.

    @deprecated Version 1.10
  */
  buildInDidFinishFor: function(child) {
  },

  /**
    @private
    Called by child view when build out finishes. By default removes the child view.
  */
  buildOutDidFinishFor: function(child) {
    this.removeChild(child);
  },

  /**
    Whether the view is currently building in.

    @deprecated Version 1.10
  */
  isBuildingIn: NO,

  /**
    Whether the view is currently building out.

    @deprecated Version 1.10
  */
  isBuildingOut: NO,

  /**
    Implement this, and call didFinishBuildIn when you are done.

    @deprecated Version 1.10
  */
  buildIn: function() {
    
    SC.warn("The SC.View build methods have been deprecated in favor of the transition plugins.  To build in a view, please provide a transitionIn plugin (many are pre-built in SproutCore) and to build out a view, please provide a transitionOut plugin.");
    
    this.buildInDidFinish();
  },

  /**
    Implement this, and call didFinishBuildOut when you are done.

    @deprecated Version 1.10
  */
  buildOut: function() {
    
    SC.warn("The SC.View build methods have been deprecated in favor of the transition plugins.  To build in a view, please provide a transitionIn plugin (many are pre-built in SproutCore) and to build out a view, please provide a transitionOut plugin.");
    
    this.buildOutDidFinish();
  },

  /**
    This should reset (without animation) any internal states; sometimes called before.

    It is usually called before a build in, by the parent view.
    @deprecated Version 1.10
  */
  resetBuild: function() {

  },

  /**
    Implement this if you need to do anything special when cancelling build out;
    note that buildIn will subsequently be called, so you usually won't need to do
    anything.

    This is basically called whenever build in happens.

    @deprecated Version 1.10
  */
  buildOutDidCancel: function() {

  },

  /**
    Implement this if you need to do anything special when cancelling build in.
    You probably won't be able to do anything. I mean, what are you gonna do?

    If build in was cancelled, it means build out is probably happening.
    So, any timers or anything you had going, you can cancel.
    Then buildOut will happen.

    @deprecated Version 1.10
  */
  buildInDidCancel: function() {

  },

  /**
    Call this when you have built in.

    @deprecated Version 1.10
  */
  buildInDidFinish: function() {
    this.isBuildingIn = NO;
    this._buildingInTo.buildInDidFinishFor(this);
    this._buildingInTo = null;
  },

  /**
    Call this when you have finished building out.

    @deprecated Version 1.10
  */
  buildOutDidFinish: function() {
    this.isBuildingOut = NO;
    this._buildingOutFrom.buildOutDidFinishFor(this);
    this._buildingOutFrom = null;
  },

  /**
    Usually called by parentViewDidChange, this resets the build state (calling resetBuild in the process).

    @deprecated Version 1.10
  */
  resetBuildState: function() {
    if (this.isBuildingIn) {
      this.buildInDidCancel();
      this.isBuildingIn = NO;
    }
    if (this.isBuildingOut) {
      this.buildOutDidCancel();
      this.isBuildingOut = NO;
    }

    // finish cleaning up
    this.buildingInTo = null;
    this.buildingOutFrom = null;

    this.resetBuild();
  },

  /**
    @private (semi)
    Called by building parent view's buildInChild method. This prepares
    to build in, but unlike buildInToView, this is called _before_ the child
    is appended.

    Mostly, this cancels any build out _before_ the view is removed through parent change.
  */
  willBuildInToView: function(view) {
    // stop any current build outs (and if we need to, we also need to build in again)
    if (this.isBuildingOut) {
      this.buildOutDidCancel();
    }
  },

  /**
    @private (semi)
    Called by building parent view's buildInChild method.
  */
  buildInToView: function(view) {
    // if we are already building in, do nothing.
    if (this.isBuildingIn) { return; }

    this._buildingInTo = view;
    this.isBuildingOut = NO;
    this.isBuildingIn = YES;
    this.buildIn();
  },

  /**
    @private (semi)
    Called by building parent view's buildOutChild method.

    The supplied view should always be the parent view.
  */
  buildOutFromView: function(view) {
    // if we are already building out, do nothing.
    if (this.isBuildingOut) { return; }

    // cancel any build ins
    if (this.isBuildingIn) {
      this.buildInDidCancel();
    }

    // in any case, we need to build out
    this.isBuildingOut = YES;
    this.isBuildingIn = NO;
    this._buildingOutFrom = view;
    this.buildOut();
  }
});

/* >>>>>>>>>> BEGIN source/views/view/theming.js */
sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  // ..........................................................
  // THEME SUPPORT
  //

  /**
    Names which theme this view should use; the theme named by this property
    will be set to the view's 'theme' property.

    Themes are identified by their name. In addition to looking for the
    theme globally, SproutCore will look for the theme inside 'baseTheme',
    which is almost always the parent view's theme.

    If null (the default), the view will set its 'theme' property to
    be equal to 'baseTheme'.

    Example: themeName: 'ace'

    @type String
  */
  themeName: null,

  /**
    Selects which theme to use as a 'base theme'. If null, the 'baseTheme'
    property will be set to the parent's theme. If there is no parent, the theme
    named by SC.defaultTheme is used.

    This property is private for the time being.

    @private
    @type String
  */
  baseThemeName: null,

  /**
    The SC.Theme instance which this view should use to render.

    Note: the actual code for this function is in _themeProperty for backwards-compatibility:
    some older views specify a string value for 'theme', which would override this property,
    breaking it.

    @property {SC.Theme}
  */
  theme: function() {
    var base = this.get('baseTheme'), themeName = this.get('themeName');

    // find theme, if possible
    if (themeName) {
      // Note: theme instance "find" function will search every parent
      // _except_ global (which is not a parent)
      var theme;
      if (base) {
        theme = base.find(themeName);
        if (theme) { return theme; }
      }

      theme = SC.Theme.find(themeName);
      if (theme) { return theme; }

      // Create a new invisible subtheme. This will cause the themeName to
      // be applied as a class name.
      return base.invisibleSubtheme(themeName);
    }

    // can't find anything, return base.
    return base;
  }.property('baseTheme', 'themeName').cacheable(),

  /**
    Detects when the theme changes. Replaces the layer if necessary.

    Also, because
  */
  _sc_view_themeDidChange: function() {
    var curTheme = this.get('theme');
    if (this._lastTheme === curTheme) { return; }
    this._lastTheme = curTheme;

    // invalidate child view base themes, if present
    var childViews = this.childViews, len = childViews.length, idx;
    for (idx = 0; idx < len; idx++) {
      childViews[idx].notifyPropertyChange('baseTheme');
    }

    if (this.get('layer')) { this.replaceLayer(); }
  }.observes('theme'),

  /**
    The SC.Theme instance in which the 'theme' property should look for the theme
    named by 'themeName'.

    For example, if 'baseTheme' is SC.AceTheme, and 'themeName' is 'popover',
    it will look to see if SC.AceTheme has a child theme named 'popover',
    and _then_, if it is not found, look globally.

    @private
    @property {SC.Theme}
  */
  baseTheme: function() {
    var parent;
    var baseThemeName = this.get('baseThemeName');
    if (baseThemeName) {
      return SC.Theme.find(baseThemeName);
    } else {
      parent = this.get('parentView');
      var theme  = parent && parent.get('theme');
      return   theme || SC.Theme.find(SC.defaultTheme);
    }
  }.property('baseThemeName', 'parentView').cacheable(),

  /**
    The object to which rendering and updating the HTML representation of this
    view should be delegated.

    By default, views are responsible for creating their own HTML
    representation. In some cases, however, you may want to create an object
    that is responsible for rendering all views of a certain type. For example,
    you may want rendering of SC.ButtonView to be controlled by an object that
    is specific to the current theme.

    By setting a render delegate, the render and update methods will be called
    on that object instead of the view itself.

    For your convenience, the view will provide its displayProperties to the
    RenderDelegate. In some cases, you may have a conflict between the RenderDelegate's
    API and your view's. For instance, you may have a 'value' property that is
    any number, but the render delegate expects a percentage. Make a 'displayValue'
    property, add _it_ to displayProperties instead of 'value', and the Render Delegate
    will automatically use that when it wants to find 'value.'

    You can also set the render delegate by using the 'renderDelegateName' property.

    @type Object
  */
  renderDelegate: function(key, value) {
    if (value) { this._setRenderDelegate = value; }
    if (this._setRenderDelegate) { return this._setRenderDelegate; }

    // If this view does not have a render delegate but has
    // renderDelegateName set, try to retrieve the render delegate from the
    // theme.
    var renderDelegateName = this.get('renderDelegateName'), renderDelegate;

    if (renderDelegateName) {
      renderDelegate = this.get('theme')[renderDelegateName];
      if (!renderDelegate) {
        throw new Error("%@: Unable to locate render delegate \"%@\" in theme.".fmt(this, renderDelegateName));
      }

      return renderDelegate;
    }

    return null;
  }.property('renderDelegateName', 'theme'),

  /**
    The name of the property of the current theme that contains the render
    delegate to use for this view.

    By default, views are responsible for creating their own HTML
    representation. You can tell the view to instead delegate rendering to the
    theme by setting this property to the name of the corresponding property
    of the theme.

    For example, to tell the view that it should render using the
    SC.ButtonView render delegate, set this property to
    'buttonRenderDelegate'. When the view is created, it will retrieve the
    buttonRenderDelegate property from its theme and set the renderDelegate
    property to that object.
  */
  renderDelegateName: null,

  /**
    [RO] Pass this object as the data source for render delegates. This proxy object
    for the view relays requests for properties like 'title' to 'displayTitle'
    as necessary.

    If you ever communicate with your view's render delegate, you should pass this
    object as the data source.

    The proxy that forwards RenderDelegate requests for properties to the view,
    handling display*, keeps track of the delegate's state, etc.
  */
  renderDelegateProxy: function() {
    return SC.View._RenderDelegateProxy.createForView(this);
  }.property('renderDelegate').cacheable(),

  /**
    Invoked whenever your view needs to create its HTML representation.

    You will normally override this method in your subclassed views to
    provide whatever drawing functionality you will need in order to
    render your content.

    This method is usually only called once per view. After that, the update
    method will be called to allow you to update the existing HTML
    representation.


    The default implementation of this method calls renderChildViews().

    For backwards compatibility, this method will also call the appropriate
    method on a render delegate object, if your view has one.

    @param {SC.RenderContext} context the render context
    @returns {void}
  */
  render: function(context, firstTime) {
    var renderDelegate = this.get('renderDelegate');

    if (renderDelegate) {
      if (firstTime) {
        renderDelegate.render(this.get('renderDelegateProxy'), context);
      } else {
        renderDelegate.update(this.get('renderDelegateProxy'), context.$());
      }
    }
  },

  /**
    Invokes a method on the render delegate, if one is present and it implements
    that method.

    @param {String} method The name of the method to call.
    @param arg One or more arguments.
  */
  invokeRenderDelegateMethod: function(method, args) {
    var renderDelegate = this.get('renderDelegate');
    if (!renderDelegate) return undefined;

    if (SC.typeOf(renderDelegate[method]) !== SC.T_FUNCTION) return undefined;

    args = SC.$A(arguments);
    args.shift();
    args.unshift(this.get('renderDelegateProxy'));
    return renderDelegate[method].apply(renderDelegate, args);
  }
});

/**
  @class
  @private
  View Render Delegate Proxies are tool SC.Views use to:

  - look up 'display*' ('displayTitle' instead of 'title') to help deal with
    differences between the render delegate's API and the view's.

  RenderDelegateProxies are fully valid data sources for render delegates. They
  act as proxies to the view, interpreting the .get and .didChangeFor commands
  based on the view's displayProperties.

  This tool is not useful outside of SC.View itself, and as such, is private.
*/
SC.View._RenderDelegateProxy = {

  
  // for testing:
  isViewRenderDelegateProxy: YES,
  

  /**
    Creates a View Render Delegate Proxy for the specified view.

    Implementation note: this creates a hash of the view's displayProperties
    array so that the proxy may quickly determine whether a property is a
    displayProperty or not. This could cause issues if the view's displayProperties
    array is modified after instantiation.

    @param {SC.View} view The view this proxy should proxy to.
    @returns SC.View._RenderDelegateProxy
  */
  createForView: function(view) {
    var ret = SC.beget(this);

    // set up displayProperty lookup for performance
    var dp = view.get('displayProperties'), lookup = {};
    for (var idx = 0, len = dp.length; idx < len; idx++) {
      lookup[dp[idx]] = YES;
    }

    // also allow the few special properties through
    lookup.theme = YES;

    ret._displayPropertiesLookup = lookup;
    ret.renderState = {};

    ret._view = view;
    return ret;
  },


  /**
    Provides the render delegate with any property it needs.

    This first looks up whether the property exists in the view's
    displayProperties, and whether it exists prefixed with 'display';
    for instance, if the render delegate asks for 'title', this will
    look for 'displayTitle' in the view's displayProperties array.

   @param {String} property The name of the property the render delegate needs.
   @returns The value.
  */
  get: function(property) {
    if (this[property] !== undefined) { return this[property]; }

    var displayProperty = 'display' + property.capitalize();

    if (this._displayPropertiesLookup[displayProperty]) {
      return this._view.get(displayProperty);
    } else {
      return this._view.get(property);
    }
  },

  /**
   Checks if any of the specified properties have changed.

   For each property passed, this first determines whether to use the
   'display' prefix. Then, it calls view.didChangeFor with context and that
   property name.
  */
  didChangeFor: function(context) {
    var len = arguments.length, idx;
    for (idx = 1; idx < len; idx++) {
      var property = arguments[idx],
          displayProperty = 'display' + property.capitalize();

      if (this._displayPropertiesLookup[displayProperty]) {
        if (this._view.didChangeFor(context, displayProperty)) { return YES; }
      } else {
        if (this._view.didChangeFor(context, property)) { return YES; }
      }
    }

    return NO;
  }
};

/**
  Generates a computed property that will look up the specified property from
  the view's render delegate, if present. You may specify a default value to
  return if there is no such property or is no render delegate.

  The generated property is read+write, so it may be overridden.

  @param {String} propertyName The name of the property to get from the render delegate..
  @param {Value} def The default value to use if the property is not present.
*/
SC.propertyFromRenderDelegate = function(propertyName, def) {
  return function(key, value) {
    // first, handle set() case
    if (value !== undefined) {
      this['_set_rd_' + key] = value;
    }

    // use any value set manually via set()  -- two lines ago.
    var ret = this['_set_rd_' + key];
    if (ret !== undefined) return ret;

    // finally, try to get it from the render delegate
    var renderDelegate = this.get('renderDelegate');
    if (renderDelegate && renderDelegate.get) {
      var proxy = this.get('renderDelegateProxy');
      ret = renderDelegate.getPropertyFor(proxy, propertyName);
    }

    if (ret !== undefined) return ret;

    return def;
  }.property('renderDelegate').cacheable();
};



/* >>>>>>>>>> BEGIN source/views/view/touch.js */
sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  // ..........................................................
  // MULTITOUCH SUPPORT
  //
  /**
    Set to YES if you want to receive touch events for each distinct touch
    (rather than only the first touch start and last touch end).
  */
  acceptsMultitouch: NO,

  /**
    Is YES if the view is currently being touched. NO otherwise.
  */
  hasTouch: NO,

  /**
    A boundary set of distances outside which the touch will no longer be
    considered "inside" the view anymore.  This is useful when we want to allow
    a bit of touch drag outside of the view before we consider that the User's
    finger has completely left the view.  For example, a User might touch down
    on a button, but because of the wide surface of a finger, the touch might
    slip outside of the button's frame as the person lifts up.  If the button
    uses touchIsInBoundary it can make it easier for the User to hit it.

    By default, up to 25px on each side.
  */
  touchBoundary: { left: 25, right: 25, top: 25, bottom: 25 },

  /** @private
    A computed property based on frame.
  */
  _touchBoundaryFrame: function () {
    var boundary = this.get("touchBoundary"),
      ret;

    // Determine the frame of the View in screen coordinates
    ret = this.get("parentView").convertFrameToView(this.get('frame'), null);

    // Expand the frame to the acceptable boundary.
    ret.x -= boundary.left;
    ret.y -= boundary.top;
    ret.width += boundary.left + boundary.right;
    ret.height += boundary.top + boundary.bottom;

    return ret;
  }.property('touchBoundary', 'clippingFrame').cacheable(),

  /**
    Returns YES if the provided touch is within the boundary set by
    touchBoundary.
  */
  touchIsInBoundary: function(touch) {
    return SC.pointInRect({x: touch.pageX, y: touch.pageY},
      this.get("_touchBoundaryFrame"));
  }
});

/* >>>>>>>>>> BEGIN source/views/view/visibility.js */
sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  /**
    Set to YES to indicate the view has visibility support added.

    @deprecated Version 1.10
  */
  hasVisibility: YES,

  /**
   By default we don't disable the context menu. Overriding this property
   can enable/disable the context menu per view.
  */
  isContextMenuEnabled: function () {
    return SC.CONTEXT_MENU_ENABLED;
  }.property(),

  /**
    The visibility of the view does not need to be computed any longer as it
    is maintained by the internal SC.View statechart.

    @deprecated Version 1.10
    @returns {SC.View} receiver
  */
  recomputeIsVisibleInWindow: function () {
    
    SC.warn("Developer Warning: Calling recomputeIsVisibleInWindow() is no longer necessary and has been deprecated.");
    

    return this;
  }

});

/* >>>>>>>>>> BEGIN source/panes/pane.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/view');
sc_require('views/view/acceleration');
sc_require('views/view/cursor');
sc_require('views/view/enabled');
sc_require('views/view/keyboard');
sc_require('views/view/layout');
sc_require('views/view/manipulation');
sc_require('views/view/theming');
sc_require('views/view/touch');
sc_require('views/view/visibility');
sc_require('mixins/responder_context');


/**
  Indicates a value has a mixed state of both on and off.

  @type String
*/
SC.MIXED_STATE = '__MIXED__' ;

/** @class
  A Pane is like a regular view except that it does not need to live within a
  parent view.  You usually use a Pane to form the root of a view hierarchy in
  your application, such as your main application view or for floating
  palettes, popups, menus, etc.

  Usually you will not work directly with the SC.Pane class, but with one of
  its subclasses such as SC.MainPane, SC.Panel, or SC.PopupPane.

  ## Showing a Pane

  To make a pane visible, you need to add it to your HTML document.  The
  simplest way to do this is to call the append() method:

      myPane = SC.Pane.create();
      myPane.append(); // adds the pane to the document

  This will insert your pane into the end of your HTML document body, causing
  it to display on screen.  It will also register your pane with the
  SC.RootResponder for the document so you can start to receive keyboard,
  mouse, and touch events.

  If you need more specific control for where you pane appears in the
  document, you can use several other insertion methods such as appendTo(),
  prependTo(), before() and after().  These methods all take a an element to
  indicate where in your HTML document you would like you pane to be inserted.

  Once a pane is inserted into the document, it will be sized and positioned
  according to the layout you have specified.  It will then automatically
  resize with the window if needed, relaying resize notifications to children
  as well.

  ## Hiding a Pane

  When you are finished with a pane, you can hide the pane by calling the
  remove() method.  This method will actually remove the Pane from the
  document body, as well as deregistering it from the RootResponder so that it
  no longer receives events.

  The isVisibleInWindow method will also change to NO for the Pane and all of
  its childViews and the views will no longer have their updateDisplay methods
  called.

  You can readd a pane to the document again any time in the future by using
  any of the insertion methods defined in the previous section.

  ## Receiving Events

  Your pane and its child views will automatically receive any mouse or touch
  events as long as it is on the screen.  To receive keyboard events, however,
  you must focus the keyboard on your pane by calling makeKeyPane() on the
  pane itself.  This will cause the RootResponder to route keyboard events to
  your pane.  The pane, in turn, will route those events to its current
  keyView, if there is any.

  Note that all SC.Views (anything that implements SC.ClassicResponder,
  really) will be notified when it is about or gain or lose keyboard focus.
  These notifications are sent both when the view is made keyView of a
  particular pane and when the pane is made keyPane for the entire
  application.

  You can prevent your Pane from becoming key by setting the acceptsKeyPane
  to NO on the pane.  This is useful when creating palettes and other popups
  that should not steal keyboard control from another view.

  @extends SC.View
  @extends SC.ResponderContext
  @since SproutCore 1.0
*/
SC.Pane = SC.View.extend(SC.ResponderContext,
/** @scope SC.Pane.prototype */ {

  /**
    Returns YES for easy detection of when you reached the pane.
    @type Boolean
  */
  isPane: YES,

  /**
    Set to the current page when the pane is instantiated from a page object.
    @property {SC.Page}
  */
  page: null,

  // .......................................................
  // ROOT RESPONDER SUPPORT
  //

  /**
    The rootResponder for this pane.  Whenever you add a pane to a document,
    this property will be set to the rootResponder that is now forwarding
    events to the pane.

    @property {SC.Responder}
  */
  rootResponder: null,

  /**
    Attempts to send the specified event up the responder chain for this pane. This
    method is used by the RootResponder to correctly delegate mouse, touch and keyboard
    events. You can also use it to send your own events to the pane's responders, though
    you will usually not do this.

    A responder chain is a linked list of responders - mostly views - which are each
    sequentially given an opportunity to handle the event. The responder chain begins with
    the event's `target` view, and proceeds up the chain of parentViews (via the customizable
    nextResponder property) until it reaches the pane and its defaultResponder. You can
    specify the `target` responder; by default, it is the pane's current `firstResponder`
    (see SC.View keyboard event documentation for more on the first responder).

    Beginning with the target, each responder is given the chance to handle the named event.
    In order to handle an event, a responder must implement a method with the name of the
    event. For example, to handle the mouseDown event, expose a `mouseDown` method. If a
    responder handles a method, then the event will stop bubbling up the responder chain.
    (If your responder exposes a handler method but you do not always want to handle that
    method, you can signal that the method should continue bubbling up the responder chain by
    returning NO from your handler.)

    In some rare cases, you may want to only alert part of the responder chain. For example,
    SC.ScrollView uses this to capture a touch to give the user a moment to begin scrolling
    on otherwise-tappable controls. To accomplish this, pass a view (or responder) as the
    `untilResponder` argument. If the responder chain includes this view, it will break the
    chain there and not proceed. (Note that the `untilResponder` object will not be given a
    chance to respond to the event.)

    @param {String} action The name of the event (i.e. method name) to invoke.
    @param {SC.Event} evt The optional event object.
    @param {SC.Responder} target The responder chain's first member. If not specified, will
      use the pane's current firstResponder instead.
    @param {SC.Responder} untilResponder If specified, the responder chain will break when
      this object is reached, preventing it and subsequent responders from receiving
      the event.
    @returns {Object} object that handled the event
  */
  sendEvent: function(action, evt, target, untilResponder) {
    // Until there's time for a refactor of this method, note the early return for untilResponder, marked
    // below with "FAST PATH".

    // walk up the responder chain looking for a method to handle the event
    if (!target) target = this.get('firstResponder') ;
    while(target) {
      if (action === 'touchStart') {
        // first, we must check that the target is not already touch responder
        // if it is, we don't want to have "found" it; that kind of recursion is sure to
        // cause really severe, and even worse, really odd bugs.
        if (evt.touchResponder === target) {
          target = null;
          break;
        }

        // now, only pass along if the target does not already have any touches, or is
        // capable of accepting multitouch.
        if (!target.get("hasTouch") || target.get("acceptsMultitouch")) {
          if (target.tryToPerform("touchStart", evt)) break;
        }
      } else if (action === 'touchEnd' && !target.get("acceptsMultitouch")) {
        if (!target.get("hasTouch")) {
          if (target.tryToPerform("touchEnd", evt)) break;
        }
      } else {
        if (target.tryToPerform(action, evt)) break;
      }

      // If we've reached the pane, we're at the end of the chain.
      target = (target === this) ? null : target.get('nextResponder');
      // FAST PATH: If we've reached untilResponder, break the chain. (TODO: refactor out this early return. The
      // point is to avoid pinging defaultResponder if we ran into the untilResponder.)
      if (target === untilResponder) {
        return (evt && evt.mouseHandler) || null;
      }
    }

    // if no handler was found in the responder chain, try the default
    if (!target && (target = this.get('defaultResponder'))) {
      if (typeof target === SC.T_STRING) {
        target = SC.objectForPropertyPath(target);
      }

      if (!target) target = null;
      else target = target.tryToPerform(action, evt) ? target : null ;
    }

    // if we don't have a default responder or no responders in the responder
    // chain handled the event, see if the pane itself implements the event
    else if (!target && !(target = this.get('defaultResponder'))) {
      target = this.tryToPerform(action, evt) ? this : null ;
    }

    return (evt && evt.mouseHandler) || target;
  },

  // .......................................................
  // RESPONDER CONTEXT
  //

  /**
    Pane's never have a next responder.

    @property {SC.Responder}
    @readOnly
  */
  nextResponder: function() {
    return null;
  }.property().cacheable(),

  /**
    The first responder.  This is the first view that should receive action
    events.  Whenever you click on a view, it will usually become
    firstResponder.

    @property {SC.Responder}
  */
  firstResponder: null,

  /**
    If YES, this pane can become the key pane.  You may want to set this to NO
    for certain types of panes.  For example, a palette may never want to
    become key.  The default value is YES.

    @type Boolean
  */
  acceptsKeyPane: YES,

  /**
    This is set to YES when your pane is currently the target of key events.

    @type Boolean
  */
  isKeyPane: NO,

  /**
    Make the pane receive key events.  Until you call this method, the
    keyView set for this pane will not receive key events.

    @returns {SC.Pane} receiver
  */
  becomeKeyPane: function() {
    if (this.get('isKeyPane')) return this ;
    if (this.rootResponder) this.rootResponder.makeKeyPane(this) ;

    return this ;
  },

  /**
    Remove the pane view status from the pane.  This will simply set the
    keyPane on the rootResponder to null.

    @returns {SC.Pane} receiver
  */
  resignKeyPane: function() {
    if (!this.get('isKeyPane')) return this ;
    if (this.rootResponder) this.rootResponder.makeKeyPane(null);

    return this ;
  },

  /**
    Makes the passed view (or any object that implements SC.Responder) into
    the new firstResponder for this pane.  This will cause the current first
    responder to lose its responder status and possibly keyResponder status as
    well.

    @param {SC.View} view
    @param {Event} evt that cause this to become first responder
    @returns {SC.Pane} receiver
  */
  makeFirstResponder: function(original, view, evt) {
    // firstResponder should never be null
    if(!view) view = this;

    var current = this.get('firstResponder'),
      isKeyPane = this.get('isKeyPane');

    if (current === view) return this ; // nothing to do

    // if we are currently key pane, then notify key views of change also
    if (isKeyPane) {
      if (current) { current.tryToPerform('willLoseKeyResponderTo', view); }
      if (view) {
        view.tryToPerform('willBecomeKeyResponderFrom', current);
      }
    }

    if (current) {
      current.beginPropertyChanges();
      current.set('isKeyResponder', NO);
    }

    if (view) {
      view.beginPropertyChanges();
      view.set('isKeyResponder', isKeyPane);
    }

    original(view, evt);

    if(current) current.endPropertyChanges();
    if(view) view.endPropertyChanges();

    // and notify again if needed.
    if (isKeyPane) {
      if (view) {
        view.tryToPerform('didBecomeKeyResponderFrom', current);
      }
      if (current) {
        current.tryToPerform('didLoseKeyResponderTo', view);
      }
    }

    return this ;
  }.enhance(),

  /**
    Called just before the pane loses it's keyPane status.  This will notify
    the current keyView, if there is one, that it is about to lose focus,
    giving it one last opportunity to save its state.

    @param {SC.Pane} pane
    @returns {SC.Pane} receiver
  */
  willLoseKeyPaneTo: function(pane) {
    this._forwardKeyChange(this.get('isKeyPane'), 'willLoseKeyResponderTo', pane, NO);
    return this ;
  },

  /**
    Called just before the pane becomes keyPane.  Notifies the current keyView
    that it is about to gain focus.  The keyView can use this opportunity to
    prepare itself, possibly stealing any value it might need to steal from
    the current key view.

    @param {SC.Pane} pane
    @returns {SC.Pane} receiver
  */
  willBecomeKeyPaneFrom: function(pane) {
    this._forwardKeyChange(!this.get('isKeyPane'), 'willBecomeKeyResponderFrom', pane, YES);
    return this ;
  },


  didBecomeKeyResponderFrom: function(responder) {},

  /**
    Called just after the pane has lost its keyPane status.  Notifies the
    current keyView of the change.  The keyView can use this method to do any
    final cleanup and changes its own display value if needed.

    @param {SC.Pane} pane
    @returns {SC.Pane} receiver
  */
  didLoseKeyPaneTo: function(pane) {
    var isKeyPane = this.get('isKeyPane');
    this.set('isKeyPane', NO);
    this._forwardKeyChange(isKeyPane, 'didLoseKeyResponderTo', pane);
    return this ;
  },

  /**
    Called just after the keyPane focus has changed to the receiver.  Notifies
    the keyView of its new status.  The keyView should use this method to
    update its display and actually set focus on itself at the browser level
    if needed.

    @param {SC.Pane} pane
    @returns {SC.Pane} receiver

  */
  didBecomeKeyPaneFrom: function(pane) {
    var isKeyPane = this.get('isKeyPane');
    this.set('isKeyPane', YES);
    this._forwardKeyChange(!isKeyPane, 'didBecomeKeyResponderFrom', pane, YES);
    return this ;
  },

  // .......................................................
  // MAIN PANE SUPPORT
  //

  /**
    Returns YES whenever the pane has been set as the main pane for the
    application.

    @type Boolean
  */
  isMainPane: NO,

  /**
    Invoked when the pane is about to become the focused pane.  Override to
    implement your own custom handling.

    @param {SC.Pane} pane the pane that currently have focus
    @returns {void}
  */
  focusFrom: function(pane) {},

  /**
    Invoked when the the pane is about to lose its focused pane status.
    Override to implement your own custom handling

    @param {SC.Pane} pane the pane that will receive focus next
    @returns {void}
  */
  blurTo: function(pane) {},

  /**
    Invoked when the view is about to lose its mainPane status.  The default
    implementation will also remove the pane from the document since you can't
    have more than one mainPane in the document at a time.

    @param {SC.Pane} pane
    @returns {void}
  */
  blurMainTo: function(pane) {
    this.set('isMainPane', NO) ;
  },

  /**
    Invokes when the view is about to become the new mainPane.  The default
    implementation simply updates the isMainPane property.  In your subclass,
    you should make sure your pane has been added to the document before
    trying to make it the mainPane.  See SC.MainPane for more information.

    @param {SC.Pane} pane
    @returns {void}
  */
  focusMainFrom: function(pane) {
    this.set('isMainPane', YES);
  },

  // .......................................................
  // ADDING/REMOVE PANES TO SCREEN
  //

  /**
    Inserts the pane at the end of the document.  This will also add the pane
    to the rootResponder.

    @param {SC.RootResponder} rootResponder
    @returns {SC.Pane} receiver
  */
  append: function() {
    return this.appendTo(document.body) ;
  },

  /**
    Removes the pane from the document.

    This will *not* destroy the pane's layer or destroy the pane itself.

    @returns {SC.Pane} receiver
  */
  remove: function() {
    if (this.get('isAttached')) {
      this._doDetach();
    }

    return this ;
  },

  /**
    Inserts the current pane into the page. The actual DOM insertion is done
    by a function passed into `insert`, which receives the layer as a
    parameter. This function is responsible for making sure a layer exists,
    is not already attached, and for calling `paneDidAttach` when done.

        pane = SC.Pane.create();
        pane.insert(function(layer) {
          jQuery(layer).insertBefore("#otherElement");
        });

    @param {Function} fn function which performs the actual DOM manipulation
      necessary in order to insert the pane's layer into the DOM.
    @returns {SC.Pane} receiver
   */
  insert: function(fn) {
    // Render the layer.
    this.createLayer();

    // Pass the layer to the callback (TODO: why?)
    var layer = this.get('layer');
    fn(layer);

    return this;
  },

  /**
    Inserts the pane into the DOM.

    @param {DOMElement|jQuery|String} elem the element to append the pane's layer to.
      This is passed to `jQuery()`, so any value supported by `jQuery()` will work.
    @returns {SC.Pane} receiver
  */
  appendTo: function(elem) {
    var self = this;

    return this.insert(function () {
      self._doAttach(jQuery(elem)[0]);
    });
  },

  /**
    This has been deprecated and may cause issues when used.  Please use
    didAppendToDocument instead, which is not defined by SC.Pane (i.e. you
    don't need to call sc_super when implementing didAppendToDocument in direct
    subclasses of SC.Pane).

    @deprecated Version 1.10
  */
  paneDidAttach: function() {
    // Does nothing.  Left here so that subclasses that implement the method
    // and call arguments.callee.base.apply(this,arguments) won't fail.
  },

  /**
    This method is called after the pane is attached and before child views
    are notified that they were appended to the document. Override this
    method to recompute properties that depend on the pane's existence
    in the document but must be run prior to child view notification.
   */
  recomputeDependentProperties: function () {
    // Does nothing.  Left here so that subclasses that implement the method
    // and call arguments.callee.base.apply(this,arguments) won't fail.
  },

  /** @deprecated Version 1.11. Use `isAttached` instead. */
  isPaneAttached: function () {

    
    SC.warn("Developer Warning: The `isPaneAttached` property of `SC.Pane` has been deprecated. Please use the `isAttached` property instead.");
    

    return this.get('isAttached');
  }.property('isAttached').cacheable(),

  /**
    If YES, a touch intercept pane will be added above this pane when on
    touch platforms.
  */
  wantsTouchIntercept: NO,

  /**
    Returns YES if wantsTouchIntercept and this is a touch platform.
  */
  hasTouchIntercept: function(){
    return this.get('wantsTouchIntercept') && SC.platform.touch;
  }.property('wantsTouchIntercept').cacheable(),

  /**
    The Z-Index of the pane. Currently, you have to match this in CSS.
    TODO: ALLOW THIS TO AUTOMATICALLY SET THE Z-INDEX OF THE PANE (as an option).
    ACTUAL TODO: Remove this because z-index is evil.
  */
  zIndex: 0,

  /**
    The amount over the pane's z-index that the touch intercept should be.
  */
  touchZ: 99,

  /** @private */
  _addIntercept: function() {
    if (this.get('hasTouchIntercept')) {
      var div = document.createElement("div");
      var divStyle = div.style;
      divStyle.position = "absolute";
      divStyle.left = "0px";
      divStyle.top = "0px";
      divStyle.right = "0px";
      divStyle.bottom = "0px";
      divStyle[SC.browser.experimentalStyleNameFor('transform')] = "translateZ(0px)";
      divStyle.zIndex = this.get("zIndex") + this.get("touchZ");
      div.className = "touch-intercept";
      div.id = "touch-intercept-" + SC.guidFor(this);
      this._touchIntercept = div;
      document.body.appendChild(div);
    }
  },

  /** @private */
  _removeIntercept: function() {
    if (this._touchIntercept) {
      document.body.removeChild(this._touchIntercept);
      this._touchIntercept = null;
    }
  },

  /** @private */
  hideTouchIntercept: function() {
    if (this._touchIntercept) this._touchIntercept.style.display = "none";
  },

  /** @private */
  showTouchIntercept: function() {
    if (this._touchIntercept) this._touchIntercept.style.display = "block";
  },

  /** @private */
  // updateLayerLocation: function () {
  //   if(this.get('designer') && SC.suppressMain) return arguments.callee.base.apply(this,arguments);
  //   // note: the normal code here to update node location is removed
  //   // because we don't need it for panes.
  //   return this;
  // },

  /** @private */
  init: function() {
    // Backwards compatibility
    
    // TODO: REMOVE THIS
    if (this.hasTouchIntercept === YES) {
      SC.error("Developer Error: Do not set `hasTouchIntercept` on a pane directly. Please use `wantsTouchIntercept` instead.");
    }
    

    // if a layer was set manually then we will just attach to existing HTML.
    var hasLayer = !!this.get('layer');

    arguments.callee.base.apply(this,arguments);

    if (hasLayer) {
      this._attached();
    }
  },

  /** @private */
  classNames: ['sc-pane']

}) ;

/* >>>>>>>>>> BEGIN source/panes/keyboard.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("panes/pane");

SC.Pane.reopen(
  /** @scope SC.Pane.prototype */ {

  performKeyEquivalent: function(keystring, evt) {
    var ret = arguments.callee.base.apply(this,arguments) ; // try normal view behavior first
    if (!ret) {
      var defaultResponder = this.get('defaultResponder') ;
      if (defaultResponder) {
        // try default responder's own performKeyEquivalent method,
        // if it has one...
        if (defaultResponder.performKeyEquivalent) {
          ret = defaultResponder.performKeyEquivalent(keystring, evt) ;
        }

        // even if it does have one, if it doesn't handle the event, give
        // methodName-style key equivalent handling a try
        if (!ret && defaultResponder.tryToPerform) {
          ret = defaultResponder.tryToPerform(keystring, evt) ;
        }
      }
    }
    return ret ;
  },

  /** @private
    If the user presses the tab key and the pane does not have a first
    responder, try to give it to the next eligible responder.

    If the keyDown event reaches the pane, we can assume that no responders in
    the responder chain, nor the default responder, handled the event.
  */
  keyDown: function(evt) {
    var nextValidKeyView;

    // Handle tab key presses if we don't have a first responder already
    if (evt.keyCode === 9 && !this.get('firstResponder')) {
      // Cycle forwards by default, backwards if the shift key is held
      if (evt.shiftKey) {
        nextValidKeyView = this.get('previousValidKeyView');
      } else {
        nextValidKeyView = this.get('nextValidKeyView');
      }

      if (nextValidKeyView) {
        this.makeFirstResponder(nextValidKeyView);
        return YES;
      }else if(!SC.TABBING_ONLY_INSIDE_DOCUMENT){
        evt.allowDefault();
      }
    }

    return NO;
  },

  /** @private method forwards status changes in a generic way. */
  _forwardKeyChange: function(shouldForward, methodName, pane, isKey) {
    var keyView, responder, newKeyView;
    if (shouldForward && (responder = this.get('firstResponder'))) {
      newKeyView = (pane) ? pane.get('firstResponder') : null ;
      keyView = this.get('firstResponder') ;
      if (keyView && keyView[methodName]) { keyView[methodName](newKeyView); }

      if ((isKey !== undefined) && responder) {
        responder.set('isKeyResponder', isKey);
      }
    }
  }
});

/* >>>>>>>>>> BEGIN source/panes/layout.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("panes/pane");
SC.Pane.reopen(
  /** @scope SC.Pane.prototype */ {

  /**
    Last known window size.

    @type Rect
  */
  currentWindowSize: null,

  /**
    The parent dimensions are always the last known window size.

    @returns {Rect} current window size
  */
  computeParentDimensions: function (frame) {
    if (this.get('designer') && SC.suppressMain) { return arguments.callee.base.apply(this,arguments); }

    var wDim = {x: 0, y: 0, width: 1000, height: 1000},
        layout = this.get('layout');

    // There used to be a whole bunch of code right here to calculate
    // based first on a stored window size, then on root responder, then
    // from document... but a) it is incorrect because we don't care about
    // the window size, but instead, the clientWidth/Height of the body, and
    // b) the performance benefits are not worth complicating the code that much.
    if (document && document.body) {
      wDim.width = document.body.clientWidth;
      wDim.height = document.body.clientHeight;

      // IE7 is the only browser which reports clientHeight _including_ scrollbar.
      if (SC.browser.name === SC.BROWSER.ie &&
          SC.browser.compare(SC.browser.version, "7") === 0) {

        var scrollbarSize = SC.platform.get('scrollbarSize');
        if (document.body.scrollWidth > wDim.width) {
          wDim.width -= scrollbarSize;
        }
        if (document.body.scrollHeight > wDim.height) {
          wDim.height -= scrollbarSize;
        }
      }
    }

    // If there is a minWidth or minHeight set on the pane, take that
    // into account when calculating dimensions.

    if (layout.minHeight || layout.minWidth) {
      if (layout.minHeight) {
        wDim.height = Math.max(wDim.height, layout.minHeight);
      }
      if (layout.minWidth) {
        wDim.width = Math.max(wDim.width, layout.minWidth);
      }
    }
    return wDim;
  },

  /**
    Invoked by the root responder whenever the window resizes.  This should
    simply begin the process of notifying children that the view size has
    changed, if needed.

    @param {Rect} oldSize the old window size
    @param {Rect} newSize the new window size
    @returns {SC.Pane} receiver
  */
  windowSizeDidChange: function (oldSize, newSize) {
    this.set('currentWindowSize', newSize);
    this.setBodyOverflowIfNeeded();
    this.parentViewDidResize(newSize); // start notifications.
    return this;
  },

  /**
    Changes the body overflow according to whether minWidth or minHeight
    are present in the layout hash. If there are no minimums, nothing
    is done unless true is passed as the first argument. If so, then
    overflow:hidden; will be used.

    It's possible to call this manually and pass YES to remove overflow
    if setting layout to a hash without minWidth and minHeight, but it's
    probably not a good idea to do so unless you're doing it from the main
    pane. There's only one body tag, after all, and if this is called from
    multiple different panes, the panes could fight over whether it gets
    an overflow if care isn't taken!

    @param {Boolean} [force=false] force a style to be set even if there are no minimums.
    @returns {void}
  */
  setBodyOverflowIfNeeded: function (force) {
    //Code to get rid of Lion rubberbanding.
    var layout = this.get('layout'),
        size = this.get('currentWindowSize');

    if (!layout || !size || !size.width || !size.height) return;

    var minW = layout.minWidth,
      minH = layout.minHeight;

    if (force === true || minW || minH) {
      if ((minH && size.height < minH) || (minW && size.width < minW)) {
        SC.bodyOverflowArbitrator.requestVisible(this);
      } else {
        SC.bodyOverflowArbitrator.requestHidden(this);
      }
    }
  },

  /**
    Stops controlling the body overflow according to the needs of this pane.

    @returns {void}
  */
  unsetBodyOverflowIfNeeded: function () {
    SC.bodyOverflowArbitrator.withdrawRequest(this);
  }

});

/* >>>>>>>>>> BEGIN source/panes/manipulation.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("panes/pane");

SC.Pane.reopen(
  /** @scope SC.Pane.prototype */ {

  /**
    Inserts the pane's layer as the first child of the passed element.

    @param {DOMElement|jQuery|String} elem the element to prepend the pane's layer to.
      This is passed to `jQuery()`, so any value supported by `jQuery()` will work.
    @returns {SC.Pane} receiver
  */
  prependTo: function(elem) {
    var self = this;

    return this.insert(function () {
      var el = jQuery(elem)[0];
      self._doAttach(el, el.firstChild);
    });
  },

  /**
    This method has no effect in the pane.  Instead use remove().

    @returns {void}
  */
  removeFromParent: function() {
    SC.throw("SC.Pane cannot be removed from its parent, since it's the root. Did you mean remove()?");
  }
});

/* >>>>>>>>>> BEGIN source/panes/pane_statechart.js */
sc_require("panes/pane");

/**
  Adds SC.Pane specific processes.

  While it would be a little nicer to use didAppendToDocument,
  willRemoveFromDocument and other functions, we cannot because they are public
  callbacks and if a developer overrides them without knowing to call arguments.callee.base.apply(this,arguments)
  everything will fail.  Instead, it's better to keep our static setup/remove
  code private.
  */
SC.Pane.reopen({

  /** @private */
  _executeDoAttach: function () {
    // hook into root responder
    var responder = (this.rootResponder = SC.RootResponder.responder);
    responder.panes.add(this);

    // Update the currentWindowSize cache.
    this.set('currentWindowSize', responder.currentWindowSize);

    // Set the initial design mode.  The responder will update this if it changes.
    this.updateDesignMode(this.get('designMode'), responder.get('currentDesignMode'));

    arguments.callee.base.apply(this,arguments);

    // Legacy.
    this.paneDidAttach();

    // Legacy?
    this.recomputeDependentProperties();

    // handle intercept if needed
    this._addIntercept();

    // If the layout is flexible (dependent on the window size), then the view
    // will resize when appended.
    if (!this.get('isFixedSize')) {
      // We call viewDidResize so that it calls parentViewDidResize on all child views.
      this.viewDidResize();
    }
  },

  /** @private */
  _executeDoDetach: function () {
    arguments.callee.base.apply(this,arguments);

    // remove intercept
    this._removeIntercept();

    // remove the pane
    var rootResponder = this.rootResponder;
    rootResponder.panes.remove(this);
    this.rootResponder = null;
  }

});

/* >>>>>>>>>> BEGIN source/protocols/child_view_layout_protocol.js */
// ==========================================================================
// Project:   SproutCore
// Copyright: @2013 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @namespace
  The `SC.ChildViewLayoutProtocol` protocol defines the properties and methods that you may
  implement in your custom child view layout plugins. The only required method for a plugin to
  implement is `layoutChildViews`.

  *Note: Do not mix `SC.ChildViewLayoutProtocol` into your classes. As a protocol, it exists only
  for reference sake. You only need define any of the properties or methods listed below in order to
  use this protocol.*
*/
SC.ChildViewLayoutProtocol = {

  /**
    An *optional* array of properties that should be observed on the child views in order
    to re-lay out the child views when changes occur. For example, most child
    view layout plugins will want to adjust the layout of the views whenever
    any view is hidden or becomes visible. Therefore, the parent view should
    re-run the child view layout whenever any child view's `isVisible` property
    changes and thus, `childLayoutProperties` should include at least the
    `isVisible` property name.

    For another example, the included stack child layout plugins both have the
    same `childLayoutProperties` defined:

        childLayoutProperties: ['marginBefore', 'marginAfter', 'isVisible']

    @type Array
  */
  childLayoutProperties: null,

  /**
    This *optional* method will be called when the view initializes itself. By
    returning `true` from this call, we would be indicating that whenever the
    view's size changes, it should re-lay out the child views.

    For instance, if the layout of the child views depends on the parent view's
    size, we should return `true`. If the layout of the child views is
    independent of the parent view's size, we can return false to improve
    performance.

    @param {SC.View} view The view that is using this plugin.
    @returns {Boolean} `true` if the view's size should be observed in order to re-lay out the child views.
  */
  layoutDependsOnSize: function (view) {},

  /**
    This *required* method will be called by the view each time that it needs
    to re-lay out its child views. The plugin should then as efficiently as
    possible, calculate each child views' new layout and call adjust on the
    child views.

    For code examples, see SC.View.VERTICAL_STACK and SC.View.HORIZONTAL_STACK
    in the core foundation framework.

    @param {SC.View} view The view that is using this plugin.
  */
  layoutChildViews: function (view) {}

};

/* >>>>>>>>>> BEGIN source/protocols/observable_protocol.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @namespace
  The `SC.ObservableProtocol` protocol defines the properties and methods that you may implement
  in your `SC.Observable` consumers (i.e. `SC.Object`) in order to access additional observer
  functionality. They will be used if defined but are not required for observing to work.

  *Note: Do not mix `SC.ObservableProtocol` into your classes. As a protocol, it exists only for
  reference sake. You only need define any of the properties or methods listed below in order to use
  this protocol.*
*/
SC.ObservableProtocol = {

  /**
    Generic property observer called whenever a property on the receiver changes.

    If you need to observe a large number of properties on your object, it
    is sometimes more efficient to implement this observer only and then to
    handle requests yourself.  Although this observer will be triggered
    more often than an observer registered on a specific property, it also
    does not need to be registered which can make it faster to setup your
    object instance.

    You will often implement this observer using a switch statement on the
    key parameter, taking appropriate action.

    @param observer {null} no longer used; usually null
    @param target {Object} the target of the change.  usually this
    @param key {String} the name of the property that changed
    @param value {Object} the new value of the property.
    @param revision {Number} a revision you can use to quickly detect changes.
    @returns {void}
  */
  propertyObserver: function(observer,target,key,value, revision) {

  }

};

/* >>>>>>>>>> BEGIN source/protocols/responder_protocol.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @namespace
  The `SC.ResponderProtocol` protocol defines the properties and methods that you may implement
  in your `SC.Responder` (i.e. `SC.View`) subclasses in order to handle specific responder chain
  events.

  *Note: Do not mix `SC.ResponderProtocol` into your classes. As a protocol, it exists only for
  reference sake. You only need define any of the properties or methods listed below in order to use
  this protocol.*

  @since SproutCore 1.0
*/
SC.ResponderProtocol = {

  // .......................................................................
  // Mouse Event Handlers
  //

  /**
    Called when the mouse is pressed. You must return `YES` to receive
    mouseDragged and mouseUp in the future.

    @param evt {SC.Event} the mousedown event
    @returns {Boolean} YES to receive additional mouse events, NO otherwise
  */
  mouseDown: function(evt) {},

  /**
    Called when the mouse is released.

    @param evt {SC.Event} the mouseup event
    @returns {Boolean} YES to handle the mouseUp, NO to allow click() and doubleClick() to be called
  */
  mouseUp: function(evt) {},

  /**
    Called when the mouse is dragged, after responding `YES` to a previous `mouseDown`:
    call.

    @param evt {SC.Event} the mousemove event
    @returns {void}
  */
  mouseDragged: function(evt) {},

  /**
    Called when the mouse exits the view and the root responder is not in a
    drag session.

    @param evt {SC.Event} the mousemove event
    @returns {void}
  */
  mouseExited: function(evt) {},

  /**
    Called when the mouse enters the view and the root responder is not in a
    drag session.

    @param evt {SC.Event} the mousemove event
    @returns {void}
  */
  mouseEntered: function(evt) {},

  /**
    Called when the mouse moves within the view and the root responder is not in a
    drag session.

    @param evt {SC.Event} the mousemove event
    @returns {void}
  */
  mouseMoved: function(evt) {},

  /**
     Called when a contextmenu event is triggered. Used to disable contextmenu
     per view.

     @param evt {SC.Event} the contextmenu event
     @returns {void}
   */
  contextMenu: function(evt) {},

  /**
    Called when a selectstart event in IE is triggered. **ONLY IE**
    We use it to disable IE accelerators and text selection

    @param evt {SC.Event} the selectstart event
    @returns {void}
  */
  selectStart: function(evt) {},

  // .......................................................................
  // Touch Event Handlers
  //

  /**
    Called when a touch begins. Capturing a touch is a special case behavior that allows for the
    nesting of touch capable views. In some situations, an outer view may want to capture a touch
    *before* the inner view acts on it. For example, a container view may want to act on swipes or
    pinches, while the inner view may only respond to taps. If the normal event path was followed,
    the inner view would get the `touchStart` event and by accepting it, would inadvertently prevent
    the outer view from being able to act on it.

    For this reason, when a touch begins, each view from the top-down has a chance to capture a
    touch first, before it is passed to the bottom-most target view. For example, SC.ScrollView
    captures touches so that it can determine if the touch is the beginning of a swipe or pinch. If
    the touch does become one of these gestures, SC.ScrollView can act on it. However, if the touch
    doesn't become one of these gestures, SC.ScrollView understands that it needs to pass the touch
    to its children.

    Therefore, implementors of `captureTouch` are expected to release the touch if they won't use it
    by calling the touch's `captureTouch` method and passing themself as the new starting point
    (capturing will continue from the implementor onward as it would have if the implementor hadn't
    temporarily captured it).

    Note, `captureTouch` is only meaningful for container type views where their children may
    handle touches as well. For most controls that want to handle touch, there is no reason to
    capture a touch, because they don't have any children. For these views, simply use the
    `touchStart`, `touchesDragged`, `touchCancelled` and `touchEnd` methods.

    @param touch {SC.Touch} the touch
    @returns {Boolean} YES to claim the touch and receive touchStart, NO otherwise
    @see SC.Touch#captureTouch
  */
  captureTouch: function (touch) {},

  /**
    Called when a touch previously claimed by returning `true` from `touchStart` is cancelled.

    @param touch {SC.Touch} the touch
    @returns {void}
  */
  touchCancelled: function (touch) {},

  /**
    Called when an active touch moves. The touches array contains all of the touches that this view
    has claimed by returning `true` from `touchStart`.

    @param evt {SC.Event} the event
    @param touches {Array} the touches
    @returns {void}
  */
  touchesDragged: function (evt, touches) {},

  /**
    Called when a touch previously claimed by returning `true` from `touchStart` ends.

    @param touch {SC.Touch} the touch
    @returns {void}
  */
  touchEnd: function (touch) {},

  /**
    Called when a touch begins. You must return `YES` to receive `touchesDragged` and `touchEnd` in
    the future.

    @param touch {SC.Touch} the touch
    @returns {Boolean} YES to receive additional touch events, NO otherwise
  */
  touchStart: function (touch) {},

  // .......................................................................
  // Keyboard Event Handlers
  //
  // These methods are called by the input manager in response to keyboard
  // events.  Most of these methods are defined here for you, but not actually
  // implemented in code.

  /**
    Insert the text or act on the key.

    @param {String} the text to insert or respond to
    @returns {Boolean} YES if you handled the method; NO otherwise
  */
  insertText: function(text) {},

  /**
    When the user presses a key-combination event, this will be called so you
    can run the command.

    @param charCode {String} the character code
    @param evt {SC.Event} the keydown event
    @returns {Boolean} YES if you handled the method; NO otherwise
  */
  performKeyEquivalent: function(charCode, evt) { return false; },

  /**
    This method is called if no other view in the current view hierarchy is
    bound to the escape or command-. key equivalent.  You can use this to
    cancel whatever operation is running.

    @param sender {Object} the object that triggered; may be null
    @param evt {SC.Event} the event that triggered the method
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  cancel: function(sender, evt) {},

  /**
    Delete the current selection or delete one element backward from the
    current selection.

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  deleteBackward: function(sender, evt) {},

  /**
    Delete the current selection or delete one element forward from the
    current selection.

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  deleteForward: function(sender, evt) {},

  /**
    A field editor might respond by selecting the field before it.

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  insertBacktab: function(sender, evt) {},

  /**
    Insert a newline character or end editing of the receiver.

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  insertNewline: function(sender, evt) {},

  /**
    Insert a tab or move forward to the next field.

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  insertTab: function(sender, evt) {},

  /**
    Move insertion point/selection backward one. (i.e. left arrow key)

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveLeft: function(sender, evt) {},

  /**
    Move the insertion point/selection forward one (i.e. right arrow key)
    in left-to-right text, this could be the left arrow key.

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveRight: function(sender, evt) {},

  /**
    Move the insertion point/selection up one (i.e. up arrow key)

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveUp: function(sender, evt) {},

  /**
    Move the insertion point/selection down one (i.e. down arrow key)

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveDown: function(sender, evt) {},

  /**
    Move left, extending the selection. - shift || alt

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveLeftAndModifySelection: function(sender, evt) {},

  /**
    Move right, extending the seleciton - shift || alt

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveRightAndModifySelection: function(sender, evt) {},

  /**
    Move up, extending the selection - shift || alt

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveUpAndModifySelection: function(sender, evt) {},

  /**
    Move down, extending selection - shift || alt

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveDownAndModifySelection: function(sender, evt) {},

  /**
    Move insertion point/selection to beginning of document.

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveToBeginningOfDocument: function(sender, evt) {},

  /**
    Move insertion point/selection to end of document.

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveToEndOfDocument: function(sender, evt) {},

  /**
    Page down

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  pageDown: function(sender, evt) {},

  /**
    Page up

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  pageUp: function(sender, evt) {},

  /**
    Select all

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  selectAll: function(sender, evt) {}

};

/* >>>>>>>>>> BEGIN source/protocols/sparse_array_delegate_protocol.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @namespace
  The `SC.SparseArrayDelegateProtocol` protocol defines the properties and methods that you may
  implement in your sparse array delegate objects.

  An object that implements this protocol may act as a delegate that provides data for a sparse
  array.  The delegate is invoked by the sparse array to fetch data or to update the array content
  as needed.

  Your object does not need to implement all of these methods, but it should at least implement the `sparseArrayDidRequestIndex()` method.

  *Note: Do not mix `SC.SparseArrayDelegateProtocol` into your classes. As a protocol, it exists
  only for reference sake. You only need define any of the properties or methods listed below in
  order to use this protocol.*

  @since SproutCore 1.0
*/
SC.SparseArrayDelegateProtocol = {

  /**
    Invoked when an object requests the length of the sparse array and the
    length has not yet been set.  You can implement this method to update
    the length property of the sparse array immediately or at a later time
    by calling the provideLength() method on the sparse array.

    This method will only be called once on your delegate unless you
    subsequently call provideLength(null) on the array, which will effectively
    "empty" the array and cause the array to invoke the delegate again the
    next time its length is request.

    If you do not set a length on the sparse array immediately, it will return
    a length of 0 until you provide the length.

    @param {SC.SparseArray} sparseArray the array that needs a length.
    @returns {void}
  */
  sparseArrayDidRequestLength: function(sparseArray) {
    // Default does nothing.
  },

  /**
    Invoked when an object requests an index on the sparse array that has not
    yet been set.  You should implement this method to set the object at the
    index using provideObjectAtIndex() or provideObjectsInRange() on the
    sparse array.  You can call these methods immediately during this handler
    or you can wait and call them at a later time once you have loaded any
    data.

    This method will only be called when an index is requested on the sparse
    array that has not yet been filled.  If you have filled an index or range
    and you would like to reset it, call the objectsDidChangeInRange() method
    on the sparse array.

    Note that if you implement the sparseArrayDidRequestRange() method, that
    method will be invoked instead of this one whenever possible to allow you
    to fill in the array with the most efficiency possible.

    @param {SC.SparseArray} sparseArray the sparse array
    @param {Number} index the requested index
    @returns {void}
  */
  sparseArrayDidRequestIndex: function(sparseArray, index) {

  },

  /**
    Alternative method invoked when an object requests an index on the
    sparse array that has not yet been set.  If you set the
    rangeWindowSize property on the Sparse Array, then all object index
    requests will be expanded to to nearest range window and then this
    method will be called with that range.

    You should fill in the passed range by calling the provideObjectsInRange()
    method on the sparse array.

    If you do not implement this method but set the rangeWindowSize anyway,
    then the sparseArrayDidRequestIndex() method will be invoked instead.

    Note that the passed range is a temporary object.  Be sure to clone it if
    you want to keep the range for later use.

    @param {SC.SparseArray} sparseArray the sparse array
    @param {Range} range read only range.
    @returns {void}
  */
  sparseArrayDidRequestRange: function(sparseArray, range) {

  },

  /**
    Optional delegate method you can use to determine the index of a
    particular object.  If you do not implement this method, then the
    sparse array will just search the objects it has loaded already.

    @param {SC.SparseArray} sparseArray the sparse array
    @param {Object} object the object to find the index of
    @return {Number} the index or -1
    @returns {void}
  */
  sparseArrayDidRequestIndexOf: function(sparseArray, object) {

  },

  /**
    Optional delegate method invoked whenever the sparse array attempts to
    changes its contents.  If you do not implement this method or if you
    return NO from this method, then the edit will not be allowed.

    @param {SC.SparseArray} sparseArray the sparse array
    @param {Number} idx the starting index to replace
    @param {Number} amt the number if items to replace
    @param {Array} objects the array of objects to insert
    @returns {Boolean} YES to allow replace, NO to deny
  */
  sparseArrayShouldReplace: function(sparseArray, idx, amt, objects) {
    return NO ;
  },

  /**
    Invoked whenever the sparse array is reset.  Resetting a sparse array
    will cause it to flush its content and go back to the delegate for all
    property requests again.

    @param {SC.SparseArray} sparseArray the sparse array
    @returns {void}
  */
  sparseArrayDidReset: function(sparseArray) {
  }
};

/* >>>>>>>>>> BEGIN source/protocols/view_transition_protocol.js */
// ==========================================================================
// Project:   SproutCore
// Copyright: @2013 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/** @namespace
  The `SC.ViewTransitionProtocol` protocol defines the properties and methods that you may
  implement in your custom transition plugins. The only required method for a plugin to
  implement is `run`.

  SC.View uses transition plugins to setup, execute and cleanup the swapping between views and
  expects the given transition plugin object to implement this protocol.

  *Note: Do not mix `SC.ViewTransitionProtocol` into your classes. As a protocol, it exists only
  for reference sake. You only need define any of the properties or methods listed below in order to
  use this protocol.*
*/
SC.ViewTransitionProtocol = {

  /**
    This optional method is called to set up the entrance transition (i.e.
    transitionIn or transitionShow).

    Use this method to adjust the layout of the view so that it may be properly
    animated.  For example, you may need to adjust the content from a flexible
    layout (i.e. { left: 0, top: 0, right: 0, bottom: 0 }) to a fixed layout
    (i.e. { left: 0, top: 0, width: 100, height: 200 }) so that it can be
    moved.

    @param {SC.View} view The view being transitioned.
    @param {Object} options Options to modify the transition.  As set by transitionShowOptions or transitionInOptions.
    @param {Boolean} inPlace Whether the transition should start with the current layout of the view, because a previous transition was cancelled in place.
  */
  setup: function (view, options, inPlace) {},

  /**
    This method is called to transition the view in or visible (i.e. transitionIn or
    transitionShow).

    When the transition completes, this function *must* call `didTransitionIn()`
    on the view, passing this object and the original options as
    arguments.

    @param {SC.View} view The view being transitioned.
    @param {Object} options Options to modify the transition.  As set by transitionShowOptions or transitionInOptions.
    @param {Object} finalLayout The final layout of the view, which may be different than the starting layout of the view if a previous transition was cancelled in place.
    @param {Object} finalFrame The final frame of the view, which may be different than the starting frame of the view if a previous transition was cancelled in place.
  */
  run: function (view, options, finalLayout, finalFrame) {},


  /**
    This optional property exposes a list of layout properties involved in the
    transition. This allows the view to more intelligently reset its layout when
    the transition is complete.

    If unspecified, the transition will cache and reset the entire layout hash. This
    can cause problems when spearately adjusting or animating those properties during
    a transition. (Note that you should not adjust or animate the layout properties
    that are involved in a transition while the transition is under way.)

    @field
    @type Array
    @default All layout properties
  */
  layoutProperties: []

};

/* >>>>>>>>>> BEGIN source/system/ready.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


SC.BENCHMARK_LOG_READY = YES;

sc_require('system/event');

SC.mixin({
  isReady: NO,

  /**
    Allows apps to avoid automatically attach the ready handlers if they
    want to by setting this flag to YES

    @type Boolean
  */
  suppressOnReady: SC.suppressOnReady ? YES : NO,

  /**
    Allows apps to avoid automatically invoking main() when onReady is called

    @type Boolean
  */
  suppressMain: SC.suppressMain ? YES : NO,

  /**
    Add the passed target and method to the queue of methods to invoke when
    the document is ready.  These methods will be called after the document
    has loaded and parsed, but before the main() function is called.

    Methods are called in the order they are added.

    If you add a ready handler when the main document is already ready, then
    your handler will be called immediately.

    @param target {Object} optional target object
    @param method {Function} method name or function to execute
    @returns {SC}
  */
  ready: function (target, method) {
    var queue = SC._readyQueue;

    // normalize
    if (method === undefined) {
      method = target;
      target = null;
    } else if (SC.typeOf(method) === SC.T_STRING) {
      method = target[method];
    }

    if (SC.isReady) {
      jQuery(document).ready(function () { method.call(target); });
    } else {
      if (!queue) SC._readyQueue = [];
      SC._readyQueue.push(function () { method.call(target); });
    }

    return this;
  },

  onReady: {
    done: function () {
      if (SC.isReady) return;

      SC.isReady = true;

      SC.RunLoop.begin();

      SC.Locale.createCurrentLocale();
      var loc = SC.Locale.currentLanguage.toLowerCase();
      jQuery("body").addClass(loc);

      jQuery("html").attr("lang", loc);

      jQuery("#loading").remove();

      var queue = SC._readyQueue, idx, len;

      if (queue) {
        for (idx = 0, len = queue.length; idx < len; idx++) {
          queue[idx].call();
        }
        SC._readyQueue = null;
      }

      if (window.main && !SC.suppressMain && (SC.mode === SC.APP_MODE)) { window.main(); }
      SC.RunLoop.end();
    }
  }

});

// let apps ignore the regular onReady handling if they need to
if (!SC.suppressOnReady) {
  $(document).ready(SC.onReady.done);
}

// default to app mode.  When loading unit tests, this will run in test mode
SC.APP_MODE = "APP_MODE";
SC.TEST_MODE = "TEST_MODE";
SC.mode = SC.APP_MODE;

/* >>>>>>>>>> BEGIN source/system/platform.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/**
  A constant indicating an unsupported method, property or other.

  @static
  @constant
*/
SC.UNSUPPORTED = '_sc_unsupported';


/** @class

  This platform object allows you to conditionally support certain HTML5
  features.

  Rather than relying on the user agent, it detects whether the given elements
  and events are supported by the browser, allowing you to create much more
  robust apps.
*/
SC.platform = SC.Object.create({
  /**
    The size of scrollbars in this browser.

    @type Number
  */
  scrollbarSize: function () {
    var tester = document.createElement("DIV"),
        child;
    tester.innerHTML = "<div style='height:1px;'></div>";
    tester.style.cssText = "position:absolute;width:100px;height:100px;overflow-y:visible;";

    child = tester.childNodes[0];
    document.body.appendChild(tester);
    var noScroller = child.innerWidth || child.clientWidth;
    tester.style.overflowY = 'scroll';
    var withScroller = child.innerWidth || child.clientWidth;
    document.body.removeChild(tester);

    return noScroller - withScroller;

  }.property().cacheable(),


  /*
    NOTES
     - Chrome would incorrectly indicate support for touch events.  This has been fixed:
       http://code.google.com/p/chromium/issues/detail?id=36415
     - Android is assumed to support touch, but incorrectly reports that it does not.
     - See: https://github.com/Modernizr/Modernizr/issues/84 for a discussion on detecting
       touch capability.
     - See: https://github.com/highslide-software/highcharts.com/issues/1331 for a discussion
       about why we need to check if ontouchstart is null in addition to check if it's defined
     - The test for window._phantom provides support for phantomjs, the headless WebKit browser
       used in Travis-CI, and which incorredtly (see above) identifies itself as a touch browser.
       For more information on CI see https://github.com/sproutcore/sproutcore/pull/1025
       For discussion of the phantomjs touch issue see https://github.com/ariya/phantomjs/issues/10375
  */
  /**
    YES if the current device supports touch events, NO otherwise.

    You can simulate touch events in environments that don't support them by
    calling SC.platform.simulateTouchEvents() from your browser's console.

    Note! The support for "touch" is a browser property and can't be relied on
    to determine if the device is actually a "touch" device or if the device
    actually uses touch events.  There are instances where "touch" devices will
    not send touch events or will send touch and mouse events together and
    there are instances where "non-touch" devices will support touch events.

    It is recommended that you do not use this property at this time.

    @type Boolean
  */
  touch: (!SC.none(window.ontouchstart) || SC.browser.name === SC.BROWSER.android || 'ontouchstart' in document.documentElement) && SC.none(window._phantom),

  /**
    True if bouncing on scroll is expected in the current platform.

    @type Boolean
  */
  bounceOnScroll: SC.browser.os === SC.OS.ios,

  /**
    True if pinch-to-zoom is expected in the current platform.

    @type Boolean
  */
  pinchToZoom: SC.browser.os === SC.OS.ios,

  /**
    A hash that contains properties that indicate support for new HTML5
    a attributes.

    For example, to test to see if the `download` attribute is supported,
    you would verify that `SC.platform.a.download` is true.

    @type Array
  */
  a: function () {
    var elem = document.createElement('a');

    return {
      download: !!('download' in elem),
      media: !!('media' in elem),
      ping: !!('ping' in elem),
    };
  }(),

  /**
    A hash that contains properties that indicate support for new HTML5
    input attributes.

    For example, to test to see if the `placeholder` attribute is supported,
    you would verify that `SC.platform.input.placeholder` is true.

    @type Array
  */
  input: function (attributes) {
    var ret = {},
        len = attributes.length,
        elem = document.createElement('input'),
        attr, idx;

    for (idx = 0; idx < len; idx++) {
      attr = attributes[idx];

      ret[attr] = !!(attr in elem);
    }

    return ret;
  }(['autocomplete', 'readonly', 'list', 'size', 'required', 'multiple', 'maxlength',
        'pattern', 'min', 'max', 'step', 'placeholder',
        'selectionStart', 'selectionEnd', 'selectionDirection']),

  /**
    YES if the application is currently running as a standalone application.

    For example, if the user has saved your web application to their home
    screen on an iPhone OS-based device, this property will be true.

    @type Boolean
  */
  standalone: !!navigator.standalone,


  /** @deprecated Since version 1.10. Use SC.browser.cssPrefix.
    Prefix for browser specific CSS attributes.
  */
  cssPrefix: SC.browser.cssPrefix,

  /** @deprecated Since version 1.10. Use SC.browser.domPrefix.
    Prefix for browser specific CSS attributes when used in the DOM.
  */
  domCSSPrefix: SC.browser.domPrefix,

  /**
    Call this method to swap out the default mouse handlers with proxy methods
    that will translate mouse events to touch events.

    This is useful if you are debugging touch functionality on the desktop.
  */
  simulateTouchEvents: function () {
    // Touch events are supported natively, no need for this.
    if (this.touch) {
      
      SC.Logger.info("Can't simulate touch events in an environment that supports them.");
      
      return;
    }

    SC.Logger.log("Simulating touch events");

    // Tell the app that we now "speak" touch
    SC.platform.touch = YES;
    SC.platform.bounceOnScroll = YES;

    // CSS selectors may depend on the touch class name being present
    document.body.className = document.body.className + ' touch';

    // Initialize a counter, which we will use to generate unique ids for each
    // fake touch.
    this._simtouch_counter = 1;

    // Remove events that don't exist in touch environments
    this.removeEvents(['click', 'dblclick', 'mouseout', 'mouseover', 'mousewheel']);

    // Replace mouse events with our translation methods
    this.replaceEvent('mousemove', this._simtouch_mousemove);
    this.replaceEvent('mousedown', this._simtouch_mousedown);
    this.replaceEvent('mouseup', this._simtouch_mouseup);

    // fix orientation handling
    SC.platform.windowSizeDeterminesOrientation = YES;
    SC.device.orientationHandlingShouldChange();
  },

  /** @private
    Removes event listeners from the document.

    @param {Array} events Array of strings representing the events to remove
  */
  removeEvents: function (events) {
    var idx, len = events.length, key;
    for (idx = 0; idx < len; idx++) {
      key = events[idx];
      SC.Event.remove(document, key, SC.RootResponder.responder, SC.RootResponder.responder[key]);
    }
  },

  /** @private
    Replaces an event listener with another.

    @param {String} evt The event to replace
    @param {Function} replacement The method that should be called instead
  */
  replaceEvent: function (evt, replacement) {
    SC.Event.remove(document, evt, SC.RootResponder.responder, SC.RootResponder.responder[evt]);
    SC.Event.add(document, evt, this, replacement);
  },

  /** @private
    When simulating touch events, this method is called when mousemove events
    are received.

    If the altKey is depressed and pinch center not yet established, we will capture the mouse position.
  */
  _simtouch_mousemove: function (evt) {
    if (!this._mousedown) {
      /*
        we need to capture when was the first spot that the altKey was pressed and use it as
        the center point of a pinch
       */
      if (evt.altKey && this._pinchCenter === null) {
        this._pinchCenter = {
          pageX: evt.pageX,
          pageY: evt.pageY,
          screenX: evt.screenX,
          screenY: evt.screenY,
          clientX: evt.clientX,
          clientY: evt.clientY
        };
      } else if (!evt.altKey && this._pinchCenter !== null) {
        this._pinchCenter = null;
      }
      return NO;
    }

    var manufacturedEvt = this.manufactureTouchEvent(evt, 'touchmove');
    return SC.RootResponder.responder.touchmove(manufacturedEvt);
  },

  /** @private
    When simulating touch events, this method is called when mousedown events
    are received.
  */
  _simtouch_mousedown: function (evt) {
    this._mousedown = YES;

    var manufacturedEvt = this.manufactureTouchEvent(evt, 'touchstart');
    return SC.RootResponder.responder.touchstart(manufacturedEvt);
  },

  /** @private
    When simulating touch events, this method is called when mouseup events
    are received.
  */
  _simtouch_mouseup: function (evt) {
    var manufacturedEvt = this.manufactureTouchEvent(evt, 'touchend'),
        ret = SC.RootResponder.responder.touchend(manufacturedEvt);

    this._mousedown = NO;
    this._simtouch_counter++;
    return ret;
  },

  /** @private
    Converts a mouse-style event to a touch-style event.

    Note that this method edits the passed event in place, and returns
    that same instance instead of a new, modified version.

    If altKey is depressed and we have previously captured a position for the center of
    the pivot point for the virtual second touch, we will manufacture an additional touch.
    The position of the virtual touch will be the reflection of the mouse position,
    relative to the pinch center.

    @param {Event} evt the mouse event to modify
    @param {String} type the type of event (e.g., touchstart)
    @returns {Event} the mouse event with an added changedTouches array
  */
  manufactureTouchEvent: function (evt, type) {
    var realTouch, virtualTouch, realTouchIdentifier = this._simtouch_counter;

    realTouch = {
      type: type,
      target: evt.target,
      identifier: realTouchIdentifier,
      pageX: evt.pageX,
      pageY: evt.pageY,
      screenX: evt.screenX,
      screenY: evt.screenY,
      clientX: evt.clientX,
      clientY: evt.clientY
    };
    evt.touches = [ realTouch ];

    /*
      simulate pinch gesture
     */
    if (evt.altKey && this._pinchCenter !== null) {
      //calculate the mirror position of the virtual touch
      var pageX = this._pinchCenter.pageX + this._pinchCenter.pageX - evt.pageX,
          pageY = this._pinchCenter.pageY + this._pinchCenter.pageY - evt.pageY,
          screenX = this._pinchCenter.screenX + this._pinchCenter.screenX - evt.screenX,
          screenY = this._pinchCenter.screenY + this._pinchCenter.screenY - evt.screenY,
          clientX = this._pinchCenter.clientX + this._pinchCenter.clientX - evt.clientX,
          clientY = this._pinchCenter.clientY + this._pinchCenter.clientY - evt.clientY,
          virtualTouchIdentifier = this._simtouch_counter + 1;

      virtualTouch = {
        type: type,
        target: evt.target,
        identifier: virtualTouchIdentifier,
        pageX: pageX,
        pageY: pageY,
        screenX: screenX,
        screenY: screenY,
        clientX: clientX,
        clientY: clientY
      };

      evt.touches = [realTouch, virtualTouch];
    }
    evt.changedTouches = evt.touches;

    return evt;
  },

  /**
    Whether the browser supports CSS animations.

    @type Boolean
  */
  supportsCSSAnimations: SC.browser.experimentalStyleNameFor('animation') !== SC.UNSUPPORTED,

  /**
    Whether the browser supports CSS transitions.

    @type Boolean
  */
  supportsCSSTransitions: SC.browser.experimentalStyleNameFor('transition') !== SC.UNSUPPORTED,

  /**
    Whether the browser supports 2D CSS transforms.

    @type Boolean
  */
  supportsCSSTransforms: SC.browser.experimentalStyleNameFor('transform') !== SC.UNSUPPORTED,

  /**
    Whether the browser can properly handle 3D CSS transforms.

    @type Boolean
  */
  supportsCSS3DTransforms: SC.browser.experimentalStyleNameFor('perspective') !== SC.UNSUPPORTED,

  /**
    Whether the browser supports the application cache.

    @type Boolean
  */
  supportsApplicationCache: ('applicationCache' in window),

  /**
    Whether the browser supports the hashchange event.

    @type Boolean
  */
  supportsHashChange: function () {
    // Code copied from Modernizr which copied code from YUI (MIT licenses)
    // documentMode logic from YUI to filter out IE8 Compat Mode which false positives
    return ('onhashchange' in window) && (document.documentMode === undefined || document.documentMode > 7);
  }(),

  /**
    Whether the browser supports HTML5 history.

    @type Boolean
  */
  supportsHistory: function () {
    return !!(window.history && window.history.pushState);
  }(),

  /**
    Whether the browser supports IndexedDB.

    @type Boolean
  */
  supportsIndexedDB: function () {
    return !!(window.indexedDB || window[SC.browser.domPrefix + 'IndexedDB']);
  }(),

  /**
    Whether the browser supports the canvas element.

    @type Boolean
  */
  supportsCanvas: function () {
    return !!document.createElement('canvas').getContext;
  }(),

  /**
    Whether the browser supports the XHR2 ProgressEvent specification. This
    reliably implies support for XMLHttpRequest 'loadstart' and 'progress'
    events, as well as the terminal 'load', 'error' and 'abort' events. Support
    for 'loadend', which fires no matter how the request terminats, is a bit
    spottier and should be verified separately using `supportsXHR2LoadEndEvent`.

    @type Boolean
  */
  supportsXHR2ProgressEvent: ('ProgressEvent' in window),

  /**
    Whether the browser supports the XHR2 FormData specification.

    @type Boolean
  */
  supportsXHR2FormData: ('FormData' in window),

  /**
    Whether the browser supports the XHR2 ProgressEvent's loadend event. If not
    supported, you should handle 'load', 'error' and 'abort' events instead.

    @type Boolean
   */
  supportsXHR2LoadEndEvent: function () {
    return (new XMLHttpRequest).onloadend === null;
  } (),

  /**
    Whether the browser supports the orientationchange event.

    @type Boolean
  */
  supportsOrientationChange: ('onorientationchange' in window),

  /**
    Whether the browser supports WebSQL.

    @type Boolean
  */
  supportsWebSQL: ('openDatabase' in window),

  /**
    Because iOS is slow to dispatch the window.onorientationchange event,
    we use the window size to determine the orientation on iOS devices
    and desktop environments when SC.platform.touch is YES (ie. when
    SC.platform.simulateTouchEvents has been called)

    @type Boolean
  */
  windowSizeDeterminesOrientation: SC.browser.os === SC.OS.ios || !('onorientationchange' in window),

  /**
    Does this browser support the Apache Cordova (formerly phonegap) runtime?

    This requires that you (the engineer) manually include the cordova
    javascript library for the appropriate platform (Android, iOS, etc)
    in your code. There are various methods of doing this; creating your own
    platform-specific index.rhtml is probably the easiest option.

    WARNING: Using the javascript_libs Buildfile option for the cordova include
    will NOT work. The library will be included after your application code,
    by which time this property will already have been evaluated.

    @type Boolean
    @see http://incubator.apache.org/cordova/
  */
  // Check for the global cordova property.
  cordova: (typeof window.cordova !== "undefined")

});

/** @private
  Test the transition and animation event names of this platform.  We could hard
  code event names into the framework, but at some point things would change and
  we would get it wrong.  Instead we perform actual tests to find out the proper
  names and only add the proper listeners.

  Once the tests are completed the RootResponder is notified in order to clean up
  unnecessary transition and animation event listeners.
*/
SC.ready(function () {
  // This will add 4 different variations of the named event listener and clean
  // them up again.
  // Note: we pass in capitalizedEventName, because we can't just capitalize
  // the standard event name.  For example, in WebKit the standard transitionend
  // event is named webkitTransitionEnd, not webkitTransitionend.
  var executeTest = function (el, standardEventName, capitalizedEventName, cleanUpFunc) {
    var domPrefix = SC.browser.domPrefix,
      lowerDomPrefix = domPrefix.toLowerCase(),
      eventNameKey = standardEventName + 'EventName',
      callback = function (evt) {
        var domPrefix = SC.browser.domPrefix,
          lowerDomPrefix = domPrefix.toLowerCase(),
          eventNameKey = standardEventName + 'EventName';

        // Remove all the event listeners.
        el.removeEventListener(standardEventName, callback, NO);
        el.removeEventListener(lowerDomPrefix + standardEventName, callback, NO);
        el.removeEventListener(lowerDomPrefix + capitalizedEventName, callback, NO);
        el.removeEventListener(domPrefix + capitalizedEventName, callback, NO);

        // The cleanup timer re-uses this function and doesn't pass evt.
        if (evt) {
          SC.platform[eventNameKey] = evt.type;

          // Don't allow the event to bubble, because SC.RootResponder will be
          // adding event listeners as soon as the testing is complete.  It is
          // important that SC.RootResponder's listeners don't catch the last
          // test event.
          evt.stopPropagation();
        }

        // Call the clean up function, pass in success state.
        if (cleanUpFunc) { cleanUpFunc(!!evt); }
      };

    // Set the initial value as unsupported.
    SC.platform[eventNameKey] = SC.UNSUPPORTED;

    // Try the various implementations.
    // ex. transitionend, webkittransitionend, webkitTransitionEnd, WebkitTransitionEnd
    el.addEventListener(standardEventName, callback, NO);
    el.addEventListener(lowerDomPrefix + standardEventName, callback, NO);
    el.addEventListener(lowerDomPrefix + capitalizedEventName, callback, NO);
    el.addEventListener(domPrefix + capitalizedEventName, callback, NO);
  };

  // Set up and execute the transition event test.
  if (SC.platform.supportsCSSTransitions) {
    var transitionEl = document.createElement('div'),
      transitionStyleName = SC.browser.experimentalStyleNameFor('transition', 'all 1ms linear');

    transitionEl.style[transitionStyleName] = 'all 1ms linear';

    // Test transition events.
    executeTest(transitionEl, 'transitionend', 'TransitionEnd', function (success) {
      // If an end event never fired, we can't really support CSS transitions in SproutCore.
      if (success) {
        // Set up the SC transition event listener.
        SC.RootResponder.responder.cleanUpTransitionListeners();
      } else {
        SC.platform.supportsCSSTransitions = NO;
      }

      transitionEl.parentNode.removeChild(transitionEl);
      transitionEl = null;
    });

    // Append the test element.
    document.documentElement.appendChild(transitionEl);

    // Break execution to allow the browser to update the DOM before altering the style.
    setTimeout(function () {
      transitionEl.style.opacity = '0';
    });

    // Set up and execute the animation event test.
    if (SC.platform.supportsCSSAnimations) {
      var animationEl = document.createElement('div'),
        keyframes,
        prefixedKeyframes;

      // Generate both the regular and prefixed version of the style.
      keyframes = '@keyframes _sc_animation_test { from { opacity: 1; } to { opacity: 0; } }';
      prefixedKeyframes = '@' + SC.browser.cssPrefix + 'keyframes _sc_prefixed_animation_test { from { opacity: 1; } to { opacity: 0; } }';

      // Add test animation styles.
      animationEl.innerHTML = '<style>' + keyframes + '\n' + prefixedKeyframes + '</style>';

      // Set up and execute the animation event test.
      animationEl.style.animation = '_sc_animation_test 1ms linear';
      animationEl.style[SC.browser.domPrefix + 'Animation'] = '_sc_prefixed_animation_test 5ms linear';

      // NOTE: We could test start, but it's extra work and easier just to test the end
      // and infer the start event name from it.  Keeping this code for example.
      // executeTest(animationEl, 'animationstart', 'AnimationStart', function (success) {
      //   // If an iteration start never fired, we can't really support CSS transitions in SproutCore.
      //   if (!success) {
      //     SC.platform.supportsCSSAnimations = NO;
      //   }
      // });

      // NOTE: Testing iteration event support proves very problematic.  Many
      // browsers can't iterate less than several milliseconds which means we
      // have to wait too long to find out this event name.  Instead we test
      // the end only and infer the iteration event name from it. Keeping this
      // code for example, but it wont' work reliably unless the animation style
      // is something like '_sc_animation_test 30ms linear' (i.e. ~60ms wait time)
      // executeTest(animationEl, 'animationiteration', 'AnimationIteration', function (success) {
      //   // If an iteration event never fired, we can't really support CSS transitions in SproutCore.
      //   if (!success) {
      //     SC.platform.supportsCSSAnimations = NO;
      //   }
      // });

      // Test animation events.
      executeTest(animationEl, 'animationend', 'AnimationEnd', function (success) {
        // If an end event never fired, we can't really support CSS animations in SproutCore.
        if (success) {
          // Infer the start and iteration event names based on the success of the end event.
          var domPrefix = SC.browser.domPrefix,
            lowerDomPrefix = domPrefix.toLowerCase(),
            endEventName = SC.platform.animationendEventName;

          switch (endEventName) {
          case lowerDomPrefix + 'animationend':
            SC.platform.animationstartEventName = lowerDomPrefix + 'animationstart';
            SC.platform.animationiterationEventName = lowerDomPrefix + 'animationiteration';
            break;
          case lowerDomPrefix + 'AnimationEnd':
            SC.platform.animationstartEventName = lowerDomPrefix + 'AnimationStart';
            SC.platform.animationiterationEventName = lowerDomPrefix + 'AnimationIteration';
            break;
          case domPrefix + 'AnimationEnd':
            SC.platform.animationstartEventName = domPrefix + 'AnimationStart';
            SC.platform.animationiterationEventName = domPrefix + 'AnimationIteration';
            break;
          default:
            SC.platform.animationstartEventName = 'animationstart';
            SC.platform.animationiterationEventName = 'animationiteration';
          }

          // Set up the SC animation event listeners.
          SC.RootResponder.responder.cleanUpAnimationListeners();
        } else {
          SC.platform.supportsCSSAnimations = NO;
        }

        // Clean up.
        animationEl.parentNode.removeChild(animationEl);
        animationEl = null;
      });

      // Break execution to allow the browser to update the DOM before altering the style.
      document.documentElement.appendChild(animationEl);
    }
  }
});

/* >>>>>>>>>> BEGIN source/system/touch.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class SC.Touch
  Represents a touch. Single touch objects are passed to `touchStart`, `touchEnd` and `touchCancelled` event handlers;
  a specialized multitouch event object is sent to `touchesDragged`, which include access to all in-flight touches
  (see "The touchesDragged Multitouch Event Object" below).

  SC.Touch exposes a number of properties, including pageX/Y, clientX/Y, screenX/Y, and startX/Y (the values that
  pageX/Y had when the touch began, useful for calculating how far the touch has moved). It also exposes the touch's
  target element at `target`, its target SC.View at `targetView`, and the touch's unique identifier at `identifier`,
  which may be relied upon to identify a particular touch for the duration of its lifecycle.

  A touch object exists for the duration of the touch – literally for as long as your finger is on the screen – and
  is sent to a number of touch events on your views. Touch events are sent to the touch's current responder, set initially
  by checking the responder chain for views which implement `touchStart` (or `captureTouch`, see "Touch Events" below),
  and can be passed to other views as needed (see "Touch Responders" below).

  Touch Events
  -----
  You can use the following methods on your views to capture and handle touch events:

  - `captureTouch` -- Sometimes, a touch responder part way up the chain may need to capture the touch and prevent it
    from being made available to its childViews. The canonical use case for this behavior is SC.ScrollView, which by
    default captures touches and holds onto them for 150ms to see if the user is scrolling, only passing them on to
    children if not. (See SC.ScrollView#delaysContentTouches for more.) In order to support this use case, `captureTouch`
    bubbles the opposite way as usual: beginning with the target's pane and bubbling *down* towards the target itself.
    `captureTouch` is passed a single instance of `SC.Touch`, and must return YES if it wishes to capture the touch and
    become its responder. (If your view doesn't want to immediately capture the touch, but instead wants to suggest itself
    as a fallback handler in case the child view resigns respondership, it can do so by passing itself to the touch's
    `stackCandidateTouchResponder` method.)
  - `touchStart` -- When a touch begins, or when a new view responder is first given access to it (see "Touch Responders"
    below), the touch is passed to this method.
  - `touchesDragged` -- Whenever any touches move, the `touchesDragged` method is called on the current view responder
    for any touches that have changed. The method is provided two arguments: a special multitouch event object (see "The
    touchesDragged Multitouch Event Object" below), and an array containing all of the touches on that view. (This is
    the same as calling `touch.touchesForView(this)`.)
  - `touchEnd` -- When a touch is complete, its current responder's `touchEnd` handler is invoked, if present, and passed
    the touch object which is ending.
  - `touchCancelled` -- This method is generally only called if you have changed the touch's responder. See "Touch
    Responders" below; in brief, if you pass the touch to another responder via `makeTouchResponder`, fully resigning
    your touch respondership, you will receive a `touchCancelled` call for the next event; if you pass the touch to another
    responder via `stackNextTouchResponder`, and never receive it back, you will receive a `touchCancelled` call when the
    touch finishes. (Note that because RootResponder must call touchStart to determine if a view will accept respondership,
    touchStart is called on a new responder before touchCancelled is called on the outgoing one.)

  The touchesDragged Multitouch Event Object
  -----
  The specialized event object sent to `touchesDragged` includes access to all touches currently in flight. You can
  access the touches for a specific view from the `touchesForView` method, or get an average position of the touches
  on a view from the convenient `averagedTouchesForView` method. For your convenience when dealing with the common
  single-touch view, the `touchesDragged` event object also exposes the positional page, client, screen and start X/Y
  values from the *first touch*. If you are interested in handling more than one touch, or in handling an average of
  in-flight touches, you should ignore these values. (Note that this event object exposes an array of touch events at
  `touches`. These are the browser's raw touch events, and should be avoided or used with care.)

  Touch Responders: Passing Touches Around
  -----
  The touch responder is the view which is currently handling events for that touch. A touch may only have one responder
  at a time, though a view with `acceptsMultitouch: YES` may respond to more than one touch at a time.

  A view becomes a touch responder by implementing touchStart (and not returning NO). (Out-of-order views can capture
  touch responder status by implementing captureTouch and returning YES.) Once a view is a touch responder, only that
  view will receive subsequent `touchesDragged` and `touchEnd` events; these events do not bubble like mouse events, and
  they do *not* automatically switch to other views if the touch moves outside of its initial responder.

  In some situations, you will want to pass control on to another view during the course of a touch, for example if
  it goes over another view. To permanently pass respondership to another view:

      if (shouldPassTouch) {
        touch.makeTouchResponder(nextView);
      }

  This will trigger `touchStart` on the new responder, and `touchCancel` on the outgoing one. The new responder will begin
  receiving `touchesDragged` events in place of the outgoing one.

  If you want to pass respondership to another view, but are likely to want it back – for example, when a ScrollView
  passes respondership to a child view but expects that the child view will pass it back if it moves more than a certain
  amount:

    if (shouldTemporarlyPassTouch) {
      touch.stackNextTouchResponder(nextView);
    }

  This will trigger `touchStart` on the new responder, and it will start receiving `touchesDragged` and `touchEnd` events.
  Note that the previous responder will not receive `touchCancelled` immediately, since the touch may return to it before
  the end; instead, it will only receive `touchCancelled` when the touch is ended.

  (If you would like to add a view as a fallback responder without triggering unnecessary calls to its `touchStart` and
  `touchCancelled` events, for example as an alternative to returning YES from `captureTouch`, you can call
  `stackCandidateTouchResponder` instead.)

  When the child view decides that the touch has moved enough to be a scroll, it should pass touch respondership back
  to the scroll view with:

    if (Math.abs(touch.pageX - touch.startX) > 4) {
      touch.restoreLastTouchResponder();
    }

  This will trigger `touchCancelled` on the second responder, and the first one will begin receiving `touchDragged` events
  again.
*/
SC.Touch = function(touch, touchContext) {
  // get the raw target view (we'll refine later)
  this.touchContext = touchContext;
  // Get the touch's unique ID.
  this.identifier = touch.identifier;

  var target = touch.target, targetView;

  // Special-case handling for TextFieldView's touch intercept overlays.
  if (target && SC.$(target).hasClass("touch-intercept")) {
    touch.target.style[SC.browser.experimentalStyleNameFor('transform')] = "translate3d(0px,-5000px,0px)";
    target = document.elementFromPoint(touch.pageX, touch.pageY);
    if (target) targetView = SC.viewFor(target);

    this.hidesTouchIntercept = NO;
    if (target.tagName === "INPUT") {
      this.hidesTouchIntercept = touch.target;
    } else {
      touch.target.style[SC.browser.experimentalStyleNameFor('transform')] = "translate3d(0px,0px,0px)";
    }
  } else {
    targetView = touch.target ? SC.viewFor(touch.target) : null;
  }

  this.targetView = targetView;
  this.target = target;
  this.type = touch.type;

  this.touchResponders = [];

  this.startX = this.pageX = touch.pageX;
  this.startY = this.pageY = touch.pageY;
  this.clientX = touch.clientX;
  this.clientY = touch.clientY;
  this.screenX = touch.screenX;
  this.screenY = touch.screenY;
};

SC.Touch.prototype = {
  
  // Debug-mode only.
  toString: function () {
    return "SC.Touch (%@)".fmt(this.identifier);
  },
  

  /**@scope SC.Touch.prototype*/

  /** @private
    The responder that's responsible for the creation and management of this touch. Usually this will be
    your app's root responder. You must pass this on create, and should not change it afterwards.

    @type {SC.RootResponder}
  */
  touchContext: null,

  /**
    This touch's unique identifier. Provided by the browser and used to track touches through their lifetime.
    You will not usually need to use this, as SproutCore's touch objects themselves persist throughout the
    lifetime of a touch.

    @type {Number}
  */
  identifier: null,

  /**
    The touch's initial target element.

    @type: {Element}
  */
  target: null,

  /**
    The view for the touch's initial target element.

    @type {SC.View}
  */
  targetView: null,

  /**
    The touch's current view. (Usually this is the same as the current touchResponder.)

    @type {SC.View}
  */
  view: null,

  /**
    The touch's current responder, i.e. the view that is currently receiving events for this touch.

    You can use the following methods to pass respondership for this touch between views as needed:
    `makeTouchResponder`, `stackNextTouchResponder`, `restoreLastTouchResponder`, and `stackCandidateTouchResponder`.
    See each method's documentation, and "Touch Responders: Passing Touches Around" above, for more.

    @type {SC.Responder}
  */
  touchResponder: null,

  /**
    Whether the touch has ended yet. If you are caching touches outside of the RootResponder, it is your
    responsibility to check this property and handle ended touches appropriately.

    @type {Boolean}
  */
  hasEnded: NO,

  /**
    The touch's latest browser event's type, for example 'touchstart', 'touchmove', or 'touchend'.

    Note that SproutCore's event model differs from that of the browser, so it is not recommended that
    you use this property unless you know what you're doing.

    @type {String}
  */
  type: null,

  /** @private
    A faked mouse event property used to prevent unexpected behavior when proxying touch events to mouse
    event handlers.
  */
  clickCount: 1,

  /**
    The timestamp of the touch's most recent event. This is the time as of when all of the touch's
    positional values are accurate.

    @type {Number}
  */
  timeStamp: null,

  /**
    The touch's latest clientX position (relative to the viewport).

    @type {Number}
  */
  clientX: null,

  /**
    The touch's latest clientY position (relative to the viewport).

    @type {Number}
  */
  clientY: null,

  /**
    The touch's latest screenX position (relative to the screen).

    @type {Number}
  */
  screenX: null,

  /**
    The touch's latest screenY position (relative to the screen).

    @type {Number}
  */
  screenY: null,

  /**
    The touch's latest pageX position (relative to the document).

    @type {Number}
  */
  pageX: null,

  /**
    The touch's latest pageY position (relative to the document).

    @type {Number}
  */
  pageY: null,

  /**
    The touch's initial pageX value. Useful for tracking a touch's total relative movement.

    @type {Number}
  */
  startX: null,

  /**
    The touch's initial pageY value.

    @type {Number}
  */
  startY: null,

  /**
    The touch's horizontal velocity, in pixels per millisecond, at the time of its last event. (Positive
    velocities indicate movement leftward, negative velocities indicate movement rightward.)

    @type {Number}
  */
  velocityX: 0,

  /**
    The touch's vertical velocity, in pixels per millisecond, at the time of its last event. (Positive
    velocities indicate movement downward, negative velocities indicate movement upward.)

    @type {Number}
  */
  velocityY: 0,

  /** @private */
  unhideTouchIntercept: function() {
    var intercept = this.hidesTouchIntercept;
    if (intercept) {
      setTimeout(function() { intercept.style[SC.browser.experimentalStyleNameFor('transform')] = "translate3d(0px,0px,0px)"; }, 500);
    }
  },

  /**
    Indicates that you want to allow the normal default behavior.  Sets
    the hasCustomEventHandling property to YES but does not cancel the event.
  */
  allowDefault: function() {
    if (this.event) this.event.hasCustomEventHandling = YES ;
  },

  /**
    If the touch is associated with an event, prevents default action on the event. This is the
    default behavior in SproutCore, which handles events through the RootResponder instead of
    allowing native handling.
  */
  preventDefault: function() {
    if (this.event) this.event.preventDefault();
  },

  /**
    Calls the native event's stopPropagation method, which prevents the method from continuing to
    bubble. Usually, SproutCore will be handling the event via delegation at the `document` level,
    so this method will have no effect.
  */
  stopPropagation: function() {
    if (this.event) this.event.stopPropagation();
  },

  stop: function() {
    if (this.event) this.event.stop();
  },

  /**
    Removes from and calls touchEnd on the touch responder.
  */
  end: function() {
    this.touchContext.endTouch(this);
  },

  /** @private
    This property, contrary to its name, stores the last touch responder for possible use later in the touch's
    lifecycle. You will usually not use this property directly, instead calling `stackNextTouchResponder` to pass
    the touch to a different view, and `restoreLastTouchResponder` to pass it back to the previous one.

    @type {SC.Responder}
  */
  nextTouchResponder: null,

  /** @private
    An array of previous touch responders.

    @type {Array}
  */
  touchResponders: null,

  /** @private
    A lazily-created array of candidate touch responders. Use `stackCandidateTouchResponder` to add candidates;
    candidates are used as a fallback if the touch is out of previous touch responders.

    @type {Array}
  */
  candidateTouchResponders: null,

  /**
    A convenience method for making the passed view the touch's new responder, retaining the
    current responder for possible use later in the touch's lifecycle.

    For example, if the touch moves over a childView which implements its own touch handling,
    you may pass the touch to it with:

      touchesDragged: function(evt, viewTouches) {
        if ([touches should be passed to childView]) {
          this.viewTouches.forEach(function(touch) {
            touch.stackNextTouchResponder(this.someChildView);
          }, this);
        }
      }

    The child view may easily pass the touch back to this view with `touch.restoreLastTouchResponder`. In the
    mean time, this view will no longer receive `touchesDragged` events; if the touch is not returned to this
    view before ending, it will receive a `touchCancelled` event rather than `touchEnd`.

    @param {SC.Responder} view The view which should become this touch's new responder.
    @param {Boolean} upChain Whether or not a fallback responder should be sought up the responder chain if responder doesn't capture or handle the touch.
  */
  stackNextTouchResponder: function(view, upStack) {
    this.makeTouchResponder(view, YES, upStack);
  },

  /**
    A convenience method for returning touch respondership to the previous touch responder.

    For example, if your view is in a ScrollView and has captured the touch from it, your view
    will prevent scrolling until you return control of the touch to the ScrollView with:

        touchesDragged: function(evt, viewTouches) {
          if (Math.abs(evt.pageY - evt.startY) > this.MAX_SWIPE) {
            viewTouches.invoke('restoreLastTouchResponder');
          }
        }
  */
  restoreLastTouchResponder: function() {
    // If we have a previous touch responder, go back to it.
    if (this.nextTouchResponder) {
      this.makeTouchResponder(this.nextTouchResponder);
    }
    // Otherwise, check if we have a candidate responder queued up.
    else {
      var candidates = this.candidateTouchResponders,
          candidate = candidates ? candidates.pop() : null;
      if (candidate) {
        this.makeTouchResponder(candidate);
      }
    }
  },

  /**
    Changes the touch responder for the touch. If shouldStack is YES,
    the current responder will be saved so that the next responder may
    return to it.

    You will generally not call this method yourself, instead exposing on
    your view either a `touchStart` event handler method, or a `captureTouch`
    method which is passed a touch object and returns YES. This method
    is used in situations where touches need to be juggled between views,
    such as when being handled by a descendent of a ScrollView.

    When returning control of a touch to a previous handler, you should call
    `restoreLastTouchResponder` instead.

    @param {SC.Responder} responder The view to assign to the touch. (It, or if bubbling then an ancestor,
      must implement touchStart.)
    @param {Boolean} shouldStack Whether the new responder should replace the old one, or stack with it.
      Stacked responders are easy to revert via `SC.Touch#restoreLastTouchResponder`.
    @param {Boolean|SC.Responder} bubblesTo If YES, will attempt to find a `touchStart` responder up the
      responder chain. If NO or undefined, will only check the passed responder. If you pass a responder
      for this argument, the attempt will bubble until it reaches the passed responder, allowing you to
      restrict the bubbling to a portion of the responder chain. (Note that this responder will not be
      given an opportunity to respond to the event.)
    @returns {Boolean} Whether a valid touch responder was found and assigned.
  */
  makeTouchResponder: function(responder, shouldStack, bubblesTo) {
    return this.touchContext.makeTouchResponder(this, responder, shouldStack, bubblesTo);
  },

  /**
    You may want your view to insert itself into the responder chain as a fallback, but without
    having touchStart etc. called if it doesn't end up coming into play. For example, SC.ScrollView
    adds itself as a candidate responder (when delaysTouchResponder is NO) so that views can easily
    give it control, but without receiving unnecessary events if not.
  */
  stackCandidateTouchResponder: function(responder) {
    // Fast path: if we're the first one it's easy.
    if (!this.candidateTouchResponders) {
      this.candidateTouchResponders = [responder];
    }
    // Just make sure it's not at the top of the stack. There may be a weird case where a
    // view wants to be in a couple of spots in the stack, but it shouldn't want to be twice
    // in a row.
    else if (responder !== this.candidateTouchResponders[this.candidateTouchResponders.length - 1]) {
      this.candidateTouchResponders.push(responder);
    }
  },

  /**
    Captures, or recaptures, this touch. This works from the startingPoint's first child up to the
    touch's target view to find a view which implements `captureTouch` and returns YES. If the touch
    is captured, then this method will perform a standard `touchStart` event bubbling beginning with
    the view which captured the touch. If no view captures the touch, then this method returns NO,
    and you should call the `makeTouchResponder` method to trigger a standard `touchStart` bubbling
    from the initial target on down.

    You will generally not call this method yourself, instead exposing on
    your view either a `touchStart` event handler method, or a `captureTouch`
    method which is passed a touch object and returns YES. This method
    is used in situations where touches need to be juggled between views,
    such as when being handled by a descendent of a ScrollView.

    @param {?SC.Responder} startingPoint The view whose children should be given an opportunity
      to capture the event. (The starting point itself is not asked.)
    @param {Boolean} shouldStack Whether any capturing responder should stack with existing responders.
      Stacked responders are easy to revert via `SC.Touch#restoreLastTouchResponder`.

    @returns {Boolean} Whether the touch was captured. If it was not, you should pass it to
      `makeTouchResponder` for standard event bubbling.
  */
  captureTouch: function(startingPoint, shouldStack) {
    return this.touchContext.captureTouch(this, startingPoint, shouldStack);
  },

  /**
    Returns all touches for a specified view. Put as a convenience on the touch itself;
    this method is also available on the event.

    For example, to retrieve the list of touches impacting the current event handler:

        touchesDragged: function(evt) {
          var myTouches = evt.touchesForView(this);
        }

    @param {SC.Responder} view
  */
  touchesForView: function(view) {
    return this.touchContext.touchesForView(view);
  },

  /**
    A synonym for SC.Touch#touchesForView.
  */
  touchesForResponder: function(responder) {
    return this.touchContext.touchesForView(responder);
  },

  /**
    Returns average data--x, y, and d (distance)--for the touches owned by the supplied view.

    See notes on the addSelf argument for an important consideration when calling from `touchStart`.

    @param {SC.Responder} view
    @param {Boolean} addSelf Includes the receiver in calculations. Pass YES for this if calling
        from touchStart, as the touch will not yet be included by default.
  */
  averagedTouchesForView: function(view, addSelf) {
    return this.touchContext.averagedTouchesForView(view, (addSelf ? this : null));
  }
};

SC.mixin(SC.Touch, {

  create: function(touch, touchContext) {
    return new SC.Touch(touch, touchContext);
  },

  /**
    Returns the averaged touch for an array of given touches. The averaged touch includes the
    average position of all the touches (i.e. the center point), the averaged distance of all
    the touches (i.e. the average of each touch's distance to the center) and the average velocity
    of each touch.

    The returned Object has a signature like,

        {
          x: ...,
          y: ...,
          velocityX: ...,
          velocityY: ...,
          d: ...
        }

    @param {Array} touches An array of touches to average.
    @param {Object} objectRef An Object to assign the values to rather than creating a new Object. If you pass an Object to this method, that same Object will be returned with the values assigned to it. This is useful in order to only alloc memory once and hold it in order to avoid garbage collection. The trade-off is that more memory remains in use indefinitely.
    @returns {Object} The averaged touch.
  */
  averagedTouch: function (touches, objectRef) {
    var len = touches.length,
        ax = 0, ay = 0, avx = 0, avy = 0,
        idx, touch;

    // If no holder object is given, create a new one.
    if (objectRef === undefined) { objectRef = {}; }

    // Sum the positions and velocities of each touch.
    for (idx = 0; idx < len; idx++) {
      touch = touches[idx];
      ax += touch.pageX;
      ay += touch.pageY;
      avx += touch.velocityX;
      avy += touch.velocityY;
    }

    // Average each value.
    ax /= len;
    ay /= len;
    avx /= len;
    avy /= len;

    // Calculate average distance.
    var ad = 0;
    for (idx = 0; idx < len; idx++) {
      touch = touches[idx];

      // Get distance for each from average position.
      var dx = Math.abs(touch.pageX - ax);
      var dy = Math.abs(touch.pageY - ay);

      // Pythagoras was clever...
      ad += Math.pow(dx * dx + dy * dy, 0.5);
    }

    // Average value.
    ad /= len;

    objectRef.x = ax;
    objectRef.y = ay;
    objectRef.velocityX = avx;
    objectRef.velocityY = avy;
    objectRef.d = ad;

    return objectRef;
  }
});

/* >>>>>>>>>> BEGIN source/system/root_responder.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/ready');
sc_require('system/platform');
sc_require('system/touch');

/** Set to NO to leave the backspace key under the control of the browser.*/
SC.CAPTURE_BACKSPACE_KEY = NO ;

/** @class

  The RootResponder captures events coming from a web browser and routes them
  to the correct view in the view hierarchy.  Usually you do not work with a
  RootResponder directly.  Instead you will work with Pane objects, which
  register themselves with the RootResponder as needed to receive events.

  RootResponder and Platforms
  ---

  RootResponder contains core functionality common among the different web
  platforms. You will likely be working with a subclass of RootResponder that
  implements functionality unique to that platform.

  The correct instance of RootResponder is detected at runtime and loaded
  transparently.

  Event Types
  ---

  RootResponders can route four types of events:

   - Direct events, such as mouse and touch events.  These are routed to the
     nearest view managing the target DOM elment. RootResponder also handles
     multitouch events so that they are delegated to the correct views.
   - Keyboard events. These are sent to the keyPane, which will then send the
     event to the current firstResponder and up the responder chain.
   - Resize events. When the viewport resizes, these events will be sent to all
     panes.
   - Keyboard shortcuts. Shortcuts are sent to the keyPane first, which
     will go down its view hierarchy. Then they go to the mainPane, which will
     go down its view hierarchy.
   - Actions. Actions are generic messages that your application can send in
     response to user action or other events. You can either specify an
     explicit target, or allow the action to traverse the hierarchy until a
     view is found that handles it.
*/
SC.RootResponder = SC.Object.extend(
  /** @scope SC.RootResponder.prototype */{

  /**
    Contains a list of all panes currently visible on screen.  Every time a
    pane attaches or detaches, it will update itself in this array.
  */
  panes: null,

  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.panes = SC.Set.create();
  },

  // .......................................................
  // MAIN PANE
  //

  /**
    The main pane.  This pane receives shortcuts and actions if the
    focusedPane does not respond to them.  There can be only one main pane.
    You can swap main panes by calling makeMainPane() here.

    Usually you will not need to edit the main pane directly.  Instead, you
    should use a MainPane subclass, which will automatically make itself main
    when you append it to the document.

    @type SC.MainPane
  */
  mainPane: null,

  /**
    Swaps the main pane.  If the current main pane is also the key pane, then
    the new main pane will also be made key view automatically.  In addition
    to simply updating the mainPane property, this method will also notify the
    panes themselves that they will lose/gain their mainView status.

    Note that this method does not actually change the Pane's place in the
    document body.  That will be handled by the Pane itself.

    @param {SC.Pane} pane
    @returns {SC.RootResponder}
  */
  makeMainPane: function(pane) {
    var currentMain = this.get('mainPane') ;
    if (currentMain === pane) return this ; // nothing to do

    this.beginPropertyChanges() ;

    // change key focus if needed.
    if (this.get('keyPane') === currentMain) this.makeKeyPane(pane) ;

    // change setting
    this.set('mainPane', pane) ;

    // notify panes.  This will allow them to remove themselves.
    if (currentMain) currentMain.blurMainTo(pane) ;
    if (pane) pane.focusMainFrom(currentMain) ;

    this.endPropertyChanges() ;
    return this ;
  },

  // ..........................................................
  // MENU PANE
  //

  /**
    The current menu pane. This pane receives keyboard events before all other
    panes, but tends to be transient, as it is only set when a pane is open.

    @type SC.MenuPane
  */
  menuPane: null,

  /**
    Sets a pane as the menu pane. All key events will be directed to this
    pane, but the current key pane will not lose focus.

    Usually you would not call this method directly, but allow instances of
    SC.MenuPane to manage the menu pane for you. If your pane does need to
    become menu pane, you should relinquish control by calling this method
    with a null parameter. Otherwise, key events will always be delivered to
    that pane.

    @param {SC.MenuPane} pane
    @returns {SC.RootResponder} receiver
  */
  makeMenuPane: function(pane) {
    // Does the specified pane accept being the menu pane?  If not, there's
    // nothing to do.
    if (pane  &&  !pane.get('acceptsMenuPane')) {
      return this;
    } else {
      var currentMenu = this.get('menuPane');
      if (currentMenu === pane) return this; // nothing to do

      this.set('menuPane', pane);
    }

    return this;
  },

  // .......................................................
  // KEY PANE
  //

  /**
    The current key pane. This pane receives keyboard events, shortcuts, and
    actions first, unless a menu is open. This pane is usually the highest
    ordered pane or the mainPane.

    @type SC.Pane
  */
  keyPane: null,

  /** @private
    A stack of previous key panes. Used to allow panes to resign key pane
    status without having to know who had it before them.

    NOTE: This property is not observable.
  */
  previousKeyPanes: [],

  /**
    Makes the passed pane the new key pane.  If you pass null or if the pane
    does not accept key focus, then key focus will transfer to the previous
    key pane (if it is still attached), and so on down the stack.  This will
    notify both the old pane and the new root View that key focus has changed.

    @param {SC.Pane} pane
    @returns {SC.RootResponder} receiver
  */
  makeKeyPane: function(pane) {
    // Quick note about previousKeyPanes: if a pane is destroyed while in the
    // previous panes stack, it will retain a reference to it here, causing a
    // brief leak. The reference will be removed as soon as the panes above it
    // in the stack resign, so it's rarely an issue, and fixing it would require
    // a dedicated method and some extra coordination that's probably not worth
    // it.

    // Was a pane specified?
    var newKeyPane, previousKeyPane, previousKeyPanes ;

    if (pane) {
      // Does the specified pane accept being the key pane?  If not, there's
      // nothing to do.
      if (!pane.get('acceptsKeyPane')) {
        return this ;
      }
      else {
        // It does accept key pane status?  Then push the current keyPane to
        // the top of the stack and make the specified pane the new keyPane.
        // First, though, do a sanity-check to make sure it's not already the
        // key pane, in which case we have nothing to do.
        previousKeyPane = this.get('keyPane') ;
        if (previousKeyPane === pane) {
          return this ;
        }
        else {
          if (previousKeyPane) {
            previousKeyPanes = this.get('previousKeyPanes') ;
            previousKeyPanes.push(previousKeyPane) ;
          }

          newKeyPane = pane ;
        }
      }
    } else {
      // No pane was specified?  Then pop the previous key pane off the top of
      // the stack and make it the new key pane, assuming that it's still
      // attached and accepts key pane (its value for acceptsKeyPane might
      // have changed in the meantime).  Otherwise, we'll keep going up the
      // stack.
      previousKeyPane = this.get('keyPane') ;
      previousKeyPanes = this.get('previousKeyPanes') ;

      newKeyPane = null ;
      var candidate;
      while (previousKeyPanes.length > 0) {
        candidate = previousKeyPanes.pop();
        if (candidate.get('isVisibleInWindow') && candidate.get('acceptsKeyPane')) {
          newKeyPane = candidate ;
          break ;
        }
      }
    }


    // If we found an appropriate candidate, make it the new key pane.
    // Otherwise, make the main pane the key pane (if it accepts it).
    if (!newKeyPane) {
      var mainPane = this.get('mainPane') ;
      if (mainPane && mainPane.get('acceptsKeyPane')) newKeyPane = mainPane ;
    }

    // now notify old and new key views of change after edit
    if (previousKeyPane) previousKeyPane.willLoseKeyPaneTo(newKeyPane) ;
    if (newKeyPane) newKeyPane.willBecomeKeyPaneFrom(previousKeyPane) ;

    this.set('keyPane', newKeyPane) ;

    if (newKeyPane) newKeyPane.didBecomeKeyPaneFrom(previousKeyPane) ;
    if (previousKeyPane) previousKeyPane.didLoseKeyPaneTo(newKeyPane) ;

    return this ;
  },

  // ..........................................................
  // VIEWPORT STATE
  //

  /**
    The last known window size.
    @type Rect
    @isReadOnly
  */
  currentWindowSize: null,

  /**
    Computes the window size from the DOM.

    @returns Rect
  */
  computeWindowSize: function() {
    var size, bod, docElement;
    if(!this._bod || !this._docElement){
      bod = document.body;
      docElement = document.documentElement;
      this._bod=bod;
      this._docElement=docElement;
    }else{
      bod = this._bod;
      docElement = this._docElement;
    }

    if (window.innerHeight) {
      size = {
        width: window.innerWidth,
        height: window.innerHeight
      } ;
    } else if (docElement && docElement.clientHeight) {
      size = {
        width: docElement.clientWidth,
        height: docElement.clientHeight
      };
    } else if (bod) {
      size = {
        width: bod.clientWidth,
        height: bod.clientHeight
      } ;
    }
    return size;
  },

  /**
    On window resize, notifies panes of the change.

    @returns {Boolean}
  */
  resize: function() {
    this._resize();
    this._assignDesignMode();

    return YES; //always allow normal processing to continue.
  },

  /** @private */
  _resize: function() {
    // calculate new window size...
    var newSize = this.computeWindowSize(), oldSize = this.get('currentWindowSize');
    this.set('currentWindowSize', newSize); // update size

    if (!SC.rectsEqual(newSize, oldSize)) {
      SC.run(function() {
        //Notify orientation change. This is faster than waiting for the orientation
        //change event.
        SC.device.windowSizeDidChange(newSize);

        // notify panes
        if (this.panes) {
            if (oldSize !== newSize) {
              this.panes.invoke('windowSizeDidChange', oldSize, newSize);
            }
        }
      }, this);
    }
  },

  /** @private */
  _assignDesignMode: function () {
    var newDesignMode = this.computeDesignMode(),
      oldDesignMode = this.get('currentDesignMode');

    if (oldDesignMode !== newDesignMode) {
      this.set('currentDesignMode', newDesignMode);

      if (this.panes) {
        SC.run(function() {
          this.panes.invoke('updateDesignMode', oldDesignMode, newDesignMode);
        }, this);
      }
    }
  },

  /**
    Indicates whether or not the window currently has focus.  If you need
    to do something based on whether or not the window is in focus, you can
    setup a binding or observer to this property.  Note that the SproutCore
    automatically adds an sc-focus or sc-blur CSS class to the body tag as
    appropriate.  If you only care about changing the appearance of your
    controls, you should use those classes in your CSS rules instead.
  */
  hasFocus: NO,

  /**
    Handle window focus.  Change hasFocus and add sc-focus CSS class
    (removing sc-blur).  Also notify panes.
  */
  focus: function(evt) {
    if (!this.get('hasFocus')) {
      SC.$('body').addClass('sc-focus').removeClass('sc-blur');

      SC.run(function () {
      // If the app is getting focus again set the first responder to the first
      // valid firstResponder view in the view's tree
      if(!SC.TABBING_ONLY_INSIDE_DOCUMENT && !SC.browser.isIE8OrLower){
        var keyPane = SC.RootResponder.responder.get('keyPane');
        if (keyPane) {
          var nextValidKeyView = keyPane.get('nextValidKeyView');
          if (nextValidKeyView) keyPane.makeFirstResponder(nextValidKeyView);
        }
      }

        this.set('hasFocus', YES);
      }, this);
    }

    return YES ; // allow default
  },

  /**
    Handle window focus event for IE. Listening to the focus event is not
    reliable as per every focus event you receive you immediately get a blur
    event (Only on IE of course ;)
  */
  focusin: function(evt) {
    if(this._focusTimeout) clearTimeout(this._focusTimeout);
    this.focus(evt);
  },

  /**
    Handle window blur event for IE. Listening to the focus event is not
    reliable as per every focus event you receive you immediately get a blur
    event (Only on IE of course ;)
  */
  focusout: function(evt) {
    var that = this;
    this._focusTimeout = setTimeout(function(){that.blur(evt);}, 300);
  },


  /**
    Handle window focus.  Change hasFocus and add sc-focus CSS class (removing
    sc-blur).  Also notify panes.
  */
  blur: function(evt) {
    if (this.get('hasFocus')) {
      SC.$('body').addClass('sc-blur').removeClass('sc-focus');

      SC.run(function() {
        this.set('hasFocus', NO);
      }, this);
    }
    return YES ; // allow default
  },

  dragDidStart: function(drag) {
    this._mouseDownView = drag ;
    this._drag = drag ;
  },

  // ------------------------------------------------------------------------
  // Design Modes
  //

  /** @private */
  currentDesignMode: null,

  /** @private Managed by SC.Application. */
  designModes: function (key, value) {
    if (SC.none(value)) {
      // Clear previous values.
      if (this._designModeNames) {
        delete this._designModeNames;
        delete this._designModeThresholds;
      }

      value = null;
    } else {
      this._prepOrderedArrays(value);
    }

    this._assignDesignMode();

    return value;
  }.property().cacheable(),

  /** @private Determine the design mode based on area and pixel density. */
  computeDesignMode: function () {
    var designMode = null,
      designModeNames = this._designModeNames,
      designModeThresholds = this._designModeThresholds,
      currentWindowSize,
      area;

    // Fast path!
    if (!designModeNames) { return null; }

    currentWindowSize = this.get('currentWindowSize');
    area = (currentWindowSize.width * currentWindowSize.height);
    var i, len;
    for (i = 0, len = designModeThresholds.get('length'); i < len; i++) {
      var layoutWidthThreshold = designModeThresholds.objectAt(i);
      if (area < layoutWidthThreshold) {
        designMode = designModeNames.objectAt(i);
        break;
      }
    }

    // If no smaller designMode was found, use the biggest designMode.
    if (SC.none(designMode) && designModeNames && designModeNames.get('length') > 0) {
      designMode = designModeNames.objectAt(i);
    }

    return SC.device.orientation === SC.PORTRAIT_ORIENTATION ? designMode + '_p' : designMode + '_l';
  },

  /** @private (semi-private)
    Returns the fallback design mode for the given design mode.  This is
    primarily used by SC.View for the case where an adjustment isn't found
    for the current design mode and we want to apply the next best design
    mode as a fallback.
  */
  fallbackDesignMode: function (designMode) {
    var designModeNames = this._designModeNames,
      index,
      ret = null;

    index = designModeNames.indexOf(designMode);
    if (index >= 0) {
      ret = designModeNames[index - 1];
    }

    return ret;
  },

  /** @private Prepares ordered design modes & widths arrays when designModes changes. */
  _prepOrderedArrays: function (designModes) {
    var designModeNames,
      designModeThresholds;

    // Order the design modes for easier access later.
    if (designModes) {
      designModeNames = this._designModeNames = [];
      designModeThresholds = this._designModeThresholds = [];

      var key;

      outer:
        for (key in designModes) {
          var i, value;

          // Assume that the keys will be ordered smallest to largest so run backwards.
          value = designModes[key];
          inner:
            for (i = designModeThresholds.length - 1; i >= 0; i--) {
              if (designModeThresholds[i] < value) {
                // Exit early!
                break inner;
              }
            }

          i += 1;
          designModeNames.splice(i, 0, key);
          designModeThresholds.splice(i, 0, value);
        }
    }
  },

  // .......................................................
  // ACTIONS
  //

  /**
    Set this to a delegate object that can respond to actions as they are sent
    down the responder chain.

    @type SC.Object
  */
  defaultResponder: null,

  /**
    Route an action message to the appropriate responder.  This method will
    walk the responder chain, attempting to find a responder that implements
    the action name you pass to this method.  Set 'target' to null to search
    the responder chain.

    **IMPORTANT**: This method's API and implementation will likely change
    significantly after SproutCore 1.0 to match the version found in
    SC.ResponderContext.

    You generally should not call or override this method in your own
    applications.

    @param {String} action The action to perform - this is a method name.
    @param {SC.Responder} target object to set method to (can be null)
    @param {Object} sender The sender of the action
    @param {SC.Pane} pane optional pane to start search with
    @param {Object} context optional. only passed to ResponderContexts
    @returns {Boolean} YES if action was performed, NO otherwise
    @test in targetForAction
  */
  sendAction: function( action, target, sender, pane, context, firstResponder) {
    target = this.targetForAction(action, target, sender, pane, firstResponder) ;

    if (target) {
      // HACK: If the target is a ResponderContext, forward the action.
      if (target.isResponderContext) {
        return !!target.sendAction(action, sender, context, firstResponder);
      } else {
        return target.tryToPerform(action, sender, context);
      }
    }
  },

  _responderFor: function(target, methodName, firstResponder) {
    var defaultResponder = target ? target.get('defaultResponder') : null;

    if (target) {
      target = firstResponder || target.get('firstResponder') || target;
      do {
        if (target.respondsTo(methodName)) return target ;
      } while ((target = target.get('nextResponder'))) ;
    }

    // HACK: Eventually we need to normalize the sendAction() method between
    // this and the ResponderContext, but for the moment just look for a
    // ResponderContext as the defaultResponder and return it if present.
    if (typeof defaultResponder === SC.T_STRING) {
      defaultResponder = SC.objectForPropertyPath(defaultResponder);
    }

    if (!defaultResponder) return null;
    else if (defaultResponder.isResponderContext) return defaultResponder;
    else if (defaultResponder.respondsTo(methodName)) return defaultResponder;
    else return null;
  },

  /**
    Attempts to determine the initial target for a given action/target/sender
    tuple.  This is the method used by sendAction() to try to determine the
    correct target starting point for an action before trickling up the
    responder chain.

    You send actions for user interface events and for menu actions.

    This method returns an object if a starting target was found or null if no
    object could be found that responds to the target action.

    Passing an explicit target or pane constrains the target lookup to just
    them; the defaultResponder and other panes are *not* searched.

    @param {Object|String} target or null if no target is specified
    @param {String} method name for target
    @param {Object} sender optional sender
    @param {SC.Pane} optional pane
    @param {firstResponder} a first responder to use
    @returns {Object} target object or null if none found
  */
  targetForAction: function(methodName, target, sender, pane, firstResponder) {

    // 1. no action, no target...
    if (!methodName || (SC.typeOf(methodName) !== SC.T_STRING)) {
      return null ;
    }

    // 2. an explicit target was passed...
    if (target) {
      // Normalize String targets to Objects
      if (SC.typeOf(target) === SC.T_STRING) {
        target = SC.objectForPropertyPath(target) ||
                 SC.objectForPropertyPath(target, sender);
      }

      // Ensure that the target responds to the method.
      if (target && !target.isResponderContext) {
        if (target.respondsTo && !target.respondsTo(methodName)) {
          target = null ;
        } else if (SC.typeOf(target[methodName]) !== SC.T_FUNCTION) {
          target = null ;
        }
      }

      return target ;
    }

    // 3. an explicit pane was passed...
    if (pane) {
      target = this._responderFor(pane, methodName, firstResponder);
      if (target) return target;
    }

    // 4. no target or pane passed... try to find target in the active panes
    // and the defaultResponder
    var keyPane = this.get('keyPane'), mainPane = this.get('mainPane') ;

    // ...check key and main panes first
    if (keyPane && (keyPane !== pane)) {
      target = this._responderFor(keyPane, methodName) ;
    }
    if (!target && mainPane && (mainPane !== keyPane)) {
      target = this._responderFor(mainPane, methodName) ;
    }

    // ...still no target? check the defaultResponder...
    if (!target && (target = this.get('defaultResponder'))) {
      if (SC.typeOf(target) === SC.T_STRING) {
        target = SC.objectForPropertyPath(target) ;
        if (target) this.set('defaultResponder', target) ; // cache if found
      }
      if (target && !target.isResponderContext) {
        if (target.respondsTo && !target.respondsTo(methodName)) {
          target = null ;
        } else if (SC.typeOf(target[methodName]) !== SC.T_FUNCTION) {
          target = null ;
        }
      }
    }

    return target ;
  },

  /**
    Finds the view that appears to be targeted by the passed event.  This only
    works on events with a valid target property.

    @param {SC.Event} evt
    @returns {SC.View} view instance or null
  */
  targetViewForEvent: function (evt) {
    var ret = null;
    if (evt.target) { ret = SC.viewFor(evt.target); }

    return ret;
  },

  /**
    Attempts to send an event down the responder chain.  This method will
    invoke the sendEvent() method on either the keyPane or on the pane owning
    the target view you pass in.  It will also automatically begin and end
    a new run loop.

    If you want to trap additional events, you should use this method to
    send the event down the responder chain.

    @param {String} action
    @param {SC.Event} evt
    @param {Object} target
    @returns {Object} object that handled the event or null if not handled
  */
  sendEvent: function(action, evt, target) {
    var pane, ret ;

    SC.run(function send_event() {
      // get the target pane
      if (target) pane = target.get('pane') ;
      else pane = this.get('menuPane') || this.get('keyPane') || this.get('mainPane') ;

      // if we found a valid pane, send the event to it
      ret = (pane) ? pane.sendEvent(action, evt, target) : null ;
    }, this);

    return ret ;
  },

  // .......................................................
  // EVENT LISTENER SETUP
  //

  /**
    Default method to add an event listener for the named event.  If you simply
    need to add listeners for a type of event, you can use this method as
    shorthand.  Pass an array of event types to listen for and the element to
    listen in.  A listener will only be added if a handler is actually installed
    on the RootResponder (or receiver) of the same name.

    @param {Array} keyNames
    @param {Element} target
    @param {Object} receiver - optional if you don't want 'this'
    @param {Boolean} useCapture
    @returns {SC.RootResponder} receiver
  */
  listenFor: function(keyNames, target, receiver, useCapture) {
    receiver = receiver ? receiver : this;
    keyNames.forEach( function(keyName) {
      var method = receiver[keyName] ;
      if (method) SC.Event.add(target, keyName, receiver, method, null, useCapture) ;
    },this) ;

    target = null ;

    return receiver ;
  },

  /**
    Called when the document is ready to begin handling events.  Setup event
    listeners in this method that you are interested in observing for your
    particular platform.  Be sure to call arguments.callee.base.apply(this,arguments).

    @returns {void}
  */
  setup: function() {
    // handle basic events
    this.listenFor(['touchstart', 'touchmove', 'touchend', 'touchcancel', 'keydown', 'keyup', 'beforedeactivate', 'mousedown', 'mouseup', 'dragenter', 'dragover', 'dragleave', 'drop', 'click', 'dblclick', 'mousemove', 'contextmenu'], document)
        .listenFor(['resize'], window);

    if(SC.browser.isIE8OrLower) this.listenFor(['focusin', 'focusout'], document);
    else this.listenFor(['focus', 'blur'], window);

    // handle special case for keypress- you can't use normal listener to block
    // the backspace key on Mozilla
    if (this.keypress) {
      if (SC.CAPTURE_BACKSPACE_KEY && SC.browser.isMozilla) {
        var responder = this ;
        document.onkeypress = function(e) {
          e = SC.Event.normalizeEvent(e);
          return responder.keypress.call(responder, e);
        };

      // Otherwise, just add a normal event handler.
      } else {
        SC.Event.add(document, 'keypress', this, this.keypress);
      }
    }

    // Add an array of transition listeners for immediate use (these will be cleaned up when actual testing completes).
    // Because the transition test happens asynchronously and because we don't want to
    // delay the launch of the application in order to a transition test (the app won't
    // load if the browser tab is not visible), we start off by listening to everything
    // and when the test is completed, we remove the extras to avoid double callbacks.
    if (SC.platform.supportsCSSTransitions) {
      var domPrefix = SC.browser.domPrefix,
        lowerDomPrefix = domPrefix.toLowerCase(),
        variation1 = lowerDomPrefix + 'transitionend',
        variation2 = lowerDomPrefix + 'TransitionEnd',
        variation3 = domPrefix + 'TransitionEnd';

      // Ensure that the callback name used maps to our implemented function name.
      this[variation1] = this[variation2] = this[variation3] = this.transitionend;

      // ex. transitionend, webkittransitionend, webkitTransitionEnd, WebkitTransitionEnd
      this.listenFor(['transitionend', variation1, variation2, variation3], document);

      if (SC.platform.supportsCSSAnimations) {
        variation1 = lowerDomPrefix + 'animationstart';
        variation2 = lowerDomPrefix + 'AnimationStart';
        variation3 = domPrefix + 'AnimationStart';

        // Ensure that the callback name used maps to our implemented function name.
        this[variation1] = this[variation2] = this[variation3] = this.animationstart;

        // ex. animationstart, webkitanimationstart, webkitAnimationStart, WebkitAnimationStart
        this.listenFor(['animationstart', variation1, variation2, variation3], document);

        variation1 = lowerDomPrefix + 'animationiteration';
        variation2 = lowerDomPrefix + 'AnimationIteration';
        variation3 = domPrefix + 'AnimationIteration';

        // Ensure that the callback name used maps to our implemented function name.
        this[variation1] = this[variation2] = this[variation3] = this.animationiteration;

        // ex. animationiteration, webkitanimationiteration, webkitAnimationIteration, WebkitAnimationIteration
        this.listenFor(['animationiteration', variation1, variation2, variation3], document);

        variation1 = lowerDomPrefix + 'animationend';
        variation2 = lowerDomPrefix + 'AnimationEnd';
        variation3 = domPrefix + 'AnimationEnd';

        // Ensure that the callback name used maps to our implemented function name.
        this[variation1] = this[variation2] = this[variation3] = this.animationend;

        // ex. animationend, webkitanimationend, webkitAnimationEnd, WebkitAnimationEnd
        this.listenFor(['animationend', variation1, variation2, variation3], document);
      }
    }

    // handle these two events specially in IE
    ['drag', 'selectstart'].forEach(function(keyName) {
      var method = this[keyName] ;
      if (method) {
        if (SC.browser.isIE) {
          var responder = this ;

          document.body['on' + keyName] = function(e) {
            return method.call(responder, SC.Event.normalizeEvent(event || window.event)); // this is IE :(
          };

          // be sure to cleanup memory leaks
           SC.Event.add(window, 'unload', this, function() {
            document.body['on' + keyName] = null;
          });

        } else {
          SC.Event.add(document, keyName, this, method);
        }
      }
    }, this);

    var mousewheel = 'mousewheel';

    // Firefox emits different mousewheel events than other browsers
    if (SC.browser.isMozilla) {
      // For Firefox < 3.5, subscribe to DOMMouseScroll events
      if (SC.browser.compare(SC.browser.engineVersion, '1.9.1') < 0) {
        mousewheel = 'DOMMouseScroll';

      // For Firefox 3.5 and greater, we can listen for MozMousePixelScroll,
      // which supports pixel-precision scrolling devices, like MacBook
      // trackpads.
      } else {
        mousewheel = 'MozMousePixelScroll';
      }
    }
    SC.Event.add(document, mousewheel, this, this.mousewheel);

    // Do some initial set up.
    this.set('currentWindowSize', this.computeWindowSize()) ;

    // TODO: Is this workaround still valid?
    if (SC.browser.os === SC.OS.ios && SC.browser.name === SC.BROWSER.safari) {

      // If the browser is identifying itself as a touch-enabled browser, but
      // touch events are not present, assume this is a desktop browser doing
      // user agent spoofing and simulate touch events automatically.
      if (SC.platform && !SC.platform.touch) {
        SC.platform.simulateTouchEvents();
      }

      // Monkey patch RunLoop if we're in MobileSafari
      var f = SC.RunLoop.prototype.endRunLoop, patch;

      patch = function() {
        // Call original endRunLoop implementation.
        if (f) f.apply(this, arguments);

        // This is a workaround for a bug in MobileSafari.
        // Specifically, if the target of a touchstart event is removed from the DOM,
        // you will not receive future touchmove or touchend events. What we do is, at the
        // end of every runloop, check to see if the target of any touches has been removed
        // from the DOM. If so, we re-append it to the DOM and hide it. We then mark the target
        // as having been moved, and it is de-allocated in the corresponding touchend event.
        var touches = SC.RootResponder.responder._touches, touch, elem, target, found = NO;
        if (touches) {
          // Iterate through the touches we're currently tracking
          for (touch in touches) {
            if (touches[touch]._rescuedElement) continue; // only do once

            target = elem = touches[touch].target;

            // Travel up the hierarchy looking for the document body
            while (elem && (elem = elem.parentNode) && !found) {
              found = (elem === document.body);
            }

            // If we aren't part of the body, move the element back
            // but make sure we hide it from display.
            if (!found && target) {

              // Actually clone this node and replace it in the original
              // layer if needed
              if (target.parentNode && target.cloneNode) {
                var clone = target.cloneNode(true);
                target.parentNode.replaceChild(clone, target);
                target.swapNode = clone; // save for restore later
              }

              // Create a holding pen if needed for these views...
              var pen = SC.touchHoldingPen;
              if (!pen) {
                pen = SC.touchHoldingPen = document.createElement('div');
                pen.style.display = 'none';
                document.body.appendChild(pen);
              }

              // move element back into document...
              pen.appendChild(target);

              // ...and save the element to be garbage collected on touchEnd.
              touches[touch]._rescuedElement = target;
            }
          }
        }
      };
      SC.RunLoop.prototype.endRunLoop = patch;
    }
  },

  /**
    Cleans up the additional transition event listeners.

    NOTE: requires that SC.RootResponser.responder.transitionendEventName
    has been determined.

    @returns {void}
  */
  cleanUpTransitionListeners: function () {
    var actualEventName = SC.platform.transitionendEventName,
      domPrefix = SC.browser.domPrefix,
      lowerDomPrefix = domPrefix.toLowerCase(),
      variation1 = lowerDomPrefix + 'transitionend',
      variation2 = lowerDomPrefix + 'TransitionEnd',
      variation3 = domPrefix + 'TransitionEnd';

    // Once the actual event name is determined, simply remove all the extras.
    // This should prevent any problems with browsers that fire multiple events.
    ['transitionend', variation1, variation2, variation3].forEach(function (keyName) {
      if (keyName !== actualEventName) {
        SC.Event.remove(document, keyName, this, this[keyName]);
        this[keyName] = null;
    }
    });
  },

  /**
    Cleans up the additional animation event listeners.

    NOTE: requires that SC.RootResponser.responder.animationstartEventName,
    SC.RootResponser.responder.animationendEventName and
    SC.RootResponser.responder.animationiterationEventName have been
    determined.

    @returns {void}
  */
  cleanUpAnimationListeners: function () {
    var domPrefix = SC.browser.domPrefix,
      lowerDomPrefix = domPrefix.toLowerCase(),
      actualEventName = SC.platform.animationendEventName,
      variation1 = lowerDomPrefix + 'animationend',
      variation2 = lowerDomPrefix + 'AnimationEnd',
      variation3 = domPrefix + 'AnimationEnd';

    // Once the actual event name is determined, simply remove all the extras.
    // This should prevent any problems with browsers that fire multiple events.
    ['animationend', variation1, variation2, variation3].forEach(function (keyName) {
      if (keyName !== actualEventName) {
        SC.Event.remove(document, keyName, this, this[keyName]);
        this[keyName] = null;
    }
    });

    actualEventName = SC.platform.animationiterationEventName;
    variation1 = lowerDomPrefix + 'animationiteration';
    variation2 = lowerDomPrefix + 'AnimationIteration';
    variation3 = domPrefix + 'AnimationIteration';
    ['animationiteration', variation1, variation2, variation3].forEach(function (keyName) {
      if (keyName !== actualEventName) {
        SC.Event.remove(document, keyName, this, this[keyName]);
        this[keyName] = null;
      }
    });

    actualEventName = SC.platform.animationstartEventName;
    variation1 = lowerDomPrefix + 'animationstart';
    variation2 = lowerDomPrefix + 'AnimationStart';
    variation3 = domPrefix + 'AnimationStart';
    ['animationstart', variation1, variation2, variation3].forEach(function (keyName) {
      if (keyName !== actualEventName) {
        SC.Event.remove(document, keyName, this, this[keyName]);
        this[keyName] = null;
      }
    });
  },

  // ...........................................................................
  // TOUCH SUPPORT
  //

  /**
    @private
    A map from views to internal touch entries.

    Note: the touch entries themselves also reference the views.
  */
  _touchedViews: {},

  /**
    @private
    A map from internal touch ids to the touch entries themselves.

    The touch entry ids currently come from the touch event's identifier.
  */
  _touches: {},

  /**
    Returns the touches that are registered to the specified view or responder; undefined if none.

    When views receive a touch event, they have the option to subscribe to it.
    They are then mapped to touch events and vice-versa. This returns touches mapped to the view.

    This method is also available on SC.Touch objects, and you will usually call it from there.
  */
  touchesForView: function(view) {
    if (this._touchedViews[SC.guidFor(view)]) {
      return this._touchedViews[SC.guidFor(view)].touches;
    }
  },

  /**
    Computes a hash with x, y, and d (distance) properties, containing the average position
    of all touches, and the average distance of all touches from that average. This is useful
    for implementing scaling.

    This method is also available on SC.Touch objects, and you will usually call it from there.

    @param {SC.View} view The view whose touches should be averaged.
    @param {SC.Touch} additionalTouch This method uses touchesForView; if you call it from
        touchStart, that touch will not yet be included in touchesForView. To accommodate this,
        you should pass the view to this method (or pass YES to SC.Touch#averagedTouchesForView's
        `addSelf` argument).
  */
  averagedTouchesForView: function(view, additionalTouch) {
    var t = this.touchesForView(view),
      len, averaged, additionalTouchIsDuplicate;

    // Each view gets its own cached average touches object for performance.
    averaged = view._scrr_averagedTouches || (view._scrr_averagedTouches = {});

    // FAST PATH: no touches to track.
    if ((!t || t.length === 0) && !additionalTouch) {
      averaged.x = 0;
      averaged.y = 0;
      averaged.d = 0;
      averaged.velocityX = 0;
      averaged.velocityY = 0;

    // Otherwise, average the touches.
    } else {
      // Cache the array object used by this method. (Cleared at the end to prevent memory leaks.)
      var touches = this._averagedTouches_touches || (this._averagedTouches_touches = []);

      // copy touches into array
      if (t) {
        var i;
        len = t.length;
        for(i = 0; i < len; i++) {
          touches.push(t[i]);
          if (additionalTouch && t[i] === additionalTouch) additionalTouchIsDuplicate = YES;
        }
      }

      // Add additionalTouch if present and not duplicated.
      if (additionalTouch && !additionalTouchIsDuplicate) touches.push(additionalTouch);

      // Calculate the average.
      SC.Touch.averagedTouch(touches, averaged);

      // Clear the touches array to prevent touch object leaks.
      touches.length = 0;
    }

    return averaged;
  },

  assignTouch: function(touch, view) {
    // sanity-check
    if (touch.hasEnded) throw new Error("Attempt to assign a touch that is already finished.");

    // Fast path, the touch is already assigned to the view.
    if (touch.view === view) return;

    // unassign from old view if necessary
    if (touch.view) {
      this.unassignTouch(touch);
    }

    // create view entry if needed
    if (!this._touchedViews[SC.guidFor(view)]) {
      this._touchedViews[SC.guidFor(view)] = {
        view: view,
        touches: SC.CoreSet.create([]),
        touchCount: 0
      };
      view.set("hasTouch", YES);
    }

    // add touch
    touch.view = view;
    this._touchedViews[SC.guidFor(view)].touches.add(touch);
    this._touchedViews[SC.guidFor(view)].touchCount++;
  },

  unassignTouch: function(touch) {
    // find view entry
    var view, viewEntry;

    // Fast path, the touch is not assigned to a view.
    if (!touch.view) return; // touch.view should===touch.touchResponder eventually :)

    // get view
    view = touch.view;

    // get view entry
    viewEntry = this._touchedViews[SC.guidFor(view)];
    viewEntry.touches.remove(touch);
    viewEntry.touchCount--;

    // remove view entry if needed
    if (viewEntry.touchCount < 1) {
      view.set("hasTouch", NO);
      viewEntry.view = null;
      delete this._touchedViews[SC.guidFor(view)];
    }

    // clear view
    touch.view = undefined;
  },

  _flushQueuedTouchResponder: function(){
    if (this._queuedTouchResponder) {
      var queued = this._queuedTouchResponder;
      this._queuedTouchResponder = null;
      this.makeTouchResponder.apply(this, queued);
    }
  },

  /**
    This method attempts to change the responder for a particular touch. The touch's responder is the
    view which will receive touch events for that touch.

    You will usually not call this method directly, instead calling one of the convenience methods on
    the touch itself. See documentation for SC.Touch for more.

    Possible gotchas:

    - Because this method must search for a view which implements touchStart (without returning NO),
      touchStart is called on the new responder before touchCancelled is called on the old one.
    - While a touch exposes its current responder at `touchResponder` and any previous stacked one at
      `nextTouchResponder`, their relationship is ad hoc and arbitrary, and so are not chained by
      `nextResponder` like in a standard responder chain. To query the touch's current responder stack
      (or, though it's not recommended, change it), check touch.touchResponders.

    @param {SC.Touch} touch
    @param {SC.Responder} responder The view to assign to the touch. (It, or if bubbling then an ancestor,
      must implement touchStart.)
    @param {Boolean} shouldStack Whether the new responder should replace the old one, or stack with it.
      Stacked responders are easy to revert via `SC.Touch#restoreLastTouchResponder`.
    @param {Boolean|SC.Responder} bubblesTo If YES, will attempt to find a `touchStart` responder up the
      responder chain. If NO or undefined, will only check the passed responder. If you pass a responder
      for this argument, the attempt will bubble until it reaches the passed responder, allowing you to
      restrict the bubbling to a portion of the responder chain. ((Note that this responder will not be
      given an opportunity to respond to the event.)
    @returns {Boolean} Whether a valid touch responder was found and assigned.
  */
  makeTouchResponder: function(touch, responder, shouldStack, bubblesTo) {
    // In certain cases (SC.Gesture being one), we have to call makeTouchResponder
    // from inside makeTouchResponder so we queue it up here.
    if (this._isMakingTouchResponder) {
      this._queuedTouchResponder = [touch, responder, shouldStack, bubblesTo];
      return YES; // um?
    }
    this._isMakingTouchResponder = YES;

    var stack = touch.touchResponders, touchesForView;

    // find the actual responder (if any, I suppose)
    // note that the pane's sendEvent function is slightly clever:
    // if the target is already touch responder, it will just return it without calling touchStart
    // we must do the same.
    if (touch.touchResponder === responder) {
      this._isMakingTouchResponder = NO;
      this._flushQueuedTouchResponder();
      return YES; // more um
    }

    // send touchStart
    // get the target pane
    var pane;
    if (responder) pane = responder.get('pane') ;
    else pane = this.get('keyPane') || this.get('mainPane') ;

    // if the responder is not already in the stack...
    if (stack.indexOf(responder) < 0) {

      // if we need to go up the view chain, do so via SC.Pane#sendEvent.
      if (bubblesTo) {
        // if we found a valid pane, send the event to it
        try {
          responder = pane ? pane.sendEvent("touchStart", touch, responder, bubblesTo) : null ;
        } catch (e) {
          SC.Logger.error("Error in touchStart: " + e);
          responder = null;
        }
      } else {
        // If the responder doesn't currently have a touch, or it does but it accepts multitouch, test it. Otherwise it's cool.
        if (responder && ((responder.get ? responder.get("acceptsMultitouch") : responder.acceptsMultitouch) || !responder.hasTouch)) {
          // If it doesn't respond to touchStart, it's no good.
          if (!responder.respondsTo("touchStart")) {
            responder = null;
          }
          // If it returns NO from touchStart, it's no good. Otherwise it's cool.
          else if (responder.touchStart(touch) === NO) {
            responder = null;
          }
        }
      }
    }

    // if the item is in the stack, we will go to it (whether shouldStack is true or not)
    // as it is already stacked
    if (!shouldStack || (stack.indexOf(responder) > -1 && stack[stack.length - 1] !== responder)) {
      // first, we should unassign the touch. Note that we only do this IF WE ARE removing
      // the current touch responder. Otherwise we cause all sorts of headaches; why? Because,
      // if we are not (suppose, for instance, that it is stacked), then the touch does not
      // get passed back to the touch responder-- even while it continues to get events because
      // the touchResponder is still set!
      this.unassignTouch(touch);

      // pop all other items
      var idx = stack.length - 1, last = stack[idx];
      while (last && last !== responder) {
        // unassign the touch
        touchesForView = this.touchesForView(last); // won't even exist if there are no touches

        // send touchCancelled (or, don't, if the view doesn't accept multitouch and it is not the last touch)
        if ((last.get ? last.get("acceptsMultitouch") : last.acceptsMultitouch) || !touchesForView) {
          if (last.touchCancelled) last.touchCancelled(touch);
        }

        // go to next (if < 0, it will be undefined, so lovely)
        idx--;
        last = stack[idx];

        // update responders (for consistency)
        stack.pop();

        touch.touchResponder = stack[idx];
        touch.nextTouchResponder = stack[idx - 1];
      }

    }

    // now that we've popped off, we can push on
    if (responder) {
      this.assignTouch(touch, responder);

      // keep in mind, it could be one we popped off _to_ above...
      if (responder !== touch.touchResponder) {
        stack.push(responder);

        // update responder helpers
        touch.touchResponder = responder;
        touch.nextTouchResponder = stack[stack.length - 2];
      }
    }

    // Unflag that this method is running, and flush the queue if any.
    this._isMakingTouchResponder = NO;
    this._flushQueuedTouchResponder(); // this may need to be &&'ed with the responder to give the correct return value...

    return !!responder;
  },

  /**
    Before the touchStart event is sent up the usual responder chain, the views along that same responder chain
    are given the opportunity to capture the touch event, preventing child views (including the target) from
    hearing about it. This of course proceeds in the opposite direction from a usual event bubbling, starting at
    the target's first ancestor and proceeding towards the target. This method implements the capture phase.

    If no view captures the touch, this method will return NO, and makeTouchResponder is then called for the
    target, proceeding with standard target-to-pane event bubbling for `touchStart`.

    For an example of captureTouch in action, see SC.ScrollView's touch handling, which by default captures the
    touch and holds it for 150ms to allow it to determine whether the user is tapping or scrolling.

    You will usually not call this method yourself, and if you do, you should call the corresponding convenience
    method on the touch itself.

    @param {SC.Touch} touch The touch to offer up for capture.
    @param {?SC.Responder} startingPoint The view whose children should be given an opportunity to capture
      the event. (The starting point itself is not asked.)
    @param {Boolean} shouldStack Whether any capturing responder should stack with existing responders.
      Stacked responders are easy to revert via `SC.Touch#restoreLastTouchResponder`.

    @returns {Boolean} Whether or not the touch was captured. If it was not, you should pass it to
      `makeTouchResponder` for standard event bubbling.
  */
  captureTouch: function(touch, startingPoint, shouldStack) {
    if (!startingPoint) startingPoint = this;

    var target = touch.targetView, view = target,
        chain = [], idx, len;

    
    if (SC.LOG_TOUCH_EVENTS) {
      SC.Logger.info('  -- Received one touch on %@'.fmt(target.toString()));
    }
    
    // Generate the captureTouch responder chain by working backwards from the target
    // to the starting point. (Don't include the starting point.)
    while (view && (view !== startingPoint)) {
      chain.unshift(view);
      view = view.get('nextResponder');
    }

    // work down the chain
    for (len = chain.length, idx = 0; idx < len; idx++) {
      view = chain[idx];
      
      if (SC.LOG_TOUCH_EVENTS) SC.Logger.info('  -- Checking %@ for captureTouch response…'.fmt(view.toString()));
      

      // see if it captured the touch
      if (view.tryToPerform('captureTouch', touch)) {
        
        if (SC.LOG_TOUCH_EVENTS) SC.Logger.info('   -- Making %@ touch responder because it returns YES to captureTouch'.fmt(view.toString()));
        

        // if so, make it the touch's responder
        this.makeTouchResponder(touch, view, shouldStack, startingPoint); // (touch, target, should stack, bubbles back to startingPoint, or all the way up.)
        return YES; // and that's all we need
      }
    }

    
    if (SC.LOG_TOUCH_EVENTS) SC.Logger.info("   -- Didn't find a view that returned YES to captureTouch.");
    

    return NO;
  },

  
  /** @private
    Artificially calls endTouch for any touch which is no longer present. This is necessary because
    _sometimes_, WebKit ends up not sending endtouch.
  */
  endMissingTouches: function(presentTouches) {
    var idx, len = presentTouches.length, map = {}, end = [];

    // make a map of what touches _are_ present
    for (idx = 0; idx < len; idx++) {
      map[presentTouches[idx].identifier] = YES;
    }

    // check if any of the touches we have recorded are NOT present
    for (idx in this._touches) {
      var id = this._touches[idx].identifier;
      if (!map[id]) end.push(this._touches[idx]);
    }

    // end said touches
    if (end.length) {
      console.warn('Ending missing touches: ' + end.toString());
    }
    for (idx = 0, len = end.length; idx < len; idx++) {
      this.endTouch(end[idx]);
      this.finishTouch(end[idx]);
    }
  },
  

  _touchCount: 0,

  /** @private
    Ends a specific touch (for a bit, at least). This does not "finish" a touch; it merely calls
    touchEnd, touchCancelled, etc. A re-dispatch (through recapture or makeTouchResponder) will terminate
    the process; it would have to be restarted separately, through touch.end().
  */
  endTouch: function(touchEntry, action, evt) {
    if (!action) { action = "touchEnd"; }

    var responderIdx, responders, responder, originalResponder;

    // unassign
    this.unassignTouch(touchEntry);

    // call end for all items in chain
    if (touchEntry.touchResponder) {
      originalResponder = touchEntry.touchResponder;

      responders = touchEntry.touchResponders;
      responderIdx = responders.length - 1;
      responder = responders[responderIdx];
      while (responder) {
        if (responder[action]) { responder[action](touchEntry, evt); }

        // check to see if the responder changed, and stop immediately if so.
        if (touchEntry.touchResponder !== originalResponder) { break; }

        // next
        responderIdx--;
        responder = responders[responderIdx];
        action = "touchCancelled"; // any further ones receive cancelled
      }
    }
  },

  /**
    @private
    "Finishes" a touch. That is, it eradicates it from our touch entries and removes all responder, etc. properties.
  */
  finishTouch: function(touch) {
    // ensure the touch is indeed unassigned.
    this.unassignTouch(touch);

    // If we rescued this touch's initial element, we should remove it
    // from the DOM and garbage collect now. See setup() for an
    // explanation of this bug/workaround.
    var elem = touch._rescuedElement;
    if (elem) {
      if (elem.swapNode && elem.swapNode.parentNode) {
        elem.swapNode.parentNode.replaceChild(elem, elem.swapNode);
      } else if (elem.parentNode === SC.touchHoldingPen) {
        SC.touchHoldingPen.removeChild(elem);
      }
      delete touch._rescuedElement;
      elem.swapNode = null;
      elem = null;
    }

    // clear responders (just to be thorough)
    touch.touchResponders = null;
    touch.touchResponder = null;
    touch.nextTouchResponder = null;
    touch.hasEnded = YES;

    // and remove from our set
    if (this._touches[touch.identifier]) delete this._touches[touch.identifier];
  },

  /** @private
    Called when the user touches their finger to the screen. This method
    dispatches the touchstart event to the appropriate view.

    We may receive a touchstart event for each touch, or we may receive a
    single touchstart event with multiple touches, so we may have to dispatch
    events to multiple views.

    @param {Event} evt the event
    @returns {Boolean}
  */
  touchstart: function(evt) {
    // Starting iOS5 touch events are handled by textfields.
    // As a workaround just let the browser to use the default behavior.
    if(this.ignoreTouchHandle(evt)) return YES;

    var hidingTouchIntercept = NO;

    SC.run(function() {
      
      // When using breakpoints on touch start, we will lose the end touch event.
      this.endMissingTouches(evt.touches);
      

      // loop through changed touches, calling touchStart, etc.
      var changedTouches = evt.changedTouches,
          len = changedTouches.length,
          idx,
          touch, touchEntry;

      // prepare event for touch mapping.
      evt.touchContext = this;

      // Loop through each touch we received in this event
      for (idx = 0; idx < len; idx++) {
        touch = changedTouches[idx];

        // Create an SC.Touch instance for every touch.
        touchEntry = SC.Touch.create(touch, this);

        // skip the touch if there was no target
        if (!touchEntry.targetView) continue;

        // account for hidden touch intercept (passing through touches, etc.)
        if (touchEntry.hidesTouchIntercept) hidingTouchIntercept = YES;

        // set timestamp
        touchEntry.timeStamp = evt.timeStamp;

        // Store the SC.Touch object. We use the identifier property (provided
        // by the browser) to disambiguate between touches. These will be used
        // later to determine if the touches have changed.
        this._touches[touch.identifier] = touchEntry;

        // set the event (so default action, etc. can be stopped)
        touchEntry.event = evt; // will be unset momentarily

        // First we allow any view in the responder chain to capture the touch, before triggering the standard touchStart
        // handler chain.
        var captured = this.captureTouch(touchEntry, this);
        if (!captured) this.makeTouchResponder(touchEntry, touchEntry.targetView, NO, YES); // (touch, target, shouldn't stack, bubbles all the way)

        // Unset the reference to the original event so we can garbage collect.
        touchEntry.event = null;
      }

      evt.touchContext = null;
    }, this);

    // hack for text fields
    if (hidingTouchIntercept) {
      return YES;
    }

    return evt.hasCustomEventHandling;
  },

  /**
    @private
    used to keep track of when a specific type of touch event was last handled, to see if it needs to be re-handled
  */
  touchmove: function(evt) {
    // Starting iOS5 touch events are handled by textfields.
    // As a workaround just let the browser to use the default behavior.
    if(this.ignoreTouchHandle(evt)) return YES;

    SC.run(function() {
      // pretty much all we gotta do is update touches, and figure out which views need updating.
      var touches = evt.changedTouches, touch, touchEntry,
          idx, len = touches.length, view, changedTouches, viewTouches, firstTouch,
          changedViews = {}, guid, hidingTouchIntercept = NO;

      if (this._drag) {
        touch = SC.Touch.create(evt.changedTouches[0], this);
        this._drag.tryToPerform('mouseDragged', touch);
      }

      // figure out what views had touches changed, and update our internal touch objects
      for (idx = 0; idx < len; idx++) {
        touch = touches[idx];

        // get our touch
        touchEntry = this._touches[touch.identifier];

        // we may have no touch entry; this can happen if somehow the touch came to a non-SC area.
        if (!touchEntry) {
          continue;
        }

        if (touchEntry.hidesTouchIntercept) hidingTouchIntercept = YES;

        // update touch velocity (moving average)
        var duration = evt.timeStamp - touchEntry.timeStamp,
          velocityLambda, latestXVelocity, latestYVelocity;
        // Given uneven timing between events, we should give less weight to shorter (less accurate)
        // events, with no consideration at all given zero-time events.
        if (duration !== 0) {
          // Lambda (how heavily we're weighting the latest number)
          velocityLambda = Math.min(1, duration / 80);
          // X
          latestXVelocity = (touch.pageX - touchEntry.pageX) / duration;
          touchEntry.velocityX = (1.0 - velocityLambda) * touchEntry.velocityX + velocityLambda * (latestXVelocity);
          // Y
          latestYVelocity = (touch.pageY - touchEntry.pageY) / duration;
          touchEntry.velocityY = (1.0 - velocityLambda) * touchEntry.velocityY + velocityLambda * (latestYVelocity);
        }

        // update touch position et al.
        touchEntry.pageX = touch.pageX;
        touchEntry.pageY = touch.pageY;
        touchEntry.clientX = touch.clientX;
        touchEntry.clientY = touch.clientY;
        touchEntry.screenX = touch.screenX;
        touchEntry.screenY = touch.screenY;
        touchEntry.timeStamp = evt.timeStamp;
        touchEntry.type = evt.type;
        touchEntry.event = evt;

        // if the touch entry has a view
        if (touchEntry.touchResponder) {
          view = touchEntry.touchResponder;

          guid = SC.guidFor(view);
          // create a view entry
          if (!changedViews[guid]) changedViews[guid] = { "view": view, "touches": [] };

          // add touch
          changedViews[guid].touches.push(touchEntry);
        }
      }

      // HACK: DISABLE OTHER TOUCH DRAGS WHILE MESSING WITH TEXT FIELDS
      if (hidingTouchIntercept) {
        evt.allowDefault();
        return YES;
      }

      // loop through changed views and send events
      for (idx in changedViews) {
        // get info
        view = changedViews[idx].view;
        changedTouches = changedViews[idx].touches;

        // prepare event; note that views often won't use this method anyway (they'll call touchesForView instead)
        evt.viewChangedTouches = changedTouches;

        // the first VIEW touch should be the touch info sent
        viewTouches = this.touchesForView(view);
        firstTouch = viewTouches.firstObject();

        // Load the event up with data from the first touch. THIS IS FOR CONVENIENCE ONLY in cases where the developer
        // only cares about one touch.
        evt.pageX = firstTouch.pageX;
        evt.pageY = firstTouch.pageY;
        evt.clientX = firstTouch.clientX;
        evt.clientY = firstTouch.clientY;
        evt.screenX = firstTouch.screenX;
        evt.screenY = firstTouch.screenY;
        evt.startX = firstTouch.startX;
        evt.startY = firstTouch.startY;
        evt.velocityX = firstTouch.velocityX;
        evt.velocityY = firstTouch.velocityY;
        evt.touchContext = this; // Injects the root responder so it can call e.g. `touchesForView`.

        // Give the view a chance to handle touchesDragged. (Don't bubble; viewTouches is view-specific.)
        view.tryToPerform("touchesDragged", evt, viewTouches);
      }

      // clear references to event
      touches = evt.changedTouches;
      len = touches.length;
      for (idx = 0; idx < len; idx++) {
        touch = touches[idx];
        touchEntry = this._touches[touch.identifier];
        if (touchEntry) touchEntry.event = null;
      }
      evt.touchContext = null;
      evt.viewChangedTouches = null;
    }, this);

    return evt.hasCustomEventHandling;
  },

  touchend: function(evt) {
    var hidesTouchIntercept = NO;

    // Starting iOS5 touch events are handled by textfields.
    // As a workaround just let the browser to use the default behavior.
    if(this.ignoreTouchHandle(evt)) return YES;

    SC.run(function() {
      var touches = evt.changedTouches, touch, touchEntry,
          idx, len = touches.length,
          action = evt.isCancel ? "touchCancelled" : "touchEnd";

      for (idx = 0; idx < len; idx++) {
        //get touch+entry
        touch = touches[idx];
        touch.type = 'touchend';
        touchEntry = this._touches[touch.identifier];

        // check if there is an entry
        if (!touchEntry) continue;

        // update touch velocity (moving average)
        var duration = evt.timeStamp - touchEntry.timeStamp,
          velocityLambda, latestXVelocity, latestYVelocity;
        // Given uneven timing between events, we should give less weight to shorter (less accurate)
        // events, with no consideration at all given zero-time events.
        if (duration !== 0) {
          // Lambda (how heavily we're weighting the latest number)
          velocityLambda = Math.min(1, duration / 80);
          // X
          latestXVelocity = (touch.pageX - touchEntry.pageX) / duration;
          touchEntry.velocityX = (1.0 - velocityLambda) * touchEntry.velocityX + velocityLambda * (latestXVelocity);
          // Y
          latestYVelocity = (touch.pageY - touchEntry.pageY) / duration;
          touchEntry.velocityY = (1.0 - velocityLambda) * touchEntry.velocityY + velocityLambda * (latestYVelocity);
        }

        // update touch position et al.
        touchEntry.timeStamp = evt.timeStamp;
        touchEntry.pageX = touch.pageX;
        touchEntry.pageY = touch.pageY;
        touchEntry.clientX = touch.clientX;
        touchEntry.clientY = touch.clientY;
        touchEntry.screenX = touch.screenX;
        touchEntry.screenY = touch.screenY;
        touchEntry.type = 'touchend';
        touchEntry.event = evt;

        
        if (SC.LOG_TOUCH_EVENTS) SC.Logger.info('-- Received touch end');
        
        if (touchEntry.hidesTouchIntercept) {
          touchEntry.unhideTouchIntercept();
          hidesTouchIntercept = YES;
        }

        if (this._drag) {
          this._drag.tryToPerform('mouseUp', touch) ;
          this._drag = null ;
        }

        // unassign
        this.endTouch(touchEntry, action, evt);
        this.finishTouch(touchEntry);
      }
    }, this);


    // for text fields
    if (hidesTouchIntercept) {
      return YES;
    }

    return evt.hasCustomEventHandling;
  },

  /** @private
    Handle touch cancel event.  Works just like cancelling a touch for any other reason.
    touchend handles it as a special case (sending cancel instead of end if needed).
  */
  touchcancel: function(evt) {
    evt.isCancel = YES;
    this.touchend(evt);
  },

  /** @private
     Ignore Touch events on textfields and links. starting iOS 5 textfields
     get touch events. Textfields just need to get the default focus action.
  */
  ignoreTouchHandle: function(evt) {
    if(SC.browser.isMobileSafari){
      var tag = evt.target.tagName;
      if(tag==="INPUT" || tag==="TEXTAREA" || tag==="A" || tag==="SELECT"){
        evt.allowDefault();
        return YES;
      }
    }
    return NO;
  },

  // ..........................................................
  // KEYBOARD HANDLING
  //


  /**
    Invoked on a keyDown event that is not handled by any actual value.  This
    will get the key equivalent string and then walk down the keyPane, then
    the focusedPane, then the mainPane, looking for someone to handle it.
    Note that this will walk DOWN the view hierarchy, not up it like most.

    @returns {Object} Object that handled evet or null
  */
  attemptKeyEquivalent: function(evt) {
    var ret = null ;

    // keystring is a method name representing the keys pressed (i.e
    // 'alt_shift_escape')
    var keystring = evt.commandCodes()[0];

    // couldn't build a keystring for this key event, nothing to do
    if (!keystring) return NO;

    var menuPane = this.get('menuPane'),
        keyPane  = this.get('keyPane'),
        mainPane = this.get('mainPane');

    if (menuPane) {
      ret = menuPane.performKeyEquivalent(keystring, evt) ;
      if (ret) return ret;
    }

    // Try the keyPane.  If it's modal, then try the equivalent there but on
    // nobody else.
    if (keyPane) {
      ret = keyPane.performKeyEquivalent(keystring, evt) ;
      if (ret || keyPane.get('isModal')) return ret ;
    }

    // if not, then try the main pane
    if (!ret && mainPane && (mainPane!==keyPane)) {
      ret = mainPane.performKeyEquivalent(keystring, evt);
      if (ret || mainPane.get('isModal')) return ret ;
    }

    return ret ;
  },

  _lastModifiers: null,

  /** @private
    Modifier key changes are notified with a keydown event in most browsers.
    We turn this into a flagsChanged keyboard event.  Normally this does not
    stop the normal browser behavior.
  */
  _handleModifierChanges: function(evt) {
    // if the modifier keys have changed, then notify the first responder.
    var m;
    m = this._lastModifiers = (this._lastModifiers || { alt: false, ctrl: false, shift: false });

    var changed = false;
    if (evt.altKey !== m.alt) {
      m.alt = evt.altKey;
      changed = true;
    }

    if (evt.ctrlKey !== m.ctrl) {
      m.ctrl = evt.ctrlKey;
      changed = true;
    }

    if (evt.shiftKey !== m.shift) {
      m.shift = evt.shiftKey;
      changed = true;
    }
    evt.modifiers = m; // save on event

    return (changed) ? (this.sendEvent('flagsChanged', evt) ? evt.hasCustomEventHandling : YES) : YES ;
  },

  /** @private
    Determines if the keyDown event is a nonprintable or function key. These
    kinds of events are processed as keyboard shortcuts.  If no shortcut
    handles the event, then it will be sent as a regular keyDown event.
    This function is only valid when called with a keydown event.
  */
  _isFunctionOrNonPrintableKey: function(evt) {
    return !!(evt.altKey || evt.ctrlKey || evt.metaKey || SC.FUNCTION_KEYS[evt.which]);
  },

  /** @private
    Determines if the event simply reflects a modifier key change.  These
    events may generate a flagsChanged event, but are otherwise ignored.
  */
  _isModifierKey: function(evt) {
    return !!SC.MODIFIER_KEYS[evt.charCode];
  },

   /**
     @private
     Determines if the key is printable (and therefore should be dispatched from keypress).
     Some browsers send backspace, tab, enter, and escape on keypress, so we want to
     explicitly ignore those here.

     @param {KeyboardEvent} evt keypress event
     @returns {Boolean}
   */
  _isPrintableKey: function (evt) {
    return ((evt.originalEvent.which === undefined || evt.originalEvent.which > 0) &&
      !(evt.which === 8 || evt.which === 9 || evt.which === 13 || evt.which === 27));
  },

  /** @private
    The keydown event occurs whenever the physically depressed key changes.
    This event is used to deliver the flagsChanged event and to with function
    keys and keyboard shortcuts.

    All actions that might cause an actual insertion of text are handled in
    the keypress event.

    References:
        http://www.quirksmode.org/js/keys.html
        https://developer.mozilla.org/en/DOM/KeyboardEvent
        http://msdn.microsoft.com/library/ff974342.aspx
  */
  keydown: function(evt) {
    if (SC.none(evt)) return YES;
    var keyCode = evt.keyCode;
    if (SC.browser.isMozilla && evt.keyCode===9) {
      this.keydownCounter = 1;
    }
    // Fix for IME input (japanese, mandarin).
    // If the KeyCode is 229 wait for the keyup and
    // trigger a keyDown if it is is enter onKeyup.
    if (keyCode===229){
      this._IMEInputON = YES;
      return this.sendEvent('keyDown', evt);
    }

    // If user presses the escape key while we are in the middle of a
    // drag operation, cancel the drag operation and handle the event.
    if (keyCode === 27 && this._drag) {
      this._drag.cancelDrag(evt);
      this._drag = null;
      this._mouseDownView = null;
      return YES;
    }

    // Firefox does NOT handle delete here...
    if (SC.browser.isMozilla && (evt.which === 8)) return true ;

    // modifier keys are handled separately by the 'flagsChanged' event
    // send event for modifier key changes, but only stop processing if this
    // is only a modifier change
    var ret = this._handleModifierChanges(evt),
        target = evt.target || evt.srcElement,
        forceBlock = (evt.which === 8) && !SC.allowsBackspaceToPreviousPage && (target === document.body);

    if (this._isModifierKey(evt)) return (forceBlock ? NO : ret);

    // if this is a function or non-printable key, try to use this as a key
    // equivalent.  Otherwise, send as a keyDown event so that the focused
    // responder can do something useful with the event.
    ret = YES ;
    if (this._isFunctionOrNonPrintableKey(evt)) {
      // otherwise, send as keyDown event.  If no one was interested in this
      // keyDown event (probably the case), just let the browser do its own
      // processing.

      // Arrow keys are handled in keypress for firefox
      if (keyCode>=37 && keyCode<=40 && SC.browser.isMozilla) return YES;

      ret = this.sendEvent('keyDown', evt) ;

      // attempt key equivalent if key not handled
      if (!ret) {
        SC.run(function () {
        ret = !this.attemptKeyEquivalent(evt) ;
        }, this);
      } else {
        ret = evt.hasCustomEventHandling ;
        if (ret) forceBlock = NO ; // code asked explicitly to let delete go
      }
    }

    return forceBlock ? NO : ret ;
  },

  /** @private
    The keypress event occurs after the user has typed something useful that
    the browser would like to insert.  Unlike keydown, the input codes here
    have been processed to reflect that actual text you might want to insert.

    Normally ignore any function or non-printable key events.  Otherwise, just
    trigger a keyDown.
  */
  keypress: function(evt) {
    var ret,
        keyCode   = evt.keyCode,
        isFirefox = SC.browser.isMozilla;

    if (isFirefox && evt.keyCode===9) {
      this.keydownCounter++;
      if (this.keydownCounter === 2) return YES;
    }

    // delete is handled in keydown() for most browsers
    if (isFirefox && (evt.which === 8)) {
      //get the keycode and set it for which.
      evt.which = keyCode;
      ret = this.sendEvent('keyDown', evt);
      return ret ? (SC.allowsBackspaceToPreviousPage || evt.hasCustomEventHandling) : YES ;

    // normal processing.  send keyDown for printable keys...
    //there is a special case for arrow key repeating of events in FF.
    } else {
      var isFirefoxArrowKeys = (keyCode >= 37 && keyCode <= 40 && isFirefox),
          charCode           = evt.charCode;

      if ((charCode !== undefined && charCode === 0 && evt.keyCode!==9) && !isFirefoxArrowKeys) return YES;
      if (isFirefoxArrowKeys) evt.which = keyCode;
      // we only want to rethrow if this is a printable key so that we don't
      // duplicate the event sent in keydown when a modifier key is pressed.
      if (isFirefoxArrowKeys || this._isPrintableKey(evt)) {
        return this.sendEvent('keyDown', evt) ? evt.hasCustomEventHandling : YES;
    }
    }
  },

  keyup: function(evt) {
    // to end the simulation of keypress in firefox set the _ffevt to null
    if(this._ffevt) this._ffevt=null;

    // modifier keys are handled separately by the 'flagsChanged' event
    // send event for modifier key changes, but only stop processing if this is only a modifier change
    var ret = this._handleModifierChanges(evt);
    if (this._isModifierKey(evt)) return ret;
    // Fix for IME input (japanese, mandarin).
    // If the KeyCode is 229 wait for the keyup and
    // trigger a keyDown if it is is enter onKeyup.
    if (this._IMEInputON && evt.keyCode===13){
      evt.isIMEInput = YES;
      this.sendEvent('keyDown', evt);
      this._IMEInputON = NO;
    }
    return this.sendEvent('keyUp', evt) ? evt.hasCustomEventHandling:YES;
  },

  /**
    IE's default behavior to blur textfields and other controls can only be
    blocked by returning NO to this event. However we don't want to block
    its default behavior otherwise textfields won't lose focus by clicking on
    an empty area as it's expected. If you want to block IE from blurring another
    control set blockIEDeactivate to true on the specific view in which you
    want to avoid this. Think of an autocomplete menu, you want to click on
    the menu but don't loose focus.
  */
  beforedeactivate: function(evt) {
    var toElement = evt.toElement;
    if (toElement && toElement.tagName && toElement.tagName!=="IFRAME") {
      var view = SC.viewFor(toElement);
      //The following line is necessary to allow/block text selection for IE,
      // in combination with the selectstart event.
      if (view && view.get('blocksIEDeactivate')) return NO;
    }
    return YES;
  },

  // ..........................................................
  // MOUSE HANDLING
  //

  mousedown: function(evt) {
    // First, save the click count. The click count resets if the mouse down
    // event occurs more than 250 ms later than the mouse up event or more
    // than 8 pixels away from the mouse down event or if the button used is different.
    this._clickCount += 1;

    var view = this.targetViewForEvent(evt);

    view = this._mouseDownView = this.sendEvent('mouseDown', evt, view) ;
    if (view && view.respondsTo('mouseDragged')) this._mouseCanDrag = YES ;

    // Determine if any views took responsibility for the event. If so, save that information so we
    // can prevent the next click event we receive from propagating to the browser.
    var ret = view ? evt.hasCustomEventHandling : YES;
    this._lastMouseDownCustomHandling = ret;

    // If it has been too long since the last click, the handler has changed or the mouse has moved
    // too far, reset the click count.
    if (!this._lastMouseUpAt || this._lastMouseDownView !== this._mouseDownView || ((Date.now() - this._lastMouseUpAt) > 250)) {
      this._clickCount = 1;
    } else {
      var deltaX = this._lastMouseDownX - evt.clientX,
          deltaY = this._lastMouseDownY - evt.clientY,
          distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY) ;

      if (distance > 8.0) this._clickCount = 1;
    }
    evt.clickCount = this._clickCount;

    // Cache the handler and point of the last mouse down in order to determine whether a successive mouse down should
    // still increment the click count.
    this._lastMouseDownView = this._mouseDownView;
    this._lastMouseDownX = evt.clientX;
    this._lastMouseDownY = evt.clientY;

    return ret;
  },

  /**
    mouseUp only gets delivered to the view that handled the mouseDown evt.
    we also handle click and double click notifications through here to
    ensure consistant delivery.  Note that if mouseDownView is not
    implemented, then no mouseUp event will be sent, but a click will be
    sent.
  */
  mouseup: function(evt) {
    var clickOrDoubleClickDidTrigger = NO,
      dragView = this._drag,
      handler = null;

    if (dragView) {
      SC.run(function () {
        dragView.tryToPerform('mouseUp', evt);
      });
    } else {
      var view = this._mouseDownView,
        targetView = this.targetViewForEvent(evt);

      // record click count.
      evt.clickCount = this._clickCount ;

      // attempt the mouseup call only if there's a target.
      // don't want a mouseup going to anyone unless they handled the mousedown...
      if (view) {
        handler = this.sendEvent('mouseUp', evt, view) ;

        // try doubleClick
        if (!handler && this._clickCount === 2) {
          handler = this.sendEvent('doubleClick', evt, view) ;
          clickOrDoubleClickDidTrigger = YES;
        }

        // try single click
        if (!handler) {
          handler = this.sendEvent('click', evt, view) ;
          clickOrDoubleClickDidTrigger = YES;
        }
      }

      // try whoever's under the mouse if we haven't handle the mouse up yet
      if (!handler && !clickOrDoubleClickDidTrigger) {

        // try doubleClick
        if (this._clickCount === 2) {
          handler = this.sendEvent('doubleClick', evt, targetView);
        }

        // try singleClick
        if (!handler) {
          handler = this.sendEvent('click', evt, targetView) ;
        }
      }
    }

    // cleanup
    this._mouseCanDrag = NO;
    this._mouseDownView = this._drag = null;

    // Save timestamp of mouseup at last possible moment.
    // (This is used to calculate double click events)
    this._lastMouseUpAt = Date.now() ;

    // Determine if any views took responsibility for the
    // event. If so, save that information so we can prevent
    // the next click event we receive from propagating to the browser.
    var ret = handler ? evt.hasCustomEventHandling : YES;
    this._lastMouseUpCustomHandling = ret;

    return ret;
  },

  /**
    Certain browsers ignore us overriding mouseup and mousedown events and
    still allow default behavior (such as navigating away when the user clicks
    on a link). To block default behavior, we store whether or not the last
    mouseup or mousedown events resulted in us calling preventDefault() or
    stopPropagation(), in which case we make the same calls on the click event.

    @param {Event} evt the click event
    @returns {Boolean} whether the event should be propagated to the browser
  */
  click: function(evt) {
    if (!this._lastMouseUpCustomHandling || !this._lastMouseDownCustomHandling) {
      evt.preventDefault();
      evt.stopPropagation();
      return NO;
    }

    return YES;
  },

  dblclick: function(evt){
    if (SC.browser.isIE8OrLower) {
      this._clickCount = 2;
      // this._onmouseup(evt);
      this.mouseup(evt);
    }
  },

  mousewheel: function(evt) {
    var view = this.targetViewForEvent(evt) ,
        handler = this.sendEvent('mouseWheel', evt, view) ;

    return (handler) ? evt.hasCustomEventHandling : YES ;
  },

  _lastHovered: null,

  /**
   This will send mouseEntered, mouseExited, mousedDragged and mouseMoved
   to the views you hover over.  To receive these events, you must implement
   the method. If any subviews implement them and return true, then you won't
   receive any notices.

   If there is a target mouseDown view, then mouse moved events will also
   trigger calls to mouseDragged.
  */
  mousemove: function(evt) {

    if (SC.browser.isIE) {
      if (this._lastMoveX === evt.clientX && this._lastMoveY === evt.clientY) return;
    }

    // We'll record the last positions in all browsers, in case a special pane
    // or some such UI absolutely needs this information.
    this._lastMoveX = evt.clientX;
    this._lastMoveY = evt.clientY;

    SC.run(function() {
      var dragView = this._drag;

       // make sure the view gets focus no matter what.  FF is inconsistent
       // about this.
      // this.focus();
       // only do mouse[Moved|Entered|Exited|Dragged] if not in a drag session
       // drags send their own events, e.g. drag[Moved|Entered|Exited]
      if (dragView) {
         //IE triggers mousemove at the same time as mousedown
         if(SC.browser.isIE){
           if (this._lastMouseDownX !== evt.clientX || this._lastMouseDownY !== evt.clientY) {
            dragView.tryToPerform('mouseDragged', evt);
           }
        } else {
          dragView.tryToPerform('mouseDragged', evt);
         }
       } else {
        var lh = this._lastHovered || [], nh = [], loc, len,
             view = this.targetViewForEvent(evt) ;

         // first collect all the responding view starting with the
         // target view from the given mouse move event
         while (view && (view !== this)) {
           nh.push(view);
           view = view.get('nextResponder');
         }
         // next exit views that are no longer part of the
         // responding chain
         for (loc=0, len=lh.length; loc < len; loc++) {
           view = lh[loc] ;
          if (nh.indexOf(view) === -1 && !view.isDestroyed) { // Usually we don't want to have to manually check isDestroyed, but in this case we're explicitly checking an out-of-date cache.
             view.tryToPerform('mouseExited', evt);
           }
         }
         // finally, either perform mouse moved or mouse entered depending on
         // whether a responding view was or was not part of the last
         // hovered views
         for (loc=0, len=nh.length; loc < len; loc++) {
           view = nh[loc];
           if (lh.indexOf(view) !== -1) {
             view.tryToPerform('mouseMoved', evt);
           } else {
             view.tryToPerform('mouseEntered', evt);
           }
         }
         // Keep track of the view that were last hovered
         this._lastHovered = nh;
         // also, if a mouseDownView exists, call the mouseDragged action, if
         // it exists.
         if (this._mouseDownView) {
           if(SC.browser.isIE){
             if (this._lastMouseDownX !== evt.clientX && this._lastMouseDownY !== evt.clientY) {
               this._mouseDownView.tryToPerform('mouseDragged', evt);
             }
           }
           else {
             this._mouseDownView.tryToPerform('mouseDragged', evt);
           }
         }
       }
    }, this);
  },

  // These event handlers prevent default file handling, and enable the dataDrag API.
  /** @private The dragenter event comes from the browser when a data-ful drag enters any element. */
  dragenter: function(evt) {
    SC.run(function() { this._dragenter(evt); }, this);
  },

  /** @private */
  _dragenter: function(evt) {
    if (!this._dragCounter) {
      this._dragCounter = 1;
    }
    else this._dragCounter++;
    return this._dragover(evt);
  },

  /** @private The dragleave event comes from the browser when a data-ful drag leaves any element. */
  dragleave: function(evt) {
    SC.run(function() { this._dragleave(evt); }, this);
  },

  /** @private */
  _dragleave: function(evt) {
    this._dragCounter--;
    var ret = this._dragover(evt);
    return ret;
  },
  /** @private
    Dragleave doesn't fire reliably in all browsers, so this method forces it (scheduled below). Note
    that, being scheduled via SC.Timer, this method is already in a run loop.
  */
  _forceDragLeave: function() {
    // Give it another runloop to ensure that we're not in the middle of a drag.
    this.invokeLast(function() {
      if (this._dragCounter === 0) return;
      this._dragCounter = 0;
      var evt = this._lastDraggedEvt;
      this._dragover(evt);
    });
  },

  /** @private This event fires continuously while the dataful drag is over the document. */
  dragover: function(evt) {
    SC.run(function() { this._dragover(evt); }, this);
  },

  /** @private */
  _dragover: function(evt) {
    // If it's a file being dragged, prevent the default (leaving the app and opening the file).
    if (evt.dataTransfer.types && (evt.dataTransfer.types.contains('Files') || evt.dataTransfer.types.contains('text/uri-list'))) {
      evt.preventDefault();
      evt.stopPropagation();
      // Set the default drag effect to 'none'. Views may reverse this if they wish.
      evt.dataTransfer.dropEffect = 'none';
    }

    // Walk the responder chain, alerting anyone that would like to know.
    var ld = this._lastDraggedOver || [], nd = [], loc, len,
        view = this.targetViewForEvent(evt);

    // Build the responder chain, starting with the view's target and (presumably) moving
    // up through parentViews to the pane.
    while (view && (view !== this)) {
      nd.push(view);
      view = view.get('nextResponder');
    }

    // Invalidate the force-drag-leave timer, if we have one set up.
    if (this._dragLeaveTimer) this._dragLeaveTimer.invalidate();

    // If this is our final drag event then we've left the document and everybody gets a
    // dataDragExited.
    if (this._dragCounter === 0) {
      for (loc = 0, len = nd.length; loc < len; loc++) {
        view = nd[loc];
        view.tryToPerform('dataDragExited', evt);
      }
      this._lastDraggedOver = this._lastDraggedEvt = this._dragLeaveTimer = null;
    }
    // Otherwise, we process the responder chain normally, ignoring dragleaves.
    // (We skip dragleave events because they are sent after the adjacent dragenter event; checking
    // through both stacks would result in views being exited, re-entered and re-exited each time.
    // As a consequence, views are left ignorant of a very small number of dragleave events; those
    // shouldn't end up being the crucial just-before-drop events, though, so they should be of no
    // consequence.)
    else if (evt.type !== 'dragleave') {
      // First, exit views that are no longer part of the responder chain, child to parent.
      for (loc = 0, len = ld.length; loc < len; loc++) {
        view = ld[loc];
        if (nd.indexOf(view) === -1) {
          view.tryToPerform('dataDragExited', evt);
        }
      }
      // Next, enter views that have just joined the responder chain, parent to child.
      for (loc = nd.length - 1; loc >= 0; loc--) {
        view = nd[loc];
        if (ld.indexOf(view) === -1) {
          view.tryToPerform('dataDragEntered', evt);
        }
      }
      // Finally, send hover events to everybody.
      for (loc = 0, len = nd.length; loc < len; loc++) {
        view = nd[loc];
        view.tryToPerform('dataDragHovered', evt);
      }
      this._lastDraggedOver = nd;
      this._lastDraggedEvt = evt;
      // For browsers that don't reliably call a dragleave for every dragenter, we have a timer fallback.
      this._dragLeaveTimer = SC.Timer.schedule({ target: this, action: '_forceDragLeave', interval: 300 });
    }
  },

  /** @private This event is called if the most recent dragover event returned with a non-"none" dropEffect. */
  drop: function(evt) {
    SC.run(function() { this._drop(evt); }, this);
  },

  /** @private */
  _drop: function(evt) {
    // If it's a file being dragged, prevent the default (leaving the app and opening the file).
    if (evt.dataTransfer.types && (evt.dataTransfer.types.contains('Files') || evt.dataTransfer.types.contains('text/uri-list'))) {
      evt.preventDefault();
      evt.stopPropagation();
      // Set the default drag effect to 'none'. Views may reverse this if they wish.
      evt.dataTransfer.dropEffect = 'none';
    }

    // Bubble up the responder chain until we have a successful responder.
    var ld = this._lastDraggedOver || [], nd = [], loc, len,
        view = this.targetViewForEvent(evt);

    // First collect all the responding view starting with the target view from the given drag event.
    while (view && (view !== this)) {
      nd.push(view);
      view = view.get('nextResponder');
    }
    // Next, exit views that are no longer part of the responding chain. (This avoids the pixel-wide
    // edge case where a drop event fires on a new view without a final dragover event.)
    for (loc = 0, len = ld.length; loc < len; loc++) {
      view = ld[loc];
      if (nd.indexOf(view) === -1) {
        view.tryToPerform('dataDragExited', evt);
      }
    }
    // Next, bubble the drop event itself until we find someone that successfully responds.
    for (loc = 0, len = nd.length; loc < len; loc++) {
      view = nd[loc];
      if (view.tryToPerform('dataDragDropped', evt)) break;
    }
    // Finally, notify all interested views that the drag is dead and gone.
    for (loc = 0, len = nd.length; loc < len; loc++) {
      view = nd[loc];
      view.tryToPerform('dataDragExited', evt);
    }

    // Reset caches and counters.
    this._lastDraggedOver = null;
    this._lastDraggedAt = null;
    this._dragCounter = 0;
    if (this._dragLeaveTimer) this._dragLeaveTimer.invalidate();
    this._dragLeaveTimer = null;
  },


  // these methods are used to prevent unnecessary text-selection in IE,
  // there could be some more work to improve this behavior and make it
  // a bit more useful; right now it's just to prevent bugs when dragging
  // and dropping.

  _mouseCanDrag: YES,

  selectstart: function(evt) {
    var targetView = this.targetViewForEvent(evt),
        result = this.sendEvent('selectStart', evt, targetView);

    // If the target view implements mouseDragged, then we want to ignore the
    // 'selectstart' event.
    if (targetView && targetView.respondsTo('mouseDragged')) {
      return (result !==null ? YES: NO) && !this._mouseCanDrag;
    } else {
      return (result !==null ? YES: NO);
    }
  },

  drag: function() { return false; },

  contextmenu: function(evt) {
    var view = this.targetViewForEvent(evt),
      ret;

    // Determine if any views took responsibility for the event.
    view = this.sendEvent('contextMenu', evt, view);
    ret = view ? evt.hasCustomEventHandling : YES;

    return ret;
  },

  // ..........................................................
  // ANIMATION HANDLING
  //

  /* @private Handler for animationstart events. */
  animationstart: function (evt) {
    var view = this.targetViewForEvent(evt);
    this.sendEvent('animationDidStart', evt, view);

    return view ? evt.hasCustomEventHandling : YES;
  },

  /* @private Handler for animationiteration events. */
  animationiteration: function (evt) {
    var view = this.targetViewForEvent(evt);
    this.sendEvent('animationDidIterate', evt, view);

    return view ? evt.hasCustomEventHandling : YES;
  },

  /* @private Handler for animationend events. */
  animationend: function (evt) {
    var view = this.targetViewForEvent(evt);
    this.sendEvent('animationDidEnd', evt, view);

    return view ? evt.hasCustomEventHandling : YES;
  },

  /* @private Handler for transitionend events. */
  transitionend: function (evt) {
    var view = this.targetViewForEvent(evt);
    this.sendEvent('transitionDidEnd', evt, view);

    return view ? evt.hasCustomEventHandling : YES;
  }

});

/*
  Invoked when the document is ready, but before main is called.  Creates
  an instance and sets up event listeners as needed.
*/
SC.ready(SC.RootResponder, SC.RootResponder.ready = function () {
  var r;

  r = SC.RootResponder.responder = SC.RootResponder.create();
  r.setup();
});

/* >>>>>>>>>> BEGIN source/system/application.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('system/root_responder');


/** @class

  The root object for a SproutCore application. Usually you will create a
  single SC.Application instance as your root namespace. SC.Application is
  required if you intend to use SC.Responder to route events.

  ## Example

      Contacts = SC.Application.create({
        store: SC.Store.create(SC.Record.fixtures),

        // add other useful properties here
      });

  @extends SC.ResponderContext
  @since SproutCore 1.0
*/
SC.Application = SC.Responder.extend(SC.ResponderContext,
/** SC.Application.prototype */ {

  /** @private UNUSED
    The current design mode of the application and its views.

    If the application has designModes specified, this property will be set
    automatically as the window size changes across the design mode boundaries.

    @property {String}
    @default null
  */
  // designMode: null,

  /**
    A hash of the design mode thresholds for this application.

    While a "design" (the manner views are positioned, shaped and styled) may be
    flexible enough to stretch up for a large display and to compress down
    for a medium sized display, at a certain point it often makes more sense
    to stop stretching and compressing and just implement an additional new design
    specific to the much different display size. In order to make this possible
    and with as much ease as possible, SproutCore includes support for "design
    modes". Design modes are based on the current display size and orientation.

    SproutCore supports three size-based design modes by default: 's' for small,
    'm' for medium and 'l' for large. Smartphones and handheld devices like the
    iPod Touch fall within the small category, tablets and normal desktop displays
    fall within the medium category and retina desktops or 4K displays fall
    into the large category.

    When the display size crosses a threshold between one size category to
    another, SproutCore will update the design mode of each view in the
    application, giving you a chance to provide overrides for that specific
    size via the special `modeAdjust` property.

    For example, if you wanted to hide a view completely when in the small (s)
    mode you could add:

        //...

        mediumPlusView: SC.View.extend({

          // Design mode overrides.
          modeAdjust: { s: { isVisible: false } } // Hide the view in 's' or 'small' mode.

        }),

        //...

    As you can see, we simply indicate the property overrides that we want
    for the specific mode. To adjust the height for medium mode, you could add:

        //...

        myView: SC.View.extend({

          // The normal layout always applies.
          layout: { height: 24 },

          // Design mode overrides.
          modeAdjust: { m: { layout: { height: 30 } } // Adjust the height in 'm' or 'medium' mode.

        }),

        //...

    Note that the values in `modeAdjust` are overrides for that mode and the
    values will be *reset* to their original values when leaving that mode.

    The second component to design modes is orientation. Each of the size
    categories can have two different orientations: 'l' for landscape or 'p' for
    portrait. Therefore, you may want to alter the design to account for the
    device orientation as well using `modeAdjust`. To do this, you simply
    specify orientation specific designs with the `_l` or `_p` suffix
    accordingly.

    For example, you can provide a configuration for a size category with
    slight deviations for orientations of that size all in just a few lines
    of code,

        //...

        customView: SC.View.extend({

          // The default alignment for this custom view's contents.
          alignment: SC.ALIGN_LEFT,

          // The default line height for this custom view's contents.
          lineHeight: 40,

          // Design mode overrides.
          modeAdjust: {
            m: { lineHeight: 50 }, // Overrides for medium mode regardless of orientation.
            m_p: { alignment: SC.ALIGN_CENTER }, // Overrides for medium - portrait mode.
            m_l: { layout: { top: 20 } } // Overrides for medium - landscape mode.
          }

        }),

        //...

    ### A note on styling for design modes

    Class names are automatically applied to each view depending on the mode
    as found in the SC.DESIGN_MODE_CLASS_NAMES hash. By default, your
    views will have one of three class names added:

        > 'sc-small' in small mode
        > 'sc-medium' in medium mode
        > 'sc-large' in large mode

    As well, the `body` element is given an orientation class name that you
    can use as well:

        > 'sc-landscape' in landscape orientation
        > 'sc-portrait' in portrait orientation

    ### A note on overriding layouts

    Layout overrides work slightly differently than regular property overrides,
    because they are set via `adjust`. This means they apply on *top* of the
    default layout, they don't replace the default layout. For example,
    the default layout is `{ left: 0, right: 0, top: 0, bottom: 0 }` and if
    we provide a design mode like,

        modeAdjust: { l: { layout: { top: 50 } } }

    The layout becomes `{ left: 0, right: 0, top: 50, bottom: 0 }`. If we had
    a default layout like `{ centerX: 0, centerY: 0, height: 100, width: 100 }`
    and we wanted to change it to a left positioned layout, we would need to
    null out the centerX value like so,

        modeAdjust: { l: { layout: { centerX: null, left: 0 } } } // Convert to left positioned layout.

    ### A note on the medium category

    The medium category covers tablets *and* non-retina desktops and laptops.
    While we could try to further differentiate between these two categories,
    there is no safe way to do this and to do so would cause more harm than good.
    Tablets can be connected to mice and keyboards, desktops can have touch
    screens and there is no way to know whether a mouse, touch or pointer is
    going to be used from one event to the next. Therefore the message should
    be clear, *you should always design for touch*. This means that a medium
    sized design should be expected to work well on a laptop and a tablet.

    ### A note on customizing the design mode categories

    Design mode thresholds are determined by the area of the display divided by
    the device pixel ratio. In this manner a 1024 x 768 display on a
    handheld device can be differentiated from a 1024 x 768 display on a
    desktop. Through testing and research, the three categories of 'small',
    'medium' and 'large' were chosen with thresholds between them of
    500,000 sq.px and 2,000,000 sq.px.

    Therefore, any display area divided by device pixel ratio that is less
    than 500,000 will be considered 'small' and likewise a calculated area
    of over 2,000,000 will be considered 'large'. This should be sufficient
    for almost all device specific designs and as is mentioned earlier,
    trying to get even more fine-grained is a dangerous endeavor. However,
    you can set your own thresholds easily enough by overriding this property.

    @readonly
    @property {Object}
    @default { s: 500000, m: 2000000, l: Infinity }
  */
  designModes: {
    's': 500000, // ex. smart phone display
    'm': 2000000, // ex. tablet & non-retina desktop display
    'l': Infinity // ex. retina desktop display and TV
  },

  /** @private */
  init: function () {
    arguments.callee.base.apply(this,arguments);

    // Initialize the value on the RootResponder when it is ready.
    SC.ready(this, '_setDesignModes');
  },

  /** @private */
  _setDesignModes: function () {
    var designModes = this.get('designModes'),
      responder = SC.RootResponder.responder;

    if (designModes) {
      // All we do is pass the value to the root responder for convenience.
      responder.set('designModes', designModes);
      // UNUSED.
      // this.bind('designMode', SC.Binding.from('SC.RootResponder.responder.currentDesignMode'));
    }
  }

});

/* >>>>>>>>>> BEGIN source/system/bezier_curves.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2014 7x7 Software Inc. All rights reserved.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @private Kept private until fully fleshed out.
  A cubic bezier equation. Used by the SC.easingCurve function.
 */
SC.CubicBezierEquation = function (C1, C2, C3, C4) {

  var B1 = function (t) { return (1 - t) * (1 - t) * (1 - t); };
  var B2 = function (t) { return 3 * t * (1 - t) * (1 - t); };
  var B3 = function (t) { return 3 * t * t * (1 - t); };
  var B4 = function (t) { return t * t * t; };

  this.position = function (percent) {
    var pos = {};

    pos.x = C1.x * B1(percent) + C2.x * B2(percent) + C3.x * B3(percent) + C4.x * B4(percent);
    pos.y = C1.y * B1(percent) + C2.y * B2(percent) + C3.y * B3(percent) + C4.y * B4(percent);

    return pos;
  };

};

/** @private Kept private until fully fleshed out (name change?).
  A specialized bezier curve with fixed start at 0,0 and fixed end at 1,1.

  */
SC.easingCurve = function (C2x, C2y, C3x, C3y) {

  var C1 = { x: 0, y: 0 },
    C2 = { x: C2x, y: C2y },
    C3 = { x: C3x, y: C3y },
    C4 = { x: 1, y: 1 };

  var equation = new SC.CubicBezierEquation(C1, C2, C3, C4);

  equation.value = function (percent) {
    percent = Math.max(0, Math.min(percent, 1));
    return this.position(percent).y;
  };

  equation.toString = function () {
    return "cubic-bezier(%@, %@, %@, %@)".fmt(C2x, C2y, C3x, C3y);
  };

  return equation;
};

/* >>>>>>>>>> BEGIN source/system/color.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  Represents a color, and provides methods for manipulating it. Maintains underlying
  rgba values, and includes support for colorspace conversions between rgb and hsl.

  For instructions on using SC.Color to color a view, see "SC.Color and SC.View"
  below.

  ### Basic Use

  You can create a color from red, green, blue and alpha values, with:

      SC.Color.create({
        r: 255,
        g: 255,
        b: 255,
        a: 0.5
      });

  All values are optional; the default is black. You can also create a color from any
  valid CSS string, with:

      SC.Color.from('rgba(255, 255, 255, 0.5)');

  The best CSS value for the given color in the current browser is available at the
  bindable property `cssText`. (This will provide deprecated ARGB values for older
  versions of IE; see "Edge Case: Supporting Alpha in IE" below.) (Calling
  `SC.Color.from` with an undefined or null value is equivalent to calling it with
  `'transparent'`.)

  Once created, you can manipulate a color by settings its a, r, g or b values,
  or setting its cssText value (though be careful of invalid values; see "Error
  State" below).

  ### Math

  `SC.Color` provides three methods for performing basic math: `sub` for subtraction,
  `add` for addition, and `mult` for scaling a number via multiplication.

  Note that these methods do not perform any validation to ensure that the underlying
  rgba values stay within the device's gamut (0 to 255 on a normal screen, and 0 to 1
  for alpha). For example, adding white to white will result in r, g and b values of
  510, a nonsensical value. (The `cssText` property will, however, correctly clamp the
  component values, and the color will output #FFFFFF.) This behavior is required
  for operations such as interpolating between colors (see "SC.Color and SC.View"
  below); it also gives SC.Color more predictable math, where A + B - B = A, even if
  the intermediate (A + B) operation results in underlying values outside of the normal
  gamut.

  (The class method `SC.Color.clampToDeviceGamut` is used to clamp r, g and b values to the
  standard 0 - 255 range. If your application is displaying on a screen with non-standard
  ranges, you may need to override this method.)

  ### SC.Color and SC.View

  Hooking up an instance of SC.Color to SC.View#backgroundColor is simple, but like all
  uses of backgroundColor, it comes with moderate performance implications, and should
  be avoided in cases where regular CSS is sufficient, or where bindings are unduly
  expensive, such as in rapidly-scrolling ListViews.

  Use the following code to tie a view's background color to an instance of SC.Color. Note
  that you must add backgroundColor to displayProperties in order for your view to update
  when the it changes; for performance reasons it is not included by default.

      SC.View.extend({
        color: SC.Color.from({'burlywood'}),
        backgroundColorBinding: SC.Binding.oneWay('*color.cssText'),
        displayProperties: ['backgroundColor']
      })

  You can use this to implement a simple cross-fade between two colors. Here's a basic
  example (again, note that when possible, pure CSS transitions will be substantially
  more performant):

      SC.View.extend({
        displayProperties: ['backgroundColor'],
        backgroundColor: 'cadetblue',
        fromColor: SC.Color.from('cadetblue'),
        toColor: SC.Color.from('springgreen'),
        click: function() {
          // Cancel previous timer.
          if (this._timer) this._timer.invalidate();
          // Figure out whether we're coming or going.
          this._forward = !this._forward;
          // Calculate the difference between the two colors.
          var fromColor = this._forward ? this.fromColor : this.toColor,
              toColor = this._forward ? this.toColor : this.fromColor;
          this._deltaColor = toColor.sub(fromColor);
          // Set the timer.
          this._timer = SC.Timer.schedule({
            target: this,
            action: '_tick',
            interval: 15,
            repeats: YES,
            until: Date.now() + 500
          });
        },
        _tick: function() {
          // Calculate percent of time elapsed.
          var started = this._timer.startTime,
              now = Date.now(),
              until = this._timer.until,
              pct = (now - started) / (until - started);
          // Constrain pct.
          pct = Math.min(pct, 1);
          // Calculate color.
          var fromColor = this._forward ? this.fromColor : this.toColor,
              toColor = this._forward ? this.toColor : this.fromColor,
              deltaColor = this._deltaColor,
              currentColor = fromColor.add(deltaColor.mult(pct));
          // Set.
          this.set('backgroundColor', currentColor.get('cssText'));
        }
      })

  ### Error State

  If you call `SC.Color.from` with an invalid value, or set `cssText` to an invalid
  value, the color object will go into error mode, with `isError` set to YES and
  `errorValue` containing the invalid value that triggered it. A color in error mode
  will become transparent, and you will be unable to modify its r, g, b or a values.

  To reset a color to its last-good values (or, if none, to black), call its `reset`
  method. Setting `cssText` to a valid value will also recover the color object to a
  non-error state.

  ### Edge Case: Supporting Alpha in IE

  Supporting the alpha channel in older versions of IE requires a little extra work.
  The bindable `cssText` property will return valid ARGB (e.g. #99FFFFFF) when it
  detects that it's in an older version of IE which requires it, but unfortunately you
  can't simply plug that value into `background-color`. The following code will detect
  this case and provide the correct CSS snippet:

      // This hack disables ClearType on IE!
      var color = SC.Color.from('rgba(0, 0, 0, .5)').get('cssText'),
          css;
      if (SC.Color.supportsARGB) {
        var gradient = "progid:DXImageTransform.Microsoft.gradient";
        css = ("-ms-filter:" + gradient + "(startColorstr=%@1,endColorstr=%@1);" +
               "filter:" + gradient + "(startColorstr=%@1,endColorstr=%@1)" +
               "zoom: 1").fmt(color);
      } else {
        css = "background-color:" + color;
      }

  @extends SC.Object
  @extends SC.Copyable
  @extends SC.Error
 */
SC.Color = SC.Object.extend(
  SC.Copyable,
  /** @scope SC.Color.prototype */{

  /**
    The original color string from which this object was created.

    For example, if your color was created via `SC.Color.from("burlywood")`,
    then this would be set to `"burlywood"`.

    @type String
    @default null
   */
  original: null,

  /**
    Whether the color is valid. Attempting to set `cssText` or call `from` with invalid input
    will put the color into an error state until updated with a valid string or reset.

    @type Boolean
    @default NO
    @see SC.Error
  */
  isError: NO,

  /**
    In the case of an invalid color, this contains the invalid string that was used to create or
    update it.

    @type String
    @default null
    @see SC.Error
  */
  errorValue: null,

  /**
    The alpha channel (opacity).
    `a` is a decimal value between 0 and 1.

    @type Number
    @default 1
   */
  a: function (key, value) {
    // Getter.
    if (value === undefined) {
      return this._a;
    }
    // Setter.
    else {
      if (this.get('isError')) value = this._a;
      this._a = value;
      return value;
    }
  }.property().cacheable(),

  /** @private */
  _a: 1,

  /**
    The red value.
    `r` is an integer between 0 and 255.

    @type Number
    @default 0
   */
  r: function (key, value) {
    // Getter.
    if (value === undefined) {
      return this._r;
    }
    // Setter.
    else {
      if (this.get('isError')) value = this._r;
      this._r = value;
      return value;
    }
  }.property().cacheable(),

  /** @private */
  _r: 0,

  /**
    The green value.
    `g` is an integer between 0 and 255.

    @type Number
    @default 0
   */
  g: function (key, value) {
    // Getter.
    if (value === undefined) {
      return this._g;
    }
    // Setter.
    else {
      if (this.get('isError')) value = this._g;
      this._g = value;
      return value;
    }
  }.property().cacheable(),

  /** @private */
  _g: 0,

  /**
    The blue value.
    `b` is an integer between 0 and 255.

    @type Number
    @default 0
   */
  b: function (key, value) {
    // Getter.
    if (value === undefined) {
      return this._b;
    }
    // Setter.
    else {
      if (this.get('isError')) value = this._b;
      this._b = value;
      return value;
    }
  }.property().cacheable(),

  /** @private */
  _b: 0,

  /**
    The current hue of this color.
    Hue is a float in degrees between 0° and 360°.

    @field
    @type Number
   */
  hue: function (key, deg) {
    var clamp = SC.Color.clampToDeviceGamut,
        hsl = SC.Color.rgbToHsl(clamp(this.get('r')),
                                clamp(this.get('g')),
                                clamp(this.get('b'))),
        rgb;

    if (deg !== undefined) {
      // Normalize the hue to be between 0 and 360
      hsl[0] = (deg % 360 + 360) % 360;

      rgb = SC.Color.hslToRgb(hsl[0], hsl[1], hsl[2]);
      this.beginPropertyChanges();
      this.set('r', rgb[0]);
      this.set('g', rgb[1]);
      this.set('b', rgb[2]);
      this.endPropertyChanges();
    }
    return hsl[0];
  }.property('r', 'g', 'b').cacheable(),

  /**
    The current saturation of this color.
    Saturation is a percent between 0 and 1.

    @field
    @type Number
   */
  saturation: function (key, value) {
    var clamp = SC.Color.clampToDeviceGamut,
        hsl = SC.Color.rgbToHsl(clamp(this.get('r')),
                                clamp(this.get('g')),
                                clamp(this.get('b'))),
        rgb;

    if (value !== undefined) {
      // Clamp the saturation between 0 and 100
      hsl[1] = SC.Color.clamp(value, 0, 1);

      rgb = SC.Color.hslToRgb(hsl[0], hsl[1], hsl[2]);
      this.beginPropertyChanges();
      this.set('r', rgb[0]);
      this.set('g', rgb[1]);
      this.set('b', rgb[2]);
      this.endPropertyChanges();
    }

    return hsl[1];
  }.property('r', 'g', 'b').cacheable(),

  /**
    The current lightness of this color.
    Saturation is a percent between 0 and 1.

    @field
    @type Number
   */
  luminosity: function (key, value) {
    var clamp = SC.Color.clampToDeviceGamut,
        hsl = SC.Color.rgbToHsl(clamp(this.get('r')),
                                clamp(this.get('g')),
                                clamp(this.get('b'))),
        rgb;

    if (value !== undefined) {
      // Clamp the lightness between 0 and 1
      hsl[2] = SC.Color.clamp(value, 0, 1);

      rgb = SC.Color.hslToRgb(hsl[0], hsl[1], hsl[2]);
      this.beginPropertyChanges();
      this.set('r', rgb[0]);
      this.set('g', rgb[1]);
      this.set('b', rgb[2]);
      this.endPropertyChanges();
    }
    return hsl[2];
  }.property('r', 'g', 'b').cacheable(),

  /**
    Whether two colors are equivalent.
    @param {SC.Color} color The color to compare this one to.
    @returns {Boolean} YES if the two colors are equivalent
   */
  isEqualTo: function (color) {
    return this.get('r') === color.get('r') &&
           this.get('g') === color.get('g') &&
           this.get('b') === color.get('b') &&
           this.get('a') === color.get('a');
  },

  /**
    Returns a CSS string of the color
    under the #aarrggbb scheme.

    This color is only valid for IE
    filters. This is here as a hack
    to support animating rgba values
    in older versions of IE by using
    filter gradients with no change in
    the actual gradient.

    @returns {String} The color in the rgba color space as an argb value.
   */
  toArgb: function () {
    var clamp = SC.Color.clampToDeviceGamut;

    return '#' + [clamp(255 * this.get('a')),
                  clamp(this.get('r')),
                  clamp(this.get('g')),
                  clamp(this.get('b'))].map(function (v) {
      v = v.toString(16);
      return v.length === 1 ? '0' + v : v;
    }).join('');
  },

  /**
    Returns a CSS string of the color
    under the #rrggbb scheme.

    @returns {String} The color in the rgb color space as a hex value.
   */
  toHex: function () {
    var clamp = SC.Color.clampToDeviceGamut;
    return '#' + [clamp(this.get('r')),
                  clamp(this.get('g')),
                  clamp(this.get('b'))].map(function (v) {
      v = v.toString(16);
      return v.length === 1 ? '0' + v : v;
    }).join('');
  },

  /**
    Returns a CSS string of the color
    under the rgb() scheme.

    @returns {String} The color in the rgb color space.
   */
  toRgb: function () {
    var clamp = SC.Color.clampToDeviceGamut;
    return 'rgb(' + clamp(this.get('r')) + ','
                  + clamp(this.get('g')) + ','
                  + clamp(this.get('b')) + ')';
  },

  /**
    Returns a CSS string of the color
    under the rgba() scheme.

    @returns {String} The color in the rgba color space.
   */
  toRgba: function () {
    var clamp = SC.Color.clampToDeviceGamut;
    return 'rgba(' + clamp(this.get('r')) + ','
                   + clamp(this.get('g')) + ','
                   + clamp(this.get('b')) + ','
                   + this.get('a') + ')';
  },

  /**
    Returns a CSS string of the color
    under the hsl() scheme.

    @returns {String} The color in the hsl color space.
   */
  toHsl: function () {
    var round = Math.round;
    return 'hsl(' + round(this.get('hue')) + ','
                  + round(this.get('saturation') * 100) + '%,'
                  + round(this.get('luminosity') * 100) + '%)';
  },

  /**
    Returns a CSS string of the color
    under the hsla() scheme.

    @returns {String} The color in the hsla color space.
   */
  toHsla: function () {
    var round = Math.round;
    return 'hsla(' + round(this.get('hue')) + ','
                   + round(this.get('saturation') * 100) + '%,'
                   + round(this.get('luminosity') * 100) + '%,'
                   + this.get('a') + ')';
  },

  /**
    The CSS string representation that will be
    best displayed by the browser.

    @field
    @type String
   */
  cssText: function (key, value) {
    // Getter.
    if (value === undefined) {
      // FAST PATH: Error.
      if (this.get('isError')) return this.get('errorValue');

      // FAST PATH: transparent.
      if (this.get('a') === 0) return 'transparent';

      var supportsAlphaChannel = SC.Color.supportsRgba ||
                                 SC.Color.supportsArgb;
      return (this.get('a') === 1 || !supportsAlphaChannel)
             ? this.toHex()
             : SC.Color.supportsRgba
             ? this.toRgba()
             : this.toArgb();
    }
    // Setter.
    else {
      var hash = SC.Color._parse(value);
      this.beginPropertyChanges();
      // Error state
      if (!hash) {
        // Cache current value for recovery.
        this._lastValidHash = { r: this._r, g: this._g, b: this._b, a: this._a };
        this.set('r', 0);
        this.set('g', 0);
        this.set('b', 0);
        this.set('a', 0);
        this.set('errorValue', value);
        this.set('isError', YES);
      }
      // Happy state
      else {
        this.setIfChanged('isError', NO);
        this.setIfChanged('errorValue', null);
        this.set('r', hash.r);
        this.set('g', hash.g);
        this.set('b', hash.b);
        this.set('a', hash.a);
      }
      this.endPropertyChanges();
      return value;
    }
  }.property('r', 'g', 'b', 'a').cacheable(),

  /**
    A read-only property which always returns a valid CSS property. If the color is in
    an error state, it returns 'transparent'.

    @field
    @type String
   */
  validCssText: function() {
    if (this.get('isError')) return 'transparent';
    else return this.get('cssText');
  }.property('cssText', 'isError').cacheable(),

  /**
    Resets an errored color to its last valid color. If the color has never been valid,
    it resets to black.

    @returns {SC.Color} receiver
   */
  reset: function() {
    // Gatekeep: not in error mode.
    if (!this.get('isError')) return this;
    // Reset the value to the last valid hash, or default black.
    var lastValidHash = this._lastValidHash || { r: 0, g: 0, b: 0, a: 1 };
    this.beginPropertyChanges();
    this.set('isError', NO);
    this.set('errorValue', null);
    this.set('r', lastValidHash.r);
    this.set('g', lastValidHash.g);
    this.set('b', lastValidHash.b);
    this.set('a', lastValidHash.a);
    this.endPropertyChanges();
    return this;
  },

  /**
    Returns a clone of this color.
    This will always a deep clone.

    @returns {SC.Color} The clone color.
   */
  copy: function () {
    return SC.Color.create({
      original: this.get('original'),
      r: this.get('r'),
      g: this.get('g'),
      b: this.get('b'),
      a: this.get('a'),
      isError: this.get('isError'),
      errorValue: this.get('errorValue')
    });
  },

  /**
    Returns a color that's the difference between two colors.

    Note that the result might not be a valid CSS color.

    @param {SC.Color} color The color to subtract from this one.
    @returns {SC.Color} The difference between the two colors.
   */
  sub: function (color) {
    return SC.Color.create({
      r: this.get('r') - color.get('r'),
      g: this.get('g') - color.get('g'),
      b: this.get('b') - color.get('b'),
      a: this.get('a') - color.get('a'),
      isError: this.get('isError') || color.get('isError')
    });
  },

  /**
    Returns a new color that's the addition of two colors.

    Note that the resulting a, r, g and b values are not clamped to within valid
    ranges.

    @param {SC.Color} color The color to add to this one.
    @returns {SC.Color} The addition of the two colors.
   */
  add: function (color) {
    return SC.Color.create({
      r: this.get('r') + color.get('r'),
      g: this.get('g') + color.get('g'),
      b: this.get('b') + color.get('b'),
      a: this.get('a') + color.get('a'),
      isError: this.get('isError')
    });
  },

  /**
    Returns a color that has it's units uniformly multiplied
    by a given multiplier.

    Note that the result might not be a valid CSS color.

    @param {Number} multipler How much to multiply rgba by.
    @returns {SC.Color} The adjusted color.
   */
  mult: function (multiplier) {
    var round = Math.round;
    return SC.Color.create({
      r: round(this.get('r') * multiplier),
      g: round(this.get('g') * multiplier),
      b: round(this.get('b') * multiplier),
      a: this.get('a') * multiplier,
      isError: this.get('isError')
    });
  }
});

SC.Color.mixin(
  /** @scope SC.Color */{

  /** @private Overrides create to support creation with {a, r, g, b} hash. */
  create: function() {
    var vals = {},
        hasVals = NO,
        keys = ['a', 'r', 'g', 'b'],
        args, len,
        hash, i, k, key;


    // Fast arguments access.
    // Accessing `arguments.length` is just a Number and doesn't materialize the `arguments` object, which is costly.
    args = new Array(arguments.length); // SC.A(arguments)
    len = args.length;

    // Loop through all arguments. If any of them contain numeric a, r, g or b arguments,
    // clone the hash and move the value from (e.g.) a to _a.
    for (i = 0; i < len; i++) {
      hash = arguments[i];
      if (SC.typeOf(hash.a) === SC.T_NUMBER
        || SC.typeOf(hash.r) === SC.T_NUMBER
        || SC.typeOf(hash.g) === SC.T_NUMBER
        || SC.typeOf(hash.b) === SC.T_NUMBER
      ) {
        hasVals = YES;
        hash = args[i] = SC.clone(hash);
        for (k = 0; k < 4; k++) {
          key = keys[k];
          if (SC.typeOf(hash[key]) === SC.T_NUMBER) {
            vals['_' + key] = hash[key];
            delete hash[key];
          }
        }
      } else {
        args[i] = hash;
      }
    }

    if (hasVals) args.push(vals);
    return SC.Object.create.apply(this, args);
  },

  /**
    Whether this browser supports the rgba color model.
    Check courtesy of Modernizr.
    @type Boolean
    @see https://github.com/Modernizr/Modernizr/blob/master/modernizr.js#L552
   */
  supportsRgba: (function () {
    var style = document.getElementsByTagName('script')[0].style,
        cssText = style.cssText,
        supported;

    style.cssText = 'background-color:rgba(5,2,1,.5)';
    supported = style.backgroundColor.indexOf('rgba') !== -1;
    style.cssText = cssText;
    return supported;
  }()),

  /**
    Whether this browser supports the argb color model.
    @type Boolean
   */
  supportsArgb: (function () {
    var style = document.getElementsByTagName('script')[0].style,
        cssText = style.cssText,
        supported;

    style.cssText = 'filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#55000000", endColorstr="#55000000");';
    supported = style.backgroundColor.indexOf('#55000000') !== -1;
    style.cssText = cssText;
    return supported;
  }()),

  /**
    Used to clamp a value in between a minimum
    value and a maximum value.

    @param {Number} value The value to clamp.
    @param {Number} min The minimum number the value can be.
    @param {Number} max The maximum number the value can be.
    @returns {Number} The value clamped between min and max.
   */
  clamp: function (value, min, max) {
    return Math.max(Math.min(value, max), min);
  },

  /**
    Clamps a number, then rounds it to the nearest integer.

    @param {Number} value The value to clamp.
    @param {Number} min The minimum number the value can be.
    @param {Number} max The maximum number the value can be.
    @returns {Number} The value clamped between min and max as an integer.
    @see SC.Color.clamp
   */
  clampInt: function (value, min, max) {
    return Math.round(SC.Color.clamp(value, min, max));
  },

  /**
    Clamps a number so it lies in the device gamut.
    For screens, this an integer between 0 and 255.

    @param {Number} value The value to clamp
    @returns {Number} The value clamped to the device gamut.
   */
  clampToDeviceGamut: function (value) {
    return SC.Color.clampInt(value, 0, 255);
  },

  /**
    Returns the RGB for a color defined in
    the HSV color space.

    @param {Number} h The hue of the color as a degree between 0° and 360°
    @param {Number} s The saturation of the color as a percent between 0 and 1.
    @param {Number} v The value of the color as a percent between 0 and 1.
    @returns {Number[]} A RGB triple in the form `(r, g, b)`
      where each of the values are integers between 0 and 255.
   */
  hsvToRgb: function (h, s, v) {
    h /= 360;
    var r, g, b,
        i = Math.floor(h * 6),
        f = h * 6 - i,
        p = v * (1 - s),
        q = v * (1 - (s * f)),
        t = v * (1 - (s * (1 - f))),
        rgb = [[v, t, p],
               [q, v, p],
               [p, v, t],
               [p, q, v],
               [t, p, v],
               [v, p, q]],
        clamp = SC.Color.clampToDeviceGamut;

    i = i % 6;
    r = clamp(rgb[i][0] * 255);
    g = clamp(rgb[i][1] * 255);
    b = clamp(rgb[i][2] * 255);

    return [r, g, b];
  },

  /**
    Returns an RGB color transformed into the
    HSV colorspace as triple `(h, s, v)`.

    @param {Number} r The red component as an integer between 0 and 255.
    @param {Number} g The green component as an integer between 0 and 255.
    @param {Number} b The blue component as an integer between 0 and 255.
    @returns {Number[]} A HSV triple in the form `(h, s, v)`
      where `h` is in degrees (as a float) between 0° and 360° and
            `s` and `v` are percents between 0 and 1.
   */
  rgbToHsv: function (r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    var max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        d = max - min,
        h, s = max === 0 ? 0 : d / max, v = max;

    // achromatic
    if (max === min) {
      h = 0;
    } else {
      switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      }
      h /= 6;
    }
    h *= 360;

    return [h, s, v];
  },

  /**
    Returns the RGB for a color defined in
    the HSL color space.

    (Notes are taken from the W3 spec, and are
     written in ABC)

    @param {Number} h The hue of the color as a degree between 0° and 360°
    @param {Number} s The saturation of the color as a percent between 0 and 1.
    @param {Number} l The luminosity of the color as a percent between 0 and 1.
    @returns {Number[]} A RGB triple in the form `(r, g, b)`
      where each of the values are integers between 0 and 255.
    @see http://www.w3.org/TR/css3-color/#hsl-color
   */
  hslToRgb: function (h, s, l) {
    h /= 360;

  // HOW TO RETURN hsl.to.rgb(h, s, l):
    var m1, m2, hueToRgb = SC.Color.hueToRgb,
        clamp = SC.Color.clampToDeviceGamut;

    // SELECT:
      // l<=0.5: PUT l*(s+1) IN m2
      // ELSE: PUT l+s-l*s IN m2
    m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
    // PUT l*2-m2 IN m1
    m1 = l * 2 - m2;
    // PUT hue.to.rgb(m1, m2, h+1/3) IN r
    // PUT hue.to.rgb(m1, m2, h    ) IN g
    // PUT hue.to.rgb(m1, m2, h-1/3) IN b
    // RETURN (r, g, b)
    return [clamp(hueToRgb(m1, m2, h + 1/3) * 255),
            clamp(hueToRgb(m1, m2, h)       * 255),
            clamp(hueToRgb(m1, m2, h - 1/3) * 255)];
  },

  /** @private
    Returns the RGB value for a given hue.
   */
  hueToRgb: function (m1, m2, h) {
  // HOW TO RETURN hue.to.rgb(m1, m2, h):
    // IF h<0: PUT h+1 IN h
    if (h < 0) h++;
    // IF h>1: PUT h-1 IN h
    if (h > 1) h--;
    // IF h*6<1: RETURN m1+(m2-m1)*h*6
    if (h < 1/6) return m1 + (m2 - m1) * h * 6;
    // IF h*2<1: RETURN m2
    if (h < 1/2) return m2;
    // IF h*3<2: RETURN m1+(m2-m1)*(2/3-h)*6
    if (h < 2/3) return m1 + (m2 - m1) * (2/3 - h) * 6;
    // RETURN m1
    return m1;
  },

  /**
    Returns an RGB color transformed into the
    HSL colorspace as triple `(h, s, l)`.

    @param {Number} r The red component as an integer between 0 and 255.
    @param {Number} g The green component as an integer between 0 and 255.
    @param {Number} b The blue component as an integer between 0 and 255.
    @returns {Number[]} A HSL triple in the form `(h, s, l)`
      where `h` is in degrees (as a float) between 0° and 360° and
            `s` and `l` are percents between 0 and 1.
   */
  rgbToHsl: function (r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    var max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        h, s, l = (max + min) / 2,
        d = max - min;

    // achromatic
    if (max === min) {
      h = s = 0;
    } else {
      s = l > 0.5
          ? d / (2 - max - min)
          : d / (max + min);

      switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      }
      h /= 6;
    }
    h *= 360;

    return [h, s, l];
  },

  // ..........................................................
  // Regular expressions for accepted color types
  //
  PARSE_RGBA: /^rgba\(\s*([\d]+%?)\s*,\s*([\d]+%?)\s*,\s*([\d]+%?)\s*,\s*([.\d]+)\s*\)$/,
  PARSE_RGB : /^rgb\(\s*([\d]+%?)\s*,\s*([\d]+%?)\s*,\s*([\d]+%?)\s*\)$/,
  PARSE_HSLA: /^hsla\(\s*(-?[\d]+)\s*\s*,\s*([\d]+)%\s*,\s*([\d]+)%\s*,\s*([.\d]+)\s*\)$/,
  PARSE_HSL : /^hsl\(\s*(-?[\d]+)\s*,\s*([\d]+)%\s*,\s*([\d]+)%\s*\)$/,
  PARSE_HEX : /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
  PARSE_ARGB: /^#[0-9a-fA-F]{8}$/,

  /**
    A mapping of anglicized colors to their hexadecimal
    representation.

    Computed by running the following code at http://www.w3.org/TR/css3-color

       var T = {}, color = null,
           colors = document.querySelectorAll('.colortable')[1].querySelectorAll('.c');

       for (var i = 0; i < colors.length; i++) {
         if (i % 4 === 0) {
           color = colors[i].getAttribute('style').split(':')[1];
         } else if (i % 4 === 1) {
           T[color] = colors[i].getAttribute('style').split(':')[1].toUpperCase();
         }
       }
       JSON.stringify(T);

    @see http://www.w3.org/TR/css3-color/#svg-color
   */
  KEYWORDS: {"aliceblue":"#F0F8FF","antiquewhite":"#FAEBD7","aqua":"#00FFFF","aquamarine":"#7FFFD4","azure":"#F0FFFF","beige":"#F5F5DC","bisque":"#FFE4C4","black":"#000000","blanchedalmond":"#FFEBCD","blue":"#0000FF","blueviolet":"#8A2BE2","brown":"#A52A2A","burlywood":"#DEB887","cadetblue":"#5F9EA0","chartreuse":"#7FFF00","chocolate":"#D2691E","coral":"#FF7F50","cornflowerblue":"#6495ED","cornsilk":"#FFF8DC","crimson":"#DC143C","cyan":"#00FFFF","darkblue":"#00008B","darkcyan":"#008B8B","darkgoldenrod":"#B8860B","darkgray":"#A9A9A9","darkgreen":"#006400","darkgrey":"#A9A9A9","darkkhaki":"#BDB76B","darkmagenta":"#8B008B","darkolivegreen":"#556B2F","darkorange":"#FF8C00","darkorchid":"#9932CC","darkred":"#8B0000","darksalmon":"#E9967A","darkseagreen":"#8FBC8F","darkslateblue":"#483D8B","darkslategray":"#2F4F4F","darkslategrey":"#2F4F4F","darkturquoise":"#00CED1","darkviolet":"#9400D3","deeppink":"#FF1493","deepskyblue":"#00BFFF","dimgray":"#696969","dimgrey":"#696969","dodgerblue":"#1E90FF","firebrick":"#B22222","floralwhite":"#FFFAF0","forestgreen":"#228B22","fuchsia":"#FF00FF","gainsboro":"#DCDCDC","ghostwhite":"#F8F8FF","gold":"#FFD700","goldenrod":"#DAA520","gray":"#808080","green":"#008000","greenyellow":"#ADFF2F","grey":"#808080","honeydew":"#F0FFF0","hotpink":"#FF69B4","indianred":"#CD5C5C","indigo":"#4B0082","ivory":"#FFFFF0","khaki":"#F0E68C","lavender":"#E6E6FA","lavenderblush":"#FFF0F5","lawngreen":"#7CFC00","lemonchiffon":"#FFFACD","lightblue":"#ADD8E6","lightcoral":"#F08080","lightcyan":"#E0FFFF","lightgoldenrodyellow":"#FAFAD2","lightgray":"#D3D3D3","lightgreen":"#90EE90","lightgrey":"#D3D3D3","lightpink":"#FFB6C1","lightsalmon":"#FFA07A","lightseagreen":"#20B2AA","lightskyblue":"#87CEFA","lightslategray":"#778899","lightslategrey":"#778899","lightsteelblue":"#B0C4DE","lightyellow":"#FFFFE0","lime":"#00FF00","limegreen":"#32CD32","linen":"#FAF0E6","magenta":"#FF00FF","maroon":"#800000","mediumaquamarine":"#66CDAA","mediumblue":"#0000CD","mediumorchid":"#BA55D3","mediumpurple":"#9370DB","mediumseagreen":"#3CB371","mediumslateblue":"#7B68EE","mediumspringgreen":"#00FA9A","mediumturquoise":"#48D1CC","mediumvioletred":"#C71585","midnightblue":"#191970","mintcream":"#F5FFFA","mistyrose":"#FFE4E1","moccasin":"#FFE4B5","navajowhite":"#FFDEAD","navy":"#000080","oldlace":"#FDF5E6","olive":"#808000","olivedrab":"#6B8E23","orange":"#FFA500","orangered":"#FF4500","orchid":"#DA70D6","palegoldenrod":"#EEE8AA","palegreen":"#98FB98","paleturquoise":"#AFEEEE","palevioletred":"#DB7093","papayawhip":"#FFEFD5","peachpuff":"#FFDAB9","peru":"#CD853F","pink":"#FFC0CB","plum":"#DDA0DD","powderblue":"#B0E0E6","purple":"#800080","red":"#FF0000","rosybrown":"#BC8F8F","royalblue":"#4169E1","saddlebrown":"#8B4513","salmon":"#FA8072","sandybrown":"#F4A460","seagreen":"#2E8B57","seashell":"#FFF5EE","sienna":"#A0522D","silver":"#C0C0C0","skyblue":"#87CEEB","slateblue":"#6A5ACD","slategray":"#708090","slategrey":"#708090","snow":"#FFFAFA","springgreen":"#00FF7F","steelblue":"#4682B4","tan":"#D2B48C","teal":"#008080","thistle":"#D8BFD8","tomato":"#FF6347","turquoise":"#40E0D0","violet":"#EE82EE","wheat":"#F5DEB3","white":"#FFFFFF","whitesmoke":"#F5F5F5","yellow":"#FFFF00","yellowgreen":"#9ACD32"},

  /**
    Parses any valid CSS color into a `SC.Color` object. Given invalid input, will return a
    `SC.Color` object in an error state (with isError: YES).

    @param {String} color The CSS color value to parse.
    @returns {SC.Color} The color object representing the color passed in.
   */
  from: function (color) {
    // Fast path: clone another color.
    if (SC.kindOf(color, SC.Color)) {
      return color.copy();
    }

    // Slow path: string
    var hash = SC.Color._parse(color),
        C = SC.Color;

    // Gatekeep: bad input.
    if (!hash) {
      return SC.Color.create({
        original: color,
        isError: YES
      });
    }

    return C.create({
      original: color,
      r: C.clampInt(hash.r, 0, 255),
      g: C.clampInt(hash.g, 0, 255),
      b: C.clampInt(hash.b, 0, 255),
      a: C.clamp(hash.a, 0, 1)
    });
  },

  /** @private
    Parses any valid CSS color into r, g, b and a values. Returns null for invalid inputs.

    For internal use only. External code should call `SC.Color.from` or `SC.Color#cssText`.

    @param {String} color The CSS color value to parse.
    @returns {Hash || null} A hash of r, g, b, and a values.
   */
  _parse: function (color) {
    var C = SC.Color,
        oColor = color,
        r, g, b, a = 1,
        percentOrDeviceGamut = function (value) {
          var v = parseInt(value, 10);
          return value.slice(-1) === "%"
                 ? C.clampInt(v * 2.55, 0, 255)
                 : C.clampInt(v, 0, 255);
        };

    if (C.KEYWORDS.hasOwnProperty(color)) {
      color = C.KEYWORDS[color];
    } else if (SC.none(color) || color === '') {
      color = 'transparent';
    }

    if (C.PARSE_RGB.test(color)) {
      color = color.match(C.PARSE_RGB);

      r = percentOrDeviceGamut(color[1]);
      g = percentOrDeviceGamut(color[2]);
      b = percentOrDeviceGamut(color[3]);

    } else if (C.PARSE_RGBA.test(color)) {
      color = color.match(C.PARSE_RGBA);

      r = percentOrDeviceGamut(color[1]);
      g = percentOrDeviceGamut(color[2]);
      b = percentOrDeviceGamut(color[3]);

      a = parseFloat(color[4], 10);

    } else if (C.PARSE_HEX.test(color)) {
      // The three-digit RGB notation (#rgb)
      // is converted into six-digit form (#rrggbb)
      // by replicating digits, not by adding zeros.
      if (color.length === 4) {
        color = '#' + color.charAt(1) + color.charAt(1)
                    + color.charAt(2) + color.charAt(2)
                    + color.charAt(3) + color.charAt(3);
      }

      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);

    } else if (C.PARSE_ARGB.test(color)) {
      r = parseInt(color.slice(3, 5), 16);
      g = parseInt(color.slice(5, 7), 16);
      b = parseInt(color.slice(7, 9), 16);

      a = parseInt(color.slice(1, 3), 16) / 255;

    } else if (C.PARSE_HSL.test(color)) {
      color = color.match(C.PARSE_HSL);
      color = C.hslToRgb(((parseInt(color[1], 10) % 360 + 360) % 360),
                         C.clamp(parseInt(color[2], 10) / 100, 0, 1),
                         C.clamp(parseInt(color[3], 10) / 100, 0, 1));

      r = color[0];
      g = color[1];
      b = color[2];

    } else if (C.PARSE_HSLA.test(color)) {
      color = color.match(C.PARSE_HSLA);

      a = parseFloat(color[4], 10);

      color = C.hslToRgb(((parseInt(color[1], 10) % 360 + 360) % 360),
                         C.clamp(parseInt(color[2], 10) / 100, 0, 1),
                         C.clamp(parseInt(color[3], 10) / 100, 0, 1));

      r = color[0];
      g = color[1];
      b = color[2];

    // See http://www.w3.org/TR/css3-color/#transparent-def
    } else if (color === "transparent") {
      r = g = b = 0;
      a = 0;

    } else {
      return null;
    }

    return {
      r: r,
      g: g,
      b: b,
      a: a
    };
  }
});

/* >>>>>>>>>> BEGIN source/system/device.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/core_query');
sc_require('system/ready');
sc_require('system/root_responder');
sc_require('system/platform');

SC.PORTRAIT_ORIENTATION = 'portrait';
SC.LANDSCAPE_ORIENTATION = 'landscape';
SC.NO_ORIENTATION = 'desktop'; // value 'desktop' for backwards compatibility

/**
  The device object allows you to check device specific properties such as
  orientation and if the device is offline, as well as observe when they change
  state.

  ## Orientation
  When a touch device changes orientation, the orientation property will be
  set accordingly which you can observe

  ## Offline support
  In order to build a good offline-capable web application, you need to know
  when your app has gone offline so you can for instance queue your server
  requests for a later time or provide a specific UI/message.

  Similarly, you also need to know when your application has returned to an
  'online' state again, so that you can re-synchronize with the server or do
  anything else that might be needed.

  By observing the 'isOffline' property you can be notified when this state
  changes. Note that this property is only connected to the navigator.onLine
  property, which is available on most modern browsers.

*/
SC.device = SC.Object.create({

  /**
    Sets the orientation for devices, either SC.LANDSCAPE_ORIENTATION
    or SC.PORTRAIT_ORIENTATION.

    @type String
    @default SC.PORTRAIT_ORIENTATION
  */
  orientation: SC.PORTRAIT_ORIENTATION,

  /**
    Indicates whether the device is currently online or offline. For browsers
    that do not support this feature, the default value is NO.

    Is currently inverse of the navigator.onLine property. Most modern browsers
    will update this property when switching to or from the browser's Offline
    mode, and when losing/regaining network connectivity.

    @type Boolean
    @default NO
  */
  isOffline: NO,

  /**
    Returns a Point containing the last known X and Y coordinates of the
    mouse, if present.

    @type Point
  */
  mouseLocation: function() {
    var responder = SC.RootResponder.responder,
        lastX = responder._lastMoveX,
        lastY = responder._lastMoveY;

    if (SC.empty(lastX) || SC.empty(lastY)) {
      return null;
    }

    return { x: lastX, y: lastY };
  }.property(),

  /**
    Initialize the object with some properties up front
  */
  init: function() {
    arguments.callee.base.apply(this,arguments);

    if (navigator && navigator.onLine === false) {
      this.set('isOffline', YES);
    }
  },

  /**
    As soon as the DOM is up and running, make sure we attach necessary
    event handlers
  */
  setup: function() {
    var responder = SC.RootResponder.responder;
    responder.listenFor(['online', 'offline'], window, this);

    this.orientationHandlingShouldChange();
  },

  // ..........................................................
  // ORIENTATION HANDLING
  //

  /**
    Determines which method to use for orientation changes.
    Either detects orientation changes via the current size
    of the window, or by the window.onorientationchange event.
  */
  orientationHandlingShouldChange: function() {
    if (SC.platform.windowSizeDeterminesOrientation) {
      SC.Event.remove(window, 'orientationchange', this, this.orientationchange);
      this.windowSizeDidChange(SC.RootResponder.responder.get('currentWindowSize'));
    } else if (SC.platform.supportsOrientationChange) {
      SC.Event.add(window, 'orientationchange', this, this.orientationchange);
      this.orientationchange();
    }
  },

  /**
    @param {Hash} newSize The new size of the window
    @returns YES if the method altered the orientation, NO otherwise
  */
  windowSizeDidChange: function(newSize) {
    if (SC.platform.windowSizeDeterminesOrientation) {
      if (newSize.height >= newSize.width) {
        SC.device.set('orientation', SC.PORTRAIT_ORIENTATION);
      } else {
        SC.device.set('orientation', SC.LANDSCAPE_ORIENTATION);
      }

      return YES;
    }
    return NO;
  },

  /**
    Called when the window.onorientationchange event is fired.
  */
  orientationchange: function(evt) {
    SC.run(function() {
      if (window.orientation === 0 || window.orientation === 180) {
        SC.device.set('orientation', SC.PORTRAIT_ORIENTATION);
      } else {
        SC.device.set('orientation', SC.LANDSCAPE_ORIENTATION);
      }
    });
  },

  /** @private */
  orientationObserver: function () {
    var body = SC.$(document.body),
        orientation = this.get('orientation');

    if (orientation === SC.PORTRAIT_ORIENTATION) {
      body.addClass('sc-portrait');
    } else {
      body.removeClass('sc-portrait');
    }

    if (orientation === SC.LANDSCAPE_ORIENTATION) {
      body.addClass('sc-landscape');
    } else {
      body.removeClass('sc-landscape');
    }
  }.observes('orientation'),


  // ..........................................................
  // CONNECTION HANDLING
  //

  online: function(evt) {
    SC.run(function () {
      this.set('isOffline', NO);
    }, this);
  },

  offline: function(evt) {
    SC.run(function () {
      this.set('isOffline', YES);
    }, this);
  }

});

/*
  Invoked when the document is ready, but before main is called.  Creates
  an instance and sets up event listeners as needed.
*/
SC.ready(function() {
  SC.device.setup();
});

/* >>>>>>>>>> BEGIN source/system/key_bindings.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


// Key Bindings are used to map a keyboard input to an action message on a
// responder.  These bindings are most useful when implementing sophisticated
// keyboard input mechanisms.  For keyboard shortcuts, instead use menus, etc.

SC.MODIFIED_KEY_BINDINGS = {
  'ctrl_.': 'cancel',
  'shift_tab': 'insertBacktab',
  'shift_left': 'moveLeftAndModifySelection',
  'shift_right': 'moveRightAndModifySelection',
  'shift_up': 'moveUpAndModifySelection',
  'shift_down': 'moveDownAndModifySelection',
  'alt_left': 'moveLeftAndModifySelection',
  'alt_right': 'moveRightAndModifySelection',
  'alt_up': 'moveUpAndModifySelection',
  'alt_down': 'moveDownAndModifySelection',
  'ctrl_a': 'selectAll'
} ;

SC.BASE_KEY_BINDINGS = {
  'escape': 'cancel',
  'backspace': 'deleteBackward',
  'delete': 'deleteForward',
  'return': 'insertNewline',
  'tab': 'insertTab',
  'left': 'moveLeft',
  'right': 'moveRight',
  'up': 'moveUp',
  'down': 'moveDown',
  'home': 'moveToBeginningOfDocument',
  'end': 'moveToEndOfDocument',
  'pagedown': 'pageDown',
  'pageup': 'pageUp'
} ;


/* >>>>>>>>>> BEGIN source/system/page.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class SC.Page

  A Page object is used to store a set of views that can be lazily configured
  as needed.  The page object works by overloading the get() method.  The
  first time you try to get the page
  
  @extends SC.Object
*/
SC.Page = SC.Object.extend(
/** @scope SC.Page.prototype */ {
  
  /**
    When you create a page, you can set it's "owner" property to an
    object outside the page definition. This allows views in the page
    to use the owner object as a target, (as well as other objects
    accessible through the owner object). E.g.
    
        myButton: SC.ButtonView.design({
          title: 'Click me',
          target: SC.outlet('page.owner'),
          action: 'buttonClicked'
        })
    
    Usually, you'll set 'owner' to the object defined in core.js.
  */
  owner: null,
  
  get: function(key) {
    var value = this[key] ;
    if (value && value.isClass) {
      this[key] = value = value.create({ page: this }) ;
      return value ;
    } else return arguments.callee.base.apply(this,arguments);
  },

  /**
    Returns the named property unless the property is a view that has not yet
    been configured.  In that case it will return undefined.  You can use this
    method to safely get a view without waking it up.
  */
  getIfConfigured: function(key) {
    var ret = this[key] ;
    return (ret && ret.isViewClass) ? null : this.get(key);
  },

  /**
    Applies a localization to every view builder defined on the page.  You must call this before you construct a view to apply the localization.
  */
  loc: function(locs) {
    var view, key;
    for(key in locs) {
      if (!locs.hasOwnProperty(key)) continue ;
      view = this[key] ;
      if (!view || !view.isViewClass) continue ;
      view.loc(locs[key]);
    }
    return this ;
  }

  //needsDesigner: YES,
  
  //inDesignMode: YES
    
}) ;

// ..........................................................
// SUPPORT FOR LOADING PAGE DESIGNS
// 

/** Calling design() on a page is the same as calling create() */
SC.Page.design = SC.Page.create ;

/** Calling localization returns passed attrs. */
SC.Page.localization = function(attrs) { return attrs; };



/* >>>>>>>>>> BEGIN source/system/render_context.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/builder');

/** set update mode on context to replace content (preferred) */
SC.MODE_REPLACE = 'replace';

/** set update mode on context to append content */
SC.MODE_APPEND = 'append';

/** set update mode on context to prepend content */
SC.MODE_PREPEND = 'prepend';

/** list of numeric properties that should not have 'px' appended */
SC.NON_PIXEL_PROPERTIES = ['zIndex', 'opacity'];

/** a list of styles that get expanded into multiple properties, add more as you discover them */
SC.COMBO_STYLES = {
  WebkitTransition: ['WebkitTransitionProperty', 'WebkitTransitionDuration', 'WebkitTransitionDelay', 'WebkitTransitionTimingFunction']
};

/**
  @namespace

  A RenderContext is a builder that can be used to generate HTML for views or
  to update an existing element.  Rather than making changes to an element
  directly, you use a RenderContext to queue up changes to the element,
  finally applying those changes or rendering the new element when you are
  finished.

  You will not usually create a render context yourself but you will be passed
  a render context as the first parameter of your render() method on custom
  views.

  Render contexts are essentially arrays of strings.  You can add a string to
  the context by calling push().  You can retrieve the entire array as a
  single string using join().  This is basically the way the context is used
  for views.  You are passed a render context and expected to add strings of
  HTML to the context like a normal array.  Later, the context will be joined
  into a single string and converted into real HTML for display on screen.

  In addition to the core push and join methods, the render context also
  supports some extra methods that make it easy to build tags.

  context.begin() <-- begins a new tag context
  context.end() <-- ends the tag context...
*/
SC.RenderContext = SC.Builder.create(
  /** @lends SC.RenderContext */ {

  SELF_CLOSING: SC.CoreSet.create().addEach(['area', 'base', 'basefront', 'br', 'hr', 'input', 'img', 'link', 'meta']),

  /**
    When you create a context you should pass either a tag name or an element
    that should be used as the basis for building the context.  If you pass
    an element, then the element will be inspected for class names, styles
    and other attributes.  You can also call update() or replace() to
    modify the element with you context contents.

    If you do not pass any parameters, then we assume the tag name is 'div'.

    A second parameter, parentContext, is used internally for chaining.  You
    should never pass a second argument.

    @param {String|DOMElement} tagNameOrElement
    @returns {SC.RenderContext} receiver
  */
  init: function (tagNameOrElement, prevContext) {
    var tagNameOrElementIsString;

    // if a prevContext was passed, setup with that first...
    if (prevContext) {
      this.prevObject = prevContext;
      this.strings    = prevContext.strings;
      this.offset     = prevContext.length + prevContext.offset;
    }

    if (!this.strings) this.strings = [];

    // if tagName is string, just setup for rendering new tagName
    if (tagNameOrElement === undefined) {
      tagNameOrElement = 'div';
      tagNameOrElementIsString = YES;
    }
    else if (tagNameOrElement === 'div'  ||  tagNameOrElement === 'label'  ||  tagNameOrElement === 'a') {
      // Fast path for common tags.
      tagNameOrElementIsString = YES;
    }
    else if (SC.typeOf(tagNameOrElement) === SC.T_STRING) {
      tagNameOrElement = tagNameOrElement.toLowerCase();
      tagNameOrElementIsString = YES;
    }

    if (tagNameOrElementIsString) {
      this._tagName     = tagNameOrElement;
      this._needsTag    = YES; // used to determine if end() needs to wrap tag
      this.needsContent = YES;

      // increase length of all contexts to leave space for opening tag
      var c = this;
      while (c) { c.length++; c = c.prevObject; }

      this.strings.push(null);
      this._selfClosing = this.SELF_CLOSING.contains(tagNameOrElement);
    } else {
      this._elem        = tagNameOrElement;
      this._needsTag    = NO;
      this.length       = 0;
      this.needsContent = NO;
    }
    return this;
  },

  // ..........................................................
  // PROPERTIES
  //

  // NOTE: We store this as an actual array of strings so that browsers that
  // support dense arrays will use them.
  /**
    The current working array of strings.

    @type Array
  */
  strings: null,

  /**
    this initial offset into the strings array where this context instance
    has its opening tag.

    @type Number
  */
  offset: 0,

  /**
    the current number of strings owned by the context, including the opening
    tag.

    @type Number
  */
  length: 0,

  /**
    Specify the method that should be used to update content on the element.
    In almost all cases you want to replace the content.  Very carefully
    managed code (such as in CollectionView) can append or prepend content
    instead.

    You probably do not want to change this property unless you know what you
    are doing.

    @type String
  */
  updateMode: SC.MODE_REPLACE,

  /**
    YES if the context needs its content filled in, not just its outer
    attributes edited.  This will be set to YES anytime you push strings into
    the context or if you don't create it with an element to start with.
  */
  needsContent: NO,

  // ..........................................................
  // CORE STRING API
  //

  /**
    Returns the string at the designated index.  If you do not pass anything
    returns the string array.  This index is an offset from the start of the
    strings owned by this context.

    @param {Number} idx the index
    @returns {String|Array}
  */
  get: function (idx) {
    var strings = this.strings || [];
    return (idx === undefined) ? strings.slice(this.offset, this.length) : strings[idx + this.offset];
  },

  /** @deprecated */
  html: function (line) {
    
    SC.warn("Developer Warning: SC.RenderContext:html() is no longer used to push HTML strings.  Please use `push()` instead.");
    
    return this.push(line);
  },

  /**
    Adds a string to the render context for later joining and insertion.  To
    HTML escape the string, see the similar text() method instead.

    Note: You can pass multiple string arguments to this method and each will
    be pushed.

    When used in render() for example,

        MyApp.MyView = SC.View.extend({

          innerText: '',

          render: function (context) {
            var innerText = this.get('innerText');

            // This will be pushed into the DOM all at once.
            context.push('<div class="inner-div">', innerText, '<span class="inner-span">**</span></div>');
          }

        });

    @param {String} line the HTML to add to the context
    @returns {SC.RenderContext} receiver
  */
  push: function (line) {
    var strings = this.strings, len = arguments.length;
    if (!strings) this.strings = strings = []; // create array lazily

    if (len > 1) {
      strings.push.apply(strings, arguments);
    } else {
      strings.push(line);
    }

    // adjust string length for context and all parents...
    var c = this;
    while (c) { c.length += len; c = c.prevObject; }

    this.needsContent = YES;

    return this;
  },

  /**
    Pushes the passed string to the render context for later joining and
    insertion, but first escapes the string to ensure that no user-entered HTML
    is processed as HTML.  To push the string without escaping, see the similar
    push() method instead.

    Note: You can pass multiple string arguments to this method and each will
    be escaped and pushed.

    When used in render() for example,

        MyApp.MyView = SC.View.extend({

          userText: '<script src="http://maliciousscripts.com"></script>',

          render: function (context) {
            var userText = this.get('userText');

            // Pushes "&lt;script src="http://maliciousscripts.com"&gt;&lt;/script&gt;" in the DOM
            context.text(userText);
          }

        });

    @param {String} line the text to add to the context
    @returns {SC.RenderContext} receiver
  */
  text: function () {
    var len = arguments.length,
      idx = 0;

    for (idx = 0; idx < len; idx++) {
      this.push(SC.RenderContext.escapeHTML(arguments[idx]));
    }

    return this;
  },

  /**
    Joins the strings together, closes any open tags and returns the final result.

    @param {String} joinChar optional string to use in joins. def empty string
    @returns {String} joined string
  */
  join: function (joinChar) {
    // generate tag if needed...
    if (this._needsTag) this.end();

    var strings = this.strings;
    return strings ? strings.join(joinChar || '') : '';
  },

  // ..........................................................
  // GENERATING
  //

  /**
    Begins a new render context based on the passed tagName or element.
    Generate said context using end().

    @returns {SC.RenderContext} new context
  */
  begin: function (tagNameOrElement) {
    return SC.RenderContext(tagNameOrElement, this);
  },

  /**
    If the current context targets an element, this method returns the
    element.  If the context does not target an element, this method will
    render the context into an offscreen element and return it.

    @returns {DOMElement} the element
  */
  element: function () {
    return this._elem ? this._elem : SC.$(this.join())[0];
  },

  /**
    Removes an element with the passed id in the currently managed element.
  */
  remove: function (elementId) {
    if (!elementId) return;

    var el, elem = this._elem;
    if (!elem || !elem.removeChild) return;

    el = document.getElementById(elementId);
    if (el) {
      el = elem.removeChild(el);
      el = null;
    }
  },

  /**
    If an element was set on this context when it was created, this method
    will actually apply any changes to the element itself.  If you have not
    written any inner html into the context, then the innerHTML of the
    element will not be changed, otherwise it will be replaced with the new
    innerHTML.

    Also, any attributes, id, classNames or styles you've set will be
    updated as well.  This also ends the editing context session and cleans
    up.

    @returns {SC.RenderContext} previous context or null if top
  */
  update: function () {
    var elem = this._elem,
        mode = this.updateMode,
        cq, value, factory, cur, next;

    // this._innerHTMLReplaced = NO;

    if (!elem) {
      // throw new Error("Cannot update context because there is no source element");
      return;
    }

    cq = this.$();

    // replace innerHTML
    if (this.length > 0) {
      // this._innerHTMLReplaced = YES;
      if (mode === SC.MODE_REPLACE) {
        cq.html(this.join());
      } else {
        factory = elem.cloneNode(false);
        factory.innerHTML = this.join();
        cur = factory.firstChild;
        while (cur) {
          next = cur.nextSibling;
          elem.insertBefore(cur, next);
          cur = next;
        }
        cur = next = factory = null; // cleanup
      }
    }

    // attributes, styles, and class names will already have been set.

    // id="foo"
    if (this._idDidChange && (value = this._id)) {
      cq.attr('id', value);
    }

    // now cleanup element...
    elem = this._elem = null;
    return this.prevObject || this;
  },

  // these are temporary objects are reused by end() to avoid memory allocs.
  _DEFAULT_ATTRS: {},

  /**
    Ends the current tag editing context.  This will generate the tag string
    including any attributes you might have set along with a closing tag.

    The generated HTML will be added to the render context strings.  This will
    also return the previous context if there is one or the receiver.

    If you do not have a current tag, this does nothing.

    @returns {SC.RenderContext}
  */
  end: function () {
    // NOTE: If you modify this method, be careful to consider memory usage
    // and performance here.  This method is called frequently during renders
    // and we want it to be as fast as possible.

    // generate opening tag.

    // get attributes first.  Copy in className + styles...
    var tag = '', styleStr = '', key, value,
        attrs = this._attrs, className = this._classes,
        id = this._id, styles = this._styles, strings, selfClosing;

    // add tag to tag array
    tag = '<' + this._tagName;

    // add any attributes...
    if (attrs || className || styles || id) {
      if (!attrs) attrs = this._DEFAULT_ATTRS;
      if (id) attrs.id = id;
      // old versions of safari (5.0)!!!! throw an error if we access
      // attrs.class. meh...
      if (className) attrs['class'] = className.join(' ');

      // add in styles.  note how we avoid memory allocs here to keep things
      // fast...
      if (styles) {
        for (key in styles) {
          if (!styles.hasOwnProperty(key)) continue;
          value = styles[key];
          if (value === null) continue; // skip empty styles
          if (typeof value === SC.T_NUMBER && !SC.NON_PIXEL_PROPERTIES.contains(key)) value += "px";
          styleStr = styleStr + this._dasherizeStyleName(key) + ": " + value + "; ";
        }
        attrs.style = styleStr;
      }

      // now convert attrs hash to tag array...
      tag = tag + ' '; // add space for joining0
      for (key in attrs) {
        if (!attrs.hasOwnProperty(key)) continue;
        value = attrs[key];
        if (value === null) continue; // skip empty attrs
        tag = tag + key + '="' + value + '" ';
      }

      // if we are using the DEFAULT_ATTRS temporary object, make sure we
      // reset.
      if (attrs === this._DEFAULT_ATTRS) {
        delete attrs.style;
        delete attrs['class'];
        delete attrs.id;
      }

    }

    // this is self closing if there is no content in between and selfClosing
    // is not set to false.
    strings = this.strings;
    selfClosing = (this._selfClosing === NO) ? NO : (this.length === 1);
    tag = tag + (selfClosing ? ' />' : '>');

    strings[this.offset] = tag;

    // now generate closing tag if needed...
    if (!selfClosing) {
      strings.push('</' + this._tagName + '>');

      // increase length of receiver and all parents
      var c = this;
      while (c) { c.length++; c = c.prevObject; }
    }

    // if there was a source element, cleanup to avoid memory leaks
    this._elem = null;
    return this.prevObject || this;
  },

  /**
    Generates a tag with the passed options.  Like calling context.begin().end().

    @param {String} tagName optional tag name.  default 'div'
    @param {Hash} opts optional tag options.  defaults to empty options.
    @returns {SC.RenderContext} receiver
  */
  tag: function (tagName, opts) {
    return this.begin(tagName, opts).end();
  },

  // ..........................................................
  // BASIC HELPERS
  //

  /**
    Reads outer tagName if no param is passed, sets tagName otherwise.

    @param {String} tagName pass to set tag name.
    @returns {String|SC.RenderContext} tag name or receiver
  */
  tagName: function (tagName) {
    if (tagName === undefined) {
      if (!this._tagName && this._elem) this._tagName = this._elem.tagName;
      return this._tagName;
    } else {
      this._tagName = tagName;
      this._tagNameDidChange = YES;
      return this;
    }
  },

  /**
    Reads the outer tag id if no param is passed, sets the id otherwise.

    @param {String} idName the id or set
    @returns {String|SC.RenderContext} id or receiver
  */
  id: function (idName) {
    if (idName === undefined) {
      if (!this._id && this._elem) this._id = this._elem.id;
      return this._id;
    } else {
      this._id = idName;
      this._idDidChange = YES;
      return this;
    }
  },

  // ..........................................................
  // CSS CLASS NAMES SUPPORT
  //

  /** @deprecated */
  classNames: function (deprecatedArg) {
    if (deprecatedArg) {
      
      SC.warn("Developer Warning: SC.RenderContext:classNames() (renamed to classes()) is no longer used to set classes, only to retrieve them.  Please use `setClass()` instead.");
      
      return this.setClass(deprecatedArg);
    } else {
      
      SC.warn("Developer Warning: SC.RenderContext:classNames() has been renamed to classes() to better match the API of setClass() and resetClasses().  Please use `classes()` instead.");
      
      return this.classes();
    }
  },

  /**
    Retrieves the class names for the current context.

    @returns {Array} classNames array
  */
  classes: function () {
    if (!this._classes) {
      if (this._elem) {
        // Get the classes from the element.
        var attr = this.$().attr('class');

        if (attr && (attr = attr.toString()).length > 0) {
          this._classes = attr.split(/\s/);
        } else {
          // No class on the element.
          this._classes = [];
        }
      } else {
        this._classes = [];
      }
    }

    return this._classes;
  },

  /**
    Adds a class or classes to the current context.

    This is a convenience method that simply calls setClass(nameOrClasses, YES).

    @param {String|Array} nameOrClasses a class name or an array of class names
    @returns {SC.RenderContext} receiver
  */
  addClass: function (nameOrClasses) {
    // Convert arrays into objects for use by setClass
    if (SC.typeOf(nameOrClasses) === SC.T_ARRAY) {
      for (var i = 0, length = nameOrClasses.length, obj = {}; i < length; i++) {
        obj[nameOrClasses[i]] = YES;
      }
      nameOrClasses = obj;
    }

    return this.setClass(nameOrClasses, YES);
  },

  /**
    Removes the specified class name from the current context.

    This is a convenience method that simply calls setClass(name, NO).

    @param {String} name the class to remove
    @returns {SC.RenderContext} receiver
  */
  removeClass: function (name) {
    return this.setClass(name, NO);
  },

  /**
    Sets or unsets class names on the current context.

    You can either pass a single class name and a boolean indicating whether
    the value should be added or removed, or you can pass a hash with all
    the class names you want to add or remove with a boolean indicating
    whether they should be there or not.

    When used in render() for example,

        MyApp.MyView = SC.View.extend({

          isAdministrator: NO,

          render: function (context) {
            var isAdministrator = this.get('isAdministrator');

            // Sets the 'is-admin' class appropriately.
            context.setClass('is-admin', isAdministrator);
          }

        });

    @param {String|Hash} nameOrClasses either a single class name or a hash of class names with boolean values indicating whether to add or remove the class
    @param {Boolean} shouldAdd if a single class name for nameOrClasses is passed, this
    @returns {SC.RenderContext} receiver
  */
  setClass: function (nameOrClasses, shouldAdd) {
    var didChange = NO,
      classes = this.classes();

    // Add the updated classes to the internal classes object.
    if (SC.typeOf(nameOrClasses) === SC.T_ARRAY) {
      
      SC.warn("Developer Warning: SC.RenderContext:setClass() should not be passed an array of class names.  To remain compatible with calls to the deprecated classNames() function, all classes on the current context will be replaced with the given array, but it would be more accurate in the future to call resetClasses() and addClass() or setClass(hash) instead.  Please update your code accordingly.");
      
      this.resetClasses();
      classes = this.classes();

      for (var i = 0, length = nameOrClasses.length; i < length; i++) {
        didChange = this._setClass(classes, nameOrClasses[i], YES) || didChange;
      }
    } else if (SC.typeOf(nameOrClasses) === SC.T_HASH) {
      for (var name in nameOrClasses) {
        if (!nameOrClasses.hasOwnProperty(name)) continue;

        shouldAdd = nameOrClasses[name];
        didChange = this._setClass(classes, name, shouldAdd) || didChange;
      }
    } else {
      didChange = this._setClass(classes, nameOrClasses, shouldAdd);
    }

    if (didChange) {
      this._classesDidChange = YES;

      // Apply the styles to the element if we have one already.
      if (this._elem) {
        this.$().attr('class', classes.join(' '));
      }
    }

    return this;
  },

  /** @private */
  _setClass: function (classes, name, shouldAdd) {
    var didChange = NO,
      idx;

    idx = classes.indexOf(name);
    if (idx >= 0 && !shouldAdd) {
      classes.splice(idx, 1);
      didChange = YES;
    } else if (idx < 0 && shouldAdd) {
      classes.push(name);
      didChange = YES;
    }

    return didChange;
  },

  /**
    Returns YES if the outer tag current has the passed class name, NO
    otherwise.

    @param {String} name the class name
    @returns {Boolean}
  */
  hasClass: function (name) {
    if (this._elem) {
      return this.$().hasClass(name);
    }

    return this.classes().indexOf(name) >= 0;
  },

  /** @deprecated */
  resetClassNames: function () {
    
    SC.warn("Developer Warning: SC.RenderContext:resetClassNames() has been renamed to resetClasses to better match the API of classes(GET) and setClass(SET).  Please use `resetClasses()` instead.");
    
    return this.resetClasses();
  },

  /**
    Removes all class names from the context.

    Be aware that setClass() only effects the class names specified.  If there
    are existing class names that are not modified by a call to setClass(), they
    will remain on the context.  For example, if you call addClass('a') and
    addClass('b') followed by setClass({ b:NO }), the 'b' class will be
    removed, but the 'a' class will be unaffected.

    If you want to call setClass() or addClass() to replace all classes, you
    should call this method first.

    @returns {SC.RenderContext} receiver
  */
  resetClasses: function () {
    var didChange = NO,
      classes = this.classes();

    // Check for changes.
    didChange = classes.length;

    // Reset.
    this._classes = [];
    if (didChange) {
      this._classesDidChange = YES;

      // Apply the styles to the element if we have one already.
      if (this._elem) {
        this.$().attr('class', '');
      }
    }

    return this;
  },

  // ..........................................................
  // CSS Styles Support
  //

  /** @private */
  _STYLE_REGEX: /-?\s*([^:\s]+)\s*:\s*([^;]+)\s*;?/g,

  /**
    Retrieves the current styles for the context.

    @returns {Object} styles hash
  */
  styles: function (deprecatedArg) {
    // Fast path!
    if (deprecatedArg) {
      
      SC.warn("Developer Warning: SC.RenderContext:styles() is no longer used to set styles, only to retrieve them.  Please use `setStyle(%@)` instead.".fmt(deprecatedArg));
      
      return this.setStyle(deprecatedArg);
    }

    if (!this._styles) {
      if (this._elem) {
        // Get the styles from the element.
        var attr = this.$().attr('style');

        if (attr && (attr = attr.toString()).length > 0) {
          // Ensure attributes are lower case for IE
          if (SC.browser.name === SC.BROWSER.ie) {
            attr = attr.toLowerCase();
          }
          var styles = {},
            match,
            regex = this._STYLE_REGEX;

          regex.lastIndex = 0;
          while (match = regex.exec(attr)) {
            styles[this._camelizeStyleName(match[1])] = match[2];
          }

          this._styles = styles;
        } else {
          // No style on the element.
          this._styles = {};
        }
      } else {
        this._styles = {};
      }
    }

    return this._styles;
  },

  /**
    Adds the specified style to the current context.

    This is a convenience method that simply calls setStyle(nameOrStyles, value).

    @param {String|Object} nameOrStyles the name of a style or a hash of style names with values
    @param {String|Number} value style value if a single style name for nameOrStyles is passed
    @returns {SC.RenderContext} receiver
  */
  addStyle: function (nameOrStyles, value) {
    
    // Notify when this function isn't being used properly (in debug mode only).
    /*jshint eqnull:true*/
    if (SC.typeOf(nameOrStyles) === SC.T_STRING && value == null) {
      SC.warn("Developer Warning: SC.RenderContext:addStyle is not meant to be used to remove attributes by setting the value to null or undefined.  It would be more correct to use setStyle(%@, %@).".fmt(nameOrStyles, value));
    }
    
    return this.setStyle(nameOrStyles, value);
  },

  /**
    Removes the specified style from the current context.

    This is a convenience method that simply calls setStyle(name, undefined).

    @param {String} styleName the name of the style to remove
    @returns {SC.RenderContext} receiver
  */
  removeStyle: function (styleName) {
    return this.setStyle(styleName);
  },

  /** @deprecated */
  css: function (nameOrStyles, value) {
    
    SC.warn("Developer Warning: In order to simplify the API to a few core functions, SC.RenderContext:css() has been deprecated in favor of setStyle which performs the same function.  Please use `setStyle(%@, %@)` instead.".fmt(nameOrStyles, value));
    
    return this.setStyle(nameOrStyles, value);
  },

  /**
    Sets or unsets a style or styles on the context.

    Passing a value will set the value for the given style name, passing a null
    or undefined value will unset any current value for the given style name and
    remove it.

    Be aware that setStyle() only effects the styles specified.  If there
    are existing styles that are not modified by a call to setStyle(), they
    will remain on the context.  For example, if you call addStyle('margin-left', 10)
    and addStyle('margin-right', 10) followed by setClass({ 'margin-right': null }),
    the 'margin-right' style will be removed, but the 'margin-left' style will
    be unaffected.

    If you want to call setStyle() or addStyle() to replace all styles, you
    should call resetStyles() method first.

    When used in render() for example,

        MyApp.MyView = SC.View.extend({

          textColor: 'blue',

          // By default this syle will not appear since the value is null.
          fontFamily: null,

          render: function (context) {
            var textColor = this.get('textColor'),
              fontFamily = this.get('fontFamily');

            // Set the `color` and `fontFamily` styles.
            context.setStyle({
              color: textColor,
              fontFamily: fontFamily
            });
          }
        });

    @param {String|Object} nameOrStyles the name of a style or a hash of style names with values
    @param {String|Number} [value] style value if a single style name for nameOrStyles is passed
    @returns {SC.RenderContext} receiver
  */
  setStyle: function (nameOrStyles, value) {
    var didChange = NO,
      styles = this.styles();

    // Add the updated styles to the internal styles object.
    if (SC.typeOf(nameOrStyles) === SC.T_HASH) {
      for (var key in nameOrStyles) {
        // Call a separate function so that it may be optimized.
        didChange = this._sc_setStyleFromObject(didChange, key, nameOrStyles, styles);
      }
    } else {
      didChange = this._deleteComboStyles(styles, nameOrStyles);
      didChange = this._setOnHash(styles, nameOrStyles, value) || didChange;
    }

    // Set the styles on the element if we have one already.
    if (didChange && this._elem) {
      // Note: jQuery .css doesn't remove old styles
      this.$().css(styles);
    }

    return this;
  },

  /** @private Sets the style by key from the styles object. This allows for optimization outside of the for..in loop. */
  _sc_setStyleFromObject: function (didChange, key, stylesObject, styles) {
    if (!stylesObject.hasOwnProperty(key)) return false;

    var value = stylesObject[key];

    didChange = this._deleteComboStyles(styles, key) || didChange;
    didChange = this._setOnHash(styles, key, value) || didChange;

    return didChange;
  },

  /** @private */
  _deleteComboStyles: function (styles, key) {
    var comboStyles = SC.COMBO_STYLES[key],
        didChange = NO, tmp;

    if (comboStyles) {
      for (var idx = 0, idxLen = comboStyles.length; idx < idxLen; idx++) {
        tmp = comboStyles[idx];
        if (styles[tmp]) {
          delete styles[tmp];
          didChange = YES;
        }
      }
    }

    return didChange;
  },

  /** @private Sets or unsets the key:value on the hash and returns whether a change occurred. */
  _setOnHash: function (hash, key, value) {
    var cur = hash[key],
      didChange = true;

    /*jshint eqnull:true */
    if (cur == null && value != null) {
      hash[key] = value;
    } else if (cur != null && value == null) {
      // Unset using '' so that jQuery will remove the value, null is not reliable (ex. WebkitTransform)
      hash[key] = '';
    } else if (cur != value) {
      hash[key] = value;
    } else {
      didChange = false;
    }

    return didChange;
  },

  /**
    Removes all styles from the context.

    Be aware that setStyle() only affects the styles specified.  If there
    are existing styles that are not modified by a call to setStyle(), they
    will remain on the context.  For example, if you call addStyle('margin-left', 10)
    and addStyle('margin-right', 10) followed by setClass({ 'margin-right': null }),
    the 'margin-right' style will be removed, but the 'margin-left' style will
    be unaffected.

    If you want to call setStyle() or addStyle() to replace all styles, you
    should call this method first.

    @returns {SC.RenderContext} receiver
   */
  resetStyles: function () {
    var didChange = NO,
      styles = this.styles();

    // Check for changes (i.e. are there any properties in the object).
    for (var key in styles) {
      if (!styles.hasOwnProperty(key)) continue;

      didChange = YES;
    }

    // Reset.
    this._styles = {};
    if (didChange) {
      // Apply the styles to the element if we have one already.
      if (this._elem) {
        this.$().attr('style', '');
      }
    }

    return this;
  },

  // ..........................................................
  // ARBITRARY ATTRIBUTES SUPPORT
  //

  /**
    Retrieves the current attributes for the context, less the class and style
    attributes.

    If you retrieve the attributes hash to edit it, you must pass the hash back
    to setAttr in order for it to be applied to the element on rendering.

    Use classes() or styles() to get those specific attributes.

    @returns {Object} attributes hash
  */
  attrs: function () {
    if (!this._attrs) {
      if (this._elem) {
        // Get the attributes from the element.
        var attrs = {},
          elAttrs = this._elem.attributes,
          length = elAttrs.length;

        for (var i = 0, attr, name; i < length; i++) {
          attr = elAttrs.item(i);
          name = attr.nodeName;
          if (name.match(/^(?!class|style).*$/i)) {
            attrs[name] = attr.value;
          }
        }

        this._attrs = attrs;
      } else {
        this._attrs = {};
      }
    }

    return this._attrs;
  },

  /** @deprecated */
  attr: function (nameOrAttrs, value) {
    // Fast path.
    if (nameOrAttrs) {

      if (SC.typeOf(nameOrAttrs) === SC.T_HASH || value !== undefined) {
        
        SC.warn("Developer Warning: SC.RenderContext:attr() is no longer used to set attributes.  Please use `setAttr()` instead, which matches the API of setClass() and setStyle().");
        
        return this.setAttr(nameOrAttrs, value);
      } else {
        
        SC.warn("Developer Warning: SC.RenderContext:attr() is no longer used to get an attribute.  Please use `attrs()` instead to retrieve the hash and check properties on it directly, which matches the API of classes() and styles().");
        
        return this.attrs()[nameOrAttrs];
      }
    }
    
    SC.warn("Developer Warning: SC.RenderContext:attr() is no longer used to get attributes.  Please use `attrs()` instead, which matches the API of classes() and styles().");
    

    return this.attrs();
  },

  /**
    Adds the specified attribute to the current context.

    This is a convenience method that simply calls setAttr(nameOrAttrs, value).

    @param {String|Object} nameOrAttrs the name of an attribute or a hash of attribute names with values
    @param {String|Number} value attribute value if a single attribute name for nameOrAttrs is passed
    @returns {SC.RenderContext} receiver
  */
  addAttr: function (nameOrAttrs, value) {
    
    // Notify when this function isn't being used properly (in debug mode only).
    /*jshint eqnull:true*/
    if (SC.typeOf(nameOrAttrs) === SC.T_STRING && value == null) {
      SC.warn("Developer Warning: SC.RenderContext:addAttr is not meant to be used to remove attributes by setting the value to null or undefined.  It would be more correct to use setAttr(%@, %@).".fmt(nameOrAttrs, value));
    }
    
    return this.setAttr(nameOrAttrs, value);
  },

  /**
    Removes the specified attribute from the current context.

    This is a convenience method that simply calls setAttr(name, undefined).

    @param {String} styleName the name of the attribute to remove
    @returns {SC.RenderContext} receiver
  */
  removeAttr: function (name) {
    
    // Notify when this function isn't being used properly (in debug mode only).
    if (name.match(/^(class|style)$/i)) {
      SC.error("Developer Error: SC.RenderContext:removeAttr is not meant to be used to remove the style or class attribute.  You should use resetClasses() or resetStyles().");
    }
    

    return this.setAttr(name);
  },

  /**
    Sets or unsets an attribute or attributes on the context.  Passing a value
    will set the value for the given attribute name, passing a null or undefined
    value will unset any current value for the given attribute name and remove
    it.

    When used in render() for example,

        MyApp.MyView = SC.View.extend({

          // By default this syle will not appear since the value is null.
          title: null,

          render: function (context) {
            var title = this.get('title');

            // Set the `title` and `data-test` attributes.
            context.setAttr({
              title: title,
              'data-test': SC.buildMode === 'test'
            });
          }
        });

    @param {String|Object} nameOrAttrs the name of an attribute or a hash of attribute names with values
    @param {String} [value] attribute value if a single attribute name for nameOrAttrs is passed
    @returns {SC.RenderContext} receiver
  */
  setAttr: function (nameOrAttrs, value) {
    var didChange = NO,
      attrs = this.attrs(),
      key;

    
    // Add some developer support to prevent improper use (in debug mode only).
    var foundImproperUse = NO;
    if (SC.typeOf(nameOrAttrs) === SC.T_HASH) {

      for (key in nameOrAttrs) {
        if (key.match(/^(class|style)$/i)) {
          foundImproperUse = YES;
        }
      }
    } else if (nameOrAttrs.match(/^(class|style)$/i)) {
      foundImproperUse = YES;
    }

    if (foundImproperUse) {
      SC.error("Developer Error: setAttr() is not meant to set class or style attributes.  Only classes and styles added with their relevant methods will be used.  Please use setClass() or setStyle().");
    }
    

    // Add the updated attrs to the internal attrs object.
    if (SC.typeOf(nameOrAttrs) === SC.T_HASH) {
      for (key in nameOrAttrs) {
        if (!nameOrAttrs.hasOwnProperty(key)) continue;

        value = nameOrAttrs[key];
        didChange = this._setOnHash(attrs, key, value) || didChange;
      }
    } else {
      didChange = this._setOnHash(attrs, nameOrAttrs, value);
    }

    if (didChange) {
      this._attrsDidChange = YES;

      // Apply the attrs to the element if we have one already.
      if (this._elem) {
        this.$().attr(nameOrAttrs, value);
      }
    }

    return this;
  },

  //
  // COREQUERY SUPPORT
  //
  /**
    Returns a CoreQuery instance for the element this context wraps (if
    it wraps any). If a selector is passed, the CoreQuery instance will
    be for nodes matching that selector.

    Renderers may use this to modify DOM.
   */
  $: function (sel) {
    var ret, elem = this._elem;
    ret = !elem ? SC.$([]) : (sel === undefined) ? SC.$(elem) : SC.$(sel, elem);
    elem = null;
    return ret;
  },


  /** @private
  */
  _camelizeStyleName: function (name) {
    // IE wants the first letter lowercase so we can allow normal behavior
    var needsCap = name.match(/^-(webkit|moz|o)-/),
        camelized = SC.String.camelize(name);

    if (needsCap) {
      return camelized.substr(0, 1).toUpperCase() + camelized.substr(1);
    } else {
      return camelized;
    }
  },

  /** @private
    Converts camelCased style names to dasherized forms
  */
  _dasherizeStyleName: function (name) {
    var dasherized = SC.String.dasherize(name);
    if (dasherized.match(/^(webkit|moz|ms|o)-/)) { dasherized = '-' + dasherized; }
    return dasherized;
  }

});

(function () {
  // this regex matches all <, > or &, unless & is immediately followed by at last 1 up to 7 alphanumeric
  // characters and a ;. For instance:
  // Some evil <script src="evil.js"> but this is legal &amp; these are not & &illegalese;
  // would become:
  // Some evil &lt;script src="evil.js"&gt; but this is legal &amp; these are not &amp; &amp;illegalese;
  var _escapeHTMLRegex = /[<>]|&(?![\d\w#]{1,7};)/g, _escapeHTMLMethod = function (match) {
    switch (match) {
    case '&':
      return '&amp;';
    case '<':
      return '&lt;';
    case '>':
      return '&gt;';
    }
  };

  /**
    Helper method escapes the passed string to ensure HTML is displayed as
    plain text while preserving HTML entities like &apos; , &agrave;, etc.
    You should make sure you pass all user-entered data through
    this method to avoid errors.  You can also do this with the text() helper
    method on a render context.

    @param {String|Number} text value to escape
    @returns {String} string with all HTML values properly escaped
  */
  SC.RenderContext.escapeHTML = function (text) {
    if (!text) return '';
    if (SC.typeOf(text) === SC.T_NUMBER) { text = text.toString(); }
    return text.replace(_escapeHTMLRegex, _escapeHTMLMethod);
  };
})();

/* >>>>>>>>>> BEGIN source/system/selection_set.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  A SelectionSet contains a set of objects that represent the current
  selection.  You can select objects by either adding them to the set directly
  or indirectly by selecting a range of indexes on a source object.

  @extends SC.Object
  @extends SC.Enumerable
  @extends SC.Freezable
  @extends SC.Copyable
  @since SproutCore 1.0
*/
SC.SelectionSet = SC.Object.extend(SC.Enumerable, SC.Freezable, SC.Copyable,
  /** @scope SC.SelectionSet.prototype */ {

  /**
    Walk like a duck.

    @type Boolean
  */
  isSelectionSet: YES,

  /**
    Total number of indexes in the selection set

    @type Number
  */
  length: function() {
    var ret     = 0,
        sets    = this._sets,
        objects = this._objects;
    if (objects) ret += objects.get('length');
    if (sets) sets.forEach(function(s) { ret += s.get('length'); });
    return ret ;
  }.property().cacheable(),

  // ..........................................................
  // INDEX-BASED SELECTION
  //

  /**
    A set of all the source objects used in the selection set.  This
    property changes automatically as you add or remove index sets.

    @type SC.Array
  */
  sources: function() {
    var ret  = [],
        sets = this._sets,
        len  = sets ? sets.length : 0,
        idx, set, source;

    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set && set.get('length')>0 && set.source) ret.push(set.source);
    }
    return ret ;
  }.property().cacheable(),

  /**
    Returns the index set for the passed source object or null if no items are
    seleted in the source.

    @param {SC.Array} source the source object
    @returns {SC.IndexSet} index set or null
  */
  indexSetForSource: function(source) {
    if (!source || !source.isSCArray) return null; // nothing to do

    var cache   = this._indexSetCache,
        objects = this._objects,
        ret, idx;

    // try to find in cache
    if (!cache) cache = this._indexSetCache = {};
    ret = cache[SC.guidFor(source)];
    if (ret && ret._sourceRevision && (ret._sourceRevision !== source.propertyRevision)) {
      ret = null;
    }

    // not in cache.  generate from index sets and any saved objects
    if (!ret) {
      ret = this._indexSetForSource(source, NO);
      if (ret && ret.get('length')===0) ret = null;

      if (objects) {
        if (ret) ret = ret.copy();
        objects.forEach(function(o) {
          if ((idx = source.indexOf(o)) >= 0) {
            if (!ret) ret = SC.IndexSet.create();
            ret.add(idx);
          }
        }, this);
      }

      if (ret) {
        ret = cache[SC.guidFor(source)] = ret.frozenCopy();
        ret._sourceRevision = source.propertyRevision;
      }
    }

    return ret;
  },

  /**
    @private

    Internal method gets the index set for the source, ignoring objects
    that have been added directly.
  */
  _indexSetForSource: function(source, canCreate) {
    if (canCreate === undefined) canCreate = YES;

    var guid  = SC.guidFor(source),
        index = this[guid],
        sets  = this._sets,
        len   = sets ? sets.length : 0,
        ret   = null;

    if (index >= len) index = null;
    if (SC.none(index)) {
      if (canCreate && !this.isFrozen) {
        this.propertyWillChange('sources');
        if (!sets) sets = this._sets = [];
        ret = sets[len] = SC.IndexSet.create();
        ret.source = source ;
        this[guid] = len;
        this.propertyDidChange('sources');
      }

    } else ret = sets ? sets[index] : null;
    return ret ;
  },

  /**
    Add the passed index, range of indexSet belonging to the passed source
    object to the selection set.

    The first parameter you pass must be the source array you are selecting
    from.  The following parameters may be one of a start/length pair, a
    single index, a range object or an IndexSet.  If some or all of the range
    you are selecting is already in the set, it will not be selected again.

    You can also pass an SC.SelectionSet to this method and all the selected
    sets will be added from their instead.

    @param {SC.Array} source source object or object to add.
    @param {Number} start index, start of range, range or IndexSet
    @param {Number} length length if passing start/length pair.
    @returns {SC.SelectionSet} receiver
  */
  add: function(source, start, length) {

    if (this.isFrozen) throw new Error(SC.FROZEN_ERROR);

    var sets, len, idx, set, oldlen, newlen, setlen, objects;

    // normalize
    if (start === undefined && length === undefined) {
      if (!source) throw new Error("Must pass params to SC.SelectionSet.add()");
      if (source.isIndexSet) return this.add(source.source, source);
      if (source.isSelectionSet) {
        sets = source._sets;
        objects = source._objects;
        len  = sets ? sets.length : 0;

        this.beginPropertyChanges();
        for(idx=0;idx<len;idx++) {
          set = sets[idx];
          if (set && set.get('length')>0) this.add(set.source, set);
        }
        if (objects) this.addObjects(objects);
        this.endPropertyChanges();
        return this ;

      }
    }

    set    = this._indexSetForSource(source, YES);
    oldlen = this.get('length');
    setlen = set.get('length');
    newlen = oldlen - setlen;

    set.add(start, length);

    this._indexSetCache = null;

    newlen += set.get('length');
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
      if (setlen === 0) this.notifyPropertyChange('sources');
    }

    return this ;
  },

  /**
    Removes the passed index, range of indexSet belonging to the passed source
    object from the selection set.

    The first parameter you pass must be the source array you are selecting
    from.  The following parameters may be one of a start/length pair, a
    single index, a range object or an IndexSet.  If some or all of the range
    you are selecting is already in the set, it will not be selected again.

    @param {SC.Array} source source object. must not be null
    @param {Number} start index, start of range, range or IndexSet
    @param {Number} length length if passing start/length pair.
    @returns {SC.SelectionSet} receiver
  */
  remove: function(source, start, length) {

    if (this.isFrozen) throw new Error(SC.FROZEN_ERROR);

    var sets, len, idx, i, set, oldlen, newlen, setlen, objects, object;

    // normalize
    if (start === undefined && length === undefined) {
      if (!source) throw new Error("Must pass params to SC.SelectionSet.remove()");
      if (source.isIndexSet) return this.remove(source.source, source);
      if (source.isSelectionSet) {
        sets = source._sets;
        objects = source._objects;
        len  = sets ? sets.length : 0;

        this.beginPropertyChanges();
        for(idx=0;idx<len;idx++) {
          set = sets[idx];
          if (set && set.get('length')>0) this.remove(set.source, set);
        }
        if (objects) this.removeObjects(objects);
        this.endPropertyChanges();
        return this ;
      }
    }

    // save starter info
    set    = this._indexSetForSource(source, YES);
    oldlen = this.get('length');
    newlen = oldlen - set.get('length');

    // if we have objects selected, determine if they are in the index
    // set and remove them as well.
    if (set && (objects = this._objects)) {

      // convert start/length to index set so the iterator below will work...
      if (length !== undefined) {
        start = SC.IndexSet.create(start, length);
        length = undefined;
      }

      for (i = objects.get('length') - 1; i >= 0; --i) {
        object = objects[i];
        idx = source.indexOf(object);
        if (start.contains(idx)) {
          objects.remove(object);
          newlen--;
        }
      }
    }

    // remove indexes from source index set
    set.remove(start, length);
    setlen = set.get('length');
    newlen += setlen;

    // update caches; change enumerable...
    this._indexSetCache = null;
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
      if (setlen === 0) this.notifyPropertyChange('sources');
    }

    return this ;
  },


  /**
    Returns YES if the selection contains the named index, range of indexes.

    @param {Object} source source object for range
    @param {Number} start index, start of range, range object, or indexSet
    @param {Number} length optional range length
    @returns {Boolean}
  */
  contains: function(source, start, length) {
    if (start === undefined && length === undefined) {
      return this.containsObject(source);
    }

    var set = this.indexSetForSource(source);
    if (!set) return NO ;
    return set.contains(start, length);
  },

  /**
    Returns YES if the index set contains any of the passed indexes.  You
    can pass a single index, a range or an index set.

    @param {Object} source source object for range
    @param {Number} start index, range, or IndexSet
    @param {Number} length optional range length
    @returns {Boolean}
  */
  intersects: function(source, start, length) {
    var set = this.indexSetForSource(source, NO);
    if (!set) return NO ;
    return set.intersects(start, length);
  },


  // ..........................................................
  // OBJECT-BASED API
  //

  _TMP_ARY: [],

  /**
    Adds the object to the selection set.  Unlike adding an index set, the
    selection will actually track the object independent of its location in
    the array.

    @param {Object} object
    @returns {SC.SelectionSet} receiver
  */
  addObject: function(object) {
    var ary = this._TMP_ARY, ret;
    ary[0] = object;

    ret = this.addObjects(ary);
    ary.length = 0;

    return ret;
  },

  /**
    Adds objects in the passed enumerable to the selection set.  Unlike adding
    an index set, the seleciton will actually track the object independent of
    its location the array.

    @param {SC.Enumerable} objects
    @returns {SC.SelectionSet} receiver
  */
  addObjects: function(objects) {
    var cur = this._objects,
        oldlen, newlen;
    if (!cur) cur = this._objects = SC.CoreSet.create();
    oldlen = cur.get('length');

    cur.addEach(objects);
    newlen = cur.get('length');

    this._indexSetCache = null;
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
    }
    return this;
  },

  /**
    Removes the object from the selection set.  Note that if the selection
    set also selects a range of indexes that includes this object, it may
    still be in the selection set.

    @param {Object} object
    @returns {SC.SelectionSet} receiver
  */
  removeObject: function(object) {
    var ary = this._TMP_ARY, ret;
    ary[0] = object;

    ret = this.removeObjects(ary);
    ary.length = 0;

    return ret;
  },

  /**
    Removes the objects from the selection set.  Note that if the selection
    set also selects a range of indexes that includes this object, it may
    still be in the selection set.

    @param {Object} object
    @returns {SC.SelectionSet} receiver
  */
  removeObjects: function(objects) {
    var cur = this._objects,
        oldlen, newlen, sets;

    if (!cur) return this;

    oldlen = cur.get('length');

    cur.removeEach(objects);
    newlen = cur.get('length');

    // also remove from index sets, if present
    if (sets = this._sets) {
      sets.forEach(function(set) {
        oldlen += set.get('length');
        set.removeObjects(objects);
        newlen += set.get('length');
      }, this);
    }

    this._indexSetCache = null;
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
    }
    return this;
  },

  /**
    Returns YES if the selection contains the passed object.  This will search
    selected ranges in all source objects.

    @param {Object} object the object to search for
    @returns {Boolean}
  */
  containsObject: function(object) {
    // fast path
    var objects = this._objects ;
    if (objects && objects.contains(object)) return YES ;

    var sets = this._sets,
        len  = sets ? sets.length : 0,
        idx, set;
    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set && set.indexOf(object)>=0) return YES;
    }

    return NO ;
  },


  // ..........................................................
  // GENERIC HELPER METHODS
  //

  /**
    Constrains the selection set to only objects found in the passed source
    object.  This will remove any indexes selected in other sources, any
    indexes beyond the length of the content, and any objects not found in the
    set.

    @param {Object} source the source to limit
    @returns {SC.SelectionSet} receiver
  */
  constrain: function (source) {
    var set, len, max, objects;

    this.beginPropertyChanges();

    // remove sources other than this one
    this.get('sources').forEach(function(cur) {
      if (cur === source) return; //skip
      var set = this._indexSetForSource(source, NO);
      if (set) this.remove(source, set);
    },this);

    // remove indexes beyond end of source length
    set = this._indexSetForSource(source, NO);
    if (set && ((max=set.get('max'))>(len=source.get('length')))) {
      this.remove(source, len, max-len);
    }

    // remove objects not in source
    if (objects = this._objects) {
      var i, cur;
      for (i = objects.length - 1; i >= 0; i--) {
        cur = objects[i];
        if (source.indexOf(cur) < 0) this.removeObject(cur);
      }
    }

    this.endPropertyChanges();
    return this ;
  },

  /**
    Returns YES if the passed index set or selection set contains the exact
    same source objects and indexes as  the receiver.  If you pass any object
    other than an IndexSet or SelectionSet, returns NO.

    @param {Object} obj another object.
    @returns {Boolean}
  */
  isEqual: function(obj) {
    var left, right, idx, len, sources, source;

    // fast paths
    if (!obj || !obj.isSelectionSet) return NO ;
    if (obj === this) return YES;
    if ((this._sets === obj._sets) && (this._objects === obj._objects)) return YES;
    if (this.get('length') !== obj.get('length')) return NO;

    // check objects
    left = this._objects;
    right = obj._objects;
    if (left || right) {
      if ((left ? left.get('length'):0) !== (right ? right.get('length'):0)) {
        return NO;
      }
      if (left && !left.isEqual(right)) return NO ;
    }

    // now go through the sets
    sources = this.get('sources');
    len     = sources.get('length');
    for(idx=0;idx<len;idx++) {
      source = sources.objectAt(idx);
      left = this._indexSetForSource(source, NO);
      right = this._indexSetForSource(source, NO);
      if (!!right !== !!left) return NO ;
      if (left && !left.isEqual(right)) return NO ;
    }

    return YES ;
  },

  /**
    Clears the set.  Removes all IndexSets from the object

    @returns {SC.SelectionSet}
  */
  clear: function() {
    if (this.isFrozen) throw new Error(SC.FROZEN_ERROR);
    if (this._sets) this._sets.length = 0 ; // truncate
    if (this._objects) this._objects = null;

    this._indexSetCache = null;
    this.propertyDidChange('length');
    this.enumerableContentDidChange();
    this.notifyPropertyChange('sources');

    return this ;
  },

  /**
   Clones the set into a new set.

   @returns {SC.SelectionSet}
  */
  copy: function() {
    var ret  = this.constructor.create(),
        sets = this._sets,
        len  = sets ? sets.length : 0 ,
        idx, set;

    if (sets && len>0) {
      sets = ret._sets = sets.slice();
      for(idx=0;idx<len;idx++) {
        if (!(set = sets[idx])) continue ;
        set = sets[idx] = set.copy();
        ret[SC.guidFor(set.source)] = idx;
      }
    }

    if (this._objects) ret._objects = this._objects.copy();
    return ret ;
  },

  /**
    @private

    Freezing a SelectionSet also freezes its internal sets.
  */
  freeze: function() {
    if (this.get('isFrozen')) { return this ; }
    var sets = this._sets,
        loc  = sets ? sets.length : 0,
        set ;

    while(--loc >= 0) {
      set = sets[loc];
      if (set) { set.freeze(); }
    }

    if (this._objects) { this._objects.freeze(); }
    this.set('isFrozen', YES);
    return this;
    // return arguments.callee.base.apply(this,arguments);
  },

  // ..........................................................
  // ITERATORS
  //

  /** @private */
  toString: function() {
    var sets = this._sets || [];
    sets = sets.map(function(set) {
      return set.toString().replace("SC.IndexSet", SC.guidFor(set.source));
    }, this);
    if (this._objects) sets.push(this._objects.toString());
    return "SC.SelectionSet:%@<%@>".fmt(SC.guidFor(this), sets.join(','));
  },

  /** @private */
  firstObject: function() {
    var sets    = this._sets,
        objects = this._objects;

    // if we have sets, get the first one
    if (sets && sets.get('length')>0) {
      var set  = sets ? sets[0] : null,
          src  = set ? set.source : null,
          idx  = set ? set.firstObject() : -1;
      if (src && idx>=0) return src.objectAt(idx);
    }

    // otherwise if we have objects, get the first one
    return objects ? objects.firstObject() : undefined;

  }.property(),

  /** @private
    Implement primitive enumerable support.  Returns each object in the
    selection.
  */
  nextObject: function(count, lastObject, context) {
    var objects, ret;

    // TODO: Make this more efficient.  Right now it collects all objects
    // first.

    if (count === 0) {
      objects = context.objects = [];
      this.forEach(function(o) { objects.push(o); }, this);
      context.max = objects.length;
    }

    objects = context.objects ;
    ret = objects[count];

    if (count+1 >= context.max) {
      context.objects = context.max = null;
    }

    return ret ;
  },

  /**
    Iterates over the selection, invoking your callback with each __object__.
    This will actually find the object referenced by each index in the
    selection, not just the index.

    The callback must have the following signature:

        function callback(object, index, source, indexSet) { ... }

    If you pass a target, it will be used when the callback is called.

    @param {Function} callback function to invoke.
    @param {Object} target optional content. otherwise uses window
    @returns {SC.SelectionSet} receiver
  */
  forEach: function(callback, target) {
    var sets = this._sets,
        objects = this._objects,
        len = sets ? sets.length : 0,
        set, idx;

    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set) set.forEachObject(callback, target);
    }

    if (objects) objects.forEach(callback, target);
    return this ;
  }

});

/** @private */
SC.SelectionSet.prototype.clone = SC.SelectionSet.prototype.copy;

/**
  Default frozen empty selection set

  @property {SC.SelectionSet}
*/
SC.SelectionSet.EMPTY = SC.SelectionSet.create().freeze();


/* >>>>>>>>>> BEGIN source/system/sparse_array.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/delegate_support') ;

/**
  @class

  A dynamically filled array.  A SparseArray makes it easy for you to create
  very large arrays of data but then to defer actually populating that array
  until it is actually needed.  This is often much faster than generating an
  array up front and paying the cost to load your data then.

  Although technically all arrays in JavaScript are "sparse" (in the sense
  that you can read and write properties at arbitrary indexes), this array
  keeps track of which elements in the array have been populated already
  and which ones have not.  If you try to get a value at an index that has
  not yet been populated, the SparseArray will notify a delegate object first,
  giving the delegate a chance to populate the component.

  Most of the time, you will use a SparseArray to incrementally load data
  from the server.  For example, if you have a contact list with 3,000
  contacts in it, you may create a SparseArray with a length of 3,000 and set
  that as the content for a ListView.  As the ListView tries to display the
  visible contacts, it will request them from the SparseArray, which will in
  turn notify your delegate, giving you a chance to load the contact data from
  the server.

  @extends SC.Enumerable
  @extends SC.Array
  @extends SC.Observable
  @extends SC.DelegateSupport
  @since SproutCore 1.0
*/

SC.SparseArray = SC.Object.extend(SC.Observable, SC.Enumerable, SC.Array,
  SC.DelegateSupport, /** @scope SC.SparseArray.prototype */ {

  // ..........................................................
  // LENGTH SUPPORT
  //

  _requestingLength: 0,
  _requestingIndex: 0,

  /**
    The length of the sparse array.  The delegate for the array should set
    this length.

    @type Number
  */
  length: function() {
    var del = this.delegate ;
    if (del && SC.none(this._length) && del.sparseArrayDidRequestLength) {
      this._requestingLength++ ;
      del.sparseArrayDidRequestLength(this);
      this._requestingLength-- ;
    }
    return this._length || 0 ;
  }.property().cacheable(),

  /**
    Call this method from a delegate to provide a length for the sparse array.
    If you pass null for this property, it will essentially "reset" the array
    causing your delegate to be called again the next time another object
    requests the array length.

    @param {Number} length the length or null
    @returns {SC.SparseArray} receiver
  */
  provideLength: function(length) {
    var oldLength;
    if (SC.none(length)) this._sa_content = null ;
    if (length !== this._length) {
      oldLength = this._length;
      this._length = length ;
      if (this._requestingLength <= 0) { this.arrayContentDidChange(0, oldLength||0, length||0) ; }
    }
    return this ;
  },

  // ..........................................................
  // READING CONTENT
  //

  /**
    The minimum range of elements that should be requested from the delegate.
    If this value is set to larger than 1, then the sparse array will always
    fit a requested index into a range of this size and request it.

    @type Number
  */
  rangeWindowSize: 1,

  /**
    This array contains all the start_indexes of ranges requested. This is to
    avoid calling sparseArrayDidRequestRange to often. Indexes are removed and
    added as range requests are completed.
  */
  requestedRangeIndex: null,

  /**
    Make sure to create the index array during init so that it is not shared
    between all instances.
  */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.requestedRangeIndex = [];

    this._TMP_PROVIDE_ARRAY = [];
    this._TMP_PROVIDE_RANGE = { length: 1 };
    this._TMP_RANGE = {};
  },

  /**
    Returns the object at the specified index.  If the value for the index
    is currently undefined, invokes the didRequestIndex() method to notify
    the delegate.

    The omitMaterializing flag ensures that the object will not be materialized,
    but it simply checks for the presence of an object at the specified index
    and will return YES (or undefined if not found). This is useful in the case
    of SparseArrays, where you might NOT want to request the index to be loaded,
    but simply need a shallow check to see if the position has been filled.

    @param {Number} idx the index to get
    @param {Boolean} omitMaterializing
    @return {Object} the object
  */
  objectAt: function(idx, omitMaterializing) {
    var content = this._sa_content, ret ;

    if (idx >= this.get('length')) return undefined;
    if (!content) content = this._sa_content = [] ;
    if ((ret = content[idx]) === undefined) {
      if(!omitMaterializing) this.requestIndex(idx);
      ret = content[idx]; // just in case the delegate provided immediately
    }
    return ret ;
  },

  /**
    Returns the set of indexes that are currently defined on the sparse array.
    If you pass an optional index set, the search will be limited to only
    those indexes.  Otherwise this method will return an index set containing
    all of the defined indexes.  Currently this can be quite expensive if
    you have a lot of indexes defined.

    @param {SC.IndexSet} indexes optional from indexes
    @returns {SC.IndexSet} defined indexes
  */
  definedIndexes: function(indexes) {
    var ret = SC.IndexSet.create(),
        content = this._sa_content,
        idx, len;

    if (!content) return ret.freeze(); // nothing to do

    if (indexes) {
      indexes.forEach(function(idx) {
        if (content[idx] !== undefined) ret.add(idx);
      });
    } else {
      len = content.length;
      for(idx=0;idx<len;idx++) {
        if (content[idx] !== undefined) ret.add(idx);
      }
    }

    return ret.freeze();
  },

  _TMP_RANGE: {},

  /**
    Called by objectAt() whenever you request an index that has not yet been
    loaded.  This will possibly expand the index into a range and then invoke
    an appropriate method on the delegate to request the data.

    It will check if the range has been already requested.

    @param {Number} idx the index to retrieve
    @returns {SC.SparseArray} receiver
  */
  requestIndex: function(idx) {
    var del = this.delegate;
    if (!del) return this; // nothing to do

    // adjust window
    var len = this.get('rangeWindowSize'), start = idx;
    if (len > 1) start = start - Math.floor(start % len);
    if (len < 1) len = 1 ;

    // invoke appropriate callback
    this._requestingIndex++;
    if (del.sparseArrayDidRequestRange) {
      var range = this._TMP_RANGE;
      if(this.wasRangeRequested(start)===-1){
        range.start = start;
        range.length = len;
        this.requestedRangeIndex.push(start);
        del.sparseArrayDidRequestRange(this, range);
      }
    } else if (del.sparseArrayDidRequestIndex) {
      while(--len >= 0) del.sparseArrayDidRequestIndex(this, start + len);
    }
    this._requestingIndex--;

    return this ;
  },

  /*
    This method is called by requestIndex to check if the range has already
    been requested. We assume that rangeWindowSize is not changed often.

     @param {Number} startIndex
     @return {Number} index in requestRangeIndex
  */
  wasRangeRequested: function(rangeStart) {
    var i, ilen;
    for(i=0, ilen=this.requestedRangeIndex.length; i<ilen; i++){
      if(this.requestedRangeIndex[i]===rangeStart) return i;
    }
    return -1;
  },

  /*
    This method has to be called after a request for a range has completed.
    To remove the index from the sparseArray to allow future updates on the
    range.

     @param {Number} startIndex
     @return {Number} index in requestRangeIndex
  */
  rangeRequestCompleted: function(start) {
    var i = this.wasRangeRequested(start);
    if(i>=0) {
      this.requestedRangeIndex.removeAt(i,1);
      return YES;
    }
    return NO;
  },

  /**
    This method sets the content for the specified to the objects in the
    passed array.  If you change the way SparseArray implements its internal
    tracking of objects, you should override this method along with
    objectAt().

    @param {Range} range the range to apply to
    @param {Array} array the array of objects to insert
    @returns {SC.SparseArray} receiver
  */
  provideObjectsInRange: function(range, array) {
    var content = this._sa_content ;
    if (!content) content = this._sa_content = [] ;
    var start = range.start, len = range.length;
    while(--len >= 0) content[start+len] = array.objectAt(len);
    if (this._requestingIndex <= 0) this.arrayContentDidChange(range.start, range.length, range.length);
    return this ;
  },

  /**
    Convenience method to provide a single object at a specified index.  Under
    the covers this calls provideObjectsInRange() so you can override only
    that method and this one will still work.

    @param {Number} index the index to insert
    @param {Object} the object to insert
    @return {SC.SparseArray} receiver
  */
  provideObjectAtIndex: function(index, object) {
    var array = this._TMP_PROVIDE_ARRAY, range = this._TMP_PROVIDE_RANGE;
    array[0] = object;
    range.start = index;
    return this.provideObjectsInRange(range, array);
  },

  /**
    Invalidates the array content in the specified range.  This is not the
    same as editing an array.  Rather it will cause the array to reload the
    content from the delegate again when it is requested.

    @param {Range} the range
    @returns {SC.SparseArray} receiver
  */
  objectsDidChangeInRange: function(range) {

    // delete cached content
    var content = this._sa_content ;
    if (content) {
      // if range covers entire length of cached content, just reset array
      if (range.start === 0 && SC.maxRange(range)>=content.length) {
        this._sa_content = null ;

      // otherwise, step through the changed parts and delete them.
      } else {
        var start = range.start, loc = Math.min(start + range.length, content.length);
        while (--loc>=start) content[loc] = undefined;
      }
    }
    this.arrayContentDidChange(range.start, range.length, range.length) ; // notify
    return this ;
  },

  /**
    Optimized version of indexOf().  Asks the delegate to provide the index
    of the specified object.  If the delegate does not implement this method
    then it will search the internal array directly.

    @param {Object} obj the object to search for
    @returns {Number} the discovered index or -1 if not found
  */
  indexOf: function(obj) {
    var c, ret, del = this.delegate ;
    if (del && del.sparseArrayDidRequestIndexOf) {
      ret = del.sparseArrayDidRequestIndexOf(this, obj);
    }

    if (SC.none(ret)) {
      c = this._sa_content ;
      if (!c) c = this._sa_content = [] ;
      ret = c.indexOf(obj) ;
    }
    return ret;
  },

  // ..........................................................
  // EDITING
  //

  /**
    Array primitive edits the objects at the specified index unless the
    delegate rejects the change.

    @param {Number} idx the index to begin to replace
    @param {Number} amt the number of items to replace
    @param {Array} objects the new objects to set instead
    @returns {SC.SparseArray} receiver
  */
  replace: function(idx, amt, objects) {
    objects = objects || [] ;

    // if we have a delegate, get permission to make the replacement.
    var del = this.delegate ;
    if (del) {
      if (!del.sparseArrayShouldReplace ||
          !del.sparseArrayShouldReplace(this, idx, amt, objects)) {
            return this;
      }
    }

    // go ahead and apply to local content.
    var content = this._sa_content ;
    if (!content) content = this._sa_content = [] ;
    content.replace(idx, amt, objects) ;

    // update length
    var len = objects ? (objects.get ? objects.get('length') : objects.length) : 0;
    var delta = len - amt ;

    this.arrayContentWillChange(idx, amt, len) ;

    if (!SC.none(this._length)) {
      this.propertyWillChange('length');
      this._length += delta;
      this.propertyDidChange('length');
    }

    this.arrayContentDidChange(idx, amt, len);

    return this ;
  },

  /**
    Resets the SparseArray, causing it to reload its content from the
    delegate again.

    @returns {SC.SparseArray} receiver
  */
  reset: function() {
    var oldLength;
    this._sa_content = null ;
    oldLength = this._length;
    this._length = null ;
    this.arrayContentDidChange(0, oldLength, 0);
    this.invokeDelegateMethod(this.delegate, 'sparseArrayDidReset', this);
    return this ;
  }

}) ;

/**
  Convenience metohd returns a new sparse array with a default length already
  provided.

  @param {Number} len the length of the array
  @returns {SC.SparseArray}
*/
SC.SparseArray.array = function(len) {
  return this.create({ _length: len||0 });
};

/* >>>>>>>>>> BEGIN source/system/timer.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  A Timer executes a method after a defined period of time.  Timers are
  significantly more efficient than using setTimeout() or setInterval()
  because they are cooperatively scheduled using the run loop.  Timers are
  also gauranteed to fire at the same time, making it far easier to keep
  multiple timers in sync.

  ## Overview

  Timers were created for SproutCore as a way to efficiently defer execution
  of code fragments for use in Animations, event handling, and other tasks.

  Browsers are typically fairly inconsistent about when they will fire a
  timeout or interval based on what the browser is currently doing.  Timeouts
  and intervals are also fairly expensive for a browser to execute, which
  means if you schedule a large number of them it can quickly slow down the
  browser considerably.

  Timers, on the other handle, are scheduled cooperatively using the
  SC.RunLoop, which uses exactly one timeout to fire itself when needed and
  then executes by timers that need to fire on its own.  This approach can
  be many times faster than using timers and guarantees that timers scheduled
  to execute at the same time generally will do so, keeping animations and
  other operations in sync.

  ## Scheduling a Timer

  To schedule a basic timer, you can simply call SC.Timer.schedule() with
  a target and action you wish to have invoked:

      var timer = SC.Timer.schedule({
        target: myObject, action: 'timerFired', interval: 100
      });

  When this timer fires, it will call the timerFired() method on myObject.

  In addition to calling a method on a particular object, you can also use
  a timer to execute a variety of other types of code:

   - If you include an action name, but not a target object, then the action will be passed down the responder chain.
   - If you include a property path for the action property (e.g. 'MyApp.someController.someMethod'), then the method you name will be executed.
   - If you include a function in the action property, then the function will be executed.  If you also include a target object, the function will be called with this set to the target object.

  In general these properties are read-only.  Changing an interval, target,
  or action after creating a timer will have an unknown effect.

  ## Scheduling Repeating Timers

  In addition to scheduling one time timers, you can also schedule timers to
  execute periodically until some termination date.  You make a timer
  repeating by adding the repeats: YES property:

      var timer = SC.Timer.schedule({
        target: myObject,
        action: 'updateAnimation',
        interval: 100,
        repeats: YES,
        until: Time.now() + 1000
      }) ;

  The above example will execute the myObject.updateAnimation() every 100msec
  for 1 second from the current time.

  If you want a timer to repeat without expiration, you can simply omit the
  until: property.  The timer will then repeat until you invalidate it.

  ## Pausing and Invalidating Timers

  If you have created a timer but you no longer want it to execute, you can
  call the invalidate() method on it.  This will remove the timer from the
  run loop and clear certain properties so that it will not run again.

  You can use the invalidate() method on both repeating and one-time timers.

  If you do not want to invalidate a timer completely but you just want to
  stop the timer from execution temporarily, you can alternatively set the
  isPaused property to YES:

      timer.set('isPaused', YES) ;
      // Perform some critical function; timer will not execute
      timer.set('isPaused', NO) ;

  When a timer is paused, it will be scheduled and will fire like normal,
  but it will not actually execute the action method when it fires.  For a
  one time timer, this means that if you have the timer paused when it fires,
  it may never actually execute the action method.  For repeating timers,
  this means the timer will remain scheduled but simply will not execute its
  action while the timer is paused.

  ## Firing Timers

  If you need a timer to execute immediately, you can always call the fire()
  method yourself.  This will execute the timer action, if the timer is not
  paused.  For a one time timer, it will also invalidate the timer and remove
  it from the run loop.  Repeating timers can be fired anytime and it will
  not interrupt their regular scheduled times.


  @extends SC.Object
  @author Charles Jolley
  @version 1.0
  @since version 1.0
*/
SC.Timer = SC.Object.extend(
/** @scope SC.Timer.prototype */ {

  /**
    The target object whose method will be invoked when the time fires.

    You can set either a target/action property or you can pass a specific
    method.

    @type {Object}
    @field
  */
  target: null,

  /**
    The action to execute.

    The action can be a method name, a property path, or a function.  If you
    pass a method name, it will be invoked on the target object or it will
    be called up the responder chain if target is null.  If you pass a
    property path and it resolves to a function then the function will be
    called.  If you pass a function instead, then the function will be
    called in the context of the target object.

    @type {String, Function}
  */
  action: null,

  /**
    Set if the timer should be created from a memory pool.  Normally you will
    want to leave this set, but if you plan to use bindings or observers with
    this timer, then you must set isPooled to NO to avoid reusing your timer.

    @type Boolean
  */
  isPooled: NO,

  /**
    The time interval in milliseconds.

    You generally set this when you create the timer.  If you do not set it
    then the timer will fire as soon as possible in the next run loop.

    @type {Number}
  */
  interval: 0,

  /**
    Timer start date offset.

    The start date determines when the timer will be scheduled.  The first
    time the timer fires will be interval milliseconds after the start
    date.

    Generally you will not set this property yourself.  Instead it will be
    set automatically to the current run loop start date when you schedule
    the timer.  This ensures that all timers scheduled in the same run loop
    cycle will execute in the sync with one another.

    The value of this property is an offset like what you get if you call
    Date.now().

    @type {Number}
  */
  startTime: null,

  /**
    YES if you want the timer to execute repeatedly.

    @type {Boolean}
  */
  repeats: NO,

  /**
    Last date when the timer will execute.

    If you have set repeats to YES, then you can also set this property to
    have the timer automatically stop executing past a certain date.

    This property should contain an offset value like startOffset.  However if
    you set it to a Date object on create, it will be converted to an offset
    for you.

    If this property is null, then the timer will continue to repeat until you
    call invalidate().

    @type {Date, Number}
  */
  until: null,

  /**
    Set to YES to pause the timer.

    Pausing a timer does not remove it from the run loop, but it will
    temporarily suspend it from firing.  You should use this property if
    you will want the timer to fire again the future, but you want to prevent
    it from firing temporarily.

    If you are done with a timer, you should call invalidate() instead of
    setting this property.

    @type {Boolean}
  */
  isPaused: NO,

  /**
    YES onces the timer has been scheduled for the first time.
  */
  isScheduled: NO,

  /**
    YES if the timer can still execute.

    This read only property will return YES as long as the timer may possibly
    fire again in the future.  Once a timer has become invalid, it cannot
    become valid again.

    @field
    @type {Boolean}
  */
  isValid: YES,

  /**
    Set to the current time when the timer last fired.  Used to find the
    next 'frame' to execute.
  */
  lastFireTime: 0,

  /**
    Computed property returns the next time the timer should fire.  This
    property resets each time the timer fires.  Returns -1 if the timer
    cannot fire again.

    @type Time
  */
  fireTime: function() {
    if (!this.get('isValid')) { return -1 ; }  // not valid - can't fire

    // can't fire w/o startTime (set when schedule() is called).
    var start = this.get('startTime');
    if (!start || start === 0) { return -1; }

    // fire interval after start.
    var interval = this.get('interval'), last = this.get('lastFireTime');
    if (last < start) { last = start; } // first time to fire

    // find the next time to fire
    var next ;
    if (this.get('repeats')) {
      if (interval === 0) { // 0 means fire as fast as possible.
        next = last ; // time to fire immediately!

      // find the next full interval after start from last fire time.
      } else {
        next = start + (Math.floor((last - start) / interval)+1)*interval;
      }

    // otherwise, fire only once interval after start
    } else {
      next = start + interval ;
    }

    // can never have a fireTime after until
    var until = this.get('until');
    if (until && until>0 && next>until) next = until;

    return next ;
  }.property('interval', 'startTime', 'repeats', 'until', 'isValid', 'lastFireTime').cacheable(),

  /**
    Schedules the timer to execute in the runloop.

    This method is called automatically if you create the timer using the
    schedule() class method.  If you create the timer manually, you will
    need to call this method yourself for the timer to execute.

    @returns {SC.Timer} The receiver
  */
  schedule: function() {
    if (!this.get('isValid')) return this; // nothing to do

    this.beginPropertyChanges();

    // if start time was not set explicitly when the timer was created,
    // get it from the run loop.  This way timer scheduling will always
    // occur in sync.
    if (!this.startTime) this.set('startTime', SC.RunLoop.currentRunLoop.get('startTime')) ;

    // now schedule the timer if the last fire time was < the next valid
    // fire time.  The first time lastFireTime is 0, so this will always go.
    var next = this.get('fireTime'), last = this.get('lastFireTime');
    if (next >= last) {
      this.set('isScheduled', YES);
      SC.RunLoop.currentRunLoop.scheduleTimer(this, next);
    }

    this.endPropertyChanges() ;

    return this ;
  },
  /**
    Invalidates the timer so that it will not execute again.  If a timer has
    been scheduled, it will be removed from the run loop immediately.

    @returns {SC.Timer} The receiver
  */
  invalidate: function() {
    this.beginPropertyChanges();
    this.set('isValid', NO);

    var runLoop = SC.RunLoop.currentRunLoop;
    if(runLoop) runLoop.cancelTimer(this);

    this.action = this.target = null ; // avoid memory leaks
    this.endPropertyChanges();

    // return to pool...
    if (this.get('isPooled')) SC.Timer.returnTimerToPool(this);
    return this ;
  },

  /**
    Immediately fires the timer.

    If the timer is not-repeating, it will be invalidated.  If it is repeating
    you can call this method without interrupting its normal schedule.

    @returns {void}
  */
  fire: function() {

    // this will cause the fireTime to recompute
    var last = Date.now();
    this.set('lastFireTime', last);

    var next = this.get('fireTime');

    // now perform the fire action unless paused.
    if (!this.get('isPaused')) this.performAction() ;

     // reschedule the timer if needed...
     if (next > last) {
       this.schedule();
     } else {
       this.invalidate();
     }
  },

  /**
    Actually fires the action. You can override this method if you need
    to change how the timer fires its action.
  */
  performAction: function() {
    var typeOfAction = SC.typeOf(this.action);

    // if the action is a function, just try to call it.
    if (typeOfAction == SC.T_FUNCTION) {
      this.action.call((this.target || this), this) ;

    // otherwise, action should be a string.  If it has a period, treat it
    // like a property path.
    } else if (typeOfAction === SC.T_STRING) {
      if (this.action.indexOf('.') >= 0) {
        var path = this.action.split('.') ;
        var property = path.pop() ;

        var target = SC.objectForPropertyPath(path, window) ;
        var action = target.get ? target.get(property) : target[property];
        if (action && SC.typeOf(action) == SC.T_FUNCTION) {
          action.call(target, this) ;
        } else {
          throw new Error('%@: Timer could not find a function at %@'.fmt(this, this.action));
        }

      // otherwise, try to execute action direction on target or send down
      // responder chain.
      } else {
        SC.RootResponder.responder.sendAction(this.action, this.target, this);
      }
    }
  },

  init: function() {
    arguments.callee.base.apply(this,arguments);

    // convert startTime and until to times if they are dates.
    if (this.startTime instanceof Date) {
      this.startTime = this.startTime.getTime() ;
    }

    if (this.until instanceof Date) {
      this.until = this.until.getTime() ;
    }
  },

  /** @private - Default values to reset reused timers to. */
  RESET_DEFAULTS: {
    target: null, action: null,
    isPooled: NO, isPaused: NO, isScheduled: NO, isValid: YES,
    interval: 0, repeats: NO, until: null,
    startTime: null, lastFireTime: 0
  },

  /**
    Resets the timer settings with the new settings.  This is the method
    called by the Timer pool when a timer is reused.  You will not normally
    call this method yourself, though you could override it if you need to
    reset additional properties when a timer is reused.

    @params {Hash} props properties to copy over
    @returns {SC.Timer} receiver
  */
  reset: function(props) {
    if (!props) props = SC.EMPTY_HASH;

    // note: we copy these properties manually just to make them fast.  we
    // don't expect you to use observers on a timer object if you are using
    // pooling anyway so this won't matter.  Still notify of property change
    // on fireTime to clear its cache.
    this.propertyWillChange('fireTime');
    var defaults = this.RESET_DEFAULTS ;
    for(var key in defaults) {
      if (!defaults.hasOwnProperty(key)) continue ;
      this[key] = SC.none(props[key]) ? defaults[key] : props[key];
    }
    this.propertyDidChange('fireTime');
    return this ;
  },

  // ..........................................................
  // TIMER QUEUE SUPPORT
  //

  /** @private - removes the timer from its current timerQueue if needed.
    return value is the new "root" timer.
  */
  removeFromTimerQueue: function(timerQueueRoot) {
    var prev = this._timerQueuePrevious, next = this._timerQueueNext ;

    if (!prev && !next && timerQueueRoot !== this) return timerQueueRoot ; // not in a queue...

    // else, patch up to remove...
    if (prev) prev._timerQueueNext = next ;
    if (next) next._timerQueuePrevious = prev ;
    this._timerQueuePrevious = this._timerQueueNext = null ;
    return (timerQueueRoot === this) ? next : timerQueueRoot ;
  },

  /** @private - schedules the timer in the queue based on the runtime. */
  scheduleInTimerQueue: function(timerQueueRoot, runTime) {
    this._timerQueueRunTime = runTime ;

    // find the place to begin
    var beforeNode = timerQueueRoot;
    var afterNode = null ;
    while(beforeNode && beforeNode._timerQueueRunTime < runTime) {
      afterNode = beforeNode ;
      beforeNode = beforeNode._timerQueueNext;
    }

    if (afterNode) {
      afterNode._timerQueueNext = this ;
      this._timerQueuePrevious = afterNode ;
    }

    if (beforeNode) {
      beforeNode._timerQueuePrevious = this ;
      this._timerQueueNext = beforeNode ;
    }

    // I am the new root if beforeNode === root
    return (beforeNode === timerQueueRoot) ? this : timerQueueRoot ;
  },

  /** @private
    adds the receiver to the passed array of expired timers based on the
    current time and then recursively calls the next timer.  Returns the
    first timer that is not expired.  This is faster than iterating through
    the timers because it does some faster cleanup of the nodes.
  */
  collectExpiredTimers: function(timers, now) {
    if (this._timerQueueRunTime > now) return this ; // not expired!
    timers.push(this);  // add to queue.. fixup next. assume we are root.
    var next = this._timerQueueNext ;
    this._timerQueueNext = null;
    if (next) next._timerQueuePrevious = null;
    return next ? next.collectExpiredTimers(timers, now) : null;
  }

}) ;

/** @scope SC.Timer */

/*
  Created a new timer with the passed properties and schedules it to
  execute.  This is the same as calling SC.Time.create({ props }).schedule().

  Note that unless you explicitly set isPooled to NO, this timer will be
  pulled from a shared memory pool of timers.  You cannot using bindings or
  observers on these timers as they may be reused for future timers at any
  time.

  @params {Hash} props Any properties you want to set on the timer.
  @returns {SC.Timer} new timer instance.
*/
SC.Timer.schedule = function(props) {
  // get the timer.
  var timer ;
  if (!props || SC.none(props.isPooled) || props.isPooled) {
    timer = this.timerFromPool(props);
  } else timer = this.create(props);
  return timer.schedule();
} ;

/**
  Returns a new timer from the timer pool, copying the passed properties onto
  the timer instance.  If the timer pool is currently empty, this will return
  a new instance.
*/
SC.Timer.timerFromPool = function(props) {
  var timers = this._timerPool;
  if (!timers) timers = this._timerPool = [] ;
  var timer = timers.pop();
  if (!timer) timer = this.create();
  return timer.reset(props) ;
};

/**
  Returns a timer instance to the timer pool for later use.  This is done
  automatically when a timer is invalidated if isPooled is YES.
*/
SC.Timer.returnTimerToPool = function(timer) {
  if (!this._timerPool) this._timerPool = [];

  this._timerPool.push(timer);
  return this ;
};



/* >>>>>>>>>> BEGIN source/system/utils.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// These are helpful utility functions for calculating range and rect values
sc_require('system/browser');

SC.mixin( /** @scope SC */ {

  /**
    Takes a URL of any type and normalizes it into a fully qualified URL with
    hostname.  For example:

        "some/path" => "http://localhost:4020/some/path"
        "/some/path" => "http://localhost:4020/some/path"
        "http://localhost:4020/some/path" => "http://localhost:4020/some/path"

    @param url {String} the URL
    @returns {String} the normalized URL
  */
  normalizeURL: function(url) {
    if (url.slice(0,1) == '/') {
      url = window.location.protocol + '//' + window.location.host + url ;
    } else if ((url.slice(0,5) == 'http:') || (url.slice(0,6) == 'https:')) {
      // no change
    } else {
      url = window.location.href + '/' + url ;
    }
    return url ;
  },

  /** Return true if the number is between 0 and 1 */
  isPercentage: function(val){
    return (val<1 && val>0);
  },

  /** Return the left edge of the frame */
  minX: function(frame) {
    return frame.x || 0;
  },

  /** Return the right edge of the frame. */
  maxX: function(frame) {
    return (frame.x || 0) + (frame.width || 0);
  },

  /** Return the midpoint of the frame. */
  midX: function(frame) {
    return (frame.x || 0) + ((frame.width || 0) / 2) ;
  },

  /** Return the top edge of the frame */
  minY: function(frame) {
    return frame.y || 0 ;
  },

  /** Return the bottom edge of the frame */
  maxY: function(frame) {
    return (frame.y || 0) + (frame.height || 0) ;
  },

  /** Return the midpoint of the frame */
  midY: function(frame) {
    return (frame.y || 0) + ((frame.height || 0) / 2) ;
  },

  /** Returns the point that will center the frame X within the passed frame. */
  centerX: function(innerFrame, outerFrame) {
    return (outerFrame.width - innerFrame.width) / 2 ;
  },

  /** Return the point that will center the frame Y within the passed frame. */
  centerY: function(innerFrame, outerFrame) {
    return (outerFrame.height - innerFrame.height) /2  ;
  },

  /**
    The offset of an element.

    This function returns the left and top offset of an element with respect to either the document, the
    viewport or the element's parent element.  In standard SproutCore applications, the coordinates of the
    viewport are equivalent to the document, but a HTML5 application that wishes to use this component
    of SproutCore might need to properly distinguish between the two.

    For a useful discussion on the concepts of offsets and coordinates, see:
    http://www.quirksmode.org/mobile/viewports.html.

    @param {DOMElement|jQuery|String} elem the element to find the offset of.
      This is passed to `jQuery()`, so any value supported by `jQuery()` will work.
    @param {String} relativeToFlag flag to determine which relative element to determine offset by.
      One of either: 'document', 'viewport' or 'parent' (default: 'document').
    @returns {Object} the offset of the element as an Object (ie. Hash) in the form { x: value, y: value }.
   */
  offset: function(elem, relativeToFlag) {
    var userAgent,
        index,
        mobileBuildNumber,
        result;

    relativeToFlag = relativeToFlag || 'document';

    if (relativeToFlag === 'parent') {
      result = jQuery(elem).position();
    } else {
      result = jQuery(elem).offset();

      // jQuery does not workaround a problem with Mobile Safari versions prior to 4.1 that add the scroll
      // offset to the results of getBoundingClientRect.
      //
      // See http://dev.jquery.it/ticket/6446
      if (SC.browser.isMobileSafari) {
        userAgent = navigator.userAgent;
        index = userAgent.indexOf('Mobile/');
        mobileBuildNumber = userAgent.substring(index + 7, index + 9);

        if (parseInt(SC.browser.mobileSafari, 0) <= 532 || (mobileBuildNumber <= "8A")) {
          result.left -= window.pageXOffset;
          result.top -= window.pageYOffset;
        }
      }

      // Subtract the scroll offset for viewport coordinates
      if (relativeToFlag === 'viewport') {

        if(SC.browser.isIE8OrLower){
          result.left -= $(window).scrollLeft();
          result.top -= $(window).scrollTop();
        }else{
          result.left -= window.pageXOffset;
          result.top -= window.pageYOffset;
        }
      }
    }

    // Translate 'left', 'top' to 'x', 'y'

    try{
      result.x = result.left;
      result.y = result.top;
    } catch (e) {
      // We need this for IE, when the element is detached, for some strange
      // reason the object returned by element.getBoundingClientRect()
      // is read-only
      result = {x:result.left, y:result.top};
    }
    delete result.left;
    delete result.top;

    return result;
  },

  /**
    @deprecated Use SC.offset instead.

    SC.offset() is more accurate, more flexible in the value for the element parameter and
    easier to understand.

    @param el The DOM element
    @returns {Point} A hash with x, y offsets.
  */
  viewportOffset: function(el) {
    
    SC.warn("Developer Warning: SC.viewportOffset() has been deprecated in favor of SC.offset().  Please use SC.offset() from here on.");
    
    var result = SC.offset(el, 'viewport');

    return {x: result.left, y: result.top};
  }

}) ;

/* >>>>>>>>>> BEGIN source/system/utils/rect.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
SC.mixin( /** @scope SC */ {
  /** A Point at {0,0} */
  ZERO_POINT: { x: 0, y: 0 },

  /** Check if the given point is inside the rect. */
  pointInRect: function(point, f) {
    return  (point.x >= SC.minX(f)) &&
            (point.y >= SC.minY(f)) &&
            (point.x <= SC.maxX(f)) &&
            (point.y <= SC.maxY(f)) ;
  },

  /** Return true if the two frames match.  You can also pass only points or sizes.

    @param r1 {Rect} the first rect
    @param r2 {Rect} the second rect
    @param delta {Float} an optional delta that allows for rects that do not match exactly. Defaults to 0.1
    @returns {Boolean} true if rects match
   */
  rectsEqual: function(r1, r2, delta) {
    if (!r1 || !r2) return (r1 == r2) ;
    if (!delta && delta !== 0) delta = 0.1;
    if ((r1.y != r2.y) && (Math.abs(r1.y - r2.y) > delta)) return NO ;
    if ((r1.x != r2.x) && (Math.abs(r1.x - r2.x) > delta)) return NO ;
    if ((r1.width != r2.width) && (Math.abs(r1.width - r2.width) > delta)) return NO ;
    if ((r1.height != r2.height) && (Math.abs(r1.height - r2.height) > delta)) return NO ;
    return YES ;
  },

  /** Returns the insersection between two rectangles.

    @param r1 {Rect} The first rect
    @param r2 {Rect} the second rect
    @returns {Rect} the intersection rect.  width || height will be 0 if they do not interset.
  */
  intersectRects: function(r1, r2) {
    // find all four edges
    var ret = {
      x: Math.max(SC.minX(r1), SC.minX(r2)),
      y: Math.max(SC.minY(r1), SC.minY(r2)),
      width: Math.min(SC.maxX(r1), SC.maxX(r2)),
      height: Math.min(SC.maxY(r1), SC.maxY(r2))
    } ;

    // convert edges to w/h
    ret.width = Math.max(0, ret.width - ret.x) ;
    ret.height = Math.max(0, ret.height - ret.y) ;
    return ret ;
  },

  /** Returns the union between two rectangles

    @param r1 {Rect} The first rect
    @param r2 {Rect} The second rect
    @returns {Rect} The union rect.
  */
  unionRects: function(r1, r2) {
    // find all four edges
    var ret = {
      x: Math.min(SC.minX(r1), SC.minX(r2)),
      y: Math.min(SC.minY(r1), SC.minY(r2)),
      width: Math.max(SC.maxX(r1), SC.maxX(r2)),
      height: Math.max(SC.maxY(r1), SC.maxY(r2))
    } ;

    // convert edges to w/h
    ret.width = Math.max(0, ret.width - ret.x) ;
    ret.height = Math.max(0, ret.height - ret.y) ;
    return ret ;
  },

  /**
    Returns a copy of the passed rect, scaled by the specified scale, centered on the specified origin.

    @param {Rect} rect The rectangle to scale.
    @param {Number|Array|Hash} scale The scale (or [scaleX, scaleY], or { x: scaleX, y: scaleY}) to apply. Defaults to 1.
    @param {Number} originX The horizontal scale origin. Defaults to 0.5 (center).
    @param {Number} originY The vertical scale origin. Defaults to 0.5 (center).
    @returns {Rect} The scaled rect.
  */
  scaleRect: function(rect, scale, originX, originY) {
    // Defaults
    if (scale == null) scale = 1;
    if (originX == null) originX = 0.5;
    if (originY == null) originY = 0.5;

    // Gatekeep: Identity scale.
    if (scale === 1) return SC.cloneRect(rect);

    // Unpack scale.
    var scaleX, scaleY;
    switch (SC.typeOf(scale)) {
      case SC.T_ARRAY:
        scaleX = scale[0];
        scaleY = scale[1];
        break;
      case SC.T_HASH:
        scaleX = scale.x;
        scaleY = scale.y;
        break;
      default:
        scaleX = scale;
        scaleY = scale;
        break;
    }

    var scaledHeight = rect.height * scaleY,
      scaledWidth = rect.width * scaleX,
      dHeight = scaledHeight - rect.height,
      dWidth = scaledWidth - rect.width;
    
    // X and Y positions change depending on the origin of the scale. For example, if the
    // width scales down ten pixels and the origin is 50%, x will move five pixesl (10 * 0.5)
    // to the right.
    var scaledX = rect.x - (dWidth * originX),
      scaledY = rect.y - (dHeight * originY);

    return {
      height: scaledHeight,
      width: scaledWidth,
      x: scaledX,
      y: scaledY
    };
  },

  /**
    Duplicates the passed rect.

    This is faster than Object.clone().

    @param r {Rect} The rect to clone.
    @returns {Rect} The cloned rect
  */
  cloneRect: function(r) {
    return { x: r.x, y: r.y, width: r.width, height: r.height } ;
  },

  /** Returns a string representation of the rect as {x, y, width, height}.

    @param r {Rect} The rect to stringify.
    @returns {String} A string representation of the rect.
  */
  stringFromRect: function(r) {
    if (!r) {
      return "(null)";
    }
    else {
      return '{ x:'+r.x+', y:'+r.y+', width:'+r.width+', height:'+r.height+' }';
    }
  }


});

/* >>>>>>>>>> BEGIN source/views/view/design_mode.js */
// ==========================================================================
// Project:   SproutCore
// Copyright: @2012 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("views/view");

// When in debug mode, developers can log the design mode.

SC.LOG_DESIGN_MODE = false;


// The class names assigned to view elements depending on the current design
// mode.
SC.DESIGN_MODE_CLASS_NAMES = {
  s: 'sc-small',
  m: 'sc-medium',
  l: 'sc-large',
  xl: 'sc-xlarge'
};

/** @private This adds design modes support to SC.View. */
SC.View.reopen(
  /** @scope SC.View.prototype */ {

  // ------------------------------------------------------------------------
  // Properties
  //

  /**
    The current design mode of the application and this view.

    If the application has designModes specified, this property will be set
    automatically when the view is created and as the window size changes
    across the design mode boundaries.

    @property {String}
    @default null
  */
  designMode: null,

  /**
    The dynamic adjustments to apply to this view depending on the current
    design mode.

    If you specify designModes on the application, this hash will be checked
    for a matching adjustment to apply for the current design mode.

    @property {Object}
    @default null
  */
  modeAdjust: null,

  // ------------------------------------------------------------------------
  // Methods
  //

  /** @private Recursively set the designMode on each child view. */
  adjustChildDesignModes: function (lastDesignMode, designMode) {
    var childViews = this.get('childViews');

    var i, len = childViews.get('length');
    for (i = 0; i < len; i++) {
      var childView = childViews.objectAt(i);

      childView.updateDesignMode(lastDesignMode, designMode);
    }
  },

  _sc_assignProperty: function (key, value) {
    if (key === 'layout') {
      var newExplicitLayout = this._sc_computeExplicitLayout(value), // Convert the layout to an explicit layout.
          layoutDiff = {},
          explicitLayout = this.get('explicitLayout');
      for (var layoutKey in newExplicitLayout) {
        var currentValue = explicitLayout[layoutKey];

        layoutDiff[layoutKey] = currentValue === undefined ? null : currentValue;

        if (layoutKey === 'centerX') {
          layoutDiff.left = explicitLayout.left;
          layoutDiff.right = explicitLayout.right;
        }

        if (layoutKey === 'centerY') {
          layoutDiff.top = explicitLayout.top;
          layoutDiff.bottom = explicitLayout.bottom;
        }
      }

      this._originalProperties.layout = layoutDiff;
    } else {
      // Get the original value of the property for reset.
      this._originalProperties[key] = this.get(key);
    }

    // Apply the override.
    if (key === 'layout') {
      
      if (SC.LOG_DESIGN_MODE || this.SC_LOG_DESIGN_MODE) {
        SC.Logger.log('  - Adjusting %@: %@ (cached as %@)'.fmt(key, SC.inspect(value), SC.inspect(this._originalProperties[key])));
      }
      
      this.adjust(value);
    } else {
      
      if (SC.LOG_DESIGN_MODE || this.SC_LOG_DESIGN_MODE) {
        SC.Logger.log('  - Setting %@: %@ (cached as %@)'.fmt(key, SC.inspect(value), SC.inspect(this._originalProperties[key])));
      }
      
      this.set(key,value);
    }
  },

  _sc_revertProperty: function (key, oldValue) {
    
    if (SC.LOG_DESIGN_MODE || this.SC_LOG_DESIGN_MODE) {
      SC.Logger.log('  - Resetting %@ to %@'.fmt(key, SC.inspect(oldValue)));
    }
    

    if (key === 'layout') {
      this.adjust(oldValue);
    } else {
      this.set(key, oldValue);
    }
  },

  /**
    Updates the design mode for this view.

    This method is called automatically by the view's pane whenever the pane
    determines that the design mode, as specified in the pane's designModes
    property, has changed.  You should likely never need to call it manually.

    This method updates the designMode property of the view, adjusts
    the layout if a matching design adjustment in the view's designAdjustments
    property is found and adds a class name to the view for the current
    design mode.

    Note that updating the design mode also updates all child views of this
    view.

    @param {String} lastDesignMode the previously applied design mode
    @param {String} [designMode] the name of the design mode
   */
  updateDesignMode: function (lastDesignMode, designMode) {
    // Fast path.
    if (lastDesignMode === designMode) { return; }

    var classNames = this.get('classNames'),
      modeAdjust,
      elem,
      key,
      layer,
      newProperties,
      prevProperties,
      size;

    this.set('designMode', designMode);

    // Get the size name portion of the mode.
    if (designMode) {
      size = designMode.split('_')[0];
    }

    modeAdjust = this.get('modeAdjust');
    if (modeAdjust) {
      // Stop observing changes for a moment.
      this.beginPropertyChanges();

      // Unset any previous properties.
      prevProperties = this._originalProperties;
      if (prevProperties) {
        
        if (SC.LOG_DESIGN_MODE || this.SC_LOG_DESIGN_MODE) {
          SC.Logger.log('%@ — Removing previous design property overrides set by "%@":'.fmt(this, lastDesignMode));
        }
        

        for (key in prevProperties) {
          this._sc_revertProperty(key, prevProperties[key]);
        }

        // Remove the cache.
        this._originalProperties = null;
      }

      if (designMode) {
        // Apply new properties. The orientation specific properties override the size properties.
        if (modeAdjust[size] || modeAdjust[designMode]) {
          newProperties = SC.merge(modeAdjust[size], modeAdjust[designMode]);

          
          if (SC.LOG_DESIGN_MODE || this.SC_LOG_DESIGN_MODE) {
            SC.Logger.log('%@ — Applying design properties for "%@":'.fmt(this, designMode));
          }
          

          // Cache the original properties for reset.
          this._originalProperties = {};
          for (key in newProperties) {
            this._sc_assignProperty(key, newProperties[key]);
          }
        }
      }

      // Resume observing.
      this.endPropertyChanges();
    }

    // Apply the design mode as a class name.
    // This is done here rather than through classNameBindings, because we can
    // do it here without needing to setup a designMode observer for each view.
    var designClass;
    layer = this.get('layer');
    if (layer) {
      elem = this.$();

      // If we had previously added a class to the element, remove it.
      if (lastDesignMode) {
        designClass = SC.DESIGN_MODE_CLASS_NAMES[lastDesignMode.split('_')[0]];
        elem.removeClass(designClass);
        classNames.removeObject(designClass);
      }

      // If necessary, add a new class.
      if (designMode) {
        designClass = SC.DESIGN_MODE_CLASS_NAMES[size];
        elem.addClass(designClass);
        classNames.push(designClass);
      }
    } else {
      if (designMode) {
        designClass = SC.DESIGN_MODE_CLASS_NAMES[size];
        // Ensure that it gets into the classNames array
        // so it is displayed when we render.
        classNames.push(designClass);
      }
    }

    // Set the designMode on each child view (may be null).
    this.adjustChildDesignModes(lastDesignMode, designMode);
  }

});

/* >>>>>>>>>> BEGIN source/panes/main.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('panes/pane');
sc_require('panes/keyboard');
sc_require('panes/layout');
sc_require('panes/manipulation');
sc_require('panes/pane_statechart');

/** @class

  Most SproutCore applications have a main pane, which dominates the
  application page.  You can extend from this view to implement your own main
  pane.  This class will automatically make itself main whenever you append it
  to a document, removing any other main pane that might be currently in
  place.  If you do have another already focused as the keyPane, this view
  will also make itself key automatically.  The default way to use the main
  pane is to simply add it to your page like this:

      SC.MainPane.create().append();

  This will cause your root view to display.  The default layout for a
  MainPane is to cover the entire document window and to resize with the
  window.

  @extends SC.Pane
  @since SproutCore 1.0
*/
SC.MainPane = SC.Pane.extend({
  /** @private */
  layout: { minHeight: 200, minWidth: 200 },

  /**
    Called when the pane is attached.  Takes on main pane status.
   */
  didAppendToDocument: function () {
    var responder = this.rootResponder;

    responder.makeMainPane(this);
    this.becomeKeyPane();

    // Update the body overflow on attach.
    this.setBodyOverflowIfNeeded();
  },

  /**
    Called when the pane is detached.  Resigns main pane status.
  */
  willRemoveFromDocument: function () {
    var responder = this.rootResponder;

    // Stop controlling the body overflow on detach.
    this.unsetBodyOverflowIfNeeded();

    responder.makeMainPane(null);
    this.resignKeyPane();
  },

  /** @private The 'updatedLayout' event. */
  _updatedLayout: function () {
    arguments.callee.base.apply(this,arguments);

    // If by chance the minHeight or minWidth changed we would need to alter the body overflow request.
    this.setBodyOverflowIfNeeded();
  },

  /** @private */
  acceptsKeyPane: YES,

  /** @private */
  classNames: ['sc-main']
});

