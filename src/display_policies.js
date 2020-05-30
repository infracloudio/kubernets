loads = document.getElementById("workloads")
ns = document.getElementById("namespaces")

document.addEventListener("DOMContentLoaded", function (){
    loadNamespaces()
    // drawExistingNWPolicies()
})

ns.addEventListener("change", function populateWorkloads(event){
    resetWorkloads()
    nsSelected = event.target.value
    workloads = getWorkloadOfNS(nsSelected)
    for (i=0; i<workloads.length; i++){
        wlEle = document.createElement("div")
        wlEle.classList.add("workloads")
            sp = document.createElement("span")
            sp.innerHTML = workloads[i].workload+"/"+workloads[i].name
            wlEle.appendChild(sp)

            labs = document.createElement("div")
                for (key in workloads[i].labels){
                    s = document.createElement("div")
                    s.innerHTML = key+" : "+ workloads[i].labels[key]
                    s.classList.add("labels")
                    labs.appendChild(s)
                }
            wlEle.appendChild(labs)
        wlEle.setAttribute("id", "wl"+i)
        loads.appendChild(wlEle)
    }
})

function resetWorkloads(){
    loads.innerHTML = ""
}

function getWorkloadOfNS(ns){
    return [
        {
            name : "one",
            workload:"deployment",
            labels:{
               "run" :"mysql",
               "component":"database"
            }
        },
        {
            name : "two",
            workload:"statefulset",
            labels:{
                "run":"nginx",
                "component":"frontend"
            }
        },
        {
            name : "three",
            workload:"daemonset",
            labels:{
                "run":"golang",
                "component":"backend"
            }
        },
    ]
}

function loadNamespaces(){
    namespaces = getNamespaces()
    for (i = 0; i< namespaces.length; i++){
        op = document.createElement("option")
        op.innerHTML=namespaces[i]
        op.value = namespaces[i]
        ns.appendChild(op)
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
function getNamespaces(){
    const obj = new KubeClient();
    obj.getNamespaces().then((ns) => console.log(ns));
    return ["default", "kube-system", "kube-public"]
}