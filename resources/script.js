const sitepath = "tntsuperman.github.io";

function getfile(path){
    let xhr = new XMLHttpRequest();
    xhr.open("GET",path,false);
    xhr.send();
    return xhr;
}


function loadpage(p,lang){
    let xr = getfile(sitepath + "/config/template.json");
    if(xr.status !== 200) console.error("could not access \"" + sitepath + "/config/template.json\"");
    var tmpjson = JSON.parse(xr.responseText);
    let b = document.querySelector("main");
    for(let i = 0;i < p.length;++i){
        switch(p[i][0]){
            case ':':
                let t = p[i].split(':');
                if(t.length !== 5) break;
                if(t[2] != "*"){
                    if(t[2] != lang) break;
                }
                let s = document.createElement(t[1]);
                s.innerText = t[3];
                if(i < p.length - 1){
                    if(p[i + 1][0] === '='){
                        while(i !== p.length - 1){
                            if(p[i+1][0] === '='){
                                i++;
                                let z = p[i].split('=');
                                if(z.length !== 4) continue;
                                s.setAttribute(z[1],z[2]);
                            }else break;
                        }
                    }
                }   
                
                b.appendChild(s);
                break;
            case '\\':
                let d = p[i].split('\\');
                if(d.length < 3) break;
                let nak = tmpjson.find((element) => element.name == d[1]);
                nak = nak.temp;
                for(let i = 0;i < d.length - 3;++i) nak = nak.replace('%',d[i + 2]);
                console.log("nak generated : " + nak);
                loadpage(nak.split('\n'),lang);
                break;
        }
    }
}

function load(){
    //1.define variabue
    let lang;
    let page;

    //2. Load GET argument
    let path = location.search;
    if(path){
        path = path.substring(1);
        var arg = path.split('&');
        for(let i = 0;i < arg.length;++i){
            var e = arg[i].split("=");
            var n = decodeURIComponent(e[0]);
            var v = decodeURIComponent(e[1]);
            if(n === "lang"){
                lang = v;
            }else if(n === "page"){
                page = v;
            }
        }
    }
    if(lang == null || page == null) location.href = sitepath + "?page=index&lang=en";

    //3. Generate HMF
    let b = document.querySelector("body");
    b.appendChild(document.createElement("header"));
    b.appendChild(document.createElement("main"));
    b.appendChild(document.createElement("footer"));
    let ht = document.getElementsByName("html");
    ht.addAttribute("lang",lang);

    //3.Request and Load PageFile
    let xhr = getfile(sitepath + "/page/" + page + ".page");
    if(xhr.status !== 200) location.href = sitepath + "?page=404&lang=en";
    loadpage(xhr.responseText.split("\n"),lang);
}