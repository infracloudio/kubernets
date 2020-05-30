interface Workload {
  name: string;
  namespace: string;
  kind: string;
  labels: {[key: string]: string};
}
