package kube

import (
	"context"
	"log"
	"os"

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
