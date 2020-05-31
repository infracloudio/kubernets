package kube

// Workload contains Kubernets workload details
type Workload struct {
	Name      string
	Namespace string
	Kind      string
	Labels    map[string]string
	Port      string
}
