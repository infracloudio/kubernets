import k8s = require('@kubernetes/client-node');

//Usage:
//const obj = new KubeClient();
//obj.getNamespaces().then((ns) => console.log(ns));
//obj.getWorkloads('default').then(ws => console.log(ws));
class KubeClient extends k8s.KubeConfig {
  constructor() {
    super();
    this.loadFromDefault();
  }

  async getNamespaces(): Promise<string[]> {
    const k8sApi = this.makeApiClient(k8s.CoreV1Api);
    const namespaces: string[] = [];
    // get K8s namespaces
    await k8sApi
      .listNamespace()
      .then(res => {
        for (let i = 0; i < res.body.items.length; i++) {
          const metadata: k8s.V1ObjectMeta = res.body.items[i]
            .metadata as k8s.V1ObjectMeta;
          namespaces.push(metadata.name as string);
        }
      })
      .catch(() => {
        console.log('Failed to list namespaces.');
      });
    return namespaces;
  }

  async getDeployments(namespace: string): Promise<Workload[]> {
    const k8sApi = this.makeApiClient(k8s.AppsV1Api);
    const workloads: Workload[] = [];
    // get deployments
    await k8sApi
      .listNamespacedDeployment(namespace)
      .then(res => {
        for (let i = 0; i < res.body.items.length; i++) {
          const metadata: k8s.V1ObjectMeta = res.body.items[i]
            .metadata as k8s.V1ObjectMeta;
          const spec: k8s.V1DeploymentSpec = res.body.items[i]
            .spec as k8s.V1DeploymentSpec;
          const labels: {[key: string]: string} = spec.selector.matchLabels as {
            [key: string]: string;
          };
          const ws: Workload = {
            name: metadata.name as string,
            namespace: metadata.namespace as string,
            kind: 'deployment',
            labels: labels,
          };
          workloads.push(ws);
        }
      })
      .catch(() => {
        console.log('Failed to list deployments.');
      });
    return workloads;
  }

  async getStatefulSets(namespace: string): Promise<Workload[]> {
    const k8sApi = this.makeApiClient(k8s.AppsV1Api);
    const workloads: Workload[] = [];
    // get statefulsets
    await k8sApi
      .listNamespacedStatefulSet(namespace)
      .then(res => {
        for (let i = 0; i < res.body.items.length; i++) {
          const metadata: k8s.V1ObjectMeta = res.body.items[i]
            .metadata as k8s.V1ObjectMeta;
          const spec: k8s.V1StatefulSetSpec = res.body.items[i]
            .spec as k8s.V1StatefulSetSpec;
          const labels: {[key: string]: string} = spec.selector.matchLabels as {
            [key: string]: string;
          };
          const ws: Workload = {
            name: metadata.name as string,
            namespace: metadata.namespace as string,
            kind: 'statefulset',
            labels: labels,
          };
          workloads.push(ws);
        }
      })
      .catch(() => {
        console.log('Failed to list deployments.');
      });
    return workloads;
  }

  async getWorkloads(namespace: string): Promise<Workload[]> {
    let workloads: Workload[] = [];
    await this.getDeployments(namespace).then(
      ws => (workloads = workloads.concat(ws))
    );
    await this.getStatefulSets(namespace).then(
      ws => (workloads = workloads.concat(ws))
    );
    return workloads;
  }
}
