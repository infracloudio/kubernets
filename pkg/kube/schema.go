package kube

// Workload contains Kubernets workload details
type Workload struct {
	Name          string
	Namespace     string
	Kind          string
	Labels        map[string]string
	Ports         []string
	NetworkPolicy string
}

// Relation represents relation between workloads
type Relation struct {
	Node      Workload
	Connected []Workload
}
