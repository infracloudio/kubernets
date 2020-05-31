package kube

import (
	"context"
	"log"
	"os"
	"reflect"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	// Enable auth for cloud providers
	_ "k8s.io/client-go/plugin/pkg/client/auth"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

// Client implements methods to get K8s resources
type Client struct {
	kubernetes.Interface
}

// NewClient returns new Client object
func NewClient() (*Client, error) {
	kubeConfig, err := rest.InClusterConfig()
	if err != nil {
		// If ran outside the cluster, use kubeconfig for authentication
		kubeconfigPath := os.Getenv("KUBECONFIG")
		if kubeconfigPath == "" {
			kubeconfigPath = os.Getenv("HOME") + "/.kube/config"
		}
		kubeConfig, err = clientcmd.BuildConfigFromFlags("", kubeconfigPath)
		if err != nil {
			return nil, err
		}
	}
	kubeClient, err := kubernetes.NewForConfig(kubeConfig)
	if err != nil {
		return nil, err
	}
	return &Client{kubeClient}, nil
}

// GetNamespaces returns list of K8s namespaces
func (c *Client) GetNamespaces(ctx context.Context) ([]string, error) {
	nsList, err := c.CoreV1().Namespaces().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}
	namespaces := []string{}
	for _, ns := range nsList.Items {
		namespaces = append(namespaces, ns.GetName())
	}
	return namespaces, nil
}

func (c *Client) getDeployments(ctx context.Context, namespace string) ([]Workload, error) {
	deployList, err := c.AppsV1().Deployments(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}
	workloads := []Workload{}
	for _, d := range deployList.Items {
		workloads = append(workloads, Workload{Name: d.GetName(), Namespace: d.GetNamespace(), Kind: "Deployment", Labels: d.GetLabels()})
	}
	return workloads, nil
}

func (c *Client) getStatefulSets(ctx context.Context, namespace string) ([]Workload, error) {
	ssList, err := c.AppsV1().StatefulSets(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}
	workloads := []Workload{}
	for _, d := range ssList.Items {
		workloads = append(workloads, Workload{Name: d.GetName(), Namespace: d.GetNamespace(), Kind: "Deployment", Labels: d.GetLabels()})
	}
	return workloads, nil
}

// GetWorkloads returns list of K8s workloads - deployments and statefulsets in a namespace
func (c *Client) GetWorkloads(ctx context.Context, namespace string) ([]Workload, error) {
	dw, err := c.getDeployments(ctx, namespace)
	if err != nil {
		log.Println("Failed to get deployments.", err)
		return nil, err
	}
	sw, err := c.getStatefulSets(ctx, namespace)
	if err != nil {
		log.Println("Failed to get statefulsets.", err)
		return nil, err
	}
	return append(dw, sw...), nil
}

func (c *Client) getWorkloadFromLabels(wl []Workload, labels map[string]string) []Workload {
	workList := []Workload{}
	for _, w := range wl {
		matched := true
		for sk, sv := range labels {
			if w.Labels[sk] != sv {
				matched = false
			}
		}
		if matched {
			workList = append(workList, w)
		}
	}
	return workList
}

func (c *Client) addToRelation(rel []Relation, src, target []Workload) []Relation {
	for _, sw := range src {
		exists := false
		for i := range rel {
			if !reflect.DeepEqual(rel[i].Node, sw) {
				continue
			}
			// Add new connection if relation already exists
			for _, tw := range target {
				rel[i].Connected = append(rel[i].Connected, tw)
			}
			exists = true
			break
		}
		// Add new relation if not exists
		if !exists {
			rel = append(rel, Relation{Node: sw, Connected: target})
		}
	}
	return rel
}

// BuildGraph returns relation schema between workloads as per the network policies
func (c *Client) BuildGraph(ctx context.Context, namespace string) ([]Relation, error) {
	netPolicies, err := c.NetworkingV1().NetworkPolicies(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	wl, err := c.GetWorkloads(ctx, namespace)
	if err != nil {
		return nil, err
	}

	rel := []Relation{}
	for _, n := range netPolicies.Items {
		// TODO: Just parsing ingress rules for now. Add support for ingress in future
		for _, ing := range n.Spec.Ingress {
			ports := []string{}
			for _, p := range ing.Ports {
				if p.Port != nil {
					ports = append(ports, p.Port.String())
				}
			}
			for _, from := range ing.From {
				srcWorkload := c.getWorkloadFromLabels(wl, from.PodSelector.MatchLabels)
				tarWorkload := c.getWorkloadFromLabels(wl, n.Spec.PodSelector.MatchLabels)
				if srcWorkload == nil || tarWorkload == nil {
					continue
				}
				// Add ports and policy
				for i := range tarWorkload {
					tarWorkload[i].Ports = ports
					tarWorkload[i].NetworkPolicy = n.GetName()
				}
				rel = c.addToRelation(rel, srcWorkload, tarWorkload)
			}
		}
	}
	return rel, nil
}
