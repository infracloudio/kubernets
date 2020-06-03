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
                    s = s+","+(key+":"+ workloads[i].Labels[key])
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
let output = document.getElementById('codegen');
let manifest = CodeMirror.fromTextArea(output, {
    mode: "text/x-yaml",
    lineNumbers : true
});

function processRelResponse(){

    if (xmlReqPol.status == 200 && xmlReqPol.readyState == 4){
        relations = JSON.parse(xmlReqPol.responseText)
        console.log(relations)
        for (i = 0; i< relations.length; i++){
            node = relations[i].Node
            connectedTo = relations[i].Connected
            for (j = 0; j< connectedTo.length; j++){
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
    sourceid = e.parentElement.parentElement.getAttribute("id")
    targetid = getIDOfWorkload(e.value)

    connect = document.createElement("connection")
    connect.setAttribute("from", "#"+sourceid)
    connect.setAttribute("to", "#"+targetid)
    connect.setAttribute("tail", "")
    document.body.appendChild(connect)
    createYaml(sourceid, targetid)
}

function createYaml(sourceid, targetid){
    // target is the workload on which the network policy will be applied
    let source_label = document.getElementById(sourceid).title;
    let target_label = document.getElementById(targetid).title;
    target_label = target_label.substring(1, target_label.length);
    source_label = source_label.substring(1, source_label.length);
    // Converting to object
    target_label_split = target_label.split(",");
    let targetObj = {};
    for (i=0; i<target_label_split.length; i++) {
        val = target_label_split[i].split(":")
        targetObj[val[0]] = val[1]
    };

    source_label_split = source_label.split(",");
    let sourceObj = {};
    for (i=0; i<source_label_split.length; i++) {
        val = source_label_split[i].split(":")
        sourceObj[val[0]] = val[1]
    };

    // Getting workload names
    let source_element = document.getElementById(sourceid);
    let target_element = document.getElementById(targetid);
    let name_space = document.getElementById(sourceid);

    source_name=source_element.getAttribute("name").split("/")[2];
    target_name=target_element.getAttribute("name").split("/")[2];
    name_space_name=name_space.getAttribute("name").split("/")[0];

    // variables
    var port = "8080";
    var policy_types = "Ingress";
    var protocol = "TCP";
    var policy_name = "test-network-policy";
    // Substituting labels to form yaml
    var doc = jsyaml.safeLoad(`
apiVersion: networking.k8s.io\/v1
kind: NetworkPolicy
metadata:
  name: test-network-policy
  namespace: default
spec:
  podSelector:
    matchLabels:
      role: db
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: frontend
    ports:
    - protocol: TCP
      port: PORT_NUMBER
`);
    doc.spec.podSelector.matchLabels = targetObj;
    doc.spec.ingress[0].from[0].podSelector.matchLabels = sourceObj;
    doc.metadata.name = source_name+"-"+target_name;
    doc.metadata.namespace = name_space_name;
    const yaaml = jsyaml.safeDump(doc);
    manifest.setValue(yaaml);
    manifest.setSize(450, 600);
}

function getIDOfWorkload(value){
    return workloadEleIDMap[value]
}
