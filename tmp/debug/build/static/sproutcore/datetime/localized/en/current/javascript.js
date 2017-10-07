/* >>>>>>>>>> BEGIN source/lproj/strings.js */
// ==========================================================================
// Project: SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
// Portions ©2008-2011 Apple Inc. All rights reserved.
// License: Licensed under MIT license (see license.js)
// ==========================================================================

SC.stringsFor('English', {
  '_SC.DateTime.dayNames' : 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday',
  '_SC.DateTime.abbreviatedDayNames' : 'Sun Mon Tue Wed Thu Fri Sat',
  '_SC.DateTime.monthNames' : 'January February March April May June July August September October November December',
  '_SC.DateTime.abbreviatedMonthNames' : 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec',
  '_SC.DateTime.AMPMNames' : 'AM PM',

  '_SC.DateTime.now' : 'Right now',
  '_SC.DateTime.secondIn' : 'In a moment',
  '_SC.DateTime.secondsIn' : 'In %e seconds',
  '_SC.DateTime.minuteIn' : 'In a minute',
  '_SC.DateTime.minutesIn' : 'In %e minutes',
  '_SC.DateTime.hourIn' : 'An hour from now',
  '_SC.DateTime.hoursIn' : 'In about %e hours',
  '_SC.DateTime.dayIn' : 'Tomorrow at %i:%M %p',
  '_SC.DateTime.daysIn' : '%A at %i:%M %p',
  '_SC.DateTime.weekIn' : 'Next week',
  '_SC.DateTime.weeksIn' : 'In %e weeks',
  '_SC.DateTime.monthIn' : 'Next month',
  '_SC.DateTime.monthsIn' : 'In %e months',
  '_SC.DateTime.yearIn' : 'Next year',
  '_SC.DateTime.yearsIn' : 'In %e years',

  '_SC.DateTime.secondAgo' : 'A moment ago',
  '_SC.DateTime.secondsAgo' : '%e seconds ago',
  '_SC.DateTime.minuteAgo' : 'A minute ago',
  '_SC.DateTime.minutesAgo' : '%e minutes ago',
  '_SC.DateTime.hourAgo' : 'An hour ago',
  '_SC.DateTime.hoursAgo' : 'About %e hours ago',
  '_SC.DateTime.dayAgo' : 'Yesterday at %i:%M %p',
  '_SC.DateTime.daysAgo' : '%A at %i:%M %p',
  '_SC.DateTime.weekAgo' : 'About a week ago',
  '_SC.DateTime.weeksAgo' : '%e weeks ago',
  '_SC.DateTime.monthAgo' : 'About a month ago',
  '_SC.DateTime.monthsAgo' : '%e months ago',
  '_SC.DateTime.yearAgo' : 'Last year',
  '_SC.DateTime.yearsAgo' : '%e years ago'
});

/* >>>>>>>>>> BEGIN source/system/datetime.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.DateTime.mixin(
/** @scope SC.DateTime */ {

  /**
    @private

    Called on `document.ready`.

    Because localizations may have been modified by an application developer,
    we need to wait for the ready event to actually evaluate the localizations.
  */
  _setup: function() {
    SC.DateTime.dayNames = SC.String.w(SC.String.loc('_SC.DateTime.dayNames'));
    SC.DateTime.abbreviatedDayNames = SC.String.w(SC.String.loc('_SC.DateTime.abbreviatedDayNames'));
    SC.DateTime.monthNames = SC.String.w(SC.String.loc('_SC.DateTime.monthNames'));
    SC.DateTime.abbreviatedMonthNames = SC.String.w(SC.String.loc('_SC.DateTime.abbreviatedMonthNames'));
    SC.DateTime.AMPMNames = SC.String.w(SC.String.loc('_SC.DateTime.AMPMNames'));
  },
  
  /**
    @private
    
    Elapsed string formatting override, as it depends on localization.
    
    @see SC.DateTime#toFormattedString
   */
  __getElapsedStringFormat: function(start, timezone) {
    
    var elapsed = Math.floor((+new Date() - this._date.getTime() - (timezone * 60000)) / 1000);
    var future = !!(elapsed < 0) ? "In" : "Ago";
    var interval = 0;
    var intervalType = "now";
    
    if(Math.abs(elapsed) > 31536000) { // 60 * 60 * 24 * 365 - years
      interval = Math.floor(Math.abs(elapsed / 31536000));
      intervalType = 'year';
    } else if(Math.abs(elapsed) > 2678400) { // 60 * 60 * 24 * 31 - months
      interval = Math.floor(Math.abs(elapsed / 2678400));
      intervalType = 'month';
    } else if(Math.abs(elapsed) > 604800) { // 60 * 60 * 24 * 7 - weeks
      interval = Math.floor(Math.abs(elapsed / 604800));
      intervalType = 'week';
    } else if(Math.abs(elapsed) > 86400) { // 60 * 60 * 24 - day
      interval = Math.floor(Math.abs(elapsed / 86400));
      intervalType = 'day';
    } else if(Math.abs(elapsed) > 3600) { // 60 * 60 - hour
      interval = Math.floor(Math.abs(elapsed / 3600));
      intervalType = 'hour';
    } else if(Math.abs(elapsed) > 60) { // 60 - minute
      interval = Math.floor(Math.abs(elapsed / 60));
      intervalType = 'minute';
    } else if(Math.abs(elapsed) > 0) { // second
      interval = Math.abs(elapsed);
      intervalType = 'second';
    }
    
    var formatString = '_SC.DateTime.now';
    if(intervalType !== 'now') {
      formatString = "_SC.DateTime.%@%@%@".fmt(intervalType, interval > 1 ? "s" : "", future);
    }
    return formatString.loc().replace('%e', interval);
  },

});

jQuery(document).ready(function() {
  SC.DateTime._setup();
});

