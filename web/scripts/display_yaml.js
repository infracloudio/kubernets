// // Input parametes for creating the policy yaml

// let source_label = {app: "test", run: "jog"};
// let target_label = {app: "final"};
// var port = "8080";
// var policy_types = "Ingress"
// var protocol = "TCP"
// var policy_name = "test-network-policy"

// var doc = jsyaml.load('apiVersion: networking.k8s.io\/v1\r\nkind: NetworkPolicy\r\nmetadata:\r\n  name: test-network-policy\r\n  namespace: default\r\nspec:\r\n  podSelector:\r\n    matchLabels:\r\n      role: db\r\n  policyTypes:\r\n    Ingress\r\n  ingress:\r\n  - from:\r\n    - namespaceSelector:\r\n        matchLabels:\r\n          project: myproject\r\n    - podSelector:\r\n        matchLabels:\r\n          role: frontend\r\n    ports:\r\n    - protocol: TCP\r\n      port: 6379');
// doc.spec.podSelector.matchLabels = source_label;
// const yaaml = jsyaml.safeDump(doc);
// document.getElementById("specs").value=yaaml
// // console.log(yaaml)