function nlog(is_error, message, silent = true, obj_to_log){
    // Create TimeStamp
    var dt = new Date();
    var ts = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

    // Create obj_to_log_s
    var obj_to_log_s = ((typeof obj_to_log != 'undefined') ? JSON.stringify(obj_to_log) : "");

    // Create console log string
    var log_string = "[NLL - "+ ts + "] " + message + "  - " + obj_to_log_s;

    if (is_error){
        console.error( log_string );
    } else {
        console.log( log_string );
    }

    if (!silent){

        $("#ndlr_notifications").prepend("<div class='ndlr_noti_container "+(is_error ? "ndlr_noti_err_container" : "")+"'><div class='ndlr-noti-msg'>Request Failed "+$(".ndlr_noti_container").length+": "+message+"</div><div class='ndlr-noti-actions'><span class='ndlr-noti-action-link'>X</div></div></div>");
    
        $(".ndlr-noti-action-link").unbind();
        $(".ndlr-noti-action-link").click(function(){
            $(this).parent().parent().remove();
        });

    }
    
}
function load_lazy(elem){
    
    var nll_component_id = elem.attr('nll-component-id');
    var nll_href = elem.attr('href');

    nlog(false, "Began Lazy loading for: " + nll_href);

    if (typeof nll_component_id === 'undefined'){
        nlog(true, "Failed to load lazy, Component id not defined");
        return;
    }
    //$("#" + nll_component_id ).append("<div class='overlay'>LOADING...</div>");

    $.ajax({
        url: nll_href,
        context: document.body
    }).done(function(data) {
        
        nlog(false, "Load complete");

        $("#" + nll_component_id ).html("Hello");
        //$(this).html("Hello");
        $(".ndlr_lazyloader").unbind();
        
        bind_ndlr_lazyloader();

    }).fail(function(xhr, status, error) {
        nlog(true, "Failed to load data from request.", false, $(".ndlr_lazyloader"));
    }).always(function(e) {

        nlog(false, "Lazy Loading Request Finished ", false );
    });
}
function bind_ndlr_lazyloader(elem){
    
    $(".ndlr_lazyloader").on('click', function(e){
        //console.log("Requesting..." + $(elem).html("LOADING"));
        e.preventDefault();
        
        load_lazy($(this));
        
    });
}
function auto_load_lazy_data(){
    $(".ndlr_lazyloader").each(function(i, elem){
        bind_ndlr_lazyloader(elem);
    });
}


$(document).ready(function(){
    bind_ndlr_lazyloader();
    //auto_load_lazy_data();
    
    //load_lazy();
    $(".ndlr_lazyloader").each(function(i, obj) {
        load_lazy($(obj));
    });
});