package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/infracloudio/kubernets/pkg/serve"
	"github.com/julienschmidt/httprouter"
	"github.com/rs/cors"
)

const (
	apiVersion  = "v1"
	defaultPort = "8080"
	portEnv     = "KUBERNETS_SERVER_PORT"
)

func main() {
	router := httprouter.New()
	router.GET(fmt.Sprintf("/%s/namespace", apiVersion), serve.GetNamespaces)
	router.GET(fmt.Sprintf("/%s/namespace/:namespace/workloads", apiVersion), serve.GetWorkloads)
	router.GET(fmt.Sprintf("/%s/namespace/:namespace/network/graph", apiVersion), serve.BuildGraph)
	handler := cors.Default().Handler(router)

	port := defaultPort
	if p, ok := os.LookupEnv(portEnv); ok {
		port = p
	}
	log.Printf("server started accepting requests on port=%s..\n", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), handler))
}
