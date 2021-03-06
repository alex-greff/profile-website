function Page(element_identifier, html_location, nextPage, prevPage) {
    this.hasBgCol = true;

    this.element_identifier = element_identifier;
    this.html_location = html_location;
    this.nextPage = nextPage;
    this.prevPage = prevPage;

    Page.nav_open = false;

    this.get_references = function() {
        this.get_references_base();
    }

    this.get_references_base = function() {
        this.element_ref = $(element_identifier);
        this.body_ref = $('body');
    }

    if (typeof Page.pending_transition === 'undefined') { 
        Page.pendingTransition = {
            currentPage: null, currentPageAnimOption: "anim",
            targetPage: null, targetPageAnimOption: "anim",
        }
    }

    // Setup static variables
    if (typeof Page.current_page === 'undefined') { Page.current_page = null; }
    if (typeof Page.page_background_ref === 'undefined') { Page.page_background_ref = $(".page-background"); }

    this.isOpen = false;
    this.isTransitioning = false;

    // ------------------------
    // --- Public functions ---
    // ------------------------

    this.open = function (animation_options, onComplete_callbackFcn, onComplete_callbackScope) {
        var longest_time = 0.5;

        this.open_base(animation_options, longest_time, onComplete_callbackFcn, onComplete_callbackScope);

        // console.warn(this.element_identifier + ": Unimplemented open() method"); 
    }
    this.close = function(animation_options, onComplete_callbackFcn, onComplete_callbackScope) { 
        var longest_time = 0.5;

        this.close_base(animation_options, longest_time, onComplete_callbackFcn, onComplete_callbackScope);

        // console.warn(this.element_identifier + ": Unimplemented close() method"); 
    }

    this.transition_update = function(percent, direction_vector, animate) { 
        this.transition_update_base(percent, direction_vector, animate);
    };

    this.reset_transition = function() {
        this.reset_transition_base();
    }

    this.hasNext = function () { this.nextPage != null; };
    this.hasPrev = function () { this.prevPage != null; };

    this.subscribe_to_events = function() {
        // TODO: implement
    }

    this.unsubscribe_to_events = function() {
        // TODO: implement
    }

    // ----------------------
    // --- Base functions ---
    // ----------------------

    // For each page we can make add-on animation functions

    this.open_base = function(animation_options, longest_time, onComplete_callbackFcn, onComplete_callbackScope) {
        try {
            // If the element reference is not part of the body anymore (ie the page has been changed)
            // Then get all the references (needed because after every page transition the page is a new element)
            if (!document.body.contains(this.element_ref[0])) { 
                // console.log(this.element_identifier + ": getting references via if statement");
                this.get_references(); 
            } 
        } catch (err) { // If it errors (ie is not even defined) then get the references anyways
            // console.log(this.element_identifier + ": getting references via catch");
            this.get_references();
        }

        this.body_ref.trigger("pageOpen",  [this.element_identifier, this]); // Trigger the page open event for this page

        RESET_ALL_DELTAS() // input_manager.js

        this.isTransitioning = true;
        this.isOpen = true;

        this.subscribe_to_events();

        if (this.hasBgCol) {
            // Set page background color
            TweenMax.to(Page.page_background_ref, 0.5, { backgroundColor: this.page_background_color_1 });
        }

        // Set page to be visible
        this.visibility_setter(0, "visible");

        // If no animation is wanted
        if (animation_options == "no-anim") { // No opening animation
            this.onComplete_caller(0, onComplete_callbackFcn, onComplete_callbackScope);
            this.isTransitioning = false;
            return;
        }

        this.onComplete_caller(longest_time, onComplete_callbackFcn, onComplete_callbackScope);
        this.isTransitioning_setter(longest_time, false);
    }

    this.close_base = function(animation_options, longest_time, onComplete_callbackFcn, onComplete_callbackScope) {
        try {
            // If the element reference is not part of the body anymore (ie the page has been changed)
            // Then get all the references (needed because after every page transition the page is a new element)
            if (!document.body.contains(this.element_ref[0])) { 
                // console.log(this.element_identifier + ": getting references via if statement");
                this.get_references(); 
            } 
        } catch (err) { // If it errors (ie is not even defined) then get the references anyways
            // console.log(this.element_identifier + ": getting references via catch");
            this.get_references();
        }

        this.body_ref.trigger("pageClose",  [this.element_identifier]); // Trigger the project page close event for this page

        this.isTransitioning = true;
        this.isOpen = false;

        this.unsubscribe_from_events();

        if (animation_options == "no-anim") { // No closing animation
            this.visibility_setter(0, 'hidden');
            this.onComplete_caller(0, onComplete_callbackFcn, onComplete_callbackScope);
            this.isTransitioning = false;
            //TweenMax.set(Page.page_background_ref, {backgroundColor: this.page_background_color_2});
            return;
        } 

        // Page background color
        //TweenMax.to(Page.page_background_ref, 0.2, {backgroundColor: this.page_background_color_2});

        this.onComplete_caller(longest_time, onComplete_callbackFcn, onComplete_callbackScope);
        this.isTransitioning_setter(longest_time, false);
        this.visibility_setter(longest_time, 'hidden');
    }

    this.transition_update_base = function(percent, direction_vector, animate) {
        // Color animation
        var clr = lerpColor(this.page_background_color_1, this.page_background_color_2, Math.abs(percent)); // Get color lerp value
        if (animate) { TweenMax.to(Page.page_background_ref, 0.2, {backgroundColor: clr }); }
        else { TweenMax.set(Page.page_background_ref, {backgroundColor: clr}); }
    }

    this.reset_transition_base = function() {
        // Reset page color
        TweenMax.to(Page.page_background_ref, 0.5, {backgroundColor: this.page_background_color_1});
    }

    this.subscribe_to_events = function() { this.subscribe_to_events_base(); }
    this.unsubscribe_from_events = function() { this.unsubscribe_from_events_base(); }

    this.subscribe_to_events_base = function() {
        this.body_ref.on("navOpen", () => {
            this.nav_open = true;
        });

        this.body_ref.on("navClose", () => {
            this.nav_open = false;
        });
    }

    this.unsubscribe_from_events_base = function() {
        this.body_ref.off("navOpen");
        this.body_ref.off("navClose");
    }

    // -----------------------
    // --- Setters/callers ---
    // -----------------------

    this.onComplete_caller = function(delay_time, onComplete_callbackFcn, onComplete_callbackScope) {
        // Call the onComplete function after the delay time
        TweenMax.set(this.element_ref, {delay: delay_time, onComplete: onComplete_callbackFcn, onCompleteScope: onComplete_callbackScope});
    }

    this.isTransitioning_setter = function(delay_time, bool_value) {
        TweenMax.set(this.element_ref, {delay: delay_time, onComplete: () => { this.isTransitioning = bool_value } });
    }

    this.visibility_setter = function(delay_time, visibility_val) {
        TweenMax.set(this.element_ref, {delay: delay_time, visibility: visibility_val});
    }
}