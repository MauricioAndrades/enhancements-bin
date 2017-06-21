$.fn.qtip.defaults = {
    prerender: false, // Render tooltip HTML on $(document).ready()
    id: false, // Incremental numerical ID used by default
    overwrite: true, // Overwrite previous tooltips on this element
    suppress: true, // Translate 'title' to 'oldtitle' attribute (prevent browser tooltip)
    content: {
        text: true,
        attr: 'title',
        button: false
    },
    position: {
        my: 'top left',
        at: 'bottom right',
        target: false, // Defaults to target element
        container: false, // Defaults to $(document.body)
        viewport: false, // Requires Viewport plugin
        adjust: {
            x: 0, y: 0, // Minor x/y adjustments
            mouse: true, // Follow mouse when using target:'mouse'
            resize: true, // Reposition on resize by default
            method: 'flip flip' // Requires Viewport plugin
        },
        effect: function(api, pos, viewport) {
            $(this).animate(pos, {
                duration: 200,
                queue: false
            });
        }
    },
    show: {
        target: false, // Defaults to target element
        event: 'mouseenter', // Show on mouse over by default
        effect: true, // Use default 90ms fade effect
        delay: 90, // 90ms delay before showing
        solo: false, // Do not hide others when showing
        ready: false, // Do not show immediately
        modal: { // Requires Modal plugin
            on: false, // No modal backdrop by default
            effect: true, // Mimic show effect on backdrop
            blur: true, // Hide tooltip by clicking backdrop
            escape: true // Hide tooltip when Esc pressed
        }
    },
    hide: {
        target: false, // Defaults to target element
        event: 'mouseleave', // Hide on mouse out by default
        effect: true, // Use default 90ms fade effect
        delay: 0, // No hide delay by default
        fixed: false, // Non-hoverable by default
        inactive: false, // Do not hide when inactive
        leave: 'window', // Hide when we leave the window
        distance: false // Don't hide after a set distance
    },
    style: {
        classes: '', // No additional classes added to .qtip element
        widget: false, // Not a jQuery UI widget
        width: false, // No set width
        height: false, // No set height
        tip: { // Requires Tips plugin
            corner: true, // Use position.my by default
            mimic: false, // Don't mimic a particular corner
            width: 8, 
            height: 8,
            border: true, // Detect border from tooltip style
            offset: 0 // Do not apply an offset from corner
        }
    },
    events: {
        render: null, // Called when tooltip rendered
        move: null, // Called when tooltip repositioned
        show: null, // Called when tooltip is about to be shown
        hide: null, // Called when tooltip is about to be hidden
        toggle: null, // Shortcut to binding to two events above
        visible: null, // Called when tooltip is shown
        hidden: null, // Called when tooltip is hidden
        focus: null, // Called when tooltip gains focus
        blur: null // Called when tooltip loses focus
    }
};
