/*------------------------------------------------------------------------------

    jQuery.ui.filterable - UI widget for filtering content based on text entry

    Copyright 2011 James Sanders

    Feel free to use this however you like, just don't blame me if it breaks
    your code, causes your site to fall over, kills your dog, etc.

    Requires: jQuery 1.5, jQuery UI 1.8

    Usage:

	.filterable(options)

	When applied to a block element, will by default filter the children of
	that element by checking whether the text content of each child
	contains the user's text input. Filtered elements will simply be
	assigned the class "ui-filterable-filtered", they will not be hidden or
	otherwise manipulated. Desired visual representation should be
	controlled through CSS attributes on that class.

    Options:

	input: <selector> | <element>

	    Specifies which input(s) should be used to collect user entry. If
	    omitted, a new text input will be inserted before the filterable
	    block. Any input specified or created will be given the CSS class
	    "ui-filterable-input".

	filter: <selector>

	    Specifies which elements will be tested against the filter. By
	    default, all child elements will be tested.

	delay: <millis>
	    (default value = 1000)

	    Defines how long to wait after a keypress in the input field(s)
	    before reapplying the filter, to prevent excessive testing while the
	    user is typing their search query.

	visible: <function(input)>

	    Specify a callback to check whether an element should be filtered.
	    When called, "this" refers to the element being tested, and "input"
	    is a jQuery of all inputs related to this filterable.

	    The callback should return true if the element should not be
	    filtered.

    Events:

	filtered: is triggered when an element is filtered. 

	    Code example:

		$(".selector").filterable({
		    filtered: function(event, ui) {
			// ui.item refers to the element being filtered
		    }
		});

	unfiltered: is triggered when an element is no longer filtered.

------------------------------------------------------------------------------*/
(function($, undefined) {

$.widget("ui.filterable", {
    options: {
	input: null,
	filter: null,
	delay: 1000, // 1 second wait for more keypresses by default
	visible: function(input) {
	    return new RegExp(input.val(), "i").test($(this).text());
	}
    },

    _create: function() {
	this.element.addClass("ui-filterable");
	this._initialiseInputs();
    },

    _initialiseInputs: function() {
	var self = this;
	var options = this.options;
	if (options.input) {
	    this.input = $(options.input);
	} else {
	    this.input = $("<input>", {
		type: "text"
	    }).insertBefore(this.element);
	}
	function scheduleFilter(wait) {
	    if (self.timeout)
		clearTimeout(self.timeout);
	    if (wait) {
		self.timeout = setTimeout(function() {
		    self._applyFilter();
		}, options.delay);
	    } else {
		self._applyFilter();
	    }
	}
	this.input.addClass("ui-filterable-input")
	    .bind("change.ui-filterable", function(event) {
		scheduleFilter(false);
		event.preventDefault();
	    }).filter("input:text")
		.bind("keypress.ui-filterable", function(event) {
		    if (event.keyCode == $.ui.keyCode.ENTER) {
			scheduleFilter(false);
			event.preventDefault();
		    }
		}).end()
	    .filter("input:text, textarea")
		.bind("keydown.ui-filterable", function(event) {
		    scheduleFilter(true);
		});
    },

    _applyFilter: function() {
	var self = this;
	var filter;
	if (this.options.filter)
	    filter = $(this.options.filter, this.element);
	else
	    filter = this.element.children();
	var filterFunc = this.options.visible;
	filter.each(function() {
	    if (filterFunc.call(this, self.input)) {
		$(this).removeClass("ui-filterable-filtered");
		self._trigger("unfiltered", null, { item: this });
	    } else {
		$(this).addClass("ui-filterable-filtered");
		self._trigger("filtered", null, { item: this });
	    }
	});
    },

    _setOption: function(key, value) {
	if (key == "input") {
	    if (this.options.input)
		this.input.unbind(".ui-filterable")
		    .removeClass("ui-filterable-input");
	    else
		this.input.remove();
	}
	$.Widget.prototype._setOption.call(this, key, value);
	if (key == "input")
	    this._initialiseInputs();
	else if (key == "visible")
	    this._applyFilter();
    },

    destroy: function() {
	$.Widget.prototype.destroy.apply(this, arguments);
	if (this.options.input)
	    this.input.unbind(".ui-filterable")
		.removeClass("ui-filterable-input");
	else
	    this.input.remove();
	this.element.removeClass("ui-filterable");
    }
});

})(jQuery);
