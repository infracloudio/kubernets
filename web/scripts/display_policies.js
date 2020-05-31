const BASE_URL="http://localhost:8080"
const API_VERSION="v1"
const NS_URL="namespace"
const WORKLOAD_URL = "workloads"

// this is going to store the
let workloadEleIDMap  = {}

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
    // loadPolicyRels()
    // drawExistingNWPolicies()
})

ns.addEventListener("change", function populateWorkloads(event){
    resetWorkloads()
    nsSelected = event.target.value
    getWorkloadOfNS(nsSelected)
    loadPolicyRels()
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

        for (i=0; i<workloads.length; i++){
            wlEle = document.createElement("div")
            wlEle.setAttribute("draggable", "true")
            wlEle.classList.add("workloads")
                sp = document.createElement("span")
                name = workloads[i].Namespace+"/"+workloads[i].Kind+"/"+workloads[i].Name
                sp.innerHTML = name
                wlEle.appendChild(sp)
                var s=""
                for (key in workloads[i].Labels){
                    s = s+", "+(key+" : "+ workloads[i].Labels[key])
                }
                wlEle.setAttribute("title", s)

                // add all the workloads in the dropdown
                addWorkloads(wlEle, workloads, i)
            id = "wl"+i
            wlEle.setAttribute("id", id)
            wlEle.setAttribute("name", name)
            workloadEleIDMap[name] = id
            loads.appendChild(wlEle)
        }
    }
}

function addWorkloads(ele, w, index){
    var wlDrop = document.createElement("div")
    wlDrop.classList.add("wldrop")
    wlDrop.setAttribute("id", "wldrop"+index)
        var wsel = document.createElement("select")
        wsel.setAttribute("onchange", "drawArrow(this)")
        wsel.setAttribute("id", "wsel"+i)
        wsel.classList.add("wsel")
        for (k = 0; k< w.length; k++){
            var op = document.createElement("option")
            a = w[k].Namespace+"/"+w[k].Kind+"/"+w[k].Name
            op.innerHTML = a
            op.setAttribute("optionid", index)
            wsel.appendChild(op)
        }
    wlDrop.appendChild(wsel)
    ele.appendChild(wlDrop)
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

xmlReqPol = createXMLHttpRequestObject()
function loadPolicyRels(){
    nsSelected = document.getElementById("namespaces").value
    if (nsSelected != "none"){
        console.log("MakingHTTP request to "+ BASE_URL+"/"+ API_VERSION+"/namespace/"+nsSelected+"/network/graph")
        xmlReqPol.open("GET", BASE_URL+"/"+ API_VERSION+"/namespace/"+nsSelected+"/network/graph")
        xmlReqPol.onreadystatechange = processRelResponse
        xmlReqPol.send(null)
    }
}


var g = new Dracula.Graph();
var layouter = new Dracula.Layout.Spring(g);
var renderer = new Dracula.Renderer.Raphael('#middle', g, 400, 300);
function processRelResponse(){

    if (xmlReqPol.status == 200 && xmlReqPol.readyState == 4){
        relations = JSON.parse(xmlReqPol.responseText)
        console.log(relations)
        for (i = 0; i< relations.length; i++){
            node = relations[i].Node
            connectedTo = relations[i].Connected
            for (j = 0; j< connectedTo.length; j++){
                // g.addEdge("tomato", "apple");
                g.addEdge(node.Kind+"/"+ node.Name, connectedTo[j].Kind+"/"+connectedTo[j].Name,getDirectedStyle())
            }
        }
    }
    layouter.layout();
    renderer.draw();
}

function getDirectedStyle(){
    return { style: {directed : true, stroke : "#f00" , fill : "#56f", label : "" } }
}

function drawArrow(e){
    sourceid = e.parentElement.getAttribute("id")
    targetid = getIDOfWorkload(e.value)

    connect = document.createElement("connection")
    connect.setAttribute("from", "#"+sourceid)
    connect.setAttribute("to", "#"+targetid)
    connect.setAttribute("tail", "")
    document.body.appendChild(connect)

    generateNWPolicyYaml(sourceid, targetid)
}

function getIDOfWorkload(value){
    return workloadEleIDMap[value]
}