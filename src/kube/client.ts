import k8s = require('@kubernetes/client-node');

//Usage:
//const obj = new KubeClient();
//obj.getNamespaces().then((ns) => console.log(ns));
//tslint:disable-next-line:no-unused-vars
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
}
