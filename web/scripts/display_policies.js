const BASE_URL="http://localhost:8080"
const API_VERSION="v1"
const NS_URL="namespace"
const WORKLOAD_URL = "workloads"


let loads = document.getElementById("workloads")
let ns = document.getElementById("namespaces")

function createXMLHttpRequestObject(){
	if(window.XMLHttpRequest){
		xmlHTTPRequest = new XMLHttpRequest();
	}
	else{
		xmlHTTPRequest = new ActiveXObject("Microsoft.XMLHTTP");
	}
	return xmlHTTPRequest;
}

document.addEventListener("DOMContentLoaded", function (){
    loadNamespaces()
    // drawExistingNWPolicies()
})

ns.addEventListener("change", function populateWorkloads(event){
    resetWorkloads()
    nsSelected = event.target.value
    getWorkloadOfNS(nsSelected)
})

function resetWorkloads(){
    loads.innerHTML = ""
}

xmlReqWL = createXMLHttpRequestObject()
function getWorkloadOfNS(ns){
    if (xmlReqWL != null){
        xmlReqWL.open("GET", BASE_URL+"/"+ API_VERSION+"/"+NS_URL+"/"+ ns+"/"+WORKLOAD_URL, true)
        xmlReqWL.onreadystatechange = processWLResponse
        xmlReqWL.send(null)
    } else{
        console.log("Unable to create xmlreq object for workload")
    }
}

function processWLResponse(){
    if (xmlReqWL.status == 200 && xmlReqWL.readyState == 4){
        workloads = JSON.parse(xmlReqWL.responseText)
        console.log(workloads)
        for (i=0; i<workloads.length; i++){
            wlEle = document.createElement("div")
            wlEle.classList.add("workloads")
                sp = document.createElement("span")
                sp.innerHTML = workloads[i].Namespace+"/"+workloads[i].Kind+"/"+workloads[i].Name
                wlEle.appendChild(sp)

                labs = document.createElement("div")
                    for (key in workloads[i].Labels){
                        s = document.createElement("div")
                        s.innerHTML = key+" : "+ workloads[i].Labels[key]
                        s.classList.add("labels")
                        labs.appendChild(s)
                    }
                wlEle.appendChild(labs)
            wlEle.setAttribute("id", "wl"+i)
            loads.appendChild(wlEle)
        }
    }
}

xmlReqNS = createXMLHttpRequestObject()
function loadNamespaces(){
    if (xmlReqNS != null){
        xmlReqNS.open("GET", BASE_URL+"/"+API_VERSION+"/"+NS_URL, true)
        xmlReqNS.onreadystatechange = processNSResponse
        xmlReqNS.send(null)
    } else{
        console.log("Unabel to create xml req object to get NS")
    }

}

function processNSResponse(){
    if (xmlReqNS.status == 200 && xmlReqNS.readyState ==4){
        NSs = JSON.parse(xmlReqNS.responseText)

        for (i = 0; i< NSs.length; i++){
            op = document.createElement("option")
            op.innerHTML=NSs[i]
            op.value = NSs[i]
            ns.appendChild(op)
        }
    }
}

var render = (r, n) => {
    var set = r.set().push(
      r.rect(n.point[0] - 30, n.point[1] - 13, 62, 86)
        .attr({ fill: '#fa8', 'stroke-width': 2, r: '9px'}))
        .push(r.text(n.point[0], n.point[1] + 30, n.label)
        .attr({ 'font-size': '20px' }));
      set.items.forEach((el) => {
        el.tooltip(r.set().push(r.rect(0, 0, 30, 30)
          .attr({
            fill: '#fec', 'stroke-width': 1, r: '9px'
          })
        ));
      });
      return set;
    };

var g = new Dracula.Graph();
// g.addNode('newnode', {label: "abc", render: render});
g.addEdge("strawberry", "cherry", getDirectedStyle());
g.addEdge('id34', 'cherry', getDirectedStyle());
g.addEdge("strawberry", "apple", getDirectedStyle());
g.addEdge("strawberry", "tomato");

g.addEdge("tomato", "apple");
g.addEdge("tomato", "kiwi");

g.addEdge("cherry", "apple");
g.addEdge("cherry", "kiwi");

var layouter = new Dracula.Layout.Spring(g);
layouter.layout();

var renderer = new Dracula.Renderer.Raphael('#middle', g, 400, 300);
renderer.draw();

function getDirectedStyle(){
    return { style: {directed : true, stroke : "#f00" , fill : "#56f", label : "" } }
}

