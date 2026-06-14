import ForceGraph2D from "react-force-graph-2d";

function AlertNetworkGraph({ alerts }) {
  const graphData = alerts.reduce(
    (acc, alert, index) => {
      const sender = String(alert.Sender_account || "Unknown sender");
      const receiver = String(alert.Receiver_account || "Unknown receiver");
      const probability = Number(alert.fraud_probability || 0);

      if (!acc.nodeMap.has(sender)) {
        acc.nodeMap.set(sender, {
          id: sender,
          label: sender,
          degree: 0,
          maxProbability: 0,
        });
      }

      if (!acc.nodeMap.has(receiver)) {
        acc.nodeMap.set(receiver, {
          id: receiver,
          label: receiver,
          degree: 0,
          maxProbability: 0,
        });
      }

      const senderNode = acc.nodeMap.get(sender);
      const receiverNode = acc.nodeMap.get(receiver);

      senderNode.degree += 1;
      receiverNode.degree += 1;
      senderNode.maxProbability = Math.max(senderNode.maxProbability, probability);
      receiverNode.maxProbability = Math.max(receiverNode.maxProbability, probability);

      acc.links.push({
        source: sender,
        target: receiver,
        probability,
        amount: Number(alert.Amount || 0),
        paymentType: alert.Payment_type || "Unknown",
        id: `${sender}-${receiver}-${index}`,
      });

      return acc;
    },
    { nodeMap: new Map(), links: [] }
  );

  const nodes = Array.from(graphData.nodeMap.values());
  const links = graphData.links;

  if (alerts.length === 0) {
    return (
      <section className="network-card">
        <div className="section-header compact">
          <div>
            <span className="eyebrow">Graph Preview</span>
            <h2>Alert Relationship Network</h2>
            <p>
              Load a dataset to visualize account-to-account relationships from
              model-positive review candidates.
            </p>
          </div>
        </div>

        <div className="network-empty">
          Review candidates will appear as sender and receiver account links.
        </div>
      </section>
    );
  }

  return (
    <section className="network-card">
      <div className="section-header compact">
        <div>
          <span className="eyebrow">Graph Preview</span>
          <h2>Alert Relationship Network</h2>
          <p>
            Account graph reconstructed from the current review alerts. Larger
            nodes indicate more connections, while warmer links indicate higher
            XGBoost confidence.
          </p>
        </div>
      </div>

      <div className="network-legend">
        <span><i className="legend-node" /> Account node</span>
        <span><i className="legend-link medium" /> Medium confidence</span>
        <span><i className="legend-link high" /> High confidence</span>
      </div>

      <div className="network-canvas">
        <ForceGraph2D
          graphData={{ nodes, links }}
          width={900}
          height={420}
          backgroundColor="rgba(2, 6, 23, 0)"
          cooldownTicks={80}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkColor={(link) =>
            link.probability >= 0.8
              ? "rgba(248, 113, 113, 0.88)"
              : "rgba(96, 165, 250, 0.72)"
          }
          linkWidth={(link) => 1 + link.probability * 3}
          linkLabel={(link) =>
            `${link.paymentType} | ${link.amount.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })} | ${(link.probability * 100).toFixed(2)}% confidence`
          }
          nodeCanvasObject={(node, ctx, globalScale) => {
            const radius = Math.min(7 + node.degree * 1.8, 18);
            const highConfidence = node.maxProbability >= 0.8;
            const label = node.label;
            const fontSize = Math.max(10 / globalScale, 3.8);

            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = highConfidence ? "#f97316" : "#14b8a6";
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
            ctx.lineWidth = 1.2;
            ctx.stroke();

            if (globalScale > 1.1) {
              ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
              ctx.fillStyle = "rgba(16, 32, 51, 0.88)";
              ctx.textAlign = "center";
              ctx.textBaseline = "top";
              ctx.fillText(label, node.x, node.y + radius + 3);
            }
          }}
          nodePointerAreaPaint={(node, color, ctx) => {
            const radius = Math.min(7 + node.degree * 1.8, 18);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius + 5, 0, 2 * Math.PI, false);
            ctx.fill();
          }}
        />
      </div>
    </section>
  );
}

export default AlertNetworkGraph;
