function tbc_login(response){
    if (response.success == "true"){
        is_tbc_login = true;
    } else {
        tbc_redirect = response.data || tbc_redirect;
    }

}
function tbc_count(src){
    tbc_req += 1;
    if (tbc_req == doc_info.tbc.domains.length && !is_tbc_login) {
        var schema = doc_info.tbc.domains[0].indexOf("21tb.com") >= 0 ? "https" : "http"
        window.location.href = schema + "://" + doc_info.tbc.domains[0] + tbc_redirect + window.location.href.replace(/^https?/, schema)
    }
}

var tbc_req = 0;
var is_tbc_login = false;
var tbc_redirect = "/login/index.jsp?returnUrl=";
var domain_login = function(i){
    var s = document.createElement("script");
    s.src = "//" + i + "/es/isLogin.json?callback=tbc_login&corpCode=" + doc_info.tbc.corp_code;
    s.onload = function(){
        tbc_count(this)
    }
    s.onerror = function(){
        console.error("script error", this.src)
        tbc_count(this);
    }
    document.head.appendChild(s);

}
if (doc_info.tbc && !doc_info.tbc.public) {
    (doc_info.tbc.domains ||[]).map(domain_login)
}

if (doc_info.tbc) {
    doc_info.tbc_share_title = doc_info.title;
    doc_info.title = doc_info.name;
}
