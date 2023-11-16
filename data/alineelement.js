function o(q,e){
    return {
        q: e,
        m: q, //0:Query(Can't AppendChild) 1:Element(Can AppendChild)
        attr: function(id,ct){this.q.setAttribute(id,ct);return this},
        html: function(ct){this.q.innerHTML=ct;return this},
        text: function(ct){this.q.innerText=ct;return this},
        apde: function(e){if(e.m){this.q.appendChild(e.q)}else{console.error("aLineElement: It's can't apde")};return this},
        f   : function(f){return this}
    };
}
function q(q){return o(0,document.querySelector(q)) }
function id(q){return o(0,document.getElementById(q)) }
function e(q){return o(1,document.createElement(q)) }