package serve

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/infracloudio/kubernets/pkg/kube"
	"github.com/julienschmidt/httprouter"
)

// GetNamespaces returns list of namespaces
func GetNamespaces(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Enable CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	kubeCli, err := kube.NewClient()
	if err != nil {
		log.Println(err)
		http.Error(w, fmt.Sprintf("Failed to access Kubernetes cluster. Error: %s", err.Error()), http.StatusInternalServerError)
		return
	}
	ns, err := kubeCli.GetNamespaces(context.TODO())
	if err != nil {
		log.Println(err)
		http.Error(w, fmt.Sprintf("Failed to access Kubernetes cluster. Error: %s", err.Error()), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(ns)
}

// GetWorkloads returns list of namespaces
func GetWorkloads(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	// Enable CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	ns := p.ByName("namespace")
	kubeCli, err := kube.NewClient()
	if err != nil {
		log.Println(err)
		http.Error(w, fmt.Sprintf("Failed to access Kubernetes cluster. Error: %s", err.Error()), http.StatusInternalServerError)
		return
	}
	wl, err := kubeCli.GetWorkloads(context.TODO(), ns)
	if err != nil {
		log.Println(err)
		http.Error(w, fmt.Sprintf("Failed to access Kubernetes cluster. Error: %s", err.Error()), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(wl)
}
